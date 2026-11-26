# Handoff: agent-skills

Conventions are in `AGENTS.md` at the root.

## State
- `main` is 1 commit ahead of `origin/main` (`557acc9`): `cheap-orchestration` skill, with this handoff update. Not pushed.

## Decisions
- `cheap-orchestration` governs subagents only. Provider is chosen by the user at session start and task boundaries. Autocompact is always on.

## Open questions
- How to load `cheap-orchestration` at session start: `AGENTS.md` line, Claude Code SessionStart hook, or `CLAUDE.md` import.

## Suggested skills
- `handoff` to refresh this file.
