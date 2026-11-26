# Handoff: agent-skills

Conventions are in `AGENTS.md` at the root. `.claude/CLAUDE.md` only imports it.

## State
- `main` is 2 commits ahead of `origin/main` (`35f78d3`): `d1dc87e` (skill-eval) and `ca3d2a5` (handoff and todo state under `.agents/`). Not pushed.
- Uncommitted, ready to commit after the user's go-ahead:
  - `sync-skill-links.sh`: prunes only links into `.agents/skills/`. Links and copies use the same orphan rule (source `SKILL.md` gone).
  - `check-agent-harness.sh`: checks frontmatter of `src/` skills too. A Claude-only link into `src/` is a warning, and must resolve and be gitignored.
  - `AGENTS.md`, `README.md`, `sync-harness-setup/SKILL.md`: plain-language rewrite. Load step now says the `.agents/skills/<name>` junction is made by hand.
  - `.claude/settings.json`: allow list cut to `git check-ignore`.
  - `src/skills/productivity/handoff/SKILL.md`: `argument-hint` removed (spec keys only). Added the exact heading template (State, Decisions, Open questions, Suggested skills).
  - `src/skills/writing/asd-ste100/README.md`: deleted.
  - This file.
- Check on the real repo: `agent harness: OK`. One WARN: `skill-eval` is Claude-only.
- Downstream test, scratch repo with no `src/`, Windows: sync makes a junction. Check fails until the junction is gitignored, then passes. Re-sync is clean. `--copy` works. Scratch path: `scratchpad/ds-*`.
- Local bridges, all gitignored junctions: `.claude/skills/handoff`, `.agents/skills/handoff`, `.claude/skills/skill-eval`.
- Tested on Windows Git Bash only. Linux and macOS untested. The CI workflow is a snippet in `sync-harness-setup/SKILL.md`, not committed.

## Decisions
- Removed `argument-hint` from the handoff skill so it uses spec keys only. Cost: no slash-command hint in Claude.
- Canonical skill content stays in `src/`. `.agents/` holds shared notes and gitignored links.
- Windows uses junctions. Other systems use symlinks, but that path is untested. `--copy` is the fallback.

## Open questions
- Commit and push: needs the user's go-ahead. Suggested split: (1) sync and check; (2) docs; (3) handoff skill; (4) asd-ste100 deletion; (5) settings.json; (6) this file.
- Test the Linux or macOS symlink path, or record it as a known gap.
- Add the CI workflow, or drop the snippet.
- `skills-ref validate` not run.
- `src/AGENTS.md` is still a template with placeholders. Fill it in or delete it.
- Verified with `claude -p` in the real repo: a fresh session reads `AGENTS.md` through `@../AGENTS.md` (marker probe, file restored). Interactive session not checked. Scratch-folder probes did not load `CLAUDE.md`, so they proved nothing.
- Unverified: non-Claude harnesses read `.agents/HANDOFF.md`.
- The todo-list load test has not run. It needs `/reload-skills`.
- The `mv` rules in `settings.json` are untested.

## Suggested skills
- `sync-harness-setup` for `AGENTS.md` and bridge work.
- `handoff` to refresh this file.
