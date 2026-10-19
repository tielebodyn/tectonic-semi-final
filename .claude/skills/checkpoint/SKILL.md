---
name: checkpoint
description: Hourly checkpoint (11:30, 13:30). Reports demo path status, ladder position, top risk and the next hour per person, and appends it to docs/checkpoints.md.
disable-model-invocation: true
---

# Checkpoint

Keep it short; the team reads this standing up in five minutes.

1. Run `git log --since="90 minutes ago" --oneline --all` and `git status`.
2. Read `docs/03-contract.md` and `docs/04-demo-script.md`.
3. Use the `demo-tester` agent for the demo path status (works / broken / missing per step).
4. Write, and append to `docs/checkpoints.md` with the current time:
   - **Demo path:** step table in one line per step.
   - **Ladder:** which rungs are done, which is next.
   - **Top risk** for the demo, and the fallback if it fails.
   - **Next hour per person** (Peter, Keano, Lorenzo, Tiele): one or two concrete outcomes each.
     If someone has nothing meaningful, give them the next ladder rung or a polish task.
   - **Time check:** minutes left until the 14:30 feature freeze.
