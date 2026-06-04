
## TL;DR

Ship a chat UI in React + Vite + TypeScript against a mocked API. Conversation list on the left, message thread + composer on the right, optimistic sends, real loading / error / empty states. The mocked API contract MUST match what your backend will deliver in Week 3 — design the contract first.

## Learning goals

- Ship a real product with clean component architecture and clear data flow.
- Handle loading, empty, success, and error states explicitly.
- Apply optimistic updates with rollback on failure.
- Test components and at least one custom hook.
- Write a typed mocked API matching a contract you'll later build server-side.

## Spec

- Auth screen (mocked): "log in as user X" — no real auth this week, just choose a user identity.
- Conversation list: shows all conversations the current user is part of, sorted by last message.
- Message thread: messages from the selected conversation, auto-scrolled to bottom.
- Message composer: controlled text area, submit on Enter (Shift+Enter for newline).
- Optimistic message send: message appears instantly, rolls back on simulated failure.
- Loading skeletons for conversation list + message thread.
- Empty states (no conversations, empty thread).
- Error toast on failed send.
- Mocked API behind a single `apiClient.ts` module — typed, matching the contract you'll implement in Week 3.

## Tech constraints

- React + Vite + TypeScript (strict mode).
- No real backend — use MSW (Mock Service Worker) or a simple in-memory fake fetcher.
- No `any`. Explicit return types.
- At least one custom hook for the chat domain (e.g. `useConversation`, `useMessages`).
- At least one component using `useReducer` for non-trivial state.

## API contract (you must define this and document it)

You design the contract this week. Document it in `API_CONTRACT.md` in the repo. At minimum:

- `POST /auth/login` → `{ token, user }`
- `GET /conversations` → list of conversations
- `GET /conversations/:id/messages?cursor=...` → paginated messages
- `POST /conversations/:id/messages` → create a message

Backend Week 3 will implement this contract. If you change it later, document the change.

## Acceptance criteria

- [ ]  All UI states (loading, empty, success, error) are visibly handled.
- [ ]  Optimistic send works and rolls back on simulated failure.
- [ ]  Auto-scroll keeps the latest message in view.
- [ ]  Cursor-style pagination supported in the API mock (frontend doesn't crash on a long thread).
- [ ]  At least one custom hook + at least one `useReducer` usage.
- [ ]  At least 5 unit/component tests with Vitest + React Testing Library.
- [ ]  `npx tsc --noEmit` passes.
- [ ]  `API_CONTRACT.md` documents every endpoint with request/response shapes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, link to `API_CONTRACT.md`, list of states/components, key tradeoffs.
- Mentor reviews the PR on Sunday.