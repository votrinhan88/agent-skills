#!/usr/bin/env node
// Usage: pi -p --mode json ... | node pi-watch.mjs <model-id> <short-task-label>
// Reads pi's JSON events on stdin, prints one readable line per step, and mirrors them to <os tmp>/pi-<time>-<pid>.log.
// Lines 2-3 of the log are `model: <id>` and `task: <label>`, which the run picker reads.
import { createInterface } from 'node:readline';
import { appendFileSync, readdirSync, statSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// One log per run, so parallel runs never share a file. At start, keep only the newest N logs (N = PI_WATCH_KEEP, default 32).
const dir = tmpdir();
const keep = Number(process.env.PI_WATCH_KEEP) || 32;
const logs = readdirSync(dir)
	.filter((f) => /^pi-\d{14}-\d+\.log$/.test(f))
	.flatMap((f) => { try { return [{ f, t: statSync(join(dir, f)).mtimeMs }]; } catch { return []; } }) // gone since readdir
	.sort((a, b) => b.t - a.t);
for (const { f } of logs.slice(keep - 1)) { // keep - 1, because this run's log is created next
	try { unlinkSync(join(dir, f)); } catch { /* in use or gone */ }
}
const log = join(dir, `pi-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}-${process.pid}.log`);
writeFileSync(log, '');
const out = (s) => { console.log(s); appendFileSync(log, s + '\n'); };
const text = (c) => (c || []).filter((p) => p.type === 'text').map((p) => p.text).join('');
const short = (s, n) => (s.length > n ? s.slice(0, n) + '...' : s);

// A quiet model (long thinking) writes nothing, so the picker would call the run stopped. Touching the file keeps its mtime fresh; no line is added.
const heartbeat = setInterval(() => { const t = new Date(); try { utimesSync(log, t, t); } catch { /* log pruned */ } }, 30_000);
heartbeat.unref();
// The newest run's log path, in a fixed file, so a caller never has to search <os tmp> for it.
writeFileSync(join(dir, 'pi-last-log.txt'), log + '\n');
out(`log: ${log}`);
out(`model: ${process.argv[2] || 'unknown'}`);
out(`task: ${(process.argv[3] || 'untitled').slice(0, 40)}`);
let thinking = false;
createInterface({ input: process.stdin }).on('line', (line) => {
	let e;
	try { e = JSON.parse(line); } catch { return; }
	switch (e.type) {
		case 'tool_execution_start':
			thinking = false;
			out(`> ${e.toolName} ${short(Object.entries(e.args || {}).map(([k, v]) => `${k}=${v}`).join(' '), 160)}`);
			break;
		case 'tool_execution_end':
			out(`  <- ${text(e.result?.content).length} chars`);
			break;
		case 'message_update':
			if (e.assistantMessageEvent?.type === 'thinking_delta' && !thinking) { out('thinking...'); thinking = true; }
			break;
		case 'message_end': {
			const t = e.message?.role === 'assistant' ? text(e.message.content) : '';
			if (t.trim()) { thinking = false; out(t); }
			break;
		}
		case 'agent_end':
			out('--- done ---');
			break;
	}
});
