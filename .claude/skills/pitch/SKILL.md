---
name: pitch
description: Writes the 3-minute video script, the live pitch and the jury Q&A from the real state of the repo, then stress-tests it with the jury-critic agent. Run at 13:30 and again at 15:00.
disable-model-invocation: true
---

# Pitch, video script and Q&A

1. Read `docs/02-analysis.md`, `docs/04-demo-script.md`, `docs/kbc-context.md`, `README.md` and
   the code for the demo path. Only promise what the code actually does; label anything mocked.
2. Write in `docs/04-demo-script.md`:
   - **One-sentence pitch** and **closing line**.
   - **Video script under 3:00** as a table: time, what is on screen, the exact voice-over text.
     Show the product within the first 30 seconds. Structure: moment of need, demo, how it works
     and scales, trust, close. Roughly 130 words per minute of voice-over, so at most about 380
     words in total.
   - **Live pitch** version (if there is a live pitch), same arc, with who says what.
   - **Jury Q&A**: answer every question in the bank, at most three sentences each, grounded in the
     code and `kbc-context.md`. Add the three questions you think are most dangerous for us.
3. Use the `jury-critic` agent on the result. Apply its fixes to the script where they are about
   wording or order; list the ones that need code changes separately, with an estimate.
4. Check every number in the script. Mark anything unverified with [VERIFY] and suggest asking
   the `kbc-researcher` agent.
