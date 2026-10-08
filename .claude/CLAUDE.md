# agent-skills

Catalog of Claude Code skills for use downstream in other repos. Nothing here runs on its own.

## Layout
- Skills live at `<category>/<skill-name>/SKILL.md`, with categories `productivity/`, `research/` and `writing/` at the top level.
- A skill is self-contained: supporting files (`references/`, `examples/`, `scripts/`, `templates/`) sit inside its own folder, and `SKILL.md` references only those.
- Skills copied from upstream carry a `source:` URL in their frontmatter. Don't leave a nested `.git/` inside a skill folder; git would record it as an embedded repo instead of files.

## Testing a skill
Claude Code only discovers `.claude/skills/<name>/SKILL.md`, so category folders are not loadable in place. To test, move the skill to `.claude/skills/<name>/`, run it (ideally with a fresh subagent on cases not tailored to the skill), then move it back.

## Curating a skill
Tighten it, remove repetition, then test it. Exception: `productivity/i-have-adhd` is deliberately close to upstream, so don't trim its repetition.

## Git
- Conventional-commit messages (`feat(scope): ...`, `docs(scope): ...`), with no Claude signature.
- Ask before committing or pushing.
- `.claude/HANDOFF.md` carries session state; refresh it with the `handoff` skill. `.claude/settings.json` holds only portable permissions; keep machine paths out of it.
