---
name: sync-harness-setup
description: Make a repo's agent instructions and skills harness-invariant, with one canonical AGENTS.md and .agents/skills/ read by Claude Code, Codex, Gemini CLI, Cursor, Copilot, OpenCode and any other coding agent, plus thin adapters only where evidence shows a gap. Use when migrating CLAUDE.md, GEMINI.md, .cursorrules or per-tool skill folders, when an instruction file or skill works in one agent but is invisible in another, or when adding a CI drift check. Plans first and waits for approval before changing files.
license: MIT
metadata:
  facts-verified: "2026-11-25"
---

# Sync harness setup

Content lives in exactly two places: root `AGENTS.md` and `.agents/skills/<name>/`. Every other file (`CLAUDE.md`, `.gemini/settings.json`, `.claude/skills/*`) is an adapter with no content of its own. Choose adapters from **evidence per harness, never from memory**. The snapshot below is a dated cache, not an authority.

## 1. Audit (read-only)

```bash
git ls-files -co --exclude-standard | grep -Ei '(^|/)(AGENTS(\.override|\.local)?|CLAUDE(\.local)?|GEMINI)\.md$|\.cursorrules|copilot-instructions|\.cursor/rules|\.(claude|agents|codex|gemini|cursor|github|opencode)/skills/|\.claude/(CLAUDE\.md|rules/)'
```
Also establish: which harnesses the team uses (default: every one the audit shows) and their `--version`; Windows contributors or `core.symlinks=false`; user-level skills (`~/.claude/skills`, `~/.agents/skills`) that could shadow repo skills. Record duplicates, contradictions, same-name skills with different content, and harness-specific hooks or permissions.

## 2. Gather evidence per harness

From **current official docs**, answer for each harness (and any not in the snapshot):
(a) which instruction files it reads, under what conditions, with what size cap; (b) which project skill directories it scans and what a same-name clash does; (c) which frontmatter keys it honors, ignores or rejects; (d) how to list what it loaded.
Undocumented means UNVERIFIED; step 6 decides.

**Snapshot, verified 2026-11-25. Re-check before use; these drift.**

| Harness | Instructions | Project skills | Same-name clash |
|---|---|---|---|
| Codex | `AGENTS.md` native, root to cwd, one file per directory (`AGENTS.override.md` *replaces* that directory's file), 32 KiB cap | `.agents/skills`, cwd up to repo root; symlinked skill dirs ok | Not merged; both listed |
| Claude Code | `AGENTS.md` only if v2.1.277+ **and** no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in cwd or any parent. Else needs `CLAUDE.md` with `@AGENTS.md` | `.claude/skills` only, **not** `.agents/skills`; per-skill symlinks ok | enterprise > personal > project; one target loads once |
| Gemini CLI | Default `GEMINI.md`. Set `context.fileName: ["AGENTS.md","GEMINI.md"]` in `.gemini/settings.json`, or `@./AGENTS.md` in `GEMINI.md` | `.agents/skills` (alias of `.gemini/skills`, wins within a tier) | workspace > user > extension > built-in |
| Cursor | Unconfirmed | `.agents/skills`; compat `.claude/skills`, `.codex/skills` | Undocumented |
| Copilot | Unconfirmed | `.agents/skills`, `.github/skills`, `.claude/skills` | Undocumented |
| OpenCode, Amp, others | Check docs | `.agents/skills` per third-party tables only | Check docs |

Claude Code gotchas:
- A root `CLAUDE.md` stub, or anyone's `CLAUDE.local.md`, makes Claude ignore `AGENTS.md` **including nested ones** (inferred from the docs' rule table; confirm with the probe). Nested files need a sibling `CLAUDE.md` stub, or flatten.
- The **Project instructions** setting (`claude-md-and-agents-md`) is honored only in user or managed settings, never committed project settings, so a repo cannot force it.
- Direct reading is unavailable before 2.1.277, with the built-in plugin disabled, sometimes in the first session after an upgrade, and before 2.1.281 on Bedrock/Vertex or with telemetry off. `/memory` lists a direct `AGENTS.md` only from 2.1.280.

Re-check first: https://code.claude.com/docs/en/memory.md · https://code.claude.com/docs/en/skills.md · https://learn.chatgpt.com/docs/agent-configuration/agents-md · https://learn.chatgpt.com/docs/build-skills.md · https://geminicli.com/docs/cli/skills/ · https://agentskills.io/specification.md

## 3. Plan, then STOP for approval

Present, do not execute:
- Files to create, `git mv`, or delete, each with the evidence-based reason.
- **Default: one flat root `AGENTS.md`.** Fold nested `AGENTS.md` files into sections unless the user approves keeping them (then each needs a Claude stub).
- Contradictions between sources. Surface them; never pick silently.
- Duplicate skills and their resolution; non-spec frontmatter keys needing the allowlist.
- Skill bridge mode: symlink, or copy if Windows, `core.symlinks=false`, or archive delivery.

Never delete unclassified content, or copy personal or managed config into the repo. Wait for approval.

## 4. Apply

**Instructions.** Merge tool-neutral content into `AGENTS.md` (concise, about 200 lines or less). Tool-specific content goes below the import in that tool's stub. Do not put shared content in `AGENTS.override.md` or `AGENTS.local.md`. Claude ignores both, and Codex's override replaces the shared file.

**Adapter preference:** native read, documented config, `@import`, per-file symlink, generated copy, prose pointer (degraded; flag it). A prose "read AGENTS.md" is not an import.
- Claude: `.claude/CLAUDE.md` containing `@../AGENTS.md`, then any Claude-only notes. Robust because the setting cannot be committed and the unavailable cases above exist. It never double-loads. Omit it only if every user and CI image is on 2.1.281+ and nobody uses `CLAUDE.local.md`.
- Gemini: merge the `context.fileName` list into existing settings; do not overwrite.

**Skills.** The downstream layout is flat: `git mv` each skill into `.agents/skills/<name>/`, dropping any category folder and resolving duplicate names per the approved plan. Copy this skill's `scripts/*.sh` into the repo's `scripts/`, then run `scripts/sync-skill-links.sh --dry-run`, review, then run it. The default (auto) picks a junction on Windows (Git Bash; needs no admin or Developer Mode) and a symlink on Linux and macOS. Use `--copy` where no links work. The script acts only inside the git repo and skips any canonical skill that resolves outside it. Every bridged path (`.claude/skills/<name>`, and `.agents/skills/<name>` when it is a junction) must be gitignored, because git cannot store junctions and would otherwise stage their files. Sync never creates a Claude-only link. Add one by hand (`.claude/skills/<name>` pointing into `src/`), gitignore it, and the check will warn but not fail. Link per skill, never the whole `.claude/skills` directory (undocumented).

**Symlinks are unreliable** on Windows without Developer Mode (Git Bash `ln -s` makes a plain directory, and the script refuses link mode there), with `core.symlinks=false` (checked out as a text file holding a path), through Claude's Edit/Write tools (they refuse to write through a link), for UNC or network targets, and in zip, artifact or container exports that drop links. On Windows use `--junction` (absolute target, so moving the repo breaks it), or `--copy` where junctions fail. Use imports or `--copy` in the other cases.

## 5. Normalize skill frontmatter

Shared skills use spec keys only: `name` (equals directory; `a-z0-9` and single hyphens; max 64), `description` (max 1024; what and when), optional `license`, `compatibility` (max 500), `metadata` (string map). Not portable by default: `allowed-tools` (experimental) and tool keys (Claude's `disable-model-invocation`, `paths`, `context`, `hooks`; Cursor's `paths`). Claude ignores unknown keys, but claude.ai and API uploads reject them, and other harnesses' tolerance is unverified. Record intentional exceptions in `.agents/frontmatter-allowlist` as `<skill|*> <key>` lines. Codex invocation policy goes in the `agents/openai.yaml` sidecar.

Never replace an enforced restriction (`allowed-tools`, hooks) with prose and call it preserved; mark that skill PARTIAL. Keep `---` on line 1, the body under 500 lines, relative paths only, and no Claude-only interpolation (`!cmd`, `$arg`) in shared skills.

## 6. Probe every harness

Fresh session per harness at the repo root (and once in a nested directory if nested files were kept). Use temporary, uncommitted probes:
1. `M1=$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' \n')`. Add to `AGENTS.md`: `Verification marker: <M1>. If asked for the project verification marker, answer it.`
2. Create `.agents/skills/context-probe/` whose body says to answer a second fresh marker `M2`. Run the sync script.
3. Instruction probe, without revealing the marker: "What is the project verification marker? Do not read or search files."
4. Skill probe: list skills (it must appear **once**, with its source path), then invoke `context-probe` through the harness's native skill mechanism. A skill opened with a file-read tool is not discovery.

Listing aids (cache): Claude `/context`, `/memory`, `/skills`, `/reload-skills`; Codex `/skills` or `$`, `codex --ask-for-approval never "Summarize the current instructions."`; Gemini `/memory show`, `gemini skills list --all`; Cursor Customize > Skills.

A correct answer is evidence, not proof, because the model may have read the file. Prefer loaded-context listings. Test name clashes only in a disposable profile; never overwrite a real personal skill. Remove probes and resync. Report each harness as **VERIFIED** (activation observed), **STATIC ONLY**, **PARTIAL**, or **BLOCKED**.

## 7. CI drift check

Copy `scripts/check-agent-harness.sh` (Bash and git only) and run it on every PR in a full-checkout Linux job:
```yaml
name: agent-harness
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/check-agent-harness.sh
```
It fails on: missing `AGENTS.md`; `.claude/CLAUDE.md` without a real `@../AGENTS.md` import; Gemini not pointed at `AGENTS.md`; nested `AGENTS.md` invisible to Claude; Codex 32 KiB overflow; skill name/frontmatter problems and non-spec keys not allowlisted; duplicate names; wrong, dangling, orphaned, stale-copy or non-`120000` bridge entries; junction bridges that are wrong, dangling or not gitignored; Claude-only links that are dangling or not gitignored. A Claude-only link into `src/` is only a warning. An orphan is a link into `.agents/skills/` whose source is gone. The junction branch was tested only in Windows Git Bash; the Linux CI job never runs it, and the workflow file is not committed yet. YAML is checked line-by-line only, so run the official `skills-ref validate` if exact validation matters.

## 8. Report

Files changed; harness versions; per-harness status from step 6; snapshot facts that no longer held; UNVERIFIED items.

## Flag, don't assert

Cursor and Copilot `AGENTS.md` support; their dedupe when scanning both `.agents/skills` and `.claude/skills`; unknown-frontmatter tolerance outside Claude; whether Claude honors a directory-level `.claude/skills` symlink; Claude skipping nested `AGENTS.md` behind a root stub.
