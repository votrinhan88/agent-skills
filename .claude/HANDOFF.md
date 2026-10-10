# Handoff: agent-skills

Layout, testing and git conventions are in `.claude/CLAUDE.md`.

Next session: decide how downstream repos install the skills (see Open).

## State
- 10 skills (`productivity/`, `research/`, `writing/`) are curated and committed.
- `game-dev/gym-zoo-museum` is cloned from `games/pitchside/.claude/skills/` (no `source:` URL; not yet curated or tested).
- `writing/consistency-check` now checks GitHub, X and web-page references via `scripts/web.mjs` (syntax-checked only, not run against a real post). `writing/explainer-voice` gained a warmth line.
- `productivity/i-have-adhd` is a deliberately shorter copy of upstream. Rule 9 keeps the older "cap at 5" wording. Keep it close to upstream; don't trim the repetition.

## Open
- How downstream repos install the skills (plugin layout or flatten script).
- Run `consistency-check --refs` on a real post to test `web.mjs`.
- Push after the next commit (user decides when).

## Suggested skills
- `grill-me` for the install design.
- `handoff` to refresh this file.
