# agent-skills

Skills for other repos. Nothing here runs by itself. This file is for maintainers only.

## Layout
- Real content lives in `src/skills/<category>/<skill-name>/`. Categories: `harness/`, `productivity/`, `research/`, `writing/`.
- Categories are for this repo only. At downstream, skills sit flat.
- Each skill is self-contained: keep its helper files in its own folder, and link only to those.
- Skills from upstream keep a `metadata.source` URL. Delete any nested `.git/` in a skill folder, or git stores it as an embedded repo.
- Root holds only: `AGENTS.md`, `.claude/` (Claude-only), `src/`, `.agents/` (shared notes and skill links), and `evals/` (test suites, not shipped).
- Bridged skills must be gitignored, since git can't store junctions.

## Testing a skill
Test each skill three ways. Each catches what the others miss.

1. **Load (every skill):** make a junction at `.agents/skills/<name>` into `src/` by hand. Run `sync-skill-links.sh` to mirror it into `.claude/skills/<name>`. Gitignore both. Run `/reload-skills`, then check a fresh subagent loads the skill on prompts it wasn't written for. Afterwards, delete the junctions, not the target. Keep the skill in `src/skills/`.
2. **Behavior (skills with checkable rules):** use `skill-eval`. Claude Code only, and it costs money, so ask first. Run each case several times.
3. **Read-through (style and writing skills):** a person reads the output. Graders can't judge tone.

## Curating a skill
Tighten, remove repetition, then test. Exception: `i-have-adhd` stays close to upstream, so don't trim it.

## Git
- Ask before committing or pushing.
- Conventional commits (`feat(scope): ...`). No model/harness signature.
- Refresh `.agents/HANDOFF.md` with the `handoff` skill. Keep machine paths out of `.claude/settings.json`.
