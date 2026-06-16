# Chat-MVP2

A real-time-style chat app built across a multi-week bootcamp curriculum. This is a monorepo with two independent packages plus shared docs.

## Layout

- `backend/` — NestJS + TypeScript API. JWT auth (Week 4), migrating to MongoDB (Week 5). See [backend/CLAUDE.md](backend/CLAUDE.md).
- `frontend/` — React + Vite + TypeScript chat UI. See [frontend/CLAUDE.md](frontend/CLAUDE.md).
- `weeks/` — weekly specs (`week2.md`…`week5.md`) and lesson notes (`summary.md`). **The active spec is `weeks/week5.md`.**
- `docs/adr/` — Architecture Decision Records. See `docs/adr/0000-template.md`.

Each package is self-contained (own `package.json`, `node_modules`, tooling). Always run commands from inside the relevant package directory. Claude Code loads the nearest `CLAUDE.md` by directory — package-specific rules live in those files.

## Shared rules (both packages)

- TypeScript **strict mode**. No `any` — `@typescript-eslint/no-explicit-any` is an error in both packages.
- Explicit return types on every function.
- Validate at boundaries (HTTP input, env), trust internal code.
- Keep the API contract stable: the frontend and backend share a contract; don't change response shapes without updating both sides.

## Architectural decisions → write an ADR

When you make a non-trivial architectural decision (schema design, indexing, data-access boundaries, pagination strategy), record it in `docs/adr/` using the template. ADRs double as the design-defense material the weekly PR description requires.

## Git & PR workflow

- One PR per week against the assigned GitHub repo; mentor reviews on Sunday.
- PR description must include: a summary, the list of endpoints / components touched, and **key tradeoffs**.
- For Week 5 specifically, the PR must also defend the schema design (embedding vs referencing) and list each index with the query it backs — pull this straight from the relevant ADRs.
- Create new commits; don't amend or force-push shared branches.
