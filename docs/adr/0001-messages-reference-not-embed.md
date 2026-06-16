# ADR 0001: Reference messages in their own collection (don't embed)

- **Status**: Accepted
- **Date**: 2026-06-16

## Context

Week 5 replaces the in-memory store with MongoDB. A core schema decision: do messages live embedded inside their `conversation` document, or in a separate `messages` collection referencing the conversation?

A conversation's message list is **unbounded** — an active thread grows without limit (the seed already ships a 120-message thread). Embedding an unbounded array in one document risks hitting the 16 MB document cap, makes every conversation read drag the whole history along, and turns each new message into a rewrite of an ever-larger document. Messages are also queried on their own (paginated history) rather than always-with-parent.

## Decision

Use **referencing**. Three collections:

- `users` — `{ _id, email, name, passwordHash, createdAt }`
- `conversations` — `{ _id, participantIds, lastMessageAt, lastMessagePreview, createdAt }`
- `messages` — `{ _id, conversationId, senderId, content, createdAt }`, linked to a conversation by `conversationId`.

`participantIds` stays as an array of user ids on the conversation (bounded, small, many-to-many modeled the document-DB way).

## Consequences

- Messages scale independently; sending a message is a small, cheap insert, not a rewrite of a growing document.
- Message history is queryable and paginable on its own (see ADR 0003).
- Cost: reading a conversation *with* its latest messages needs two queries instead of one. Acceptable — the conversation list only needs `lastMessageAt`/`lastMessagePreview`, which we denormalize onto the conversation (see ADR 0005).
- No single-document atomicity across a conversation and its messages; handled in ADR 0005.
