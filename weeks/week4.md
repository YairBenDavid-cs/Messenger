
## TL;DR

Refactor the Week 3 Express chat backend into a NestJS project. Add real signup, login, and JWT-protected routes via Passport JWT strategy and Nest Guards. Hash passwords with bcrypt. The FE keeps working — extend it with login/signup screens.

## Learning goals

- Apply NestJS architecture: modules, providers, controllers, services, DTOs, DI.
- Implement JWT authentication using Passport in NestJS.
- Use `@UseGuards`, custom decorators (`@CurrentUser`), and proper request-pipeline tools (pipes, guards).
- Hash passwords with bcrypt and store users securely.
- Preserve the API contract so the FE keeps working with minimal changes.

## Spec

Refactor the Week 3 backend into a Nest project with feature modules:

- `UsersModule` — owns user data, password hashing.
- `AuthModule` — owns signup, login, JWT issuance, Passport strategy, Guards.
- `ConversationsModule` — owns conversations + messages (split further if you prefer).
- `AppModule` — root module wiring everything.

New / changed endpoints:

- `POST /auth/signup` — `{ email, password, name }` → `{ token, user }`. Reject duplicate emails (`409`).
- `POST /auth/login` — `{ email, password }` → `{ token, user }`. Reject bad creds (`401`).
- All `/conversations/*` and `/messages/*` endpoints require a valid JWT in `Authorization: Bearer <token>`. Reject missing/invalid token with `401`.
- `GET /me` — returns the current authenticated user.

Authorization rule: a user can only read or post in conversations they are a participant in. Returning someone else's conversation is `403`.

FE changes (also part of the submission):

- Signup screen, Login screen.
- Token stored client-side (localStorage is fine for the Bootcamp).
- Token sent on every request via an `Authorization` header.
- Logout button that clears the token.

## Tech constraints

- NestJS + TypeScript (strict mode).
- `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`, `bcrypt` for auth.
- `class-validator` + `class-transformer` for DTOs and validation.
- Storage: still in-memory this week (Mongo is next week). Use injectable repository services so the swap is easy.
- `@nestjs/config` for env vars. `JWT_SECRET` must come from env.
- No `any`. Explicit return types everywhere.

## Acceptance criteria

- [ ]  Project structured into clean feature modules with proper imports/exports.
- [ ]  DTOs validate every incoming request body / query.
- [ ]  JWT signup + login work end to end. Bad creds return `401`. Duplicate signup returns `409`.
- [ ]  `@UseGuards(JwtAuthGuard)` protects every chat endpoint.
- [ ]  A `@CurrentUser()` decorator extracts the authenticated user in controllers.
- [ ]  Passwords are hashed with bcrypt — no plaintext anywhere.
- [ ]  `JWT_SECRET` is loaded from env, not hardcoded. `.env.example` checked in.
- [ ]  FE has signup + login screens and sends the token on every request.
- [ ]  Authorization rule enforced: cross-user access returns `403`, never the data.
- [ ]  `npx tsc --noEmit` passes; `npm run build` (Nest) passes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, module diagram (text or screenshot), security checklist (bcrypt, env secret, guard coverage), key tradeoffs.
- Repo runs end-to-end: BE + FE locally with full auth flow.
- Mentor reviews the PR on Sunday.