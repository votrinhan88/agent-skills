# agent-skills

Catalog of agent skills for use downstream in other repos. Nothing here runs on its own. This file is for maintaining the catalog, not for shipping.

## Layout
- Shipped content lives under `src/`. Skills are at `src/skills/<category>/<skill-name>/SKILL.md`, with categories `harness/`, `productivity/`, `research/` and `writing/`.
- A skill is self-contained: supporting files (`references/`, `examples/`, `scripts/`, `templates/`) sit inside its own folder, and `SKILL.md` references only those.
- Skills copied from upstream carry a `source:` URL in their frontmatter. Don't leave a nested `.git/` inside a skill folder; git would record it as an embedded repo instead of files.
- Root holds only maintainer files: this `AGENTS.md`, `.claude/` (Claude-only config and session state), and `src/`.

## Testing a skill
Claude Code only discovers `.claude/skills/<name>/SKILL.md`, so skills under `src/` are not loadable in place. To test, move the skill to `.claude/skills/<name>/`, run it (ideally with a fresh subagent on cases not tailored to the skill), then move it back under `src/skills/`.

## Curating a skill
Tighten it, remove repetition, then test it. Exception: `src/skills/productivity/i-have-adhd` is deliberately close to upstream, so don't trim its repetition.

## Git
- Conventional-commit messages (`feat(scope): ...`, `docs(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`), with no Claude signature.
- Ask before committing or pushing.
- `.claude/HANDOFF.md` carries session state; refresh it with the `handoff` skill. `.claude/settings.json` holds only portable permissions; keep machine paths out of it.
