---
name: codex-first
description: "Delegate hands-on work (implementation from a frozen spec, tests, refactors, git mechanics, read-heavy exploration, long runs) to Codex workers while a Claude session keeps specification, judgment and review. Use when the session runs a Claude model."
source: https://github.com/steipete/agent-scripts/tree/main/skills/codex-first
---

# Codex First

Delegate to Codex only when the session itself runs a Claude model (check "You are powered by the model …"). On a GPT or other non-Claude model, or if the model can't be identified, work directly.

## Launch flags — read first, copy verbatim

Default every worker, **fresh or resumed**, to `gpt-6-luna`, medium reasoning, standard tier. Use `gpt-6.2-sol` for heavier work.

```bash
# fresh
codex exec --yolo -C "$WT" \
  -m gpt-6-luna \
  -c 'model_reasoning_effort="medium"' \
  -c 'model_auto_compact_token_limit=260000' \
  -o "$OUT" - < "$ORDER"

# resume: re-pass every flag; resume does not inherit them
codex exec resume "$SID" --dangerously-bypass-approvals-and-sandbox \
  -m gpt-6-luna \
  -c 'model_reasoning_effort="medium"' \
  -c 'model_auto_compact_token_limit=260000' \
  -o "$OUT" -
```

- `--yolo` removes the sandbox: scope it with `-C` to the repo or a worktree, and list what the worker must not touch in the order.
- Stay on medium reasoning; go higher only for heavy reasoning. Compact early (260k) to avoid stale context.
- No tier flag means the standard tier. Fast and ultrafast cost much more quota; use them only when asked (`--enable fast_mode -c 'service_tier="fast"'`).
- Copy all flags into any wrapper and override them only on the user's request.

## Route

Delegate to Codex (default for hands-on work):

- implementation from a frozen spec; refactors; mechanical migrations
- bug fixes (known repro, or diagnose-then-fix), CI/lint/type failures; test writing; coverage fills
- dependency bumps, scripts/tooling
- read-heavy exploration, instead of Claude Explore/Task subagents whenever raw reading ≫ the answer (parallel `-o` files, one per thread)
- git mechanics (rebase, merge-conflict resolution, the land workflow), as one self-contained order covering rebase→resolve→CI green→land
- CI waits: poll one run with `gh run view <id> --json status,conclusion` about every 10 minutes; never `gh run watch` or `--watch`. PR CI is the default broad proof; don't rerun or re-push just for green

Keep in Claude:

- design, API design, architecture, naming, UX judgment
- tasks where writing the spec IS the work (ambiguity = design)
- tiny edits (under ~20 lines, one obvious change)
- anything needing session tools (MCP, browser, 1Password) or secrets
- releases, publishes, version bumps and their credentials
- the land decision and gates (review clean, CI green, proof). Codex runs the mechanics only after Claude decides to land
- push: ask the user first

Mixed task: Claude designs first, freezes the spec, then delegates the build-out.

## Prompt contract

Codex starts with zero session context; spec quality decides success. Every order states:

- goal, exact repo paths, constraints, non-goals
- proof expected (exact test command) and output shape ("report files changed + test output")
- "do not commit; do not edit the tests; do not touch <list>"
- the repo skill for the area being changed, if one exists, to read before the first edit
- an escape hatch for every hard prohibition: "if gate X fails after honest attempts, STOP and report exact numbers; do not work around." Treat a stop-report as a successful run
- a self-review step: "review your own diff for bugs, scope creep and missing tests before reporting"
- an explicit stop: "Do exactly this; nothing more."

Point workers at the repo's instruction file (`AGENTS.md` or `CLAUDE.md`) and edit it only when the user asks. New orders go to fresh sessions, since saturated resumed sessions mistake orders for configuration and no-op. Keep untrusted code secretless.

## Review

A worker's report is never proof. The worker reviews its own diff first. Claude then reviews every diff itself:

- `git status -sb`, then read the full diff and judge it like a contributor PR
- run the focused tests yourself; Codex claims are advisory
- check that guard, budget and baseline files the spec forbade touching are unchanged, and be suspicious of test-helper edits
- after 2 failed rounds, stop and advise the user: retry on a stronger model (`gpt-6.2-sol`) or have Claude take over directly
- before you edit or commit, make sure your worker's background command has exited (a stray worker from an earlier session can overwrite your fixes)
- parallel workers: max 2, on disjoint files, one worktree and branch each

## When a worker dies in seconds

Read the log tail before relaunching; the cause is usually the model route, not the task. `401` means a bad key; `502 / All target providers failed` means the router doesn't know that model id; `stream disconnected` against a loopback URL means nothing is listening; `requires a sandbox with reviewed escalations` means retry once with `--approve-for-me` instead of `--yolo`. Never pass a credential through `-c key=value`.

## Resuming a worker

`codex exec resume` has no `-C` (run it as `(cd <repo> && …)`) and no `--yolo` (use `--dangerously-bypass-approvals-and-sandbox`). Pass the session UUID from the fresh run's `session id:` log line, not `--last`, and re-pass model, reasoning and `-o`. Send only the delta in the follow-up prompt. A rejected flag prints `Usage: codex exec resume` while the harness may still report exit 0, so check the log tail. "list_turns is not supported yet" means the thread is too long: relaunch fresh with a self-contained order. For a long run you can't babysit, send the full stream to a log, save the session id at once, and treat ~5 minutes of log silence as a hang.
