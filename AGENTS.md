# agent-skills

Catalog of agent skills for use downstream in other repos. Nothing here runs on its own. This file is for maintaining the catalog, not for shipping.

## Layout
- Shipped content lives under `src/`. Skills are at `src/skills/<category>/<skill-name>/SKILL.md`, with categories `harness/`, `productivity/`, `research/` and `writing/`.
- Categories are only for this repo. At downstream, skills sit flat.
- A skill is self-contained: supporting files (`references/`, `examples/`, `scripts/`, `templates/`) sit inside its own folder, and `SKILL.md` references only those.
- Skills copied from upstream carry a `metadata.source` URL in their frontmatter. Don't leave a nested `.git/` inside a skill folder; git would record it as an embedded repo instead of files.
- Root holds only maintainer files: this `AGENTS.md`, `.claude/` (Claude-only config and session state), `src/`, and `.agents/`. `.agents/` is allowed only as a gitignored bridge: `.agents/skills/<name>` is a junction into `src/`, never canonical content.
- Skills bridged from `src/` are gitignored under `.claude/skills/` and `.agents/skills/`. Git cannot store junctions, so these entries must stay ignored.

## Testing a skill
Claude Code only discovers `.claude/skills/<name>/SKILL.md`, so skills under `src/` are not loadable in place. To test, bridge the skill with `src/skills/harness/sync-harness-setup/scripts/sync-skill-links.sh` (default mode: a junction on Windows, a symlink elsewhere), then run `/reload-skills` and check the skill loads from a fresh subagent on cases not tailored to it. Afterwards, remove the bridge (delete the junction, not the target) and keep the skill under `src/skills/`.

## Curating a skill
Tighten it, remove repetition, then test it. Exception: `src/skills/productivity/i-have-adhd` is deliberately close to upstream, so don't trim its repetition.

## Git
- Conventional-commit messages (`feat(scope): ...`, `docs(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`), with no Claude signature.
- Ask before committing or pushing.
- `.claude/HANDOFF.md` carries session state; refresh it with the `handoff` skill. `.claude/settings.json` holds only portable permissions; keep machine paths out of it.
