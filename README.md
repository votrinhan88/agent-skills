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

For now, copy the skill folder into your project:

```
cp -r src/skills/writing/avoid-ai-writing <your-repo>/.claude/skills/
```

Claude Code only discovers skills in `.claude/skills/<name>/`, so the folder name must match the `name` in its frontmatter. Some skills come from upstream projects and keep a `source:` URL in their frontmatter.

Copy skills one at a time, and check the `SKILL.md` for any scripts it expects you to run.

## Contributing

Maintainer instructions, including layout, testing and commit conventions, are in [AGENTS.md](AGENTS.md).
