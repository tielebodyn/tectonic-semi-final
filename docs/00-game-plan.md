# Game plan: Tectonic final, Tuesday 20 Oct 2026, 09:00-16:00

Stack: Next.js 16, React 19, TypeScript, Tailwind 4 (decided). No Laravel.
Team: Peter (PM), Keano (FE), Lorenzo (BE core, integration lead), Tiele (BE 2, security owner).
Scoring: Originality 30%, Technical ability 30%, Fit to the case 30%, Security 10% (Aikido).
Deliverables: short description, demo video under 3 minutes, public GitHub repo with README,
Aikido screenshots before and after.

## What went wrong last time, and the fix

| Last time | Fix |
| --- | --- |
| Four people, two workstreams. Tiele and Peter felt useless. | Four owned workstreams, written down at 10:00 in `03-contract.md`. |
| "Done" after 2.5 hours, motivation gone. | A work ladder agreed before coding (below). Nobody is ever done. |
| An hour of free discussion. | A timeboxed analysis with one decider (Peter) and a scorecard. |
| AI reviewers favoured a literal reading of the brief. | A human jury favours a clear story, a live moment, and answers about scale and trust. Rehearse it. |

## Timeline

| Time | What | Who |
| --- | --- | --- |
| 08:30 | Laptops up: repo pulled, `nvm use && npm ci && npm run dev` works, Claude Code logged in, Aikido connected, GCP and ElevenLabs credits checked. | All |
| 09:00 | Briefing. Peter pastes the brief, word for word, into `docs/01-brief.md` and asks the organiser questions listed there. | Peter |
| 09:15 | Silent solo ideation: 3 ideas each, one line plus its demo moment. Meanwhile Lorenzo runs `/kickoff`. | All |
| 09:30 | Converge: each idea pitched in 60 seconds, scored on the scorecard in `02-analysis.md`. | Peter leads |
| 10:00 | **Decision. No extensions.** Peter decides. | Peter |
| 10:00 | `/contract`: contract, file ownership, demo script v1, four personal briefs. | Lorenzo + Peter |
| 10:20 | Build round 1: the demo path end to end. Ugly is fine. | All |
| 11:30 | `/checkpoint` (10 minutes, standing up). | All |
| 12:00 | First Aikido AI Code Audit. This is the **baseline screenshot**. | Tiele |
| 12:30 | Lunch (20 min). Peter clicks through the demo with the `jury-critic` agent's questions. | All |
| 12:50 | Build round 2: the wow layer and the next ladder rungs. | All |
| 13:30 | `/checkpoint`. Peter starts the video script with `/pitch`. | All |
| 14:00 | Rough dry-run recording of the video, to find what breaks. | Peter + Keano |
| 14:30 | **FEATURE FREEZE.** `/freeze`. Second Aikido scan, fix the findings. | All |
| 15:10 | Final video recording and edit (under 3 minutes). Final README. | Peter + Keano |
| 15:40 | Submit in Builderbase. Open every link in a private window. Repo public. | Peter |
| 15:55 | Buffer. | |

Making the video always takes longer than you expect. That is why it starts at 13:30, not 15:30.

## Roles

**Peter, PM: owns "Fit" (30%) and the submission.**
He leads the analysis and makes the 10:00 call. After that he owns the demo script, the pitch,
persona stories and copy, the README, the video, jury Q&A, and timekeeping. Every hour he uses
the app cold and runs the `jury-critic` agent. He can also build standalone pieces: content JSON
for personas, a "vision" screen, pitch slides.

**Keano, FE: owns the customer-facing experience.**
The demo path UI, polish for the projector and the video, the mobile frame, and the moment that
makes the jury say "oh, that's smart".

**Lorenzo, BE core: owns the data model, the core engine and integration.**
He keeps the contract, does the merges, and unblocks Keano with the props he needs.

**Tiele, BE 2: owns a separate domain plus security.**
The second backend stream from the contract (in Path A: the bank-side scale view and the AI/voice
layer). He runs Aikido at 12:00 and 14:30, and the `security-auditor` agent before every merge to
main.

## The work ladder (agree on it at 10:00, per path)

1. **Must:** the demo path works for one persona, end to end.
2. **Should:** a second persona, and an explainability panel ("why am I seeing this").
3. **Could:** a second channel, the scale view, mobile polish, loading and empty states.
4. **Always available:** Aikido fixes, rehearsing the pitch, a better video take, the README, copy
   polish, or running `jury-critic` and fixing its top complaint.

If you feel done, take the next rung. If the ladder is empty, rehearse.

## How we use Claude

- **One Claude Code session per person**, each working in their own files. Recent Claude Code
  hackathon winners ran one session per domain to keep each context clean.
- **Plan before building.** Use plan mode for anything bigger than one file.
- **Audit before the next feature.** Asking "what is wrong with what we built so far?" is cheap
  and catches demo breakers early.
- **Push back.** When Claude says something won't fit in the time, check for yourself. It is often
  too cautious.
- **Agents** live in `.claude/agents/`. Run them with "use the X agent" or `@agent-X`:
  `jury-critic`, `security-auditor`, `demo-tester`, `kbc-researcher`.
- **Skills** are slash commands in `.claude/skills/`:
  `/kickoff` (09:15), `/contract` (10:00), `/checkpoint` (11:30 and 13:30), `/freeze` (14:30),
  `/pitch` (13:30 and 15:00).

## Tonight (Monday)

- [ ] Ask the organisers: may we reuse semi-final logic (ported to Next.js)? Is the empty Next.js
      scaffold we already committed OK? Is there a live pitch, and how long is it? Will KBC share data or APIs?
- [ ] Unzip this kit into `tectonic-semi-final`, commit, push. Everyone pulls.
- [x] `DOPPEL.md` committed to the old repo (11ce1f5).
- [ ] Connect the new repo to Aikido. Check the GCP credentials (valid for one week only) and the
      ElevenLabs and Cursor credits.
- [ ] Everyone: `nvm install` (reads `.nvmrc`), `npm ci`, `npm run dev` shows the Next.js page,
      Claude Code updated and logged in.
- [ ] Peter: read `paths/path-a-doppel.md` and draft the Path A answers in `02-analysis.md`.
- [ ] Decide who records and narrates the video. Install a screen recorder.
