# Hackathon mode: Tectonic Hackathon FINAL (KBC), 20 Oct 2026, 09:00-16:00

@AGENTS.md

We have 7 hours and a human jury. One strong idea with a working, rehearsed demo beats everything
else. These rules override conflicting guidance elsewhere, including personal ~/.claude/CLAUDE.md.

## Read first

- `docs/00-game-plan.md`: timeline, roles, the work ladder.
- `docs/03-contract.md`: shared types, data and file ownership. Never edit a file another person owns.
- `docs/kbc-context.md`: what KBC already has (Kate, KBC Live) and what the jury will probe.
- The chosen path: `docs/paths/path-a-doppel.md` or `docs/paths/path-b-new-challenge.md`.
- Your personal brief: `docs/briefs/<your-name>.md` (written at 10:00 by `/contract`).

## Challenge (filled in at 10:00 by /contract)

- Chosen path: A (Doppel, ported to Next.js) / B (new idea)
- Problem, in one sentence:
- Target customer and the moment of need:
- Demo moment (the 20 seconds that win):
- Demo flow, click by click: see `docs/04-demo-script.md`
- Out of scope:

## Priorities

1. The demo path in `docs/04-demo-script.md` works end to end, live, every time.
2. It looks clean on a projector and in the 3-minute video.
3. Security basics are right. It is 10% of the score and checked by Aikido's AI code audit.
4. Everything else.

## How to work

- Build the simplest thing that works. No extra abstraction layers unless the contract defines them.
- No demo mode: no env flags or separate demo-only code paths. Keep it simple.
- Every AI or external call has a deterministic fallback, so the app keeps working on a rate limit
  or a missing key.
- Do NOT write or run tests unless asked. The `demo-tester` agent is the exception.
- Stay inside the files you own (`docs/03-contract.md`). Shared contract files (`src/lib/types.ts`,
  the data layer) only change through the integration lead, Lorenzo.
- Commit small and often, pull often. Prefix commits with your area: `feat(fe): ...`,
  `feat(be-core): ...`, `feat(be-2): ...`, `docs(pm): ...`.
- Do not add npm packages without asking first.
- If a fix fails twice, stop and explain the problem instead of trying bigger fixes.
- If you think something will not fit in the time, say so once with an estimate, then do what is
  asked. We decide, not you.

## Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4

This is a recent Next.js with breaking changes compared to your training data (see `AGENTS.md`
above). Before using a Next.js API you are not sure about, read the matching guide in
`node_modules/next/dist/docs/` and heed deprecation notices.

- Code lives in `src/`. Routes are folders in `src/app/` (App Router). Use the `@/` import alias if
  `tsconfig.json` defines it.
- Server Components by default. Add `'use client'` only to components that need state, effects or
  browser APIs, and keep those components small.
- Server-side logic (data, rules, AI calls) lives in `src/lib/` and never runs in the browser.
- Tailwind 4 is CSS-first: theme tokens live in `src/app/globals.css`, there is no
  `tailwind.config.js`.
- Money is stored as signed integer cents. Seed data uses Belgian names and `BE` IBANs, never real
  customers.
- All LLM calls and prompts live in one module (`src/lib/ai.ts` or as the contract says).

## Running the app

- `npm run dev` (http://localhost:3000), `npm run build`, `npm run lint`, `npx tsc --noEmit`.
- Never run long-lived servers in the background yourself without saying so; ask the human to
  restart `npm run dev` when needed.
- Node is pinned by `.nvmrc` (`nvm use`).
- Secrets go in `.env.local` (git-ignored). `.env.example` lists the variable names with
  placeholders only.

## Security rules (non-negotiable; Aikido checks exactly these)

- Route Handlers (`route.ts`) and Server Actions (`'use server'`) are public HTTP endpoints.
  Authenticate and authorize inside every one of them, even if no UI calls them.
- The current customer always comes from the server-side session (an httpOnly, signed cookie read
  on the server). Never trust a customer, user or record ID from `params`, `searchParams`, form
  data or a JSON body. Look records up scoped to the session's customer.
- Secrets are only read in server code. Never prefix a secret with `NEXT_PUBLIC_`; never pass a
  secret or raw customer data to a Client Component as a prop.
- Validate all input on the server. Rate-limit every endpoint that calls an LLM or voice API.
- Render LLM output as plain text, never with `dangerouslySetInnerHTML`. Prompts get only the data
  they need.
- Never use or ask for real customer data.

## Domain

- The client is KBC, a Belgian bank-insurer. The jury cares about privacy and GDPR, security,
  explainability, scale (2.3 million customers) and fit with KBC Mobile, Kate and KBC Live.
- When AI suggests something, show the reasoning in the UI and keep a human in the loop.
- Detection is deterministic (rules, batchable). AI only writes the human-facing words.
- All UI copy in English, plain, informal "you". Never mix in Dutch.
