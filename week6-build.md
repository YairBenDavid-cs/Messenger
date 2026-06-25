# Week 6 — Phased Build Guide

Companion to `week6-plan.md`. Seven phases, each PR-sized and independently shippable: the app
compiles and works at the end of every phase. Order follows "tracer bullet first" — a thin
end-to-end stream before tools, titles, or summaries are layered on.

Dependency chain: **P0 → P1 → P2** are sequential (data → stream → UI). **P3, P4, P5** layer onto
P1/P2 and can be built in any order. **P6** (hardening) comes last for the feature itself, and
**P7** (CQRS retrofit of Weeks 1–5) is a separate cleanup phase that runs after the feature ships.

> **CQRS note (ADR 0006).** Where this guide and `week6-plan.md` say "CQRS command/query", it
> means an `@nestjs/cqrs` Command/Query class + handler dispatched through the `CommandBus`/`QueryBus`
> by a thin orchestrator. The `QueryBus` is already in use (`FindUserByIdQuery`); Week 6 adds the
> `CommandBus` for writes. See ADR 0006 for the full decision.

---

## Phase 0 — Data model & contract (no LLM yet)

**Goal:** assistant conversations exist and round-trip through the API; messenger contract untouched.

**Backend**
- Convert `conversations` to Mongoose discriminators: base (`type`, `participantIds`,
  `lastMessageAt`, `lastMessagePreview`, timestamps) + `Direct` (`participantKey`, `unreadCounts`) +
  `Assistant` (`title`, `contextSummary`, `summarizedUpTo`). Default existing docs to `type: 'direct'`.
- Partial-unique index on `participantKey` for `type: 'direct'`; base index
  `{ type, participantIds, lastMessageAt, _id }`.
- New `assistantMessages` (ChatTurn) collection + repo + index `{ conversationId, createdAt, _id }`.
- `POST /conversations` accepts `type`, routes by type; add `CreateAssistantConversation` CQRS command.
- `GET /conversations?type=` filter (server-scoped); `ConversationView` gains `type` + `title`
  (derived for direct, stored for assistant).
- `.env.example`: add LLM key placeholder.

**Gate:** `tsc --noEmit` + `build` pass; existing messenger tests stay green; can create an assistant
conversation and list it via `?type=assistant`; direct responses byte-identical.

---

## Phase 1 — Streaming skeleton (tracer bullet)

**Goal:** send a message to Popovich and watch tokens stream back; reply persists. No tools/title/summary.

**Backend**
- `LlmProvider` port (`AsyncIterable<LlmStreamEvent>`: `text-delta | tool-call | finish`) + one SDK
  adapter (async generator) in `infrastructure/`. Model id + key from config.
- Prompt infra: `prompts/` folder, `PromptRepository`, `SYSTEM_PROMPT_V1` + `ACTIVE` alias, safe
  interpolation util (system prompt only for now).
- `jwt-query` Passport strategy + `JwtStreamAuthGuard` (token via `?access_token=`).
- SSE event Zod schema: `token`, `done`, `error`.
- `POST /:id/messages` persists the user turn for assistant (single-module command).
- `StreamAssistantReply` orchestrator: load history → call LLM → stream `token` → persist assistant
  turn → update conversation → emit `done`. `GET /:id/assistant/stream` (`@Sse`), guarded by
  `JwtStreamAuthGuard` + `ParticipantGuard`.

**Gate:** e2e/supertest — stream emits tokens then `done.messageId`; turn persisted; `403` on a
non-owned conversation; key never logged.

---

## Phase 2 — Frontend assistant page

**Goal:** the full Popovich UX, streaming live.

**Frontend**
- Promote generic primitives to `shared/ui/chat` (bubble, scroll container, composer shell).
- `AssistantPage` routes `/assistant` (StartView, centered composer) and `/assistant/:id`
  (ConversationView, docked composer); layout derived from route + data.
- Assistant-only sidebar (`?type=assistant`).
- Consume the stream via `EventSource`: append tokens immutably, **thinking pulse** before first
  token, **Stop** button, composer locked while streaming, error → retry, input preserved.
  Lifecycle in `useEffect` (close in cleanup + `onerror`).
- Dark-mode styling via `tokens.css`.

**Gate:** RTL with mocked `EventSource` — incremental render, Stop aborts, error retry, input kept;
manual end-to-end stream visible in the browser.

---

## Phase 3 — Tools (layers onto P1)

**Goal:** Popovich can call at least one user-scoped tool.

**Backend**
- Messages CQRS queries `summarize_my_recent_messages`, `search_my_messages`, scoped by `senderId`;
  add `{ senderId, createdAt }` index (+ text index / scoped regex for search).
- Tool registry (specs separate from impls), Zod input **and** output schemas, whitelist router.
- Tool loop in `StreamAssistantReply`: validate args → route → execute scoped to `req.user.id` →
  feed back with `tool_call_id` → resume. Cap ≤3 iterations. Emit `tool` SSE events (drive the pulse).

**Gate:** explicit user-scoping test (a tool never returns another user's data); a prompt that needs
the tool triggers it and reasons over structured results.

---

## Phase 4 — Title generation + structured output (layers onto P1/P2)

**Goal:** conversations auto-title without blocking the reply.

**Backend**
- `TITLE_PROMPT_V1`; `GenerateConversationTitle` command (cheap model), run concurrently on the first
  turn; JSON-only `{ title }` parsed with Zod `safeParse`, **fail closed** to `"New chat"`; emit
  `title` SSE event.

**Frontend**
- Patch the single sidebar item's title in place on the `title` event (no list refetch).

**Gate:** title appears after first message without delaying tokens; invalid title falls back cleanly.

---

## Phase 5 — Context budget + rolling summary (layers onto P1)

**Goal:** multi-turn conversations stay coherent within token limits.

**Backend**
- Token counting; centralized soft budget reserving system + tools + user + reply.
- Pure `buildContext`: `contextSummary` + newest→oldest turns until budget, restore order, always keep
  latest.
- Roll-up trigger on total stored turns > threshold: fold prev summary + old head into new
  `contextSummary`, advance `summarizedUpTo`, keep last N raw. Raw turns never deleted.

**Gate:** unit tests on `buildContext`/truncation (pure, deterministic); a long conversation still
carries earlier context via the summary.

---

## Phase 6 — Hardening: resilience, rate limit, cost, evals, tests

**Goal:** production-readiness and the remaining acceptance criteria.

**Backend / Frontend**
- Resilience polish: Stop/disconnect persists partial turn `finishReason: 'stopped'`; LLM error →
  `error` event, persist nothing, FE retry; tool errors caught in-loop as tool-result errors.
- Per-user **token-bucket** rate-limit guard on stream/LLM endpoints → `429` before the LLM call.
- `CostEstimator` + pricing in config; log tokens/model/cost/latency per request.
- Eval set: 5–10 JSON `{ input, checks }` cases + single-command runner (pure `scoreFn`, 0–1, soft
  assertions, threshold). Document pass/fail in the PR.
- Test sweep: mocked-provider orchestrator + tool-loop tests, mapper leak tests, SSE e2e contract,
  FE streaming tests.

**Gate:** all acceptance-criteria checkboxes in `weeks/week6.md` satisfied; `tsc --noEmit` + `build`
+ tests pass; PR description covers provider choice, tools, eval results, cost/latency/prompt tradeoffs.

---

## Phase 7 — CQRS retrofit of Weeks 1–5 (cleanup, after the feature ships)

**Goal:** one consistent command/query-bus pattern across the whole app; remove the temporary
two-pattern coexistence noted in ADR 0006.

**Backend**
- Migrate remaining Week 1–5 **writes** onto the `CommandBus` (e.g. create-conversation,
  send-message, mark-read, register/authenticate) as Command classes + handlers, dispatched by the
  existing orchestrators.
- Relocate the co-located `FindUserByIdQuery`/`FindUserByIdHandler` out of `users.service.ts` into
  its own `application/queries/` file, matching the dedicated-file convention used for Week 6.
- Apply the logging seam uniformly to the migrated handlers.

**Gate:** all existing Week 1–5 tests stay green (this is refactor-behind-tests, no behavior change);
`tsc --noEmit` + `build` pass; no direct domain-service write calls remain in orchestrators.

---

## At-a-glance

| Phase | Theme                  | Demo at the end                                   |
| ----- | ---------------------- | ------------------------------------------------- |
| P0    | Data model & contract  | Create + list an assistant conversation           |
| P1    | Streaming skeleton     | Tokens stream back; reply persists                |
| P2    | Frontend page          | Full Popovich UX streaming in the browser         |
| P3    | Tools                  | A user-scoped tool gets called and reasoned over  |
| P4    | Title + structured out | Conversations auto-title, non-blocking            |
| P5    | Context budget         | Multi-turn stays coherent within limits           |
| P6    | Hardening              | Resilience, rate limit, evals, tests — ship-ready |
| P7    | CQRS retrofit (W1–5)   | One consistent bus pattern app-wide               |
