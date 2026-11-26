# agent-skills

A catalog of agent skills for Claude Code and similar coding agents. Each skill is a folder with a `SKILL.md`, plus any scripts or references it needs. Nothing here runs on its own; you copy what you want into your own project.

## What's here

Skills are grouped by category under `src/skills/`:

- **harness/**: setup and bridging between coding agents (`sync-harness-setup`, `codex-first`, `claude-pi-bridge`)
- **productivity/**: working habits and session handoffs (`grill-me`, `handoff`, `todo-list`, `i-have-adhd`)
- **research/**: paper review and summaries (`academic-paper-reviewer`, `summarize-paper`)
- **writing/**: prose style and checks (`asd-ste100`, `avoid-ai-writing`, `consistency-check`, `explainer-voice`, `strategic-narrative`)

Each skill's `SKILL.md` says what it does and when to use it.

## Using a skill

Copy a skill's folder into `<your-repo>/.agents/skills/`, without the category folder:

```
cp -r src/skills/writing/avoid-ai-writing <your-repo>/.agents/skills/
```

Claude Code only looks in `.claude/skills/`. To bridge the skills there, copy `src/skills/harness/sync-harness-setup/scripts/sync-skill-links.sh` into your repo's `scripts/`, then run it from the repo root:

```
scripts/sync-skill-links.sh --dry-run   # review the plan
scripts/sync-skill-links.sh
```

The default mode makes a junction on Windows (Git Bash, no admin needed) and a symlink elsewhere. Use `--copy` where links do not work. The script only acts inside the git repo. Add the bridged paths (`.claude/skills/<name>`, and `.agents/skills/<name>` when it is a junction) to your `.gitignore` yourself, because git cannot store junctions. The check script fails if they are not ignored.

The folder name must match the `name` in the skill's frontmatter. Some skills come from upstream projects and record their origin in a `metadata.source` URL.

Copy skills one at a time, and check the `SKILL.md` for any scripts it expects you to run.

## Contributing

Maintainer instructions, including layout, testing and commit conventions, are in [AGENTS.md](AGENTS.md).
