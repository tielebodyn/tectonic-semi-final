---
name: freeze
description: 14:30 feature freeze checklist. Runs the security and demo checks, then walks through README, secrets, links, Aikido screenshots and the video before submission.
disable-model-invocation: true
---

# Feature freeze

From now on: bug fixes, security fixes, copy and polish only. No new features.

1. Use the `security-auditor` agent on the whole repo. List findings by severity, with an owner.
2. Use the `demo-tester` agent. Anything NO-GO is the top priority.
3. Check and report on each item:
   - [ ] `.env*` files are git-ignored except `.env.example`, which has placeholders only; no keys
         in git history; no secret uses a `NEXT_PUBLIC_` prefix.
   - [ ] Every AI, voice or external call has a fallback.
   - [ ] README: replace the create-next-app README using `docs/README-template.md`: what it is,
         why it matters for KBC, how to run it (exact commands), what is mocked, what is
         unfinished, the team. Show the diff.
   - [ ] `npm run build` passes on a clean checkout.
   - [ ] The repo is public and the default branch builds from a fresh clone (list the commands).
   - [ ] Aikido: baseline screenshot taken at the first scan; second scan run; fixed issues marked
         resolved; "after" screenshot taken.
   - [ ] Video: script ready (`/pitch`), recorded, under 3:00, link works in a private window.
   - [ ] Builderbase: description, video link, repo link, screenshots.
4. End with a timed to-do list until 15:40, with an owner per item.
