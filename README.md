# agent-skills

Agent skills for Claude Code and similar tools. Each skill is a folder with a `SKILL.md` and any helper files. Nothing here runs by itself. Copy what you need into your project.

## What's here

Skills are in `src/skills/`, grouped by category:

- **harness/**: setup and bridging between coding agents (`sync-harness-setup`, `codex-first`, `claude-pi-bridge`, `skill-eval`, `cheap-orchestration`).
- **productivity/**: working habits and session handoffs (`grill-me`, `handoff`, `todo-list`, `i-have-adhd`)
- **research/**: paper review and summaries (`academic-paper-reviewer`, `summarize-paper`)
- **writing/**: prose style and checks (`asd-ste100`, `avoid-ai-writing`, `consistency-check`, `explainer-voice`, `strategic-narrative`)

Each skill's `SKILL.md` says what it does and when to use it.

## Using a skill

Copy a skill folder (without its category) into `<your-repo>/.agents/skills/`:

```
cp -r src/skills/writing/avoid-ai-writing <your-repo>/.agents/skills/
```

Claude Code reads only `.claude/skills/`. To link skills there, copy `src/skills/harness/sync-harness-setup/scripts/sync-skill-links.sh` into your repo's `scripts/` and run it from the repo root:

```
scripts/sync-skill-links.sh --dry-run   # review the plan
scripts/sync-skill-links.sh
```

On Windows it makes junctions (no admin needed); elsewhere, symlinks. Use `--copy` if links fail. The script only works inside the git repo. Add the linked paths (`.claude/skills/<name>`, and `.agents/skills/<name>` for junctions) to your `.gitignore`, since git can't store junctions. The check script fails if they aren't ignored.

The folder name must match the skill's `name`. Upstream skills keep their source in `metadata.source`.

Copy one skill at a time. Check its `SKILL.md` for scripts to run.

## Contributing

Maintainer instructions, including layout, testing and commit conventions, are in [AGENTS.md](AGENTS.md).
