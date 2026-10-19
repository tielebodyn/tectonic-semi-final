# Path B: a new challenge (or we drop Doppel)

Use this when the final brings a new task, or when the analysis shows Doppel no longer fits.

## The first hour

| Time | Step | Output |
| --- | --- | --- |
| 09:00 | Peter pastes the brief into `docs/01-brief.md`. Ask the organiser questions. | Raw brief |
| 09:15 | Everyone silently writes 3 ideas: one line + the demo moment. Lorenzo runs `/kickoff`. | 12 ideas + Claude's decode and candidates |
| 09:30 | 60 seconds per idea, no discussion. Cluster duplicates. | 4-6 candidates |
| 09:40 | Score on the scorecard in `02-analysis.md`. Run `jury-critic` on the top two. | Ranked shortlist |
| 10:00 | Peter decides. | One idea |

## Filters an idea must pass

1. **One customer, one moment.** You can tell it in two sentences.
2. **A demo moment.** Something visibly changes on screen in under 20 seconds.
3. **Scale story.** It works for millions without one AI call per customer per page view.
4. **Trust story.** Consent, explanation, a human in the loop.
5. **Not Kate.** It is clearly not "what Kate already does" (see `kbc-context.md`).
6. **Buildable.** The demo path can run end to end by 12:30 with four people.
7. **Four workstreams.** It splits into four owned pieces. If it can't, it's too small or too vague.

## Reusable building blocks from the semi-final

These patterns transfer to almost any KBC idea and save hours:

- **Rules detect, AI words.** Deterministic, batchable detection; an LLM only for the human-facing
  text, only on change, stored, with a fixed fallback.
- **"What we saw" panel.** Every suggestion lists the facts behind it.
- **"That's not me" feedback,** keyed by a stable rule key.
- **The no-sale card and the human handover** when stress signals appear.
- **Consent and pause** in the profile.
- **Scale view:** run the same logic over thousands of synthetic customers and show aggregates.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, already scaffolded in this repo. Read
`AGENTS.md`: this Next.js version differs from what models remember, so check
`node_modules/next/dist/docs/` when unsure.

## Possible KBC directions, to warm up the brain (not to pick from blindly)

- Small business owners (cash flow, VAT, invoices, a first employee).
- Life events (moving, a birth, a first job, retirement, divorce, death in the family).
- Financial resilience (no buffer, buy-now-pay-later, rising fixed costs) with a no-sale approach.
- Insurance gaps detected from the account (bank-insurer = KBC's strength).
- Households (shared goals between partners, parents and children).
- Advisors (branch and KBC Live staff who get a briefing before the call).
- Fraud and scams (the moment just before a customer pays a scammer).
