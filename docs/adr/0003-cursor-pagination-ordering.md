# ADR 0003: Cursor pagination with a total order on (createdAt, _id)

- **Status**: Accepted
- **Date**: 2026-06-16

## Context

Message history needs pagination over threads of 100+ messages (`?cursor=<...>&limit=N`, returning messages older than the cursor). Offset/skip pagination degrades on deep pages and can drop or duplicate rows when new messages arrive mid-scroll. Sorting by `createdAt` alone is not a **total order** — two messages can share a timestamp, making the boundary ambiguous.

## Decision

Use **cursor pagination** with a deterministic total order: sort by `createdAt DESC, _id DESC`. The cursor encodes both fields: `{ createdAt, id }` (both as strings).

The "older than cursor" filter uses strict `$lt` so the cursor row is never repeated:

```js
$or: [
  { createdAt: { $lt: cursor.createdAt } },
  { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
]
```

`find` filters by `conversationId` plus the cursor condition; `sort` matches the order above; `limit` is the page size.

## Consequences

- Stable, gap-free, duplicate-free pages even as new messages arrive.
- Backed directly by the `messages` compound index (ADR 0002) — index walk, no deep skip, no in-memory sort.
- Cost: cursor encoding/decoding logic and a two-clause filter, slightly more complex than `skip`. Worth it for correctness and performance.
