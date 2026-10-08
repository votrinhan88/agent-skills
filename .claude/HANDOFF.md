# Handoff: agent-skills

Catalog of Claude Code skills for use downstream in other repos; it does nothing on its own. Skills sit in top-level category folders (`productivity/`, `research/`, `writing/`).

Next session: decide how downstream repos install the skills (see Open).

## State
- `productivity/grill-me`, `productivity/handoff`, `productivity/i-have-adhd`: done and committed. `i-have-adhd` is a deliberately shorter copy of the upstream skill (`source:` in its frontmatter). Rule 9 keeps the older "cap at 5" wording. Keep it close to upstream; don't trim the repetition.
- `research/summarize-paper`, `research/academic-paper-reviewer`: curated, committed, not pushed.
- `writing/` (5 skills: `asd-ste100`, `avoid-ai-writing`, `consistency-check`, `explainer-voice`, `strategic-narrative`): curated and committed, not pushed.
- `.claude/settings.json` is untracked and intentionally left out (local permissions).

## Decisions
- Category folders live at the top level, so skills are not directly loadable here (Claude Code only discovers `.claude/skills/<name>/SKILL.md`).
- To test a skill in place, it must sit at `.claude/skills/<name>/`; move it back to its category folder afterwards.

## Open
- How downstream repos install the skills (plugin layout or flatten script).
- Push to `origin/main` (user decides when).

## Suggested skills
- `grill-me` for the install design.
- `handoff` to refresh this file.
