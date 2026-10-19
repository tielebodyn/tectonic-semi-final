---
name: kickoff
description: 09:15 kickoff. Decodes the pasted KBC brief into scoring hooks, checks whether Doppel still fits, and proposes scored idea candidates. Run after the brief is in docs/01-brief.md.
disable-model-invocation: true
---

# Kickoff: decode the brief and generate candidates

Do not write application code in this step. Only update the two docs files named below.

1. Read `docs/01-brief.md` (the raw brief), `docs/kbc-context.md`, `docs/doppel-context.md`,
   `docs/paths/path-a-doppel.md` and `docs/paths/path-b-new-challenge.md`.
2. If the raw brief section is still empty, stop and ask the user to paste it.
3. **Decode.** Fill the decode table in `docs/01-brief.md`: every phrase KBC repeats or stresses,
   what KBC most likely means by it, and what a solution must show to score on it. Add the scoring
   weights if the brief gives them. Note differences from the semi-final brief.
4. **Path A check.** In five lines: does Doppel still answer this brief? Which hooks does it miss?
   What would the upgrade be? Verdict: continue / continue with a twist / drop.
5. **Candidates.** Propose five idea candidates (Doppel 2.0 counts as one if it fits). For each:
   - one-line idea and the customer moment,
   - the demo moment (what visibly changes on screen in under 20 seconds),
   - the answer to "isn't this Kate?",
   - how it scales to millions,
   - how it splits into four workstreams (PM, FE, BE core, BE 2),
   - biggest risk.
6. Score each candidate in the scorecard of `docs/02-analysis.md` (Originality ×3, Technical ×3,
   Fit ×3, Security ×1, plus demo moment strength and buildability in about four hours of build
   time). Be harsh; a human KBC jury is judging.
7. End with your recommendation in three sentences and the three questions the team must settle
   before 10:00. The team decides, not you.
