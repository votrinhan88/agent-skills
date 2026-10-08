# Handoff: agent-skills

Catalog of Claude Code skills for use downstream in other repos; it does nothing on its own. Skills sit in top-level category folders (`productivity/`, `writing/`).

Next session: curate and add further skills the way grill-me was (tighten, remove repetition, test with a fresh subagent on cases not tailored to the skill).

## State
- `productivity/grill-me` is done: committed and pushed (`origin/main`), curated, and tested with subagent and user runs.
- `productivity/handoff` is done: curated and shipped together with this file.
- `productivity/i-have-adhd` is done: a deliberately shorter, self-contained copy of the upstream skill (`source:` in its frontmatter). Rule 9 keeps the older "cap at 5" wording. Keep it close to upstream; don't trim the repetition.

## Decisions
- Category folders live at the top level, so skills are not directly loadable here (Claude Code only discovers `.claude/skills/<name>/SKILL.md`).
- To test a skill in place, it must sit at `.claude/skills/<name>/`; move it back to its category folder afterwards.

## Open
- How downstream repos install the skills (plugin layout or flatten script).
- Which curated skills to commit and push, and when (user decides).

## Suggested skills
- `grill-me` for the install design.
- `handoff` to refresh this file.
