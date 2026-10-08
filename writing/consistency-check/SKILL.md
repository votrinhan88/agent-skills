---
name: consistency-check
description: Scripted checks on a blog post: footnotes, math fences, equation width, outline sync, and with --refs, references against arXiv and Crossref. Use while writing and before publishing.
---

# Consistency check

Scripts decide. Report findings. Don't edit the post.

## Offline

`node scripts/check.mjs <post.md>` (exit 1 on failure):

1. Every `[^key]` is defined, and every definition is used.
2. `$$` lines come in pairs.
3. Warn on display-equation lines over 110 source characters (check the render on a phone).
4. No "§".
5. If `<post>.outlines.md` exists: one bullet per paragraph under every heading, 12 words or under.

By reading, with 3 fresh Haiku agents that see no other agent's output, each reading in a different order. Take the union of findings and treat each as a lead. Verify every one against the text:

6. Each symbol is defined once, with one meaning.
7. Each term keeps one name.
8. No later qualification contradicts an earlier claim.

## `--refs`

`node scripts/citecheck.mjs <post.md>`, in the background. It runs chunks of 10, 3 at a time (`--chunk`, `--jobs`), and merges rows in key order. It checks title, authors, year, venue, edition, and pages against arXiv, Crossref, and Semantic Scholar. Verify each MISMATCH and NOT-FOUND by hand. `VENUE UNCONFIRMED` and `NOTE` are advisory. Blogs, books, and reports are MANUAL. Cache papers in `.papers/` as `author2026paper`.
