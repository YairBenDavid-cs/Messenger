# ADR 0002: Index design — one index per hot query

- **Status**: Accepted
- **Date**: 2026-06-16

## Context

The app has a small set of hot queries that must stay fast as data grows. A compound index should match each query's **filter prefix + sort order** so MongoDB walks the index in order instead of doing an in-memory sort or collection scan.

## Decision

Define these indexes via Mongoose `schema.index(...)`:

| Index | Backs |
| --- | --- |
| `users`: `{ email: 1 }`, `unique: true` | Login / signup lookup by email; enforces no duplicate accounts. |
| `conversations`: `{ participantIds: 1, lastMessageAt: -1 }` | "List my conversations sorted by last activity" — filter by participant, sort by recency. |
| `messages`: `{ conversationId: 1, createdAt: -1, _id: -1 }` | "Message history for conversation X" — filter by conversation, sort newest-first with `_id` as tie-breaker (see ADR 0003). |

## Consequences

- Each hot query is index-backed; no in-memory sorts on the hot path.
- The `messages` index ordering exactly matches the cursor sort, enabling cheap page fetches without deep skip.
- Cost: indexes add write overhead and storage. Acceptable for these three — they're all load-bearing. Don't add speculative indexes; add one only when a query needs it.
