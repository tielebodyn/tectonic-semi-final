# KBC Mantel — clickable proof of concept

A demo for the KBC hackathon final: one place where families coordinate care for an ageing parent,
while the parent decides who can help and how. Everything runs on dummy data in the browser; there is no backend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 (works on a phone too). The app opens on a choice of three guided paths.
Each path plays itself: the jury only taps "Next" and "Previous" (or uses the arrow keys) and the app shows every
screen, choice and payment in turn, with a short caption and why it matters. Taps inside the phone are ignored while a
path runs. On a large screen the guide sits next to a phone frame; on a phone it sits at the bottom.

All copy is in English, written in the tone of voice of kbc.be (English) and KBC Mobile: plain, calm, "you" and "we",
British spelling, real KBC names (KBC Mobile, Kate, KBC Live, Secure4u, itsme).

## The three paths

1. **Maria chooses her caregivers**: KBC notices signals and asks Maria herself; Maria picks Sarah (Pay),
   Tom (View) and Ann (Alerts) plus a fraud rule; Tom joins as a guest via itsme; Maria revokes access in one tap.
2. **Sarah helps her parents**: Sarah switches between Maria and Jozef, opens Maria's assets, requests Wit-Gele Kruis and a
   stair lift with a KBC renovation loan, pays a bill on Maria's behalf, and Maria approves a payment above her limit.
3. **Stopping a fraud attempt**: a fraud attempt triggers Maria's rule: Sarah gets a notification, Ann sees an alert without
   amounts, Sarah blocks the transfer with KBC; the path ends on the value and scale view.

Every step prepares the state it needs, so paths can be started in any order and steps can be skipped.

## Structure

- `src/lib/data.ts` — personas, assets, signals, partner services, care homes (static dummy data)
- `src/lib/store.ts` — demo state (roles, rules, bills, audit log, fraud state) persisted in `localStorage`
- `src/lib/tour.ts` — the three scripted paths: each step is a scene (screen, viewer, data effects, UI state)
- `src/components/shell/tour-guide.tsx` — the guide (bottom strip on mobile, side panel on desktop)
- `src/components/logo.tsx` — the Mantel logo (mark, wordmark, app icon) as SVG
- `src/app/(phone)/app/*` — family app (dashboard, circle, assets, signals, services, pay, fraud, log)
- `src/app/(phone)/maria/*` — the elderly person's senior-friendly screens (home, consent centre, approvals)
- `src/app/(phone)/onboarding/*`, `src/app/(phone)/gast` — the four entry points
- `src/app/(phone)/page.tsx` — path picker
- `src/app/(phone)/kbc` — triple-win and scale view
