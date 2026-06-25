# Week 6 — Design Decisions (Grilling Q&A)

Verbatim reconstruction of the `grill-me` planning session for Week 6 (the "Popovich"
assistant). Each entry is the question asked, the recommendation given, and the decision
landed on. This is the raw decision trail behind `week6-plan.md` and `week6-build.md`.

Format of the session: open questions in batches of two, each with a recommendation grounded
in `principles.md` / the standards / lesson notes. Numbering restarted once after the agenda
was reordered (UI → API → modules → models → indexing → LLM), so Q9/Q10 were deferred and
resumed mid-way; the canonical sequence below is the 32 the plan was built from.

> **Later clarification (ADR 0006).** This is a historical record, kept verbatim. Where Q17/Q18/Q22
> and others say "CQRS command/query", the implementation realizes each as an `@nestjs/cqrs`
> Command/Query class + handler dispatched through the `CommandBus`/`QueryBus` by a thin orchestrator
> — not a bare service method. The `QueryBus` was already in use (`FindUserByIdQuery`); Week 6 adds
> the `CommandBus` for writes, and Weeks 1–5 are retrofitted onto the bus in a new phase P7. See
> ADR 0006 for the full decision.

---

## Pre-amble — the two data-model questions that opened the tree

Before the agenda was reordered, two questions framed the core fork. Their final resolutions
were folded into Q11–Q16.

**P-A — Assistant conversation representation.** How to model an assistant conversation so the
existing 1:1 invariants (unique `participantKey`, "other participant") don't break?
*Recommendation:* add a `type: 'direct' | 'assistant'` discriminator. *Resolved in Q11/Q13/Q15.*

**P-B — Message role / authorship.** Assistant replies have no human sender; how to record
authorship and what happens to `senderId`?
*Recommendation:* add a `role` set and make `senderId` optional. *Superseded by Q12 — a
separate `assistantMessages` collection instead, leaving the human `messages` schema untouched.*

The user then reframed the agenda: "talk on the UI, then the API and endpoint contract, then
modules/CQRS/domain, then models and database, then indexing, then the LLM steps (tools,
prompts, SSE, validation, Zod, prompt version control)." Vision: an "Ask Popovich" button
opening a ChatGPT/Claude-style page — centered text-bar that docks to the bottom after the
first message, conversation list on the left with a toggle, dark mode, LLM-generated titles.

---

## UI

### Q1 — Page boundary / routing
The assistant is a separate ChatGPT-style screen, but the chat primitives live deep inside
`MessengerPage`. Its own route/page reusing promoted shared components, or a mode inside
`MessengerPage`?
**Recommendation:** a separate `AssistantPage` (route `/assistant`); promote shared chat
primitives to `shared/` so neither feature imports the other.
**Decision:** Agree.

### Q2 — Reuse vs. re-implement rule
Which existing components get promoted to `shared/` versus rebuilt for the assistant?
**Recommendation:** promote only generic, logic-free primitives (message bubble, scroll
container, input-textarea shell) driven by props; keep assistant-specific behavior in
`AssistantPage`. If reuse would need an `isAssistant` flag inside a component, split it instead.
**Decision:** Agree.

### Q3 — Empty→active layout transition
Centered composer on a blank screen, docked to the bottom once the conversation starts — model
it off a toggle, the route, or derived from data?
**Recommendation:** drive it off route + data, never a manual flag. `/assistant` = centered
StartView; submit creates the conversation, navigates to `/assistant/:id` = docked
ConversationView; one container, two presentational layouts sharing the composer.
**Decision:** Agree.

### Q4 — Conversation-list scope in the sidebar
Assistant-only list, or one unified list spanning both conversation types?
**Recommendation:** separate, type-scoped lists; the assistant sidebar shows only
`type: 'assistant'`, which means the list endpoint gains a `?type=` filter.
**Decision:** Agree — assistant chats only, it's a different page.

### Q5 — Streaming render behaviour
What does the user see and do while Popovich streams?
**Recommendation:** one in-progress bubble, append tokens immutably; lock the composer during
a stream; a Stop button that aborts and persists partial text; plain text live, markdown on `done`.
**Decision:** Agree — and add a "thinking" brain that pulses big/small while waiting for the
SSE (reused while a tool call runs).

### Q6 — Auto-title UX
When does the title appear, and does generating it delay the reply?
**Recommendation:** optimistic "New chat", reply streams immediately, title never blocks tokens;
title arrives as a separate `title` SSE event and patches that one sidebar item in place; on
failure keep "New chat".
**Decision:** Agree.

---

## API & endpoint contract

### Q7 — Shape of the assistant turn
`EventSource` is GET-only but persisting a message is a POST — how to split the turn?
**Recommendation:** two endpoints. `POST /conversations/:id/messages` persists the user
message (no LLM); `GET /conversations/:id/assistant/stream` is the `@Sse` endpoint that runs
the LLM + tool loop, streams tokens, persists the assistant turn, emits `done` with the id.
**Decision:** Agree.

### Q8 — Authenticating the stream
`EventSource` can't send an `Authorization` header, yet every byte must stay user-scoped.
**Recommendation:** pass the JWT as a query param, validate with a `jwt-query` guard variant;
scope every load/tool call to `req.user.id`; keep the URL out of logs.
**Decision:** Agree — only the owner can read or send to his own assistant conversation;
identity strictly from the JWT; build a new guard if the current ones can't do it.
*Result:* existing `ParticipantGuard` already enforces ownership via
`participantIds.includes(user.id)`; only new piece is a `jwt-query` Passport strategy +
`JwtStreamAuthGuard`. Route stacks `@UseGuards(JwtStreamAuthGuard, ParticipantGuard)`.

### Q9 — Conversation create/list/view contract changes *(deferred, then resumed)*
What changes across create / list / view so assistant conversations fit without breaking the
messenger contract?
**Recommendation:** `POST /conversations` accepts `type` and routes by it (assistant → owner
as sole participant, no `participantKey`, `title: "New chat"`); `GET /conversations` gains a
server-scoped `?type=` filter; `ConversationView` gains a required `type` + the right `title`
(stored for assistant, derived other-user name for direct). Direct responses stay byte-identical.
**Decision:** Agree.

### Q10 — SSE event contract *(deferred, then resumed)*
What event types and payload shapes does the stream define?
**Recommendation:** a small discriminated set keyed on `MessageEvent.type`: `token` `{ delta }`,
`tool` `{ name, phase }` (drives the pulse), `title` `{ title }`, `done` `{ messageId,
finishReason }`, `error` `{ code, message }`; minimal JSON, one shared Zod schema parsed on both
ends; `done.messageId` is the persisted turn's id. Never leak raw model/tool internals.
**Decision:** Agree. (User also confirmed assistant-create is `POST /conversations
{type:"assistant"}` — see Q21/Q22.)

*(The user deferred Q9/Q10 here: "let's talk on the models first, make the source of truth
clear, and explain the trade-off of a new collection vs. reusing the existing one.")*

---

## Models / source of truth

### Q11 — Conversation collection
Keep assistant conversations in the existing `conversations` collection behind a `type`
discriminator, or a separate collection?
**Recommendation:** reuse + `type`. It's the spec's framing, keeps sidebar/list/pagination/
contract unified; only cost is two dead fields on assistant rows.
**Decision:** Agree — with nuances: direct title = the other user's name; assistant title =
LLM-generated from the first message; both still need `lastMessageAt` for ordering; uniqueness
differs — `(user1,user2)` = exactly one direct conversation, but `(user,assistant)` can be
many. So the participant key needs rethinking (resolved in Q13).

### Q12 — Message/turn collection
New `assistantMessages` (ChatTurn) collection with a `role` field and room for
`tokenCount`/model metadata, or merge into `messages` with `senderId` optional?
**Recommendation:** new collection — honors lesson-11's dedicated ChatTurn, preserves the clean
human-message invariant, lets Weeks 7–8 extend the turn schema safely; share cursor/mapper helpers.
**Decision:** Agree — keep it different because it carries more details. (User also asked: how
is the rolling summary stored if we keep every raw turn but also want last-N + summary? →
resolved in Q14.)

### Q13 — participantKey + title
`participantKey` made optional with a **partial unique index** on `type: 'direct'` only, plus
an optional stored `title` used only by assistant?
**Recommendation:** Yes —
`index({ participantKey: 1 }, { unique: true, partialFilterExpression: { type: 'direct' } })`;
`participantKey` unset for assistant; optional `title` defaulting to "New chat"; direct title
derived in the presenter. Uniqueness is a direct-only rule, no fake keys.
**Decision:** Agree.

### Q14 — Where the rolling summary lives
Keep every raw turn forever *and* build context from "last N turns + one rolling summary" —
where does the summary live?
**Recommendation:** raw turns immutable in the turns collection (intentional deviation from
lesson-11's "drop"); store the summary as `contextSummary: string` + `summarizedUpTo` on the
assistant conversation doc. Display reads all turns; the context-builder sends `contextSummary`
+ the N turns after `summarizedUpTo`.
**Decision:** If both conversation types end up with dead fields, split them. *This triggered
the discriminator decision in Q15* (dead fields are bidirectional: direct rows carry dead
`title`/`contextSummary`/`summarizedUpTo`; assistant rows carry dead `participantKey`/
`unreadCounts`).

---

## Indexing

### Q15 — How to split: physical collections vs. discriminators
Two physical conversation collections, or one collection with Mongoose discriminators?
**Recommendation:** discriminators — one collection (one routing anchor, one id→type lookup),
zero dead fields. Base holds `type`, `participantIds`, `lastMessageAt`, `lastMessagePreview`,
timestamps; `Direct` adds `participantKey` + `unreadCounts` (partial-unique index here);
`Assistant` adds `title` + `contextSummary` + `summarizedUpTo`.
**Decision:** Agree (good call). On the index: use
`{ type: 1, participantIds: 1, updatedAt: -1 }` shape — confirmed a single participantId
indexes fine (multikey). Append `_id` for a stable cursor tie-breaker. After weighing
`updatedAt` (auto-bumps on any write) vs `lastMessageAt`, the user chose: **keep
`lastMessageAt`** for precise last-message ordering.

### Q16 — Assistant turns schema + user-scoping field
Scope a turn only via its conversation, or also carry a denormalized `ownerId` for the tools?
**Recommendation:** denormalize `ownerId` onto each turn so tools query "this user's turns"
without joining through conversations; index `{ ownerId, createdAt }`.
**Decision:** Corrected — the tools (`search_my_messages`, `summarize_my_recent_messages`)
should target the user's **human messages** in the existing `messages` collection, scoped by
the `senderId` already there. So **no `ownerId` denormalization**; add `{ senderId: 1,
createdAt: -1 }` to `messages`; assistant turns stay scoped purely by `conversationId`
(ownership via `ParticipantGuard`).

---

## Modules — CQRS / domain

### Q17 — Bounded-context layout & wiring
Where does the assistant feature live, and which modules does it import?
**Recommendation:** a new assistant bounded context owning turns + LLM port + tool registry +
prompts; the conversation discriminator stays in the conversations module; the cross-context
flow is a `StreamAssistantReply` orchestrator.
**Decision:** Keep the current structure's rules — a module that talks to the DB is a **leaf**
with its own repository + internal services (private by default); any use case touching more
than one service is extracted to an **orchestrator**; a service that is public API (not the
module's private internals) is exposed via **CQRS**. *Result:* assistant turns + LLM port +
tools + prompts = a leaf `domains/assistant/`; the two tools = the messages module's public
CQRS queries; the streamed reply = an `orchestrators/assistant/stream-reply` orchestrator.

### Q18 — CQRS modeling of the streaming reply + where tools sit
The reply reads history and writes a turn; the tools only read. Model it under CQRS how?
**Recommendation:** the streamed reply is a command (persists a turn) but returns an
`Observable<MessageEvent>`, mutation at completion; the two read-tools are queries into the
messages context; tools are thin adapters with specs (Zod/JSON) kept separate from
implementations.
**Decision:** Agree.

---

## LLM steps

### Q19 — LLM provider abstraction
What does the port look like and where does the SDK adapter live?
**Recommendation:** a domain port `LlmProvider` returning a provider-agnostic
`AsyncIterable<LlmStreamEvent>` (`text-delta | tool-call | finish`); the SDK adapter implements
it in `infrastructure/` as an async generator; orchestrator depends only on the port (DIP),
injected via a Nest token; model ids from config.
**Decision:** Agree.

### Q20 — Tool-call loop
Where does the loop live, and how do specs/validation/CQRS exposure fit?
**Recommendation:** the loop lives in the `stream-reply` orchestrator; on a `tool-call`,
validate args with Zod, route by name through a **whitelist** router (reject unknown), execute
as a CQRS query scoped to `req.user.id` (never model-supplied ids), feed the result back, cap
iterations (≤3), emit `tool` SSE events around execution.
**Decision:** Agree.

---

## First-message flow

### Q21 — First-message round-trips
The first send is three calls (create → send message → stream). Keep `POST /conversations`
pure, or fold the first message into it?
**Recommendation:** keep create pure — preserves single-responsibility DTOs, matches the spec;
the extra round-trip happens only on the first message. Never create empty conversations on
page open, only on first send.
**Decision:** Agree.

### Q22 — Where assistant-create lives
Assistant-create touches only the conversations module — orchestrator or module API?
**Recommendation:** a public **CQRS command on the conversations module**
(`CreateAssistantConversation`), not an orchestrator; the create controller routes by `type`
(direct → existing orchestrator, assistant → the new command).
**Decision:** Agree. (User asked who orchestrates the full first-message flow → answered in
Q23/Q24: there is **no single god-orchestrator** — three thin conductors, one per HTTP request;
`StreamAssistantReply` is the heavy conductor for the actual LLM turn and nests title gen.)

### Q23 — Where do conversation writes happen?
Bump the conversation in request 2 (→ orchestrator), or let `StreamAssistantReply` own all
conversation writes?
**Recommendation:** make `POST /:id/messages` a thin single-module command (persist user turn
only); `StreamAssistantReply` owns every conversation mutation (preview, `lastMessageAt`,
title) when it saves the assistant turn. One owner, fewer orchestrators.
**Decision:** Agree.

### Q24 — Title generation placement
A thin nested command, or a saga reacting to a "first reply completed" event?
**Recommendation:** nested thin command — on the first turn only, `StreamAssistantReply` fires
`GenerateConversationTitle` concurrently with the reply and emits the `title` event when it
resolves. A saga reacts after the request, so it couldn't push onto the open stream.
**Decision:** Agree.

---

## Prompts & structured output

### Q25 — Prompt storage, structure, and versioning
How are prompts organized and versioned?
**Recommendation:** a `prompts/` folder with named exported constants (system prompt,
title-gen prompt), each built as a Task→Context→Constraints→Output template with a `// why`
note; version in the name (`SYSTEM_PROMPT_V1`) + an `ACTIVE` alias; a small `PromptRepository`;
one safe interpolation utility (no string concatenation in services).
**Decision:** Agree.

### Q26 — The Zod-validated structured-output use case
Title generation, tool outputs, or which is canonical?
**Recommendation:** title generation is cleanest — prompt demands JSON-only `{ title }`, parsed
with `safeParse`, **fail closed** to "New chat" on any failure.
**Decision:** Do it for **both** — title-gen response *and* every tool's inputs and outputs.
Two demonstrations of the prompt↔schema contract.

---

## Context budget & model choice

### Q27 — Context budget & summarization trigger
What's the budget policy and roll-up trigger?
**Recommendation:** a soft token budget well under the hard limit (reserving room for system
prompt + tool specs + current message + reply); a pure `buildContext` reads `contextSummary`
then walks turns newest→oldest until the budget is hit, restoring chronological order, always
keeping the latest turn; trigger a roll-up only when *total stored* turns exceed a threshold.
Count tokens, never characters.
**Decision:** Agree.

### Q28 — Model selection & cost/latency
Which models for the three call types, and how to keep cost visible?
**Recommendation:** a medium model for the streamed reply; a small/cheap model for title gen +
summary roll-ups; pricing in config; a `CostEstimator` mapping tokens + model → dollars; log
tokens/model/cost/latency per request; model ids from env.
**Decision:** Agree.

---

## Resilience & evaluation

### Q29 — Stream failure, abort, and partial persistence
Defined behavior for persistence, the `error` event, and FE cleanup?
**Recommendation:** persist the turn only at completion from the accumulated buffer; on
Stop/disconnect persist partial text flagged `finishReason: 'stopped'`; on an LLM error emit
`error` and persist nothing (FE shows retry, never clears input); tool errors are caught inside
the loop and returned to the model, never crashing the stream; FE creates the `EventSource` in
`useEffect`, closes it on cleanup/`onerror`.
**Decision:** Agree.

### Q30 — Eval set design
What do the cases cover and how are they scored?
**Recommendation:** a committed JSON of 5–10 `{ input, checks }` cases — plain Q&A, each tool
correctly invoked and user-scoped, the structured title output, one edge/refusal case; a
single-command runner with a pure `scoreFn` (soft assertions, 0–1), averaged against a
threshold, prints pass/fail; never assert exact strings; document results in the PR.
**Decision:** Agree.

---

## Testing & abuse protection

### Q31 — Testing strategy for streaming + tools
How to test the assistant, separate from the eval set?
**Recommendation:** mock the `LlmProvider` port to yield a scripted token + tool-call stream
(deterministic, no real LLM); unit-test the pure pieces (`buildContext`/truncation, mappers,
tool Zod validation, the user-scoping guarantee, title `safeParse` fail-closed); e2e the SSE
contract with supertest (framing, `done.messageId`, 403 on a non-owned conversation); FE with
RTL + a mocked `EventSource`. The real-LLM eval set stays out of the deterministic suite.
**Decision:** Agree.

### Q32 — Rate limiting / abuse protection
In scope for Week 6 or deferred?
**Recommendation:** a lightweight per-user token-bucket guard on the stream/LLM endpoints
(burst + refill, 429 before the LLM call) — minimal, not distributed, no Redis.
**Decision:** Agree — use token-bucket.

---

## Outcome

Every branch resolved into `week6-plan.md` (the design) and `week6-build.md` (seven phased,
PR-sized builds: P0 data model & contract, P1 streaming skeleton, P2 frontend page, P3 tools,
P4 title + structured output, P5 context budget, P6 hardening). The user then opened the
`assistant-feat` branch and began Phase 0.
