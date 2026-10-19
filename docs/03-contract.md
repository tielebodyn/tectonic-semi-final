# Contract (written at 10:00 by `/contract`, owned by Lorenzo)

Everyone builds against this page. Changing it means telling everyone.

## Entities and fields

| Entity | Fields (types) | Notes |
| --- | --- | --- |
| | | |

Conventions: money as signed integer cents, dates as `YYYY-MM-DD` strings, enums as TypeScript
string unions in `src/lib/types.ts`.

## Data and session (decide at 10:00, no new packages without asking)

- Data store:
- Session:

## Enums

## Routes

| Route (`src/app/...`) | Kind (page / route handler / server action) | Data it reads or writes | TypeScript shape | Owner |
| --- | --- | --- | --- | --- |
| | | | | |

## Server function signatures (`src/lib/`)

```ts
// fill in
```

## File ownership

Nobody edits files they do not own. Shared files change only through Lorenzo.

| Person | Owns |
| --- | --- |
| Lorenzo | `src/lib/types.ts`, `src/lib/data/`, `src/lib/session.ts`, the core engine folder (e.g. `src/lib/engine/`), its route handlers |
| Tiele | the second domain (e.g. `src/lib/tower/`, `src/app/tower/`), `src/lib/ai.ts`, `src/lib/voice.ts`, security fixes (via PR) |
| Keano | customer-facing pages in `src/app/` (except Tiele's), `src/components/`, `src/app/globals.css` |
| Peter | `docs/`, `README.md` (at freeze), persona content and copy files (e.g. `src/lib/data/personas/`), pitch assets |

## Merge order

1. Lorenzo: `types.ts`, seed data shape, session helper (by 10:45).
2. Tiele and Keano, in parallel, against the contract (Keano uses hardcoded props until then).
3. Lorenzo merges, `demo-tester` checks the demo path.

## Ladder for this idea

1. Must:
2. Should:
3. Could:
