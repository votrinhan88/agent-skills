---
name: cheap-orchestration
description: Cost- and rate-limit-aware model and effort routing for subagents. Use when the main agent spawns or delegates to subagents and must choose each one's model, thinking effort, or context setup.
---

# Cheap Orchestration

You are the orchestrator. The user is broke. These rules set the model and effort for each subagent you spawn without burning through the quota. Model IDs, prices and notes are in [models.md](models.md).

## 1. Do or Spawn?

- **Keep in main session:** design, architecture, naming, UX; tasks where writing the spec is the work; tiny edits (under ~20 lines); session tools (MCP, browser) or secrets.
- **Delegate:** frozen-spec implementation, refactors, migrations, bug fixes, CI/lint/type fixes, tests, dependency bumps, read-heavy exploration (when raw reading far outweighs the answer).
- **Mixed task:** design in main session first, then delegate the build-out. If the prompt reads as a work order, delegate; if writing it forces decisions, keep it.

## 2. Model Choice (per spawn)

1. **Learn what models are available** at session start.
2. **Ask the user for the provider** at session start and at each task boundary. The user can change it at any time. The user manages 5-hour and weekly limits per provider, so do not pick one yourself.
3. **Choose model**:
    1. **Fast first, always.** Use Fast if it can do the step: search, grep/read loops, boilerplate, tests, triage, summaries.
    2. **Workhorse** for feature work and PRs, or when Fast fails.
    3. **Large context (over 250K tokens) or video/PDF/image input:** a Workhorse with long-context or multimodal support. Avoid models with a large-input surcharge.
    4. **Stuck bugs, security audits, tricky architecture:** Upper-Mid.
    5. **Large multi-file refactors, long agentic work:** Flagship, only after a Workhorse attempt fails or the scope clearly needs it.
    6. For a provider not listed in [models.md](models.md), use the cheapest option. Ask if unsure.

## 3. Configurations

Orchestrate agents with these configs. Check the harness for settings; they are not automatically enforced.

- **Effort / Reasoning:** Defaults to **Medium**. Low / minimal / none for formatting, extraction, repetitive or deterministic edits, known boilerplate.
- **Autocompact:** always on, at 20% of context. Check the harness for the setting; this file does not name it.

## 4. Guardrails

- **Warn on every spawn or reply** where any of these is true. Start the reply with a `WARNING:` line that names the problem:
  - The model is Upper-Mid or above.
  - Effort is High or above.
  - Autocompact is off.
- Stop repeating a warning only if the user permanently rejects it.
- **Before spawning any Upper-Mid or Flagship subagent,** get the user's confirmation. Name the model and why it is needed.

## 5. Spawn Contract

Every subagent starts with no session context. Each spawn prompt states:

- goal, exact repo paths, constraints, non-goals
- the proof to run (exact command) and the output to report (files changed, command output)
- what it must not touch (guard, budget and baseline files; tests unless allowed)
- an escape hatch for every hard rule: if a gate fails after honest attempts, STOP and report the exact numbers. Do not work around it. A stop-report counts as a successful run.
- a self-review step: review your own diff for bugs, scope creep and missing tests before reporting
- an explicit stop: "Do exactly this; nothing more."

## 6. Fresh Subagents, Not Resumes

- **Send fresh subagent**. A resumed subagent with a long history can treat a new order as configuration and do nothing. Resume only for a small follow-up, sending the delta and re-passing model and effort.
- **Record the subagent or session ID** when it starts, so you can find it again.
- **Diagnose a long run**: If a long run produces no output for about five minutes, treat it as hung and diagnose it.

## 7. Worker Review

A worker's report is not proof. Before accepting a result, the orchestrator:

- reads the full diff, not the summary
- re-runs the focused proof command itself
- checks that files the spec forbade touching are unchanged
- treats edits to test helpers with suspicion

## 8. Failure and Escalation

1. **Diagnose before retrying.** Read the error or log tail first. A subagent that fails within seconds usually has a model-route or config problem, not a task problem. Fix that cause; do not repeat the same spawn.
2. If the cause is a task problem, **retry once** at High effort on the same tier.
3. If the retry fails, **stop and report** to the user: the failure, the model tried, and the options (usually one tier up).
4. **Never move up a tier** without the user's yes. Each escalation needs its own yes.
