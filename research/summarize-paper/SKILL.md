---
name: summarize-paper
description: Write a short structured summary of an ML paper from an arXiv ID, a link, or pasted text, and file it in the .papers/ cache. Use when the author asks to summarize, digest, or file a paper.
---

# Summarize paper

## Steps

1. **Find the source.** Look in `.papers/` first for `<key>.md` (the summary) and `<key>.txt` (the source text). The key is the first author's surname, the year, and one title word, all lowercase (`hafner2019dream`, `ren2025gen3c`). For an arXiv ID or link, fetch the abstract page and the HTML version (`arxiv.org/abs/<id>`, then `ar5iv`). WebFetch cannot read PDFs, so for a PDF ask for pasted text.
2. **Fill `template.md`.** Aim for 200 to 300 words. Write `(not reported)` for anything the source does not say, and never invent results.
3. **File it.** Save the summary as `.papers/<key>.md` and the fetched text as `.papers/<key>.txt`, so the paper is not downloaded twice.
4. **Report** the path, and list any field marked `(not reported)`.

## Rules

- Give numbers only as the paper reports them, and name the table or section.
- Assume the reader knows the field. Flag links to methods and benchmarks they would recognize.
- Prefer clarity and omit secondary details.
- Contributions state what is new and why it matters. Method states how it works.
- Every claim must trace to the paper. Attribute the authors' hypotheses to them, and list the weaknesses they admit under Limitations.
