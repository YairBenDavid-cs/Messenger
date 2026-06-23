# CLAUDE.md

Guidance for Claude when working in this repository. **This file routes you to the right
context — read the linked file *before* you write code. Do not work from memory.**

## What this project is

An 8-week bootcamp build of a **Chat MVP**: React + TypeScript frontend, NestJS + MongoDB
backend, JWT auth, then LLM features (streaming assistant, RAG tutor, LangGraph agent).
Each week composes onto the previous one — the API contract is preserved across weeks so the
frontend keeps working.

**Current status: Weeks 1–5 are finished. We are now working on Week 6.**

## Repo layout

```
frontend/                  React + Vite + TS app
  frontend-standards.md    ← FE rules (read for any frontend work)
  src/
backend/                   NestJS app
  backend-standards.md     ← BE rules (read for any backend work)
  src/
weeks/                     One spec per week (week2.md … week8.md)
week6-leeson.md            Week 6 lesson notes (LLM/prompt/streaming/tools concepts)
principles.md              PR-review rubric (SOLID, DDD, code craft) — the bar code is judged against
docs/adr/                  Architecture Decision Records (schema, indexing, pagination, layering)
```

## Routing — read before you act

| If the task is… | Read first |
| --- | --- |
| **Frontend** (React, components, hooks, state, forms, FE data fetching, FE tests) | `frontend/frontend-standards.md` |
| **Backend** (NestJS modules, controllers, DTOs, persistence, auth, BE tests) | `backend/backend-standards.md` |
| **Building / continuing Week _X_** | `weeks/weekX.md` (the spec — TL;DR, spec, tech constraints, acceptance criteria) |
| **Week 6 specifically** (current) | `weeks/week6.md` **and** `week6-leeson.md` (concept notes for LLM/streaming/tools) |
| **Any code review, or judging code quality** | `principles.md` |
| **A past architecture decision** (why schema/index/pagination/layering is the way it is) | the matching file in `docs/adr/` |

Rules of thumb:

- A full-stack feature touches both standards files — read **both** the FE and BE standards.
- The standards files are **mandatory**, not suggestions. When in doubt, follow the standard
  over a quicker shortcut.
- The **NestJS backend owns the API contract.** The frontend consumes it; never redefine
  backend DTOs by hand on the frontend, and never break the contract without documenting it.

## Working a week

When asked to build or continue week _X_:

1. Open `weeks/weekX.md`. Treat its **Spec**, **Tech constraints**, and **Acceptance criteria**
   as the definition of done — satisfy every checkbox.
2. Read the standards file(s) for the layer(s) you'll touch (table above).
3. For Week 6+, also read `week6-leeson.md` for the LLM/streaming/tool-calling concepts.
4. Preserve the existing API contract unless the week's spec says to change it — if you change
   it, document the change.
5. Before declaring done, verify against the week's acceptance criteria and run the gates below.

### Week map (for orientation)

- **Week 2** — FE Chat MVP (React+Vite+TS) against a mocked API; optimistic sends; define `API_CONTRACT.md`.
- **Week 3** — Express+TS REST API (in-memory) implementing the contract; FE wired to real backend.
- **Week 4** — Refactor backend to **NestJS**; real signup/login, JWT + Passport, bcrypt; FE login/signup.
- **Week 5** — Replace in-memory store with **MongoDB/Mongoose**; schemas, indexes, cursor pagination; DAO/DTO split.
- **Week 6 (current)** — AI assistant conversation type: LLM call streamed over **SSE**; ≥1 user-scoped tool (Zod-validated); small eval set.
- **Week 7** — Knowledge base + **RAG tutor** (Atlas Vector Search, LangChain) with citations.
- **Week 8** — Capstone: **LangGraph agent** wrapping the tutor + a user-data tool; Mongo checkpointing; stream agent events; all three conversation types in one UI.

## Non-negotiables across all weeks

- TypeScript **strict mode**; **no `any`**, no `as` escapes. `npx tsc --noEmit` must pass (and
  `npm run build` for the Nest backend).
- Secrets are **env-only** (`.env`, gitignored), with `.env.example` kept up to date. Never log or commit secrets.
- All chat data is **scoped to the authenticated user** — no cross-user reads/writes (returns `403`, never the data).
- Focused commits: one logical change each, `topic: verb description`.

## Verification gates before saying "done"

- `npx tsc --noEmit` passes (frontend and backend as relevant).
- Backend: `npm run build` passes.
- Tests relevant to the change pass (Vitest + RTL on FE; Jest + supertest on BE).
- Every acceptance-criteria checkbox in the week's spec is satisfied.
- The change respects the relevant standards file and `principles.md`.
