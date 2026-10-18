#!/usr/bin/env node
// Picker for pi run logs (Windows, macOS, Linux). Up/Down select, Enter/W/Right watch (live), Esc/Q back or quit.
// Usage: node scripts/pi-picker.mjs [--list]
import { openSync, readSync, closeSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const COL = { when: 12, task: 24, model: 28 };
const ESC = '\x1b';
const up = '↑', down = '↓', right = '→';
const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

function runs() {
	return readdirSync(tmpdir())
		.filter((f) => /^pi-\d{14}-\d+\.log$/.test(f))
		.flatMap((name) => { try { return [{ name, path: join(tmpdir(), name), mtime: statSync(join(tmpdir(), name)).mtime }]; } catch { return []; } })
		.sort((a, b) => b.mtime - a.mtime)
		.slice(0, 32); // the picker scrolls, so every kept log is listed
}

// Run start, from the UTC timestamp in the file name.
function startOf(run) {
	const m = /^pi-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-/.exec(run.name);
	if (!m) return run.mtime;
	return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function when(start) {
	const now = new Date();
	const day = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5;
	const days = Math.floor(day(now) - day(start));
	const hm = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
	if (days <= 0) return `today ${hm}`;
	if (days === 1) return `yest. ${hm}`;
	if (days < 7) return `${days}d ${hm}`;
	if (days < 30) return `${Math.floor(days / 7)}w`;
	if (days < 365) return `${Math.floor(days / 30)}m`;
	return `${Math.floor(days / 365)}y`;
}

// Reads a `key: value` line from the first three lines of a log; '-' when the log predates it.
function field(run, key) {
	const head = readHead(run.path, 512).split(/\r?\n/).slice(0, 3);
	const line = head.find((l) => l.startsWith(`${key}: `));
	return line ? line.slice(key.length + 2) : '-';
}

function readHead(path, bytes) {
	const fd = openSync(path, 'r');
	try {
		const buf = Buffer.alloc(bytes);
		const n = readSync(fd, buf, 0, bytes, 0);
		return buf.toString('utf8', 0, n);
	} finally { closeSync(fd); }
}

function state(run) {
	const tail = readTail(run.path, 300);
	if (/done ---|exited with code/.test(tail)) return 'done';
	if (Date.now() - statSync(run.path).mtimeMs < 2 * 60e3) return 'running';
	return 'stopped';
}

function readTail(path, bytes) {
	const size = statSync(path).size;
	const fd = openSync(path, 'r');
	try {
		const len = Math.min(bytes, size);
		const buf = Buffer.alloc(len);
		readSync(fd, buf, 0, len, size - len);
		return buf.toString('utf8');
	} finally { closeSync(fd); }
}

function row(run) {
	let task = field(run, 'task');
	if (task.length > COL.task) task = task.slice(0, COL.task - 3) + '...';
	return `${pad(when(startOf(run)), COL.when)}  ${pad(task, COL.task)}  ${pad(field(run, 'model'), COL.model)}  ${state(run)}`;
}

const out = (s) => process.stdout.write(s);
const size = () => ({ w: process.stdout.columns || 120, h: process.stdout.rows || 30 });

// Paints a frame in place: cursor goes home, each line is overwritten and padded, so nothing is cleared and nothing flickers.
function paint(lines) {
	const { w, h } = size();
	let s = `${ESC}[H`;
	for (let r = 0; r < h; r++) {
		const text = (r < lines.length ? lines[r] : '').slice(0, w - 1);
		s += `${text}${' '.repeat(Math.max(0, w - 1 - text.length))}${r < h - 1 ? '\r\n' : ''}`;
	}
	out(s);
}

let cleanup = () => {};
function exit() {
	cleanup();
	process.exit(0);
}

// Mouse wheel arrives as SGR reports (ESC [ < button ; x ; y M). Turned into two tokens so the key handlers stay the same.
const WHEEL_UP = `${ESC}[<up`;
const WHEEL_DOWN = `${ESC}[<down`;
const WHEEL_LINES = 3;

function keysOf(chunk) {
	const keys = [];
	const re = /\x1b\[<(\d+);\d+;\d+[Mm]/g;
	let last = 0;
	let m;
	while ((m = re.exec(chunk))) {
		if (m.index > last) keys.push(chunk.slice(last, m.index));
		const b = Number(m[1]);
		if (b === 64) keys.push(WHEEL_UP);
		else if (b === 65) keys.push(WHEEL_DOWN);
		last = re.lastIndex;
	}
	if (last < chunk.length) keys.push(chunk.slice(last));
	return keys;
}

function startKeys(onKey) {
	if (!process.stdin.isTTY) return;
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	out(`${ESC}[?1000h${ESC}[?1006h`); // mouse wheel on (SGR); text selection needs Shift while it is on
	process.stdin.on('data', (chunk) => { for (const k of keysOf(chunk)) onKey(k); });
	cleanup = () => { process.stdin.setRawMode(false); out(`${ESC}[?1006l${ESC}[?1000l${ESC}[?25h${ESC}[?1049l`); };
}

let onKeyFollow = () => {};

function showFollow(run) {
	return new Promise((resolve) => {
		let pos = 0;
		let partial = '';
		const lines = [];
		let lastFrame = '';
		let scroll = 0; // lines above the tail; 0 follows the newest output
		const room = () => Math.max(5, size().h - 3); // the header, the key hints and the separator take three rows
		const maxScroll = () => Math.max(0, lines.length - room());
		const fd = openSync(run.path, 'r');

		const tick = () => {
			try {
				const total = statSync(run.path).size;
				if (total > pos) {
					const buf = Buffer.alloc(total - pos);
					readSync(fd, buf, 0, buf.length, pos);
					pos = total;
					const parts = (partial + buf.toString('utf8')).split(/\r?\n/);
					partial = parts.pop();
					lines.push(...parts);
					if (scroll > 0) scroll += parts.length; // scrolled back: the same lines stay on screen
				}
				const head = `${when(startOf(run))} - ${field(run, 'task')} - ${field(run, 'model')} - ${state(run)}`;
				scroll = Math.min(scroll, maxScroll());
				const end = lines.length - scroll;
				const frame = [head, '[wheel/PgUp/PgDn] Scroll    [G] Newest    [Esc/Q/←] Back', '-'.repeat(Math.max(0, size().w - 1)), ...lines.slice(Math.max(0, end - room()), end)];
				const joined = frame.join('\n');
				if (joined !== lastFrame) {
					paint(frame);
					lastFrame = joined;
				}
			} catch {
				finish(); // the log was pruned by a newer run; back to the list
			}
		};

		const timer = setInterval(tick, 250);
		const finish = () => {
			clearInterval(timer);
			closeSync(fd);
			resolve();
		};
		tick();
		const scrollBy = (n) => { scroll = Math.min(maxScroll(), Math.max(0, scroll + n)); tick(); };
		onKeyFollow = (k) => {
			if (k === '\u0003') exit();
			if (k === ESC || k === `${ESC}[D` || k.toLowerCase() === 'q') finish();
			else if (k === WHEEL_UP) scrollBy(WHEEL_LINES);
			else if (k === WHEEL_DOWN) scrollBy(-WHEEL_LINES);
			else if (k === `${ESC}[5~`) scrollBy(room()); // PageUp
			else if (k === `${ESC}[6~`) scrollBy(-room()); // PageDown
			else if (k === `${ESC}[F` || k.toLowerCase() === 'g') { scroll = 0; tick(); } // End: back to the newest output
		};
	});
}

async function main() {
	if (process.argv.includes('--list')) {
		for (const r of runs()) out(`${row(r)}\n`);
		return;
	}
	out(`${ESC}[?1049h${ESC}[?25l${ESC}[2J`);
	let sel = 0; // the cursor: which run is highlighted
	let top = 0; // the first run on screen: the arrows scroll it to keep the cursor visible
	let mode = 'list';
	let lastFrame = '';
	let list = [];
	const visible = () => Math.max(1, size().h - 3); // title, blank line, column header
	const clampTop = () => { top = Math.min(Math.max(0, list.length - visible()), Math.max(0, top)); };
	const keepCursorOnScreen = () => {
		if (sel < top) top = sel;
		else if (sel >= top + visible()) top = sel - visible() + 1;
	};

	const drawList = () => {
		list = runs();
		if (sel >= list.length) sel = Math.max(0, list.length - 1);
		keepCursorOnScreen();
		clampTop();
		const frame = [`claude-pi-bridge runs    [${up}/${down}] Navigation    [Enter/W/${right}] Watch    [Esc/Q] Quit`, ''];
		frame.push(`  ${pad('When', COL.when)}  ${pad('Task', COL.task)}  ${pad('Model', COL.model)}  Status`);
		if (list.length === 0) frame.push('  No pi runs yet');
		list.slice(top, top + visible()).forEach((r, j) => frame.push(`${top + j === sel ? '>' : ' '} ${row(r)}`));
		const joined = frame.join('\n');
		if (joined !== lastFrame) { paint(frame); lastFrame = joined; }
	};

	const openWatch = async (run) => {
		mode = 'follow';
		out(`${ESC}[2J`);
		await showFollow(run);
		mode = 'list';
		lastFrame = '';
		out(`${ESC}[2J`);
	};

	startKeys(async (k) => {
		if (mode === 'follow') { onKeyFollow(k); return; }
		if (k === `${ESC}[A`) { if (sel > 0) sel--; keepCursorOnScreen(); drawList(); }
		else if (k === `${ESC}[B`) { if (sel < list.length - 1) sel++; keepCursorOnScreen(); drawList(); }
		else if (k === '\r' || k === `${ESC}[C` || k.toLowerCase() === 'w') { if (list.length) await openWatch(list[sel]); }
		else if (k === ESC || k.toLowerCase() === 'q' || k === '\u0003') exit();
	});

	drawList();
	setInterval(() => { if (mode === 'list') drawList(); }, 1000);
}

process.on('SIGINT', exit);
main();
