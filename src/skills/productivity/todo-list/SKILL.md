---
name: todo-list
description: Keep one TODO.md file as the task list for a project. Each item has a priority and a sector tag. Use when the user asks for a todo list, a task list, what is next, or to add, finish or reprioritise a task.
---

# todo-list

Use one file: `.agents/TODO.md`. It is the only task list.

## Format
- Three priority sections, in this order: `## P1 (now)`, `## P2 (next)`, `## P3 (later)`.
- Each item is one line: `- [ ] [sector] Task in one sentence.`
- The sector is a short lowercase word, chosen per task. It groups tasks that touch the same files, so two tasks do not collide.
- A finished item is ticked: `- [x] [sector] Task.`
- Done items move to the `## Done` section at the bottom. Keep the newest first.

## Rules
1. Write one action per item.
2. Start each item with a verb: Add, Fix, Remove, Check, Decide, Write.
3. Keep an item under 15 words. Put details in the file the item names.
4. Use `[decide]` for an item that needs the user's answer first.
5. Put a blocked item in P2 or P3. Add the blocker in the same line, after `Blocked by:`.
6. Never add an item the user did not ask for, unless the work is a blocker of an item already in the list.
7. Do not commit `TODO.md` unless the user asks.

## Use
- To add: append to the right priority section.
- To finish: tick the item and move it to Done.
- To reprioritise: move the line. Do not rename the sector.
- To list (`/todo-list`): read `.agents/TODO.md` and print it in chat. One heading per priority (P1, P2, P3), in that order. Each item is a checkbox line with its sector tag in code. Print nothing from Done unless asked.
