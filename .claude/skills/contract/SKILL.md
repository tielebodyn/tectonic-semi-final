---
name: contract
description: 10:00 contract. Turns the chosen idea into a shared contract, file ownership, a demo script v1 and four personal build briefs. Run right after the decision.
disable-model-invocation: true
---

# Contract: from decision to four parallel workstreams

Do not write application code yet. Produce documents that let four people build in parallel
without merge conflicts.

1. Read `docs/02-analysis.md` (the decision), `docs/01-brief.md`, `docs/00-game-plan.md`,
   `docs/kbc-context.md` and the chosen path file in `docs/paths/`. If the decision section is
   empty, stop and ask.
2. Read `AGENTS.md` and what is already in `src/`. For Path A, port Doppel's logic from
   `docs/doppel-context.md` to TypeScript; keep its concepts and names, do not copy Laravel
   patterns.
3. Fill `docs/03-contract.md`:
   - entities with fields and TypeScript types (money in signed integer cents, dates `YYYY-MM-DD`),
   - enums as TypeScript string unions,
   - the data store and session choice,
   - routes in `src/app/` with their kind (page, route handler, server action) and data shapes,
   - server function signatures in `src/lib/`,
   - file ownership per person (Peter PM, Keano FE, Lorenzo BE core, Tiele BE 2), split by domain
     so no two people edit the same file,
   - merge order and the three-rung ladder for this idea.
4. Fill the "Challenge" section at the top of `CLAUDE.md`.
5. Write `docs/04-demo-script.md` v1: the one-sentence pitch, the click path and the video table.
6. Write four personal briefs in `docs/briefs/peter.md`, `keano.md`, `lorenzo.md`, `tiele.md`.
   Each brief is a prompt the person pastes into their own Claude Code session and contains: their
   goal for 12:30 (Must) and 14:30 (Should/Could), the files they own, the contract parts they rely
   on, mocks to use until others deliver, what "done" looks like on screen, and security rules
   relevant to their part. Keano's brief must include hardcoded example data in the contract's
   types so he can start immediately.
7. Show a summary: the four workstreams in one line each, and the riskiest dependency.
