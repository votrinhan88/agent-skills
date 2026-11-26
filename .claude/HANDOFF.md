# Handoff: agent-skills

Conventions are in `AGENTS.md` at the root. `.claude/CLAUDE.md` only imports it.

## State
- Unpushed: everything on `main` after `origin/main` (`git log origin/main..HEAD`). Push is the user's call.
- Committed this session: `6130eea` (bridge script, check script, gitignore for bridges) and `60e746d` (non-spec frontmatter keys moved under `metadata`).
- Pending commit, with this file: `AGENTS.md` and `README.md` updates, plus this handoff.
- `scripts/check-agent-harness.sh` on the real repo: `agent harness: OK`. It does not read `src/`, so it does not catch non-spec keys in shipped skills.
- Local bridges, both gitignored: `.claude/skills/handoff` and `.agents/skills/handoff` are junctions into `src/skills/productivity/handoff`. Claude Code loads the full body (confirmed by subagent after `/reload-skills`).
- Tested only on Windows Git Bash: the junction branch of `sync-skill-links.sh`, and its prune and refusal cases. Linux and macOS branches are untested. Linux CI never runs the junction branch.
- Skills tested only where noted: `codex-first` on Windows, Codex CLI 0.171; `consistency-check`'s `web.mjs` is syntax-checked only.
- Unverified: Claude Code follows the `@../AGENTS.md` import in a fresh session. Needs a probe, for root and for `src/`.
- The `mv` permission patterns in `settings.json` have not been tested against a real move.

## Decisions
- Downstream repos copy skills in. Copies flatten to `.agents/skills/<name>/`, so names must be unique across categories. Upstream origin goes in `metadata.source`.
- Root `.agents/` is allowed, but only as gitignored bridges into `src/`. Canonical content stays in `src/`.
- Nested `AGENTS.md` under `src/` is exempt from the nested-invisible check. `src/` is shipped content and is not read from the root.
- Junctions, not symlinks, on Windows: no admin or Developer Mode needed. `ln -s` on Windows makes a plain directory, so the script refuses link mode there.
- Testing moves a skill through a bridge (`sync-skill-links.sh`) and back, not a bare `mv`. Delete a junction, never its target.
- `handoff` no longer sets `disable-model-invocation`, so the model can invoke it on its own.

## Open
- `src/AGENTS.md` is still a template with placeholders. Fill in the real shipped instructions or drop it.
- Frontmatter: the check does not read `src/`. Consider running it (or `skills-ref validate`) over `src/` before push.
- Whether Claude Code honors the `@../AGENTS.md` import in a fresh session (see State).
- Cursor and Copilot `AGENTS.md` support, and Claude's handling of nested `AGENTS.md` behind a root stub: unverified, flagged in `sync-harness-setup`.

## Suggested skills
- `sync-harness-setup` for the `AGENTS.md` and bridge work.
- `handoff` to refresh this file.
