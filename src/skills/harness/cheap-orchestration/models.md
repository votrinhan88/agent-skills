# Model Roster

Last updated: 2026-11-27.

Update this file when models or prices change, and change the date above. The routing rules in [SKILL.md](SKILL.md) refer to tiers only, so they do not need to change.

| Tier | Provider | Model ID | Good for | Cost / limit notes |
| :--- | :--- | :--- | :--- | :--- |
| Fast | DeepSeek | `deepseek-flash` | High-volume subagents, bulk code edits, boilerplate, summarization | $0.30 in / $1.20 out per MTok at peak; $0.15 / $0.60 off-peak; cache hit $0.006 (peak) / $0.003 (off-peak); 1M context; vision; no long-context surcharge |
| Fast | OpenAI | `gpt-6-luna` | Triage, classification, structured JSON extraction, quick tool loops | $0.10 in / $0.01 cached / $0.50 out per MTok; 1.05M context; multimodal; computer use |
| Fast | Anthropic | `claude-haiku-5-5` | Fast file exploration, subagent search, browser/UI checks | $0.10 in / $0.50 out per MTok for prompts up to 100K; $0.50 / $2.50 above 100K (5x); 1M context; vision |
| Fast | Google | `gemini-3.5-flash-lite` | High-throughput routing, multimodal triage (images, PDFs, logs) | $0.30 in / $2.50 out per MTok; flat across 1M context; multimodal input; no computer use |
| Workhorse | Google | `gemini-4-hydrogen` | Everyday coding, multimodal repo ingestion, fast agentic loops | $1.50 in / $7.50 out per MTok (global endpoint; regional endpoints +10%); flat across 1M context; multimodal |
| Workhorse | OpenAI | `gpt-6.2-sol` | General coding, multi-step workflows, clear technical prose | $2 in / $10 out per MTok; above 272K input the whole request is billed at 2x input and 1.5x output; 1.05M context; computer use |
| Workhorse | Anthropic | `claude-sonnet-5-5` | Iterative feature dev, clean diffs, doc/UI generation | $2 in / $10 out per MTok; flat across 1M context; vision; watch subscription quotas |
| Upper-Mid | Google | `gemini-4-neon` | Root-cause debugging, security/data analysis, complex engineering | $3 in / $15 out per MTok (global endpoint; regional +10%); flat across 1M context; multimodal |
| Flagship | Anthropic | `claude-opus-5-5` | Hard multi-file refactors, long-horizon agentic coding | $4 in / $20 out per MTok; flat across 1M context; Fast Mode doubles rates |
| Flagship | OpenAI | `gpt-6.2-astra` | Hardest architecture, math/science, computer use, zero-shot specs | $8 in / $40 out per MTok; use sparingly; long-context surcharge not confirmed |
| Flagship | Anthropic | `claude-fable-5-2` | Novel algorithms, deep synthesis, high-stakes audits | $8 in / $40 out per MTok; flat across 1M context; last resort |

## Notes

- `deepseek-v4-pro` is no longer routed to `deepseek-flash`. It is listed separately (about $0.66 / $1.32 per MTok, no vision). It is not in the table.
- Prices are per million tokens (MTok).
- Prices and notes were checked against an outside review dated 2026-11-27. Not every source was re-checked by the maintainer.
- Models that may belong in the table but are not added yet: `gemini-4-carbon`, `gemini-4-argon` (introductory pricing until 2026-11-30), `gpt-6.1-terra` ($1 / $5), `gemini-3.8-flash` (introductory pricing until 2026-12-31), `claude-mythos-5-2` ($8 / $40, restricted).
