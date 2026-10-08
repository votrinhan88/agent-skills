---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
source: https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md
---

Write a handoff document so a fresh agent can continue this work. Save it as `.claude/HANDOFF.md` at the git repo root (not the current directory), as one file that overwrites the previous one. Create `.claude/` if missing.

Contents:
- **State:** what was done, what is in progress, and what is next.
- **Decisions:** what was settled and why, and what was ruled out.
- **Open questions** and known blockers.
- **Suggested skills:** which skills the next agent should call via the Skill tool.

Rules:
- Include only what a fresh agent can't recover from the repo, git history or linked artifacts. Don't restate file listings, diffs, commit contents, or what specs, plans, ADRs and issues already hold; link to them by path or URL. Keep it short: a line per item, not a narrative.
- Redact secrets and personal data (API keys, passwords, PII).
- If the user passed arguments, treat them as the next session's focus and tailor the document to it.

Remote sessions start from a fresh clone, so the file reaches them only if it is committed and pushed. If `.claude/HANDOFF.md` is gitignored, say so. After writing, tell the user the path and that it must be committed and pushed for remote sessions to see it. Don't commit or push on your own.
