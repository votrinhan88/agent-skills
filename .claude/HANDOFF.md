# Handoff: agent-skills

Layout, testing and git conventions are in `.claude/CLAUDE.md`.

## State
- Skills under `productivity/`, `research/`, `writing/` and `harness/` are curated and committed.
- `harness/codex-first` is a single `SKILL.md` adapted from steipete/agent-scripts (`source:` URL kept). Default worker `gpt-6-luna`, medium, standard tier; `gpt-6.2-sol` for hard work. Dropped as stale or unneeded: autoreview, `scripts/codex-resume` (needs lsof/pgrep), `references/`. Tested twice with fresh subagents on Windows, Codex CLI 0.171: routing, launch flags, prompt contract, escape-hatch stop and review all held. Not tested: resume path, long or parallel workers, macOS/Linux.
- `game-dev/gym-zoo-museum` is cloned from `games/pitchside/.claude/skills/` (no `source:` URL; not yet curated or tested).
- `writing/consistency-check` checks GitHub, X and web-page references via `scripts/web.mjs` (syntax-checked only, not run against a real post).
- `productivity/i-have-adhd` is a deliberately shorter copy of upstream. Rule 9 keeps the older "cap at 5" wording. Keep it close to upstream; don't trim the repetition.

## Decisions
- codex-first: after 2 failed worker rounds, Claude advises the user (stronger model or take over) instead of deciding. Worker self-review is a step in the order, not a reasoning-level change (effort is fixed at launch).
- `.claude/settings.json` allows only `mv` into and out of `.claude/skills/` for testing. `codex exec` (runs `--yolo`) and commits still prompt.
- A skills folder added to `.claude/skills/` mid-session is not discovered until restart; for every-reply behaviour import a skill in `CLAUDE.md` with `@path/to/SKILL.md`.

## Open
- How downstream repos install the skills (plugin layout or flatten script).
- Run `consistency-check --refs` on a real post to test `web.mjs`.
- Push (user decides when); local main is ahead of origin.

## Suggested skills
- `grill-me` for the install design.
- `handoff` to refresh this file.
