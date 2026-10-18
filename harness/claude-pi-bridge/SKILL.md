---
name: claude-pi-bridge
description: Delegate a task to the local `pi` coding agent (another CLI agent that runs in the cwd and edits files) with a readable live log. Use when the user says "send it to pi", "pi <model>", or wants a second opinion, a parallel attempt or a cheap scoped subtask from pi.
---

# claude-pi-bridge

Treat pi like a trusted subagent: spawn it without asking.

## Rules
- Brief it fully: it sees only the prompt and the files it reads. For briefs longer than about 20 lines, write them to a file in the scratchpad and pass "read <path> first".
- Audits and opinions are read-only: pass `--tools read` or `--no-tools` (wrapper and raw form). These tools cannot run git: if pi needs git output, run the command yourself and paste it into the brief.
- Edit tasks: name the files pi may touch, and pass an explicit `--tools` list such as `read,edit,write` (pi's built-in tools are read, bash, edit, write) so it cannot shell out. No git commit/add/checkout/reset/stash/push unless the brief allows it.
- After edits: review `git diff`; for untracked new files use `git diff --no-index /dev/null <file>`. Run the project's check from its local notes, then report PASS/FAIL with the failing names.
- A failed check is reported, not fixed, unless the user asks in the same turn.
- A run that ends without an answer (log shows `--- done ---` with no text) is reported as such. Retry once with a shorter brief that asks for a single final line, then report.
- If a small model fits the task, use it. Escalate to a larger one only when a small one is not enough, and ask for user approval.
- If the permission classifier denies an action, stop and ask the user.

## Run

Never bare `pi` (it opens a TUI and hangs). Every run uses `-p --mode json --no-session --no-context-files --no-extensions --no-skills --no-mcp`.

**Start**
1. Pick the model. For a named model ("pi qwen"), run `pi --list-models <word>` and pass the match as `--model <provider>/<id>`. If several match, use the default in `.claude/CLAUDE.local.md`; ask only when none is noted.
2. Write the brief to a scratchpad file. Never pass it as a quoted string.
3. Start the wrapper with `run_in_background`. It refuses to start without a brief on stdin:

       node <this-skill-dir>/pi-run.mjs <model-id> "<task-label>" [--tools read,edit,write,bash | --no-tools] [--thinking level] < <brief-file>

4. Give the task label as 2-4 words (e.g. "TODO audit"). The picker shows it with the model.

If the wrapper is unavailable, use the raw form, piping through the watch filter. Never redirect to `/dev/null` or a raw file:

    pi -p --mode json --no-session --no-context-files --no-extensions --no-skills --no-mcp [--model M] [--tools T] "<brief>" 2>&1 | node <this-skill-dir>/pi-watch.mjs <model-id> "<task-label>"

The watch filter keeps the newest 32 logs (override with `PI_WATCH_KEEP`). Each run has its own log in `<os tmp>`, so parallel runs never share one.

**Watch** (the header is lines 1 to 3: `log:`, `model:`, `task:`)
- Scroll a log: `less --header=3 "<path>"`
- Follow a live run and scroll back: `less --header=3 +F "<path>"` (`Ctrl+C` to scroll, `F` to follow again)
- Without `less`: `Get-Content -Wait <path>` (PowerShell) or `tail -f <path>` (POSIX). No scrolling, no pinned header.

**Read the result** (after the background task completes; do not poll)
1. Take the path from the task output's first line (`log: <path>`). Use `<os tmp>/pi-last-log.txt` only when one run is active: every new run overwrites it.
2. Run `tail -n 40 <path>`.

**For the user:** `pi-tail.cmd` (double-click on Windows) or `pi-tail.sh` opens the run picker (`scripts/pi-picker.mjs`).
