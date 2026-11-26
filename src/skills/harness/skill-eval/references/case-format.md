# Case format

Each case is a folder under `evals/<skill-name>/` at the repo root, in the layout `claude plugin eval` reads. The same cases therefore run from a terminal, in CI or in skill-creator's viewer.

```
evals/<skill-name>/<case-name>/
├── prompt.md        # settings block, then the user's prompt
├── case.yaml        # version, name, what success looks like
├── graders/         # one file per assertion: 01-first-check.md, 02-...
└── files/           # input files, only if the case needs any
```

**Case name:** lowercase letters, digits and hyphens, starting with a letter, saying what is checked, such as `flags-negative-quantity`. Avoid `results`, `mocks`, `node_modules`, `files`, `true`, `false` and `null`.

## prompt.md

A settings block, then the prompt exactly as a user would type it.

```markdown
---
tags: [handoff]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Write a handoff for the next session. It will fix the login bug.
```

- The CLI reads only `max_turns`, `timeout_seconds`, `allowed_tools` and `tags`. Any other key stops the case from loading.
- The block ends at the first `---`, so keep free text out of it. Descriptions go in `case.yaml`.

## case.yaml

```yaml
schema_version: "1.1"
name: flags-negative-quantity
expected_outcome: |
  The handoff names the login bug as the next task and points to the file that holds it.
```

Quote the version, or it reads as a number and the case fails to load. `name` must equal the folder name.

## graders/NN-few-words.md

One verifiable statement per file, numbered to keep the order.

```markdown
---
type: llm
focus: trace
weight: 1
---

The handoff names the login bug as the next task.
```

- Word each grader about the result, not where the work was saved. "The handoff names the login bug" works under any runner. "The file is in the outputs folder" does not.
- `focus: trace` lets the judge see what was done, not just the final message.
- Equal weights make the score equal the pass rate.

### Placeholder grader

A case without real assertions still needs one grader to load. Use `graders/01-expected-output.md`:

```markdown
---
type: llm
focus: trace
weight: 1
---

The result matches this description: <the expected outcome from case.yaml>
```

Keep the placeholder until real graders exist. Never grade it by hand.

## Input files

1. Put them in `files/`, and end the prompt with a line such as `Input files: orders.csv, notes.txt`.
2. Add `place-files.sh` beside `prompt.md`:
   ```bash
   #!/usr/bin/env bash
   set -eu
   cp -R "$(dirname "$0")/files/." .
   ```
3. Name it in `case.yaml`:
   ```yaml
   context:
     scaffold_script: place-files.sh
   ```

The CLI runs `scaffold_script` only with `--scaffold`, which is for cases we wrote.
