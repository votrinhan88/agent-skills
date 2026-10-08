---
name: strategic-narrative
description: Plan or audit a blog post's strategy before its prose is polished: the main question, an outline, and whether each paragraph serves its section. Use early, on "check the strategy", "purpose map", "does this paragraph serve the post", or an outline request.
---

# Strategic Narrative

Think chess.
A post has a grand strategy: the main question it answers.
Every section and paragraph is a tactic that serves it, and its purpose is what the reader knows or can do after it that they did not before.
A tactic may stray if one sentence says how it connects.
Settle the strategy before the wording: a paragraph whose purpose cannot be said in one sentence needs fixing first.

## Procedure

1. **Outline.** Draft: write one line per section and paragraph before any prose, and ask the author first if the main question is unstated. If `<post>.outlines.md` exists, use it (header = section purpose, bullet = paragraph purpose) and note where it and the text disagree. Otherwise infer each purpose from the text, and ask only if one can't be inferred.
2. **Strategy check.** Give each paragraph a verdict: *serves*, *drifts*, *misplaced*, or *unclear*. A tie-back sentence means it serves, but a hedge alone such as "not yet shown" is not one. Test drift by deleting the paragraph: if the section's purpose still holds, it drifts. If it belongs in another section, call it misplaced and name that section. Report only the paragraphs that don't serve.

## Outline format

`<post>.outlines.md` next to the post. Open with two lines, `Reader: ...` and `Question: ...`. One bullet per paragraph, 12 words or under, headings mirroring the post's. A paragraph split by a display equation counts as two. Keep bullets short, since agents tend to bloat them.

## Output

Open with the main question you inferred, in one line. Locate a paragraph by section, paragraph number, and lines. Flag part of a paragraph by line range.

```
Question: <main question>
- <section, paragraph, lines> (drifts | misplaced | unclear): "<purpose>". <note or target section>
- All other paragraphs serve their sections.
```

## Don't

Don't edit prose, or add content, claims, citations, or numbers. Don't judge wording.

## Invocation

`[--mode draft|detect] [--file PATH]`. Draft writes the outline from the main question. Detect only reports.
