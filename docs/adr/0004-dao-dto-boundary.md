# ADR 0004: DAO/DTO boundary — Mongoose never leaks past the data layer

- **Status**: Accepted
- **Date**: 2026-06-16

## Context

With Mongoose introduced in Week 5, there's a risk of Mongo internals (`_id`, `__v`, `ObjectId`, hydrated documents) bleeding into domain services and API responses. The API contract the frontend depends on must not change, and persistence details shouldn't dictate domain logic.

## Decision

Keep a hard boundary:

- **DAO layer**: Mongoose models and document types live only in dedicated DB-access services (e.g. the Mongoose-backed repository implementations behind the existing repository interfaces). These are the only place that imports Mongoose.
- **Domain services** depend on the repository *interfaces*, not on Mongoose.
- **Controllers** return DTOs / domain objects, never raw Mongoose documents.
- **Mapping is explicit**: a mapping function converts a DAO document → domain/DTO, stripping `_id` → `id` and dropping `__v`. No relying on implicit serialization.

This preserves the existing `controller → service → repository(interface + impl)` seam: only the impl changes from in-memory to Mongoose.

## Consequences

- The frontend sees the same response shapes (`id`, no `__v`) — contract preserved.
- Swapping or testing the data layer doesn't ripple into domain logic.
- Cost: explicit DAO↔DTO mapping is boilerplate. Accepted — the explicitness is the point (no magic, no leaks).
