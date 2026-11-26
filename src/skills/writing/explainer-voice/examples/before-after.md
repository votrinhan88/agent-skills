# Before and after

Examples on neutral topics (caching, compilers, networking, version control), not taken from the author's texts, so they do not bias the voice.
Each pair shows one rule.

1. **Concrete over grand.**
   - Before: "Version control lets teams unlock the full story of their code."
   - After: "Version control lets a team see who changed each line, and when."

2. **One idea per sentence, no echoed "each".**
   - Before: "Each cache sets its own eviction policy, which is why we cover them one at a time, each trading memory for speed in its own way."
   - After: "Caches differ in what they evict, so we take them one at a time."

3. **Give the concrete cause and cost instead of a stock pivot.**
   - Before: "The very thing that makes the index fast is also what makes it expensive."
   - After: "The index is fast because it keeps everything in memory, so it needs a lot of RAM."

4. **Literal over figurative.**
   - Before: "Newer compilers attack the startup delay from several angles."
   - After: "Newer compilers cut startup time in several ways."

5. **A "because" chain over "never X; it only Y".**
   - Before: "The client never needs the full file; it only needs the changed blocks."
   - After: "Because the server tracks changes, the client downloads only the changed blocks."

6. **No echo closer.**
   - Before: "A longer window smooths the noise but delays the signal. How much to smooth depends on what you are measuring."
   - After: "A longer window smooths the noise but delays the signal."

7. **Don't over-explain.**
   - Before: "Latency has a precise meaning here: it is the time between a request leaving the client and the first byte arriving back."
   - After: "Latency here is the time until the first byte arrives."

8. **Plain statement, no triumph.**
   - Before: "This groundbreaking approach was enough to set a new bar for query speed."
   - After: "The approach set a new best query speed on the benchmark."

9. **Vary repeated phrasing.**
   - Before: "The scheduler carries over the queue state. The retry logic carries over the timeout."
   - After: "The scheduler keeps the queue state, and the retry logic reuses the timeout."

10. **A detour is fine with one tie-back sentence.**
    - Before: a paragraph on the history of cache hardware, inside a section on eviction, with no link to it.
    - After: the same paragraph plus "This history matters because early caches fixed the eviction rule that later ones relax."

11. **Hand-off, not slogan; roadmap, not tease.**
    - Before: "In the end, a cache is only as good as what it forgets. Stay tuned: the next section changes everything."
    - After: "Another approach skips eviction and recomputes on demand. The next section covers eviction policies."
