# lesson-1

# lesson-2

# lesson-3

# lesson-4
Prompt structure
Separate: Task → Context → (Examples) → Constraints → Output format
One clear primary task verb per prompt.
Keep structure consistent across similar prompts.
Task
Define what operation the model should perform.
Avoid mixing multiple unrelated tasks in one prompt.
Context
Provide only necessary data and minimal background.
Clearly label and delimit all input data.
Make participant roles and scope explicit.
Few-shot examples
Use a small number of input → desired output pairs.
Cover normal, tricky, and edge cases.
Keep example format and style consistent.
Ensure examples follow your own constraints and output rules.
Constraints
Control length, tone, language, and allowed/forbidden content.
Make constraints explicit, specific, and non-contradictory.
Phrase them so compliance is easy to verify.
Output format
Specify the desired structure (bullets, list, key:value, table).
Be explicit about counts, markers, and sections.
Isolate formatting instructions in their own section.
Roles / personas
System: global behavior, domain, style defaults.
User: per-request task, context, examples, constraints, format.
Keep system prompts short, stable, and behavior-focused.
Clean-code organization
Extract prompts into named templates/builders.
Group sections clearly inside the template.
Keep prompt-building separate from network/business logic.
Use descriptive names that reflect the prompt’s purpose.

# lesson-5
System prompt purpose
Define assistant identity and context
Define allowed scope and boundaries
Constrain behavior, not just tone
System prompt structure
Identity & context
Scope of help (can / cannot do)
Style and interaction rules (tone, clarity, length)
Uncertainty handling (when unsure / missing info)
Hard constraints and red lines
Prompt-as-code organization
Store prompts in dedicated folders (e.g. prompts/)
Use named constants, not inline strings in services
Keep system prompts separate from business logic
Use a central PromptRepository (or equivalent)
Versioning and naming
Use semantic versioning MAJOR.MINOR.PATCH
Encode version in constant/file names
Use an “active” alias for the current version
Bump PATCH / MINOR / MAJOR according to behavior impact
Git workflow
Commit prompt changes with clear, conventional messages
Treat prompt updates as first-class code changes
Optionally tag deployed prompt versions
Placeholders and context
Use placeholders for dynamic context (template + variables)
Centralize interpolation in a small, safe utility
Pass only validated, intentional context into prompts
Clean architecture principles
Single responsibility for prompt-related code
Clear separation between prompt text, rendering, and LLM calls
Maintainability and traceability as primary design goals

# lesson-6
Optimize perceived latency
Prioritize fast time-to-first-token for chat UX.
Prefer streaming for interactive, user-waiting flows.
Use streaming as the default for chat
Enable token streaming on conversational endpoints.
Reserve non-streaming for small, non-interactive tasks.
Model responses as async streams
Treat LLM output as an async sequence, not a single value.
Consume with incremental processing rather than waiting for completion.
Think in deltas, not full messages
Understand each chunk as a partial update of the final answer.
Design logic to handle incomplete pieces cleanly.
Expose provider-agnostic token streams
Use a generic async text stream as your public interface.
Keep SDK-specific shapes contained in adapters.
Use async generators for streaming adapters
Implement streaming producers as async generators.
Emit each new text segment incrementally.
Enforce clean architecture boundaries
Separate provider SDK, adapter, service, and transport/UI layers.
Keep streaming mechanics out of controllers and UI-specific code.
Handle partial data and termination robustly
Expect empty or metadata-only chunks.
Detect and respect end-of-stream signals.
Buffer minimally and intentionally
Maintain a full-message buffer only when explicitly needed.
Avoid unnecessary in-memory accumulation of long outputs.
Name streaming concerns clearly
Use intent-revealing names for streams, tokens, and accumulators.

# lesson-7
Use SSE for one-way AI token streaming
Choose SSE (with EventSource) when the server only needs to push tokens to the client.
One SSE request per assistant reply
Open a single long‑lived SSE connection per AI response; do not poll or open multiple requests for one answer.
Thin @Sse controller, logic in services
Keep the SSE controller responsible only for transport; delegate provider/LLM logic to dedicated services.
Return Observable<MessageEvent> from @Sse
Always return a stream (Observable) of MessageEvents; let Nest handle subscription and HTTP writing.
Bridge AsyncIterable<string> → Observable in a service
Convert provider token streams to observables in a service layer, not in the controller.
One token → one MessageEvent
Treat each token or small chunk as a separate MessageEvent to enable smooth incremental rendering.
Simple MessageEvent shape
Prefer minimal payloads (data only) unless you truly need id, type, or retry.
Stable SSE framing
Ensure each event is framed as SSE (data: lines + blank line) so clients can reliably parse it.
React: EventSource per stream, not fetch
Use EventSource for SSE endpoints; avoid misusing fetch/XHR for server‑sent streams.
Append-only UI updates
Maintain an “in‑progress” assistant message and append incoming tokens to that single message.
Immutable React state updates
Always clone and replace state (messages array and message objects), never mutate in place.
Proper EventSource lifecycle management
Create the EventSource in useEffect, close it in cleanup, and handle onerror to avoid leaks and dangling streams.
Clear streaming flags in UI state
Track streaming status explicitly to prevent concurrent streams and to control input/UX correctly.
CORS and path consistency for SSE endpoint
Make sure the SSE route is correctly exposed to the frontend origin and not blocked by CORS or mismatched base paths.

# lesson-8
Core Concepts
 
Tool = JSON description of a backend function the model may request.
Model returns tool_calls instead of (or in addition to) plain text.
Three-turn loop: user → model (tool call) → backend (execute) → model (final answer).
Trust boundary between model-supplied data and your backend services.
Tool Design
 
Use clear, verb-based tool names.
Keep parameter schemas flat and simple.
Expose only tools you are comfortable being called automatically.
Separate tool specs (JSON) from tool implementations (code).
Handling Tool Calls
 
Always check for presence and length of tool_calls.
Route by tool name using a map/dictionary.
Reject unknown or unsupported tool names.
Keep handlers small: validate → call service → return result.
Validation & Security
 
Treat model arguments as untrusted input.
Always parse arguments safely and handle failures.
Enforce type checks for every parameter.
Enforce bounds and sanity checks (limits, non-empty, allowed ranges).
Never pass raw model arguments directly to DB, file system, or external APIs.
Second Model Call (Tool Results)
 
Send tool results back with matching tool_call_id.
Include the tool-call message plus tool-result messages in the follow-up call.
Return only needed, structured data to the model, not internal details.
Mindset
 
Model plans and requests; backend decides and executes.
Validation is mandatory, not optional.
Tools are a controlled interface between LLM and real system capabilities.

# lesson-9
Treat LLM tools as internal API endpoints with clear contracts.
Use verb-first, domain-specific names for tools (one clear responsibility).
Use precise, consistent parameter names that match domain concepts.
Write short, behavior-focused descriptions that state what the tool does and when to use it.
Define mini-schemas: explicit parameter types and required/optional flags only.
Prefer enums or constrained values over free-form strings when the set of options is small.
Make optional parameters defaulted server-side, not chosen by the model.
Always perform server-side validation of all tool inputs (types, ranges, existence, auth).
Keep validation, business logic, and idempotency as separate concerns.
Design read tools to be strictly side-effect free and naturally idempotent.
Design write tools to be idempotent under retry as a core requirement.
Use a stable idempotency key (e.g., tool_call_id) to detect duplicate executions.
Persist tool-call records (id, args, result) to safely handle retries.
Prefer upsert-like semantics when they naturally fit the domain.
Return stable, structured, minimal results that are easy for the model to reuse.

# lesson-10
Treat LLM output as untrusted data
Enforce a single JSON contract per use‑case
Model the contract with a strict Zod schema
Validate every LLM response at runtime with safeParse
Never use unvalidated LLM data in business logic
Fail closed on any validation error (discard whole response)
Do not “fix up” or partially trust invalid responses
Use clear domain errors for invalid AI responses
Validate before any side effects or tool invocations
Design explicit field semantics (required / optional / nullable)
Keep schemas small, minimal, and purpose‑specific
Centralize AI schemas and parsers in a dedicated module
Keep LLM calling code separate from validation logic
Use strong prompt language to demand JSON‑only output
Use JSON code fences to constrain and simplify parsing
Describe the schema in the prompt in clear natural language
Align prompt description and Zod schema as one contract
Log validation failures, but expose only safe errors to clients
Iterate on prompts when validation fails, not by weakening schemas

# lesson-11
 
Ownership & storage
 
Conversation memory must live server-side.
Database is source of truth; caches are optional and disposable.
Reload history per request; don’t rely on long-lived in-memory state.
 
Data modeling
 
Use a dedicated ChatTurn shape (role, content, tokenCount, createdAt).
Keep DB schema and LLM-facing shapes separated.
Normalize roles to a small, explicit set (user, assistant, system-summary).
 
Context window & budgets
 
Reason in tokens, not characters.
Distinguish hard model limit vs soft internal budget.
Reserve context space for system, tools, current user, and reply.
Centralize token budget configuration.
 
Truncation (sliding window)
 
Implement a single, pure truncate-to-budget function.
Always keep a tail suffix of history within budget.
Traverse from newest to oldest, accumulate until budget reached.
Preserve chronological order in the returned history.
Always keep at least the latest turn.
 
Summarize + tail (rolling summary)
 
Use summarization as occasional compaction, not every request.
Trigger on total stored history size, not just per-request size.
Maintain exactly one rolling summary plus last N raw turns.
Roll up previous summary + old raw head into a new summary.
Persist summary as a special role; drop summarized raw turns.
Enforce a structured, bounded-size summary.
 
Architecture & cleanliness
 
Separate controller, use-case service, memory service, and repository.
Keep truncation and summarization decoupled.
Avoid mutating inputs in memory logic; always return new arrays.
Use clear, intention-revealing names and centralized thresholds.

# lesson-12
Here’s a tight checklist for this lesson’s core ideas ⚡
 (Under 150 words, just concepts.)
 
Token + cost fundamentals
 
Think in tokens, not requests.
Cost = (prompt + completion tokens) × price per 1K.
Always estimate tokens/request × requests/month.
Round up for planning and budgets.
 
Model selection (capability–cost–latency)
 
Always weigh capability vs cost vs latency together.
Use small models for high-volume, low-stakes, simple tasks.
Use medium models as default for general assistants.
Use big models for low-volume, high-stakes, complex reasoning.
 
Latency mindset
 
Total latency = network + time-to-first-token + streaming.
Bigger models → more latency and cost.
Use streaming to improve perceived speed.
 
CostEstimator + architecture
 
Keep pricing in config, not controllers.
Use a dedicated CostEstimator to map tokens+model → dollars.
Log tokens, model, cost, latency per request for visibility.

# lesson-13
Treat prompts as testable artifacts, with small, focused evals per feature.
Model outputs are non-deterministic → avoid strict equality checks.
Use soft assertions (conditions on content/structure/tone) instead of exact strings.
Design eval cases as data ({ input, expected } plus a scoring strategy).
Keep eval sets small, targeted, and feature-specific (few cases, one behavior).
Score with numbers, not booleans (0–1 scale, e.g., fraction of checks that pass).
Define one clear scoreFn per feature, pure and deterministic.
Aggregate scores across cases (mean/median) and compare to a pass threshold.
Run evals via a single command and make them fully automated, no manual steps.
Version evals with code, keeping them next to the feature they guard.
Use evals to detect regressions whenever prompts, models, or parameters change.
Keep responsibilities separate: eval case definitions, runner, reporter, scoring.
Prefer readability over cleverness in eval and scoring logic
# lesson-14
Treat the LLM as untrusted; enforce safety in backend code, not just prompts.
Keep a strict system (red) vs user (green) channel separation; user text is data, not rules.
Never let user input modify system prompts, tool lists, or policies.
Make system instructions clearly state that backend authorization and policies override model and user.
Treat all LLM outputs as unknown at the boundary.
Define explicit schemas for every response and tool-call shape.
Always run a central LLM → schema.parse → handler pipeline.
Fail closed: if validation fails, do nothing risky and return an error.
Use a tool name whitelist; deny any tool not explicitly allowed.
Validate tool arguments with per-tool schemas (types, ranges, lengths, formats).
Always prefer backend-derived context (userId, roles) over model-supplied identifiers.
Route all tool calls through a single, testable tool router layer.
Apply per-user and IP rate limiting before LLM calls.
Use a token-bucket style limit (burst capacity + refill rate).
Implement rate limits as guards/middleware, returning proper errors (e.g., 429).

