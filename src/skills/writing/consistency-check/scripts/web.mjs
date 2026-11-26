// web: verify web-source [^key]: entries for citecheck.mjs. Node 22, no dependencies.
// GitHub repos, commits and files go through the GitHub API (60 unauthenticated calls per hour).
// X posts are checked by the date inside the post ID, because the text cannot be fetched.
// Other pages are checked by HTTP status and <title>. Blocked pages come back as MANUAL.
const norm = s => (s ?? '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '');
export const isWebEntry = p => (/https?:\/\//.test(p.raw) && !p.arxiv && !/doi\.org\//.test(p.raw)) || /\[(Post|Tweet)\]/.test(p.raw);

// (c2) web sources: GitHub repos, commits and files via the GitHub API, X posts via the post-ID date, other pages via status and <title>
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEBUA = { 'User-Agent': 'Mozilla/5.0 (citecheck/0.3)', Accept: 'text/html,application/json' };
const tokens = s => new Set((s ?? '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').split(/[^a-z0-9]+/).filter(w => w.length > 2));
const overlap = (a, b) => { const A = tokens(a), B = tokens(b); if (!A.size) return 0; let n = 0; for (const w of A) if (B.has(w)) n++; return n / A.size; };
const webTitle = p => ((p.raw.match(/\*([^*]+)\*/) || [])[1] ?? p.title).replace(/\s+/g, ' ').trim();
const citedDate = p => { const m = p.raw.match(/\((\d{4})(?:,\s*([A-Za-z]+)\s+(\d{1,2}))?\)/); const mo = m?.[2] && MONTHS.indexOf(m[2].toLowerCase()); return m && mo >= 0 && m[3] ? Date.UTC(+m[1], mo, +m[3]) : null; };
const dayGap = (t, d) => Math.abs(Math.round((t - d) / 864e5));
async function ghJson(path) { const r = await fetch('https://api.github.com' + path, { headers: { ...WEBUA, Accept: 'application/vnd.github+json' } }); return r.ok ? r.json() : { __status: r.status }; }
export async function checkWeb(p) {
  const url = p.raw.match(/https?:\/\/[^\s)>\]]+/)?.[0].replace(/[.,;]+$/, '');
  const title = webTitle(p), d = citedDate(p), social = /\[(Post|Tweet)\]/.test(p.raw);
  if (!url) return [social ? 'MANUAL' : 'NOT-FOUND', '-', '-', social ? 'social post without a URL: add the link' : 'no URL and no paper match'];
  const out = (status, src, ...f) => [status, src, url, f.filter(Boolean).join(' | ') || 'ok'];
  const x = url.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/(\d+)/);
  if (x) { // the post cannot be fetched, but its ID encodes its timestamp
    const t = Number((BigInt(x[1]) >> 22n) + 1288834974657n);
    if (d === null) return out('MANUAL', 'X post ID', `post is dated ${new Date(t).toISOString().slice(0, 10)}; the entry has no full date`);
    return dayGap(t, d) <= 1 ? out('PASS', 'X post ID', `date ${new Date(t).toISOString().slice(0, 10)} matches`, 'NOTE text not verified (X blocks fetching)')
      : out('MISMATCH', 'X post ID', `ISSUE post is dated ${new Date(t).toISOString().slice(0, 10)}, entry says ${new Date(d).toISOString().slice(0, 10)}`);
  }
  const g = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:\/(commit|blob|tree)\/([^#?]+))?/);
  if (g) {
    const [, owner, repo, kind, rest] = g, f = [];
    const r = await ghJson(`/repos/${owner}/${repo}`);
    if (r.__status) return out('NOT-FOUND', 'GitHub API', `repo ${owner}/${repo}: HTTP ${r.__status}`);
    if (!norm(p.raw.split(/\(\d{4}/)[0]).includes(norm(owner)) && !norm(p.raw.split(/\(\d{4}/)[0]).includes(norm(r.owner?.login ?? '')))
      f.push(`NOTE cited author differs from owner "${owner}": confirm identity`);
    if (kind === 'commit') {
      const c = await ghJson(`/repos/${owner}/${repo}/commits/${rest}`);
      if (c.__status) return out('NOT-FOUND', 'GitHub API', `commit ${rest}: HTTP ${c.__status}`);
      const msg = c.commit.message.split('\n')[0], t = Date.parse(c.commit.author.date);
      if (overlap(title, msg) < 0.6) f.push(`ISSUE commit message is "${msg}"`);
      if (d !== null && dayGap(t, d) > 1) f.push(`ISSUE commit dated ${c.commit.author.date.slice(0, 10)}`);
      return out(f.some(x => x.startsWith('ISSUE')) ? 'MISMATCH' : 'PASS', 'GitHub API', ...f);
    }
    if (kind === 'blob' || kind === 'tree') {
      const parts = rest.split('/'), ref = parts.shift(), path = parts.join('/');
      const c = await ghJson(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
      if (c.__status) f.push(`ISSUE path ${path} on ${ref}: HTTP ${c.__status}`);
    } else if (overlap(title, r.name) < 0.6 && overlap(title, r.full_name) < 0.6) f.push(`ISSUE repo is named "${r.name}"`);
    const made = new Date(r.created_at).getUTCFullYear();
    if (p.year < made) f.push(`ISSUE year ${p.year} is before the repo was created (${made})`);
    if (d !== null && kind !== 'blob' && kind !== 'tree' && p.year === made && dayGap(Date.parse(r.created_at), d) > 3) f.push(`NOTE repo created ${r.created_at.slice(0, 10)}`);
    return out(f.some(x => x.startsWith('ISSUE')) ? 'MISMATCH' : 'PASS', 'GitHub API', ...f);
  }
  let res; // any other page: status and <title>
  try { res = await fetch(url, { headers: WEBUA, redirect: 'follow', signal: AbortSignal.timeout(20000) }); } catch (e) { return out('MANUAL', 'web', `could not fetch: ${e.cause?.code ?? e.message}`); }
  if (res.status >= 400) return out('MANUAL', 'web', `HTTP ${res.status}: not checkable, verify by hand`);
  const page = (await res.text()).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, ' ').trim() ?? '';
  const ov = overlap(title, page), final = res.url !== url ? `NOTE redirects to ${res.url}` : '';
  return ov >= 0.5 ? out('PASS', 'web', `page title "${page.slice(0, 80)}"`, final) : out('MISMATCH', 'web', `ISSUE page title is "${page.slice(0, 80)}"`, `title overlap ${Math.round(ov * 100)}%`, final);
}
