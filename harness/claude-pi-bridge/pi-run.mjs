#!/usr/bin/env node
// Runs pi with the fixed flags, pipes its JSON events through pi-watch.mjs, so every run has a readable log.
// Usage: node pi-run.mjs <model-id> "<task-label>" [--tools list | --no-tools] [--thinking level] < brief.md
// The brief comes from stdin (a file, never a shell-quoted string). Refuses to start on a terminal, so nothing can hang.
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [model, label] = process.argv.slice(2, 4);
if (!model || !label) {
	console.error('usage: node pi-run.mjs <model-id> "<task-label>" [--tools list | --no-tools] [--thinking level] < brief.md');
	process.exit(2);
}
if (process.stdin.isTTY) {
	console.error('pi-run: no brief on stdin. Pipe a file: node pi-run.mjs <model> "<label>" < brief.md');
	process.exit(2);
}
const flagValue = (name, fallback) => {
	const at = process.argv.indexOf(name);
	return at > 0 ? process.argv[at + 1] : fallback;
};
const toolArgs = process.argv.includes('--no-tools') ? ['--no-tools'] : ['--tools', flagValue('--tools', 'read,edit,write,bash')];
const thinkingArgs = process.argv.includes('--thinking') ? ['--thinking', flagValue('--thinking', 'medium')] : [];

const here = dirname(fileURLToPath(import.meta.url));
const watch = spawn(process.execPath, [join(here, 'pi-watch.mjs'), model, label], { stdio: ['pipe', 'inherit', 'inherit'] });
const pi = spawn('pi', ['-p', '--mode', 'json', '--no-session', '--no-context-files', '--no-extensions', '--no-skills', '--no-mcp', '--model', model, ...toolArgs, ...thinkingArgs],
	{ stdio: ['pipe', 'pipe', 'inherit'], shell: true });

process.stdin.pipe(pi.stdin);
pi.stdout.pipe(watch.stdin);
pi.on('error', (e) => { console.error(`pi-run: cannot start pi: ${e.message}`); process.exitCode = 1; });
pi.on('close', (code) => {
	watch.stdin.end();
	if (code !== 0) console.error(`pi-run: pi exited with code ${code}`);
	process.exitCode = code ?? 1;
});
watch.on('exit', () => { if (process.exitCode === undefined) process.exitCode = 0; });
