# Handoff: agent-skills

Conventions are in `AGENTS.md` at the root. `.claude/CLAUDE.md` only imports it.

## State
- Local commits, unpushed:
  - `de82f1e` moved categories under `src/skills/`.
  - `6eb9ec8` removed `game-dev/gym-zoo-museum`.
  - `fa7af4b` added `src/AGENTS.md` (placeholder template) and `src/.claude/CLAUDE.md` (import stub).
  - `d91a3b5` added root `AGENTS.md` and `README.md`, and move-only test permissions in `.claude/settings.json`.
- Unverified: Claude Code follows the `@../AGENTS.md` import. Needs a fresh-session probe, for root and for `src/`.
- `harness/sync-harness-setup` is committed under `src/skills/harness/`; its scripts still assume the old layout.
- Skills tested only where noted: `codex-first` on Windows, Codex CLI 0.171; `consistency-check`'s `web.mjs` is syntax-checked only.
- The `mv` permission patterns in `settings.json` have not been tested against a real move.

## Decisions
- Downstream repos copy skills in. Copies flatten to `.agents/skills/<name>/`, so names must be unique across categories, and the source commit goes in the `metadata` key of `SKILL.md`.
- `src/` ships skills plus setups. Setups sit directly in `src/` (`src/AGENTS.md`, later more).
- Root `AGENTS.md` is maintainer-only. No `.agents/skills` bridge in this repo.
- Testing moves a skill from `src/skills/<category>/<name>` to `.claude/skills/<name>` and back. Only those two `mv` rules are allowed in `settings.json`.

## Open
- `README.md` copy example uses `.claude/skills/`; downstream plan is `.agents/skills/`. Pick one.
- `src/AGENTS.md` is a template with placeholders; fill in the real shipped instructions.
- `sync-harness-setup` must: stub at `.claude/CLAUDE.md`; accept `@../AGENTS.md` (CI script accepts only `@AGENTS.md` or `@./AGENTS.md` and looks for a root `CLAUDE.md`); map categories to flat names for copy-in.
- No committed `.gitignore`; ignore rules live in `.git/info/exclude`.
- Push: user decides.

## Suggested skills
- `sync-harness-setup` for the `AGENTS.md` and bridge work.
- `handoff` to refresh this file.
