---
name: skill-eval
description: Test a skill in this catalog with eval cases run by `claude plugin eval`, then compare it with a baseline from before the change. Use when the user asks to test, evaluate, benchmark or regression-check a skill, to check whether a skill triggers or changes behaviour, or to compare two versions of a skill.
metadata:
  date: "2026-11-26"
---

# skill-eval

Run a skill's eval cases against a throwaway plugin built from `src/`, then compare with the same cases on a baseline. Suites live outside `src/`, so shipped content stays clean.

**Scope: Claude Code only.** `claude plugin eval` runs each case as a `claude` child process, and the LLM judge defaults to Haiku. A pass shows how the skill behaves in Claude Code, not in Codex, Cursor, Gemini or other harnesses, so never report it as "works across agents". A per-harness runner would be a separate skill.

## Where things live

- Suites: `evals/<skill-name>/` at the repo root, in the layout described in `references/case-format.md`.
- `scripts/build-eval-plugin.sh`: copies one skill and its suite into a scratch plugin.
- `scripts/bridge-smoke.sh`: read-only check that local bridges serve the same `SKILL.md` as `src/`.
- Results: the CLI writes them to the output folder you choose, never into `src/` or `evals/`.

## Workflow

1. **Check the frontmatter.** Only `name`, `description`, `license`, `compatibility` and `metadata` are allowed. Other keys break uploads to claude.ai and the API.

2. **Write or update the cases.** Follow `references/case-format.md`. Each case needs `prompt.md`, `case.yaml` and one or more `graders/NN-*.md`. Word each grader about the result, not about where the work was saved. A case without real assertions keeps the placeholder grader.

3. **Build the plugin.**
   ```bash
   bash src/skills/harness/skill-eval/scripts/build-eval-plugin.sh <skill-name> <scratch>/candidate
   ```
   It refuses a non-empty output folder or an ambiguous skill name.

4. **Check bridges, if any.** Run `bash src/skills/harness/skill-eval/scripts/bridge-smoke.sh <skill-name>`. A missing bridge is fine, because the build reads `src/` directly.

5. **Build a baseline when comparing versions.** Check out the previous content in a worktree, then build from it:
   ```bash
   git worktree add <scratch>/base <ref>
   bash src/skills/harness/skill-eval/scripts/build-eval-plugin.sh --root <scratch>/base <skill-name> <scratch>/baseline
   ```
   Remove the worktree with `git worktree remove <scratch>/base`, never a plain `rm`.

6. **Run only after the user agrees.** Each run is a billed model call. Tell the user the case count, the runs per case (`--runs`, default 3) and a proposed cost ceiling, then run:
   ```bash
   claude plugin eval <scratch>/candidate --output-dir <scratch>/results/candidate --trust-plugin --no-publish --max-cost-usd <usd>
   ```
   Add `--allow-tools` only for tools a case needs, such as `--allow-tools "Bash(git status:*)"`. Add `--scaffold` only for input files in cases we wrote. Run the baseline the same way, with its own output folder and `--ablation none`.

7. **Read the results.** Scores are in `aggregate-result.json`, and verdicts in `report.html`. Report each run's pass rate and why failing graders failed. A grader that passes on both candidate and baseline does not show the change helped.

8. **Report.** Give the pass rates, the candidate-versus-baseline difference and the result paths. Don't commit suites or results without the user's go-ahead.

## Rules

- Never write cases inside `src/skills/`, and never edit a user-owned `evals/evals.json`.
- Use `--trust-plugin` only on plugins built from this repo.
- Bash-granting suites need WSL2 on Windows, because native Windows has no OS sandbox. Say so if a suite needs Bash on native Windows.

## Not yet verified

- That `claude plugin eval` runs headless from Windows Git Bash and accepts a built plugin folder.
- That Claude Code discovers skills inside a built plugin the way it discovers them through a junction.
- The Linux and macOS paths of the scripts.
