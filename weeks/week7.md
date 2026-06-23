**Course:** AI  •  **Week:** 7  •  **Score weight:** 100

## TL;DR

Extend the chat backend with a knowledge base. Endpoint to upload a document, ingestion pipeline (chunk → embed → store in Atlas Vector Search), retrieval endpoint, and an AI tutor mode that answers questions grounded in the uploaded content with citations. Use LangChain for the RAG chain.

## Learning goals

- Build an ingestion pipeline: document → chunks → embeddings → MongoDB Atlas Vector Search.
- Use MongoDB Atlas Vector Search to retrieve top-K relevant chunks for a query.
- Compose retrieval + LLM into a RAG chain that returns answers with citations.
- Use LangChain primitives (LLMs, prompts, retrievers, Runnables) where they earn their keep.
- Evaluate retrieval and answer quality separately.

## Spec

New tutor conversation type: `tutor`. Rules:

- A user can upload documents (text, markdown, or PDF — pick the formats you want to support, document it).
- Each user has a private knowledge base — uploaded docs are scoped to them.
- Ingestion runs asynchronously (or synchronously for simplicity) and stores chunks + embeddings in Atlas with the user ID as a filter.
- A tutor conversation answers using ONLY the user's uploaded knowledge base — no general LLM knowledge for grounded questions.
- Every tutor answer includes citations: a list of source chunks with the document name and the chunk text.
- The FE renders citations under each tutor message — clickable, showing the source.

Endpoints:

- `POST /knowledge/documents` — upload a document, kick off ingestion. Returns ingestion status.
- `GET /knowledge/documents` — list the user's uploaded documents.
- `DELETE /knowledge/documents/:id` — remove a document and its chunks.
- Tutor messages flow through the existing assistant message path, but use the tutor RAG chain instead of a plain LLM call.

Eval:

- 10-20 question/expected-source pairs in a JSON file.
- For each question: did the system retrieve the right chunk? Did the answer cover the expected information?
- Document retrieval recall and a qualitative answer quality summary in the PR description.

## Tech constraints

- MongoDB Atlas (free tier or paid) — local Mongo does NOT support Vector Search. Atlas is required.
- Atlas Vector Search index defined in the repo (JSON config or migration script).
- LangChain (TypeScript) for the RAG chain composition.
- Embeddings provider: Anthropic doesn't offer embeddings — use OpenAI `text-embedding-3-small` (cheap, good) or Voyage AI. Document your choice.
- LLM provider: same as Week 6.
- Chunking: pick a strategy (size + overlap). Document it.
- Citations: every chunk has a stable ID, document name, and source text returned in the API response.
- No `any`.

## Acceptance criteria

- [ ]  Document upload works for the formats you committed to supporting.
- [ ]  Ingestion pipeline produces chunks + embeddings stored in Atlas with the right metadata.
- [ ]  Atlas Vector Search index exists in the repo (config) and is provisioned.
- [ ]  Retrieval correctly returns top-K chunks scoped to the authenticated user only — no cross-user retrieval possible.
- [ ]  Tutor answers are grounded in retrieved context — no hallucinated facts when retrieval is empty.
- [ ]  Every tutor answer carries citations; FE renders them clearly.
- [ ]  Eval set committed; retrieval recall + answer quality documented in the PR description.
- [ ]  Re-uploading the same document doesn't duplicate chunks.
- [ ]  `npx tsc --noEmit` passes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, chunking strategy + reasoning, embedding/LLM provider choices, Atlas index config, eval results (numbers + commentary), key tradeoffs.
- Mentor reviews the PR on Sunday.