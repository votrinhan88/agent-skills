// check: offline consistency checks on a blog post. No network, runs in under a second.
// Run: node check.mjs <post.md>    Node 22, no dependencies. Exit code 1 if any check fails.
// 1 footnotes used vs defined  2 even count of `$$` lines  3 display-equation width  4 no section sign
// 5 outline sync (only if <post>.outlines.md exists): bullets per heading = paragraphs, each bullet <= 12 words
import { readFileSync, existsSync } from 'node:fs';
const post = process.argv[2];
if (!post) { console.error('usage: node check.mjs <post.md>'); process.exit(2); }
const lines = readFileSync(post, 'utf8').split(/\r?\n/);
const refAt = lines.findIndex(l => /^## References/.test(l));
const body = refAt < 0 ? lines : lines.slice(0, refAt);
let failed = false;
const report = (name, ok, detail = [], warnOnly = false) => { console.log(`${ok ? 'PASS' : warnOnly ? 'WARN' : 'FAIL'}  ${name}`); detail.forEach(d => console.log('      ' + d)); if (!ok && !warnOnly) failed = true; };

// 1. footnotes
const defined = new Set(lines.map(l => l.match(/^\[\^([^\]]+)\]:/)?.[1]).filter(Boolean));
const used = new Set(body.filter(l => !/^\[\^[^\]]+\]:/.test(l)).flatMap(l => [...l.matchAll(/\[\^([^\]]+)\]/g)].map(m => m[1]))); // a definition is a line that starts with [^key]:
const undef = [...used].filter(k => !defined.has(k)), unused = [...defined].filter(k => !used.has(k));
report('footnotes: every marker defined, every definition used', !undef.length && !unused.length,
  [...undef.map(k => `used but not defined: ${k}`), ...unused.map(k => `defined but not used: ${k}`)]);

// 2. math fences
const fences = lines.filter(l => l.trim() === '$$').length;
report(`math fences: ${fences} lines of $$ (must be even)`, fences % 2 === 0);

// 3. equation width: source characters per line inside a display block (phone-width heuristic)
const wide = []; let inEq = false;
lines.forEach((l, i) => { if (l.trim() === '$$') { inEq = !inEq; return; } if (inEq && l.length > 110) wide.push(`line ${i + 1}: ${l.length} chars`); });
report('equation width: no display line over 110 source chars (heuristic: check on a phone)', !wide.length, wide, true);

// 4. section sign
const signs = body.map((l, i) => l.includes('§') ? `line ${i + 1}` : null).filter(Boolean);
report('no section sign (§)', !signs.length, signs);

// 5. outline sync
const outlinePath = post.replace(/\.md$/, '.outlines.md');
if (existsSync(outlinePath)) {
  const paras = new Map(), bullets = new Map(); let h = '(intro)', blk = false, skip = false, inComment = false;
  const flush = () => { if (blk && !skip) paras.set(h, (paras.get(h) ?? 0) + 1); blk = false; skip = false; };
  for (const l of body) {
    if (/^#/.test(l)) { flush(); h = l.trim(); continue; }
    if (!l.trim()) { flush(); continue; }
    if (!blk) { blk = true; skip = /^(\$\$|<div|<figure|---)/.test(l); }
  }
  flush();
  const long = []; h = '(intro)';
  for (const l of readFileSync(outlinePath, 'utf8').split(/\r?\n/)) {
    if (l.includes('<!--')) inComment = true;
    if (inComment) { if (l.includes('-->')) inComment = false; continue; }
    if (/^#/.test(l)) { h = l.trim(); continue; }
    if (/^- /.test(l)) { bullets.set(h, (bullets.get(h) ?? 0) + 1); const n = l.slice(2).trim().split(/\s+/).length; if (n > 12) long.push(`${n} words under ${h}`); }
  }
  const diff = [...new Set([...paras.keys(), ...bullets.keys()])].filter(k => (paras.get(k) ?? 0) !== (bullets.get(k) ?? 0))
    .map(k => `${k}: ${paras.get(k) ?? 0} paragraphs, ${bullets.get(k) ?? 0} bullets`);
  report('outline: one bullet per paragraph under every heading', !diff.length, diff);
  report('outline: every bullet 12 words or under', !long.length, long);
} else console.log('SKIP  outline (no ' + outlinePath.split(/[\\/]/).pop() + ')');
process.exit(failed ? 1 : 0);
