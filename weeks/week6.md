## TL;DR

Add an AI assistant mode to your chat backend. New conversation type: when the user messages the assistant, the backend calls an LLM and streams the response back via Server-Sent Events. The FE renders tokens as they arrive. Wire at least one tool the model can call against the user's data.

## Learning goals

- Call an LLM API (Anthropic or OpenAI) from a Node backend.
- Stream responses end-to-end (LLM stream → backend SSE → FE token rendering).
- Implement tool calling: define tools, handle the tool-call/tool-result loop, validate tool inputs.
- Use Zod-validated structured outputs where appropriate.
- Treat prompts as code — version-controlled, with a small eval set.

## Spec

A new conversation type: `assistant`. Rules:

- The FE can create a conversation with the assistant (`POST /conversations` with `type: "assistant"`).
- Posting a user message to an assistant conversation triggers an LLM call.
- The response is streamed back via SSE: token deltas as they arrive, plus a final "done" event.
- The full assistant message is persisted to MongoDB after streaming completes.
- The FE renders streaming tokens in real time.

Tools (at least one required):

- `summarize_my_recent_messages(limit: number)` — returns a summary of the user's last N messages.
- OR `list_my_conversations()` — returns the list of the user's conversations.
- OR `search_my_messages(query: string)` — keyword search over the user's messages.

Tools must:

- Be scoped to the authenticated user only — a tool call must never leak another user's data.
- Validate inputs with Zod.
- Return structured results the model can reason over.

Eval (lightweight):

- 5-10 hand-written test prompts in a JSON file.
- A script that runs each prompt against your AI assistant and prints the response.
- Document which prompts succeed / fail in the PR description.

## Tech constraints

- NestJS backend extended.
- LLM provider: pick Anthropic OR OpenAI (your choice). Keep the call behind a thin abstraction so swapping is feasible.
- API key from env (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`). Never logged. Never committed.
- SSE for streaming. The Nest controller exposes a streaming endpoint; the FE consumes via `EventSource` or `fetch` with a streaming body reader.
- Zod for tool input/output schemas.
- No `any`.

## Acceptance criteria

- [ ]  Assistant conversation type works end to end.
- [ ]  Tokens stream in real time on the FE — no waiting for the full response.
- [ ]  Assistant messages persist to MongoDB after streaming.
- [ ]  At least one tool implemented; tool inputs validated with Zod; tool returns results scoped to the authenticated user.
- [ ]  Multi-turn assistant conversations preserve context within sensible limits.
- [ ]  Prompts live in source files (not magic strings inline) and are commented for intent.
- [ ]  At least one Zod-validated structured output use case in the codebase.
- [ ]  Small eval set committed; results documented in the PR description.
- [ ]  API keys are env-only; `.env.example` updated; secrets never logged.
- [ ]  `npx tsc --noEmit` passes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, which provider you picked and why, tool(s) implemented, eval results, key tradeoffs (cost, latency, prompt design).
- Mentor reviews the PR on Sunday.