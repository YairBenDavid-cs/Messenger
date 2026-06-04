## TL;DR

Replace the in-memory data layer in your Week 4 chat backend with MongoDB. Design clean Users / Conversations / Messages schemas, add the right indexes, implement cursor-paginated message history. The FE keeps working — data now survives server restarts.

## Learning goals

- Design MongoDB schemas for a real product (Users, Conversations, Messages).
- Decide between embedding and referencing based on read/write workloads.
- Use indexes to back the chat app's hot queries.
- Implement cursor-based pagination for message history.
- Separate database access (DAOs) from API contracts (DTOs) — no Mongo internals leaking into responses.

## Spec

Replace the in-memory repository services from Week 4 with MongoDB-backed implementations.

Required collections (suggested — defend your choices in the PR):

- `users` — `{ _id, email, name, passwordHash, createdAt }` with a unique index on `email`.
- `conversations` — `{ _id, participantIds, lastMessageAt, createdAt }` with an index on `(participantIds, lastMessageAt desc)`.
- `messages` — `{ _id, conversationId, senderId, content, createdAt }` with an index on `(conversationId, createdAt desc)`.

Required queries:

- "List my conversations sorted by last activity" (uses the participantIds + lastMessageAt index).
- "Message history for conversation X with cursor pagination" (`?cursor=<messageId>&limit=N`, returns messages older than the cursor).
- "Send message" — write the message AND update the parent conversation's `lastMessageAt` atomically.

Required architecture:

- DAO layer (Mongoose models) lives in dedicated DB services (e.g. `MessagesDbService`).
- Domain services depend on DAOs, not on Mongoose directly.
- Controllers return DTOs, never raw Mongoose documents. Strip `_id` → `id`, drop `__v`.

## Tech constraints

- NestJS + `@nestjs/mongoose` + Mongoose.
- MongoDB running locally — Docker or a free MongoDB Atlas cluster, your choice.
- `MONGO_URI` from env; `.env.example` updated.
- Cursor pagination, not offset.
- API contract preserved — the FE Chat MVP needs no changes other than working against the new backend.
- No `any`.

## Acceptance criteria

- [ ]  Schema designed with explicit reasoning in the PR description (embedding vs referencing decision).
- [ ]  All required indexes created (defined in the schemas / via Mongoose `index()` calls).
- [ ]  "My conversations" sorted correctly by last activity.
- [ ]  Cursor-paginated message history works on a thread of 100+ messages.
- [ ]  Sending a message updates `lastMessageAt` on the parent conversation.
- [ ]  DAO/DTO separation enforced — no `_id`, no `__v` in API responses.
- [ ]  Authorization rule from Week 4 still enforced (no cross-user access).
- [ ]  Data survives server restart.
- [ ]  `npx tsc --noEmit` passes; `npm run build` passes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, schema diagram (text is fine), index list with the query each one backs, embedding-vs-referencing decisions and reasoning, key tradeoffs.
- Repo runs end-to-end with MongoDB.
- Mentor reviews the PR on Sunday.