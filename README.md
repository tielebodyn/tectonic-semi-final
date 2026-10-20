# KBC Mantel — clickable proof of concept

A demo for the KBC hackathon final: one place where families coordinate care for an ageing parent,
while **the parent holds the key**. Everything runs on dummy data in the browser; there is no backend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The start screen has shortcuts to every demo step and a "Demo resetten" button.
On a desktop screen the app renders inside a phone frame, with the demo controls (steps, "Bekijk als",
KBC-zicht, reset) on the left. On a phone, the same controls sit behind the "Demo" button.

## Demo script (under 3 minutes)

1. KBC notices signals on Maria's account and asks Maria (never the child) — `/onboarding/signaal`
2. Maria picks Sarah (Handelen), Tom (Inzage), Ann (Meldingen) and a fraud rule — `/onboarding/ouder`
3. Tom joins as a guest via a simulated itsme flow — `/gast`
4. Sarah switches between Maria and Jozef, opens assets, requests Wit-Gele Kruis and a stair lift with a renovation loan — `/app`
5. Sarah pays a bill on Maria's behalf; above the limit Maria approves in her own view — `/app/betalen`, `/maria/goedkeuren`
6. A fraud attempt is stopped thanks to Maria's rule — `/app/fraude`
7. Triple-win view and scale slide for the jury — `/kbc`

Each step shortcut prepares the state it needs, so steps can be shown in any order.

## Structure

- `src/lib/data.ts` — personas, assets, signals, partner services, care homes (static dummy data)
- `src/lib/store.ts` — demo state (roles, rules, bills, audit log, fraud state) persisted in `localStorage`
- `src/lib/demo-steps.ts` — the scripted demo steps
- `src/app/(phone)/app/*` — family app (dashboard, circle, assets, signals, services, pay, fraud, log)
- `src/app/(phone)/maria/*` — the elderly person's senior-friendly screens (home, consent centre, approvals)
- `src/app/(phone)/onboarding/*`, `src/app/(phone)/gast` — the four entry points
- `src/app/kbc` — triple-win and scale view
