---
name: explainer-voice
description: Draft, edit, or audit blog explainer or survey post prose so it sounds like the author, a guide walking the reader through one question, plain and candid. Use on request, when the author says "in my voice" or "match my tone".
---

# Explainer Voice

## Voice rules

**Narrative**
- Let the section's purpose decide how ideas connect. Do not impose a pattern on every transition.
- Weave callbacks into the narrative, not section numbers. Never use "§".
- A roadmap sentence (what a section covers, or the order of what follows) is fine. Do not tease an outcome.
- End a paragraph on a fact, a hand-off, or a plain takeaway. No aphorisms or quotable slogans.
- Foreshadow rarely, only when the plot is deliberate.
- A framing question is allowed now and then, not as a habit.

**Tone**
- Speak as a guide ("let's", "we", an occasional "I"), only occasionally and only where a sentence needs it. Never force it into short method paragraphs.
- Say plainly what is not known or not shown.
- State things flatly. No hype, no triumphant verbs, no flattery.
- Light connectives: "Yet,", "Besides,", "Thus,", "In short,". Informal but not slangy.
- In a first-person, anecdotal post, contractions and "let's" are fine.

**Language**
- Plain verbs and concrete nouns. Replace figurative or inflated words with the literal thing: "attack the signal" becomes "add signal".
- Gloss in passing with "i.e.," and "e.g.,". Semicolons are rare.
- Bold the first mention of a unique keyword, most often a method name. Italics emphasize a stressed word, message, or concept.
- Mix sentence lengths, with one short punchy sentence now and then, not often.
- Lead with whatever the reader lacks: a new idea gets its intuition first (why), a familiar one its mechanism first (what).
- Keep concrete idiosyncratic phrasing ("sparks of the same idea"), fix abstract metaphors and inflated verbs, and keep rewrites in the author's register without upgrading the vocabulary.

## Reference voice

Read a sample before editing, and match what is there.

- Voice sample: the Prologue, sections 1 and 2, and subsections 3.1 and 3.2 of `_posts/2026-08-05-world-models-survey.md`.
- Worked examples, if present: `examples/before-after.md`.

## Pattern prompt

When you see the author repeat the same kind of edit, ask whether to add it to this skill's rules. Edit only this file, never a new one.

## Detect output

Voice flags only.
No severity ratings: the voice rules are not pass/fail, and nuances go to the author's later review.

```
Voice
- "<quoted text>" (<rule>) -> <plainer rewrite>
```

## Don't

- Don't add content, claims, citations, or numbers.
- Don't touch math, code, quotations, or footnote markers.
- Keep one sentence per line, and the file's existing dashes and spelling.

## Invocation

`[--mode draft|edit|detect] [--file PATH]`, or plain language.

- **draft**: write new text from the post's outline.
- **edit**: revise the named file in place with minimal, sentence-level edits. Fix voice only: do not reorder, cut, or restructure without approval, except to delete a sentence that only restates the previous one or is a slogan closer (say so). Output the revised text, then a numbered change list naming the rule behind each change, or "no change needed".
- **detect**: report only, no rewriting.
