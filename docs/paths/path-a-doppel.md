# Path A: we continue with Doppel

Use this when the final is the same KBC challenge and we keep Doppel. Read
`docs/doppel-context.md` first.

## Honest assessment

Doppel is stronger than the team thinks. It already has a memorable hook (a double that lives your
month ahead), a batchable rule engine, explainability, a no-sale card, human handover, consent
and a live demo moment (Karim). The README already answers scale and trust.

What a human KBC jury will still poke at:

1. **"Isn't this Kate?"** Kate already promises proactive, personal suggestions at the right time.
   Doppel needs a clear answer: Kate is the voice, Doppel is the foresight behind it.
2. **"Is this a feature or a new way of working?"** Today Doppel is one screen in one app. The brief
   asks for a way of understanding customers across products, services and channels, for
   millions at the same time.
3. **"Show me the millions."** The scale story is only told, never shown.
4. **The mascot.** A fluffy character can read as childish to bank executives. Keep it in the
   customer view; balance it with a serious bank-side view.
5. **"What if Doppel is wrong?"** Confidence levels and "That's not me" exist; make the learning
   loop visible.

## The upgrade: from "a diary in the app" to "KBC's foresight layer"

One sentence: **"Doppel is the foresight layer for KBC: one forward-looking model per customer,
computed in batch for all 2.3 million, that feeds the app, Kate, push and advisors, with the
customer in control."**

Candidate upgrades, ranked by score impact per hour:

| # | Upgrade | Answers | Owner |
| --- | --- | --- | --- |
| 1 | **Control tower**: a KBC-side view that runs the detector over thousands of synthetic customers and shows what is coming ("next 30 days: 18,400 VAT shortfalls in Flanders, 3,100 students losing a discount"), how many are consented, and how few AI calls it takes | Scale, "millions at once", new way of working | Tiele |
| 2 | **One diary, every channel**: the same moment rendered as app card, push, a Kate chat message, an advisor briefing and a 20-second voice note (ElevenLabs) | "Seamlessly across channels", not Kate's competitor | Keano (UI) + Tiele (voice) |
| 3 | **Advisor handover screen**: the KBC Live advisor sees Doppel's briefing for this customer, only with consent | Human in the loop, trust | Keano + Lorenzo |
| 4 | **Learning loop**: "That's not me" per `rule_key` turns into a rule precision view in the control tower | "Feed the machine", what if it's wrong | Lorenzo |
| 5 | **Side-by-side "What if I…"**: two Doppels next to each other | Unfinished item, visual wow | Keano |
| 6 | **More rule-driven personas** (replace scripted diaries) | Technical depth | Lorenzo |

Suggested ladder: Must = 1 and 2 (app + Kate + voice). Should = 3 and 4. Could = 5 and 6.

## Workstreams

- **Lorenzo (BE core):** port the engine to TypeScript (below), the synthetic customer generator (deterministic,
  e.g. 10,000 customers across life stages), batch detector script, aggregate queries, learning
  loop data.
- **Tiele (BE 2):** control tower backend and page data, ElevenLabs voice note (with a fixed audio
  fallback file), Kate message format, Aikido scans.
- **Keano (FE):** control tower UI (charts), channel switcher on a card (app / push / Kate / advisor
  / voice), advisor screen, polish.
- **Peter (PM):** demo script, story arc, persona copy, control tower labels and numbers that make
  sense, README, video, Q&A.

## Demo arc (draft)

1. Open on Karim's diary: "On 20 October I was €900 short for my VAT." (customer view)
2. "What Doppel saw": the signals. "That's not me" exists.
3. The client pays €3,200, Doppel relives the month, the shortfall disappears.
4. Switch the same moment across channels: push, Kate message, advisor briefing, voice note.
5. Zoom out to the control tower: this happens for thousands of customers every night; X are
   consented; Y AI calls in total.
6. Close: "Kate is the voice. Doppel is the foresight behind it."

## Porting Doppel to Next.js

The semi-final was Laravel; the final is Next.js. Port the **logic and concepts**, not the code.
Doppel's core is small and maps cleanly to TypeScript (ask the organisers whether reusing our own
semi-final logic is allowed):

| Laravel (semi-final) | Next.js (final) |
| --- | --- |
| `Rule` interface + 13 rule classes | `type Rule = { key, appliesTo(customer), evaluate(customer, tx, today) }` in `src/lib/engine/rules/` |
| `SignalDetector`, `ScenarioTransform`, `CardComposer` | Pure functions in `src/lib/engine/` |
| `DoppelRefresher` + `predictions` table | Recompute on change, storage per the contract |
| Seeders, persona JSON | Typed seed data in `src/lib/data/personas/` (the 9 scripted JSON files can be copied as-is) |
| `AiService` (Gemini) | `src/lib/ai.ts`, server-only, with the same fixed fallback |
| Fortify + `?as=` demo login | Session per the contract |
| Inertia page `doppel/show.tsx` | `src/app/doppel/page.tsx` (Server Component) + small client components for interactions |

Order of work (Lorenzo, about 60-75 minutes with Claude Code):

1. `src/lib/types.ts`: Customer, Transaction, Prediction, Action, Feedback, the unions.
2. Ledger helpers and three rules first: `vat_shortfall`, `unpaid_client`, `no_buffer` (Karim and
   Lotte). Other rules come later on the ladder.
3. Karim's and Lotte's seed transactions (copy the exact amounts from the old seeders).
4. Detector + composer, then Karim's "client pays" moment.

Meanwhile Keano builds the diary UI against hardcoded data in the contract's types, and Tiele
starts the control tower on a generated customer set.

The old repo stays at `~/tectonic-hackaton` as a reference: point Claude Code at it ("read
`~/tectonic-hackaton/app/Services/Doppel/Rules/VatShortfallRule.php` and port it") instead of
loading it all into context.

## Pitch lines to test

- "Every banking app shows you your past. At KBC, your double is already living your future."
- "Kate is the voice. Doppel is the foresight behind it."
- "Rules see it coming for 2.3 million customers. AI only finds the words."
- "There is always one card that sells nothing."
