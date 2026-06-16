# Backend — NestJS API

NestJS + TypeScript (strict). JWT auth is done (Week 4). The active task is migrating the in-memory data layer to MongoDB (Week 5, see `../weeks/week5.md`).

## Commands

Run from `backend/`:

- `npm run start:dev` — watch-mode dev server (port from `PORT`, default 3000).
- `npm run build` — `nest build`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint (flat config) with `--fix`.
- `npm run format` — Prettier write.

## Architecture

Feature modules, each layered: **controller → service → repository**.

- **Controller** — HTTP only: routing, DTO validation, status codes. No business logic.
- **Service** — domain logic. Depends on a repository *interface*, never on a concrete store.
- **Repository** — data access. An interface (`*.repository.interface.ts`) + an implementation, wired through a DI **Symbol token** (e.g. `USER_REPOSITORY`, `MESSAGE_REPOSITORY`, `CONVERSATION_REPOSITORY`).

Current modules: `UsersModule`, `AuthModule` (depends on Users), `ConversationsModule`, `MessagesModule`, root `AppModule`. `ConfigModule` is global; `JwtModule`/`PassportModule` live inside `AuthModule`.

Cross-cutting code lives in `common/` (decorators like `@CurrentUser()`, the `LoggingInterceptor`). Auth guards (`JwtAuthGuard`, `ParticipantGuard`) live in `auth/guards/`.

## Week-5 MongoDB rules

The repository interfaces are the seam — swap the in-memory implementations for Mongoose-backed ones without touching services. Specifics live in `../docs/adr/`:

- **DAO/DTO separation** ([0004](../docs/adr/0004-dao-dto-boundary.md)): Mongoose models and documents stay inside the DB-access layer. Services and controllers work with domain objects / DTOs. Responses expose `id` (not `_id`) and never leak `__v`.
- **Reference, don't embed messages** ([0001](../docs/adr/0001-messages-reference-not-embed.md)): `messages` is its own collection keyed by `conversationId`.
- **Index design** ([0002](../docs/adr/0002-mongo-index-design.md)): every hot query is backed by an index defined via Mongoose `index()`.
- **Cursor pagination, not offset** ([0003](../docs/adr/0003-cursor-pagination-ordering.md)): total order on `createdAt + _id`, `$lt` cursor.
- **Atomic message write** ([0005](../docs/adr/0005-atomic-message-and-lastmessageat.md)): writing a message and bumping the parent conversation's `lastMessageAt` happen together.

## Naming

- **Files**: kebab-case with a dotted role suffix — `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, `*.entity.ts`, `*.guard.ts`, `*.decorator.ts`, `*.repository.ts`, `*.repository.interface.ts`. (No camelCase filenames — `seed-data.ts`, not `seedData.ts`.)
- **Methods**: camelCase, intent-revealing verbs — `findByEmail`, `listConversations`, `recordNewMessage`, `findMessagesForConversationAfter`. Prefer a descriptive name over a generic `get`.
- **DI tokens**: `SCREAMING_SNAKE_CASE` Symbols colocated with the repository interface.

## Conventions

- DTOs validate every incoming body/query with `class-validator`; non-null fields use `!` assertions.
- Secrets and config from env via `@nestjs/config` — `JWT_SECRET`, `MONGO_URI`, `PORT`, `CORS_ORIGIN`. Keep `.env.example` in sync. Never hardcode secrets.
- Authorization rule (Week 4, still enforced): a user may only access conversations they participate in — cross-user access returns `403`, never the data.
- No `any`; explicit return types everywhere.

## Tooling note

Backend uses the modern flat-config ESLint 9 standard (`eslint.config.mjs`, `typescript-eslint` type-checked). This intentionally differs from the frontend, which is still on ESLint 8 (`.eslintrc.cjs`). Prettier rules are identical across both packages.
