**Course:** AI  •  **Week:** 8  •  **Score weight:** 100

## TL;DR

Final shipping week. Compose everything from Weeks 1-7 into one product: React FE + NestJS BE + Mongo + JWT + LangGraph agent that wraps your Week 7 RAG tutor + at least one user-data tool. Persist agent state via MongoDB checkpointing. Stream agent events to the FE. Ship.

## Learning goals

- Compose a real product from many layers: typed FE, structured BE, persistent storage, auth, LLMs, retrieval, agents.
- Model an agent as a LangGraph state graph with nodes, edges, conditional routing, and tools.
- Persist agent state in MongoDB via the LangGraph checkpoint saver.
- Stream agent events (token deltas, tool calls, intermediate progress) to the FE and render them clearly.
- Explain every layer of the stack and the tradeoffs at each layer.

## Spec

Refactor the Week 7 tutor into a LangGraph agent. The agent must:

- Have an explicit state schema (`Annotation`-based) including conversation history, retrieved context, last tool call, etc.
- Use nodes for distinct steps — at minimum: route (decide what to do next), retrieve, answer, tool_call, tool_result.
- Use conditional edges to route between "needs retrieval", "needs tool call", and "ready to answer".
- Use the LangGraph MongoDB checkpoint saver so conversation state survives restarts and the agent can resume mid-conversation.
- Stream events to the FE: token deltas, tool-call announcements, tool-result completions.
- Use the RAG retrieval from Week 7 as a tool the agent invokes when the question needs grounded knowledge.

At least one additional tool that operates on the user's own data (reuse / extend from Week 6): `summarize_my_messages`, `list_my_conversations`, `search_my_messages`, or your own.

FE:

- Conversations of all three types should work in one polished UI: human conversations, assistant conversations, tutor conversations.
- Tutor messages render citations.
- Streaming UX: tokens appear progressively; tool-call indicators show the agent's progress (e.g. "Searching your documents…", "Looking up your messages…").

## Tech constraints

- LangGraph (TypeScript) for the agent graph.
- LangGraph MongoDB checkpoint saver for persistence.
- All previous constraints carry forward: TypeScript strict mode, no `any`, env-only secrets, JWT-protected, scoped to the authenticated user.
- The full repo runs locally end-to-end with documented setup steps in the PR description.

## Acceptance criteria

- [ ]  Agent defined as a LangGraph state graph with at least one conditional edge.
- [ ]  Agent state schema typed and documented.
- [ ]  MongoDB checkpoint saver wired — kill the server mid-conversation, restart, conversation resumes.
- [ ]  Retrieval (Week 7) and at least one user-data tool (Week 6) are both available to the agent.
- [ ]  FE streams tokens and shows tool-call progress to the user.
- [ ]  Tutor citations still rendered correctly.
- [ ]  All three conversation types work in the same polished UI: human, assistant, tutor.
- [ ]  Authorization rule still enforced — tools and retrieval are scoped to the authenticated user only.
- [ ]  `npx tsc --noEmit` passes across FE and BE.
- [ ]  PR description includes a graph diagram (text/mermaid is fine), the state schema, the tool list, and a short reflection on the eight-week journey.

## Submission

- PR on your assigned GitHub repo (capstone branch).
- PR description must include: agent graph diagram, agent state schema, tool list, tradeoffs reflection, demo notes.
- The repo must run end-to-end locally with a documented setup checklist.
- Mentor reviews the PR on Sunday.