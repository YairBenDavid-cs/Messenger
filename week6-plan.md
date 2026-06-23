# Week 6 — Assistant ("Popovich") Implementation Plan

Agreed design from the planning session. This is the definition of done for Week 6; it
satisfies `weeks/week6.md` acceptance criteria and respects `principles.md`,
`frontend-standards.md`, `backend-standards.md`, and the lesson notes in `week6-leeson.md`.

---

## 0. Scope

A new `assistant` conversation type. The user chats with an LLM ("Popovich") on a separate
ChatGPT-style page. Replies stream token-by-token over SSE, at least one user-scoped tool is
wired, prompts are versioned source files, and a small eval set is committed. The existing
human↔human messenger contract is preserved byte-for-byte.

---

## 1. Frontend / UI

- **Separate page, not a mode.** New route `/assistant` (start) and `/assistant/:id` (active
  conversation), as its own `AssistantPage` feature folder. Neither page imports from the other.
- **Component reuse by promotion.** Only generic, logic-free primitives move to `shared/ui/chat`
  (message bubble, scroll container, input-textarea shell), driven by props/children. Anything
  that would need an `isAssistant` flag inside a messenger component is split out instead of branched.
  Assistant-specific behavior (streaming append, layout, Popovich avatar/empty state) lives in `AssistantPage`.
- **Empty → active layout** is derived from route + data, never a manual toggle. `/assistant`
  renders a centered "start" composer; submitting creates the conversation, navigates to
  `/assistant/:id`, and the same composer renders docked at the bottom with messages above.
  One container, two presentational layouts (`StartView` / `ConversationView`) sharing the composer.
- **Sidebar is assistant-only.** It lists only `type: assistant` conversations (`?type=assistant`),
  separate from the messenger's `direct` list. No mixed list, no per-row branching.
- **Streaming render.** One "in-progress" assistant message; tokens appended immutably
  (clone-don't-mutate). A **thinking pulse** (brain scaling big/small) shows after send and before
  the first token, and again while a tool call runs. The composer locks during an active stream
  (no concurrent streams). A **Stop** button aborts the connection and persists the partial text.
  Plain text live; markdown applied on `done`.
- **Auto-title UX.** Sidebar shows optimistic `"New chat"`; the reply streams immediately —
  title generation never blocks tokens. The generated title arrives as a `title` SSE event and is
  patched into that one sidebar item in place (no list refetch). On failure, keep `"New chat"`.
- **Dark-mode styling** via the existing `shared/theme/tokens.css` variables.

---

## 2. API & Contract

What changes (all `direct` responses stay identical — no messenger contract break):

- `POST /conversations` — stays **one** endpoint taking `type: 'direct' | 'assistant'`. Pure
  create (no first message in the body). For `assistant`: owner is the sole participant, no
  `participantKey`, `title: "New chat"`. Creating a new Popovich chat **is** this call.
- `GET /conversations?type=` — required filter, always server-scoped to `me.id`; each sidebar
  fetches only its kind.
- `ConversationView` — gains a required `type` and a `title` (stored title for assistant; derived
  other-user name for direct). Human-only fields are null/omitted for assistant rows.
- `POST /conversations/:id/messages` — persists the user turn and returns it. Unchanged for direct;
  now also valid on assistant conversations (no LLM call here).
- `GET /conversations/:id/assistant/stream` — **`@Sse`** endpoint returning
  `Observable<MessageEvent>`: loads history, runs the LLM + tool loop, streams deltas, persists the
  assistant turn, emits a final `done`.

**Per-turn flow:** `POST /:id/messages` (persist user turn) → `GET …/stream` (reply).
**First-turn flow:** `POST /conversations {type:assistant}` → navigate → `POST /:id/messages` →
open stream → title generated in parallel.

### Stream auth & ownership

- `EventSource` can't send an `Authorization` header, so the JWT is passed as `?access_token=` and
  validated by a new **`jwt-query` Passport strategy** + thin `JwtStreamAuthGuard` (shares the same
  `validate()` returning `PublicUser`). Keep that URL out of logs.
- Ownership reuses the existing **`ParticipantGuard`** unchanged — assistant conversations store
  `participantIds: [ownerId]`, so `participantIds.includes(user.id)` already enforces owner-only
  access. Stream route stacks both: `@UseGuards(JwtStreamAuthGuard, ParticipantGuard)`.
- Identity always comes from the JWT (`req.user`), never from body/params/query.

### SSE event contract (Zod-validated both ends, discriminated on `MessageEvent.type`)

| type    | payload                          |
| ------- | -------------------------------- |
| `token` | `{ delta: string }`              |
| `tool`  | `{ name, phase: 'start'|'end' }` |
| `title` | `{ title: string }`              |
| `done`  | `{ messageId, finishReason }`    |
| `error` | `{ code, message }`              |

`done.messageId` is the persisted turn id, so the FE reconciles its optimistic bubble with the
saved message. One token per `token` event. Never leak raw model/tool internals.

---

## 3. Modules / CQRS / Domain

Keeps the existing structure (`domains/*` leaves + `orchestrators/*` + `http/*`):

- **New leaf `domains/assistant/`** — owns the `AssistantMessage`/turn repository, an internal
  turns service, the `LlmProvider` port, the tool registry, and the prompt files. Private by default.
  Imports `ConversationsModule`, `MessagesModule`, `UsersModule` directly.
- **Conversation discriminator stays in `domains/conversations/`** — it's still a conversation.
- **`CreateAssistantConversation`** = a public **CQRS command on the conversations module**
  (single-module → not an orchestrator). The create controller routes by `type`: direct → existing
  orchestrator, assistant → this command.
- **Persist user turn** = a thin single-module command on the assistant module.
- **Tools** (`search_my_messages`, `summarize_my_recent_messages`) = public **CQRS queries on the
  messages module**, scoped to `req.user.id`.
- **`StreamAssistantReply` orchestrator** (`orchestrators/assistant/stream-reply`) — the conductor
  for the reply turn. Returns `Observable<MessageEvent>`. Loads history → builds context → streams
  LLM + tool loop → persists the assistant turn → **owns all conversation writes** (preview,
  `lastMessageAt`, title). On the first turn it nests **`GenerateConversationTitle`** (LLM + a
  conversations update), run concurrently with the reply, emitting the `title` event when it resolves.
  Every orchestrator stays thin and decision-free.

CQRS roles: the streamed reply is a **command** (it persists a turn) that returns a stream; the two
read-tools are **queries** (side-effect-free, idempotent).

---

## 4. Models / Persistence

- **One `conversations` collection with Mongoose discriminators** (no dead fields, single routing
  anchor):
  - **Base:** `type`, `participantIds`, `lastMessageAt`, `lastMessagePreview`, timestamps.
    (`participantIds` on the base keeps `ParticipantGuard` working for both types.)
  - **`Direct` discriminator:** `participantKey`, `unreadCounts`.
  - **`Assistant` discriminator:** `title`, `contextSummary`, `summarizedUpTo`.
- **`participantKey`** is optional, set only for `direct`. Uniqueness ("one conversation per user
  pair") is a direct-only rule → **partial unique index** on `type: 'direct'`. Assistant
  conversations carry no key, so a user gets unlimited assistant chats.
- **Title:** derived (other user's name) in the presenter for `direct`; stored (LLM-generated,
  default `"New chat"`) for `assistant`.
- **New `assistantMessages` / ChatTurn collection** (turns diverge enough from human messages to
  warrant their own schema — lesson-11): `conversationId`, `role: 'user' | 'assistant' |
  'system-summary'`, `text`, `createdAt`, optional `tokenCount`, optional `finishReason`. Scoped by
  `conversationId` (ownership already guard-enforced) — no extra user field needed.
- **Rolling summary** lives on the assistant conversation doc (`contextSummary` + `summarizedUpTo`).
  Raw turns are **never deleted** (full display history — an intentional, justified deviation from
  lesson-11's "drop"); only the LLM *context* is trimmed.
- **Tools read the existing `messages` collection**, scoped by the existing `senderId` field — no
  denormalization onto turns.
- Human `messages` schema and its required `senderId` invariant are left untouched.

---

## 5. Indexing

- `conversations` base: `{ type: 1, participantIds: 1, lastMessageAt: -1, _id: -1 }` — left-prefixes
  the per-type, per-owner sidebar query; `_id` is the cursor tie-breaker. (`participantIds` is
  multikey; a one-element array for assistant indexes fine.)
- `conversations` Direct discriminator: `{ participantKey: 1 }` unique, `partialFilterExpression:
  { type: 'direct' }`.
- `assistantMessages`: `{ conversationId: 1, createdAt: -1, _id: -1 }` for history pagination.
- `messages` (new, for tools): `{ senderId: 1, createdAt: -1 }` for `summarize_my_recent_messages`;
  for `search_my_messages`, a compound text index `{ senderId: 1, text: 'text' }` (or a
  `senderId`-scoped regex for the lightweight version).

---

## 6. LLM Pipeline

- **Provider port (`LlmProvider`, in `domains/assistant/domain`)** returns a provider-agnostic
  `AsyncIterable<LlmStreamEvent>` — union of `text-delta | tool-call | finish`. The Anthropic/OpenAI
  SDK adapter implements it in `infrastructure/` as an async generator translating SDK chunks to that
  union. Orchestrator/services depend only on the port (DIP); swapping = a new adapter, no orchestrator
  change. Model id and key come from env/config.
- **Tool-call loop** lives in `StreamAssistantReply`: consume the provider stream; on `tool-call`,
  Zod-validate args → route by name through a **whitelist** router (reject unknown) → execute as a
  messages CQRS query scoped to `req.user.id` (never model-supplied ids) → feed result back with the
  matching `tool_call_id` → resume. Cap at ≤3 iterations. Tool JSON specs are separate from
  implementations. Emit `tool` SSE events around execution (drives the pulse).
- **Prompts** in a `prompts/` folder in `domains/assistant`: named constants (`SYSTEM_PROMPT_V1`,
  `TITLE_PROMPT_V1`) built as templates (Task → Context → Constraints → Output) with `// why`
  comments. Semantic versioning in the name + an `ACTIVE` alias, bumped by behavior impact, committed
  as first-class code. A small `PromptRepository` centralizes access; one safe interpolation utility
  injects validated placeholders — no string concatenation in services.
- **Structured output (Zod, both cases):**
  - Title generation: prompt demands JSON-only `{ title: string }` (bounded length), parsed with
    `safeParse`; **fail closed** to `"New chat"` — never partially trust.
  - Tool inputs **and** outputs are Zod-validated (args in, structured results out).
- **Context budget:** a centralized soft token budget under the model's hard limit, reserving room
  for system prompt + tool specs + current user message + reply. A pure `buildContext` reads
  `contextSummary` then walks turns newest→oldest until the budget is hit, restores chronological
  order, always keeps the latest turn. **Roll-up trigger:** when *total stored* turns exceed a
  threshold (not per request) — fold previous summary + old head into a new `contextSummary`, advance
  `summarizedUpTo`, retain the last N raw. Count tokens, not characters.
- **Model selection & cost:** a medium (streamed) model for the reply; a small/cheap model for title
  generation and summary roll-ups. Pricing in config (never controllers); a `CostEstimator` maps
  tokens + model → dollars; log tokens/model/cost/latency per request.

---

## 7. Resilience (stream failure / abort)

- Assistant turn is persisted only at completion, from the accumulated buffer.
- User **Stop** / disconnect → persist the partial text as a turn flagged
  `finishReason: 'stopped'` so history stays consistent.
- LLM-level error → emit `error` event, persist nothing; FE shows a retry path and **preserves the
  user's input**.
- Tool errors are caught *inside* the loop and returned to the model as a tool-result error — they
  don't crash the stream.
- FE: create the `EventSource` in `useEffect`, close it in cleanup and `onerror`, clear the streaming flag.

---

## 8. Evals (committed)

- A JSON of 5–10 `{ input, checks }` cases co-located with the assistant feature, covering: plain
  Q&A, each tool being correctly invoked and user-scoped, the structured title output, and one
  edge/refusal case.
- A single-command runner scores each with a pure `scoreFn` using soft assertions
  (content/structure/tool-was-called → 0–1), averages against a threshold, prints pass/fail.
- No exact-string assertions (non-deterministic output). Document pass/fail in the PR description.

---

## 9. Testing (deterministic suite, separate from evals)

- **Mock the `LlmProvider` port** to yield a scripted token + tool-call stream — orchestrator and
  tool loop run deterministically with no real LLM.
- **BE unit:** `buildContext`/truncation, mappers (assert no DB/sensitive leak, correct role
  mapping), tool input Zod validation, an explicit **user-scoping test** (a tool never returns another
  user's data), title `safeParse` fail-closed.
- **BE e2e (supertest):** SSE event framing, `done.messageId`, `403` on a non-owned conversation.
- **FE (Vitest + RTL, mocked `EventSource`):** tokens render incrementally, Stop aborts, error shows
  retry, input preserved.

---

## 10. Rate limiting

A thin per-user **token-bucket** guard (burst capacity + refill rate) on the stream/LLM endpoints,
returning `429` *before* the LLM call. Not distributed, no Redis — just enough to stop a runaway
client and protect spend.

---

## 11. Non-negotiables (gates before "done")

- TypeScript strict, **no `any` / no `as`**; `npx tsc --noEmit` and `npm run build` pass.
- API key env-only (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`); `.env.example` updated; never logged.
- All assistant data scoped to the authenticated user (403, never the data).
- Prompts in source files, commented for intent; ≥1 Zod-validated structured output (we do two).
- Focused commits (`topic: verb description`); PR documents provider choice, tools, eval results,
  and cost/latency/prompt tradeoffs.

---

## 12. Suggested build order (tracer bullet first)

1. Schema + discriminators + indexes; `type` on create/list/`ConversationView` (contract intact).
2. `LlmProvider` port + one SDK adapter (no tools yet); `StreamAssistantReply` streaming `token` +
   `done` end-to-end behind the SSE auth guard.
3. FE `AssistantPage` skeleton: start→docked layout, streaming render, Stop, thinking pulse.
4. One tool (validated, user-scoped) + the tool loop + `tool` events.
5. Title generation (`title` event) + structured-output Zod.
6. Context budget + rolling summary.
7. Rate-limit guard, eval set, tests.
