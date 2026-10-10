# Handoff: agent-skills

Layout, testing and git conventions are in `.claude/CLAUDE.md`.

Next session: decide how downstream repos install the skills (see Open).

## State
- 10 skills (`productivity/`, `research/`, `writing/`) are curated and committed.
- `game-dev/gym-zoo-museum` was cloned from `games/pitchside/.claude/skills/`, but the upstream `SKILL.md` is 0 bytes, so the copy is empty too. Find a real version or drop it.
- Uncommitted work in progress: `writing/consistency-check` (SKILL.md, `scripts/citecheck.mjs`, new `scripts/web.mjs`) and `writing/explainer-voice/SKILL.md`.
- `productivity/i-have-adhd` is a deliberately shorter copy of upstream. Rule 9 keeps the older "cap at 5" wording. Keep it close to upstream; don't trim the repetition.

## Open
- How downstream repos install the skills (plugin layout or flatten script).
- Finish and commit the `writing/` changes above.

## Suggested skills
- `grill-me` for the install design.
- `handoff` to refresh this file.
