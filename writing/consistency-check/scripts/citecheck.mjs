// citecheck: verify [^key]: reference entries against arXiv, Crossref and Semantic Scholar.
// Run: node citecheck.mjs <post.md> [key ...] [--chunk 10] [--jobs 3]   (no keys = every entry)   Node 22, no dependencies.
// Checks title, authors (order, last author, count), year, venue name, venue edition, pages.
// More than --chunk keys: the keys are split into chunks (default 10), each chunk runs as its own process,
// at most --jobs at a time (default 3; arXiv asks for about one request per 3 s per client), then the rows are merged in key order.
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i < 0 ? dflt : +args.splice(i, 2)[1]; };
const worker = args.includes('--worker') && !!args.splice(args.indexOf('--worker'), 1);
const CHUNK = flag('--chunk', 10), JOBS = flag('--jobs', 3);
const [post, ...argKeys] = args;
const text = readFileSync(post, 'utf8');
const keys = argKeys.length ? argKeys : [...text.matchAll(/^\[\^([\w-]+)\]:/gm)].map(m => m[1]);
const UA = { 'User-Agent': 'citecheck/0.2 (mailto:votrinhan88@gmail.com)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FOLD = { ł: 'l', ø: 'o', đ: 'd', ß: 'ss', æ: 'ae' };
const norm = s => (s ?? '').toLowerCase().replace(/[łøđßæ]/g, c => FOLD[c]).normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '');
const nameKey = s => (s ?? '').split(/\s+/).map(t => norm(t).replace(/ue/g, 'u').replace(/oe/g, 'o').replace(/ae/g, 'a')).join(''); // Leimkühler = Leimkuehler, folded per token

// Venues: [label, matcher, expected edition from year (null = no edition)]
const VENUES = [
  ['ICLR', /international conference on learning representations|\bICLR\b/i, y => y - 2012],
  ['ICML', /international conference on machine learning|\bICML\b/i, y => y - 1983],
  ['NeurIPS', /neural information processing systems|neurips|\bnips\b/i, y => y - 1987],
  ['CoRL', /conference on robot learning|\bCoRL\b/i, y => y - 2016],
  ['CVPR', /computer vision and pattern recognition|\bCVPR\b/i, null],
  ['ICCV', /international conference on computer vision|\bICCV\b/i, null],
  ['ECCV', /european conference on computer vision|\bECCV\b/i, null],
  ['WACV', /winter conference on applications of computer vision|\bWACV\b/i, null],
  ['AAAI', /\bAAAI\b/i, null],
  ['TMLR', /transactions on machine learning research|\bTMLR\b/i, null],
  ['UIST', /\bUIST\b|user interface software/i, null],
];
const venueOf = s => VENUES.find(v => v[1].test(s ?? ''));

// (a) parse "Authors (Year). Title. Venue"
function parse(key) {
  const m = text.match(new RegExp('^\\[\\^' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]:\\s*(.+)$', 'm'));
  if (!m) return null;
  const raw = m[1], h = raw.match(/^(.*?)\s*\((\d{4})[^)]*\)\.\s*(.*)$/);
  if (!h) return { key, raw, bad: true };
  const [, a, year, after] = h;
  const t = after.match(/^(.*?[^A-Z])\.\s+(.*)$/) || [0, after, ''];
  const authors = [...a.replace(/\.\.\./g, ',').matchAll(/(?:^|,|&)\s*([^,&]+?),\s*((?:\p{Lu}\.-?\s?)+)/gu)].map(x => ({ sur: x[1].trim() }));
  const pg = after.match(/pp?\.\s*(\d+)\s*[-–]\s*(\d+)/);
  const tail = after.startsWith(t[1]) ? after.slice(t[1].length) : after; // venue text, without the title
  return { key, raw, year: +year, after, title: t[1], authors, group: authors.length === 0, trunc: /\.\.\.|et al/.test(a),
    arxiv: (raw.match(/arXiv:(\d{4}\.\d{4,5})/) || [])[1], pages: pg && `${pg[1]}-${pg[2]}`, isArxivVenue: /arXiv preprint/.test(after), tail,
    ev: venueOf(tail) };
}

// (b) resolvers -> { src, url, title, authors[], year, pages, venue }
async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.status === 429) { await sleep(3000 * (i + 1)); continue; }
    if (!r.ok) return null;
    return r.json();
  }
  return null;
}
const arxivEntry = e => {
  const g = r => (e.match(r) || [])[1]?.replace(/\s+/g, ' ').trim();
  return { src: 'arXiv', url: g(/<id>(.*?)<\/id>/)?.replace(/v\d+$/, ''), title: g(/<title>([\s\S]*?)<\/title>/), year: +g(/<published>(\d{4})/),
    authors: [...e.matchAll(/<name>(.*?)<\/name>/g)].map(n => n[1]),
    venue: [g(/<arxiv:comment[^>]*>([\s\S]*?)<\/arxiv:comment>/), g(/<arxiv:journal_ref[^>]*>([\s\S]*?)<\/arxiv:journal_ref>/)].filter(Boolean).join(' ') };
};
async function arxivFetch(url) { await sleep(3200); return (await (await fetch(url, { headers: UA })).text()); }
async function viaArxivId(p) {
  if (!p.arxiv) return null;
  const e = (await arxivFetch(`https://export.arxiv.org/api/query?id_list=${p.arxiv}`)).match(/<entry>([\s\S]*?)<\/entry>/);
  return e && arxivEntry(e[1]);
}
async function viaArxivSearch(p) {
  const x = await arxivFetch(`https://export.arxiv.org/api/query?search_query=ti:%22${encodeURIComponent(p.title)}%22&max_results=3`);
  for (const e of x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) { const c = arxivEntry(e[1]); if (titleOK(p, c)) return c; }
  return null;
}
async function viaCrossref(p) {
  const j = await getJson(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(`${p.title} ${p.authors[0]?.sur ?? ''} ${p.year}`)}&rows=3&select=DOI,title,author,issued,container-title,page`);
  for (const w of j?.message?.items ?? []) {
    const c = { src: 'Crossref', url: 'https://doi.org/' + w.DOI, title: w.title?.[0] ?? '', authors: (w.author ?? []).map(a => `${a.given ?? ''} ${a.family ?? ''}`.trim()),
      year: w.issued?.['date-parts']?.[0]?.[0], pages: w.page?.replace(/–/g, '-'), venue: w['container-title']?.join(' ') };
    if (plausible(p, c)) return c;
  }
  return null;
}
async function viaS2(p) {
  await sleep(1200);
  const j = await getJson(`https://api.semanticscholar.org/graph/v1/paper/search/match?query=${encodeURIComponent(p.title)}&fields=title,year,venue,authors,journal`);
  const w = j?.data?.[0];
  const c = w && { src: 'S2', url: 'https://www.semanticscholar.org/paper/' + w.paperId, title: w.title, authors: w.authors.map(a => a.name), year: w.year,
    pages: w.journal?.pages?.replace(/–/g, '-'), venue: [w.venue, w.journal?.name].filter(Boolean).join(' ') };
  return c && plausible(p, c) ? c : null;
}

// (c) comparison
const cleanAuthors = c => c.authors.map(n => n.trim()).filter(n => n && n !== ':' && !/\b(team|openai|nvidia|consortium)\b/i.test(n))
  .reduce((out, n) => { const prev = out.at(-1); if (prev && !/\s/.test(prev) && !/\s/.test(n)) out[out.length - 1] = prev + ' ' + n; else out.push(n); return out; }, []); // arXiv sometimes splits one name in two
const titleOK = (p, c) => { const a = norm(p.after), t = norm(c.title); return t.length > 8 && (a.startsWith(t) || t.startsWith(norm(p.title))); };
const surnameOK = (fa, full) => { const f = nameKey(full ?? ''); return f.endsWith(nameKey(fa.sur)) || f.startsWith(nameKey(fa.sur)); };
const plausible = (p, c) => titleOK(p, c) && (p.group || !p.authors.length || surnameOK(p.authors[0], cleanAuthors(c)[0]));
function compare(p, c) {
  const bad = [], notes = [], ca = cleanAuthors(c);
  if (!titleOK(p, c)) bad.push(`title: "${c.title}"`);
  if (!p.group) {
    p.authors.forEach((fa, i) => {
      const last = i === p.authors.length - 1 && p.trunc;
      const cand = last ? ca.at(-1) : ca[i];
      if (surnameOK(fa, cand)) return;
      const msg = `author ${last ? '(last)' : i + 1}: ${fa.sur} vs "${cand ?? 'missing'}"`;
      // a published entry may follow the proceedings order, which can differ from arXiv: note it, do not fail it
      if (!p.isArxivVenue && c.src === 'arXiv' && ca.some(n => surnameOK(fa, n))) notes.push(`${msg} (same author elsewhere in arXiv list; check proceedings order)`);
      else bad.push(msg);
    });
    if (!p.trunc && p.authors.length !== ca.length) bad.push(`author count ${p.authors.length} vs ${ca.length}`);
  } else notes.push('group author');
  if (c.src === 'arXiv') { if (p.isArxivVenue ? p.year !== c.year : p.year < c.year) bad.push(`year ${p.year} vs arXiv ${c.year}`); }
  else if (c.src === 'S2' ? (p.year < c.year || p.year > c.year + 2) : p.year !== c.year) bad.push(`year ${p.year} vs ${c.year}`);
  if (p.pages && c.pages && p.pages !== c.pages) (c.src === 'Crossref' ? bad : notes).push(`pages ${p.pages} vs ${c.pages}${c.src === 'Crossref' ? '' : ` (${c.src}, advisory)`}`);
  // venue name and edition
  const cv = venueOf(c.venue);
  if (p.ev && c.venue && cv && cv[0] !== p.ev[0]) bad.push(`venue ${p.ev[0]} vs source ${cv[0]}`);
  else if (p.ev && !cv) notes.push(`venue ${p.ev[0]} unconfirmed (source: ${c.venue || 'none'})`);
  if (!p.ev && p.isArxivVenue && cv) notes.push(`published at ${cv[0]} per ${c.src}: consider citing the venue`);
  const fn = p.ev?.[2];
  if (fn) {
    const ord = p.tail.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/)?.[1] ?? p.tail.match(/(?:NeurIPS|Systems,?)\s*(\d{2})\b/)?.[1];
    // proceedings volumes are often dated the year after the conference, so accept year and year-1
    if (ord && +ord !== fn(p.year) && +ord !== fn(p.year - 1)) bad.push(`edition ${ord} but ${p.ev[0]} ${p.year} is edition ${fn(p.year)}`);
  }
  return { bad, notes };
}

// (d) report
const HEADER = 'key | status | source | evidence | venue | findings';
if (!worker && keys.length > CHUNK) { // parallel mode: one process per chunk, JOBS at a time
  const chunks = []; for (let i = 0; i < keys.length; i += CHUNK) chunks.push(keys.slice(i, i + CHUNK));
  const rows = new Array(chunks.length); let next = 0, done = 0;
  const lane = async () => {
    while (next < chunks.length) {
      const i = next++;
      rows[i] = await new Promise(res => {
        const c = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', post, ...chunks[i]]); let out = '';
        c.stdout.on('data', d => out += d); c.on('close', () => res(out));
      });
      console.error(`chunk ${i + 1}/${chunks.length} finished (${++done} done)`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(JOBS, chunks.length) }, lane));
  console.log(HEADER); for (const r of rows) console.log(r.split('\n').filter(l => l && l !== HEADER).join('\n'));
  process.exit(0);
}
console.log(HEADER);
for (const k of keys) {
  const p = parse(k);
  if (!p || p.bad) { console.log(`${k} | PARSE-FAIL | - | - | - | ${p?.raw ?? 'no such key'}`); continue; }
  if (/Technical Report|University Press|CUP Archive|Harvard University Press/.test(p.raw)) { console.log(`${k} | MANUAL | - | - | - | book or report`); continue; }
  if (/https?:\/\//.test(p.raw) && !p.arxiv) { console.log(`${k} | MANUAL | - | - | - | web page`); continue; }
  const c = (await viaArxivId(p)) || (await viaCrossref(p)) || (await viaArxivSearch(p)) || (await viaS2(p));
  if (!c) { console.log(`${k} | NOT-FOUND | - | - | - | no source matched title and first author`); continue; }
  const { bad, notes } = compare(p, c);
  const vs = !p.ev ? '-' : venueOf(c.venue)?.[0] === p.ev[0] ? 'venue confirmed' : 'VENUE UNCONFIRMED';
  console.log(`${k} | ${bad.length ? 'MISMATCH' : 'PASS'} | ${c.src} | ${c.url} | ${vs} | ${[...bad.map(b => 'ISSUE ' + b), ...notes.filter(n => !/unconfirmed/.test(n)).map(n => 'NOTE ' + n)].join(' | ') || 'ok'}`);
  await sleep(300);
}
