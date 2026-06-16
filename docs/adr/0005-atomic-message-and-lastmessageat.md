# ADR 0005: Sending a message updates the conversation's lastMessageAt together

- **Status**: Accepted
- **Date**: 2026-06-16

## Context

The conversation list sorts by `lastMessageAt` and shows `lastMessagePreview` (denormalized onto the conversation per ADR 0001). When a message is sent, both the new `messages` document and the parent conversation's `lastMessageAt`/`lastMessagePreview` must move forward together. Because messages and conversations are separate collections (ADR 0001), there's no single-document atomicity for free.

## Decision

"Send message" performs two writes as one logical operation:

1. Insert the message into `messages`.
2. Update the parent conversation's `lastMessageAt` (and `lastMessagePreview`).

Order the writes message-first, then conversation update, so a partial failure leaves at worst a stored message with a slightly stale conversation timestamp (self-healing on the next send) rather than a conversation pointing at a message that doesn't exist. Use a transaction if the deployment is a replica set; otherwise the ordered two-write approach with the message as the source of truth is acceptable for the bootcamp scope.
i prefer make it as atomic or in failure to send the message abd update it alone before another message is coming

## Consequences

- Conversation list ordering stays correct without scanning messages.
- Denormalized `lastMessagePreview` avoids an extra query per conversation in the list view.
- Cost: two writes per send and a small consistency window if the second write fails. Mitigated by write ordering; upgrade to a transaction if/when running on a replica set.
