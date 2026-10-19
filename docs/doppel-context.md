# Doppel: semi-final project summary

Distilled from https://github.com/tielebodyn/tectonic-hackaton (main, 30 commits). Use this file
instead of loading the whole repo into context. Built in about 4 hours on 30 Sep 2026; top 32 of
280 teams.

> The semi-final was built in Laravel. The final is Next.js 16, so port the concepts and logic
> (see "Porting Doppel to Next.js" in `docs/paths/path-a-doppel.md`), not the PHP code. The old
> repo stays at `~/tectonic-hackaton` as a reference.

## The idea in one line

Every KBC customer gets a digital double, **Doppel**, that lives their month 30 days ahead and
writes a diary about it in the first person and in the past tense ("On 20 October I was €900 short
for my VAT"). Tagline: "Every banking app shows you your past. At KBC, your double is already
living your future."

## Product

| Part | What it does |
| --- | --- |
| My diary | Home screen: timeline of upcoming moments, each with a date and a confidence level |
| Action cards | Per moment: a KBC offer, a partner offer, or a "No sale" card with no pitch at all |
| Push preview | The most urgent moment, shown as the push the customer would get. Push and app come from the same diary |
| What Doppel saw | Every card lists the transactions and signals that led to it |
| That's not me | The customer corrects their double; the card disappears and that rule stops for them |
| What if I… | Replays the month with one change (save €100 a month, or a fixed energy contract) |
| Handover | With stress signals (falling balance, first buy-now-pay-later payment), Doppel stops selling and offers a call with a KBC advisor |
| Profile | The customer decides what Doppel may see, and can pause him |

Voice and copy rules: UI in English with an informal "you". Doppel speaks as "I", in the past
tense. Screens about Doppel refer to "Doppel" in the third person. Signals describe facts about
"your account". Advice belongs on an action card, never in a diary line. Fixed terms: "What Doppel
saw", "That's not me", "No sale", "What if I…".

## Personas

Rule-driven (the live demo):

- **Lotte (24)**: first job in Ghent, no savings buffer. Student discount ends; "what if I save
  €100 a month".
- **Jonas and Sarah Peeters**: moving with a toddler. Six address changes, no fire insurance yet,
  winter energy costs.
- **Karim (47)**: self-employed, his biggest client stopped paying. **Live event:** the client pays
  €3,200, Doppel relives the month and the VAT shortfall disappears. This was the demo climax.

Scripted (diaries in `database/data/personas/*.json`, same composer and feedback flow): Arne,
Emma and Wout, Georgette, Marc, Mateo, Nora, Sofie, Thomas, Yasmine. They cover studying abroad,
marriage, a fraud attempt, retirement, a newcomer, parental leave, a business owner, a first
investment and a divorce.

## Architecture

Stack: Laravel 13, Inertia 3, React 19, TypeScript, Tailwind 4, MySQL 8, ddev, Fortify, Wayfinder,
shadcn. Gemini (`gemini-2.5-flash`) on Google Cloud for the diary opener.

Pipeline (`app/Services/Doppel/`, about 1,900 lines including rules):

1. `SignalDetector` runs every `Rule` over a customer's transactions. Plain PHP, no AI, batchable.
2. `Rule` interface: `key()`, `appliesTo(Customer)`, `evaluate(Customer, Collection $tx, today)`
   returns `?PredictionData` (title, body, expectedOn, confidence, impactCents, urgency, signals,
   actions).
3. `ScenarioTransform` ("What if I…") rewrites the transaction list in memory; nothing is saved.
4. `DoppelRefresher` recomputes and stores the diary per scenario. It runs on seed, demo event or
   feedback, never on page load.
5. `CardComposer` sorts by urgency and date, never puts two sales cards on top, always includes one
   card that sells nothing, and removes all selling when Doppel is paused (prepends a handover card).
6. `AiService` writes only the diary opener, only when something changes, and stores it. Without an
   API key it falls back to a fixed sentence.
7. `WeatherForecast` mocks KMI warnings: one lookup per city, not per customer.

The 13 rules (`app/Services/Doppel/Rules/`): `address_changes`, `advisor_call`, `budget_ok`,
`first_tax_bill`, `home_insurance`, `mobile_cheaper`, `no_buffer`, `storm_insurance`,
`student_discount_ends`, `subscription_cleanup`, `unpaid_client`, `vat_shortfall`,
`winter_energy_bill`. Helpers live in `Ledger` (balance, projected outflows, formatting).

Example: `vat_shortfall` = balance today, minus fixed outflows until the next quarterly VAT deadline
(the 20th of Jan/Apr/Jul/Oct), minus a VAT payment as large as the previous one. Negative means
Doppel came up short (confidence 85, urgency 90, KBC Cash Credit as action).

## Data model

- `customers`: user_id, persona_key, display_name, age, city, life_stage, mood
  (neutral/relieved/paused), persona_summary, diary_opener.
- `transactions`: customer_id, booked_on, amount_cents (signed), counterparty, category,
  description, is_simulated.
- `predictions`: customer_id, scenario (base/save_100/fixed_energy), rule_key, title, body,
  expected_on, confidence, impact_cents, urgency, signals (JSON). Unique per customer, scenario and
  rule.
- `actions`: prediction_id, kind (KBC/partner/no sale), title, body, cta_label, partner_name,
  position.
- `feedback`: customer_id, rule_key, prediction_id (nullable), reason. Keyed by `rule_key` so
  dismissals survive regeneration.

Enums: ActionKind, LifeStage, Mood, Scenario,
TransactionCategory.

## Routes

- `GET /doppel`, `POST /doppel/feedback`. The semi-final's demo mode (pinned date, `?as=` login,
  demo bar with fake events and reset) is not carried over to the final.

## Security choices

The customer always comes from the logged-in session, never from an ID in the request. Feedback
only on your own predictions. No real data, all seeded. Secrets in `.env`. Audited with Aikido.

## Unfinished (from the README), which is the natural backlog

- Nine of twelve personas are scripted, not rule-driven.
- "What if I…" replays the whole screen; no side-by-side comparison of the two Doppels.
- Demo data only; live updates use a page reload, not websockets.
- Not built: a shared household Doppel, Doppel speaking in the customer's own voice, an ElevenLabs
  audio briefing.

## Lessons the team learned

- Parallel coding agents need a shared contract (enums, schema, service signatures, persona
  numbers) and strict file ownership split by domain.
- Feedback loops need stable keys (`rule_key`, not `prediction_id`).
- Use AI sparingly at scale: rules detect, AI only writes the human-facing words.
- Consent first: use legitimate financial signals, not inferred personal struggles.
