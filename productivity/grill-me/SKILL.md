---
name: grill-me
description: Grill the user relentlessly about a plan, decision, or idea, using interactive multiple-choice questions. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
source: https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round, wait for the answers, then recompute the frontier: settled decisions unblock the questions that depended on them. A question that depends on another still open in this round belongs to a later round.

## Asking

Use `AskUserQuestion` for every question. If the tool is unavailable, ask the same questions as lettered plain text instead, with the same options and recommendations.

- **Batching:** the tool takes 1-4 questions per call. If the frontier exceeds 4, send consecutive calls and treat them as one round.
- **Question:** specific, self-contained, ending in a question mark. Add a short header tag (max 12 chars) naming the decision.
- **Options:** 2-4 distinct choices covering the realistic answers, each description stating its trade-off. Don't add "Other"; the tool provides it.
- **Single vs. tickbox:** ask single-select when the choices exclude each other (pick one approach). Ask tickboxes (`multiSelect: true`) when the answer can be several at once: which constraints apply, which features are needed, which risks are real, which cases to cover. Prefer tickboxes for any "which of these" question, and don't force a single pick onto a combinable answer.
- **Recommendation:** put your pick first, labelled "(Recommended)". On a tickbox question, label every option you'd tick. If no answer is defensible without facts only the user has, put no label on any option and say so in the question.
- **`preview`:** only on single-select questions, and only when the user must compare concrete artifacts (code, config, layouts).

An "Other" answer or added notes can add, remove, or reorder branches; recompute accordingly.

## Facts vs. decisions

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait. Ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

## Done

The session is done when the frontier is empty: every branch visited, nothing left silently assumed. Summarize the settled decisions, and don't act on them until the user confirms you have reached a shared understanding.
