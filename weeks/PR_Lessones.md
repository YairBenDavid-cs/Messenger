Core Principle
Do not just make the code work.
Make it clear, safe, maintainable, and hard to misuse.
General
1. Make Intent Obvious
Code should explain itself through clear names and structure.
Avoid vague names like data, text, helper, utils, filter.
Prefer names that describe the domain and purpose.
2. Prefer Simple Code
Every abstraction must earn its place.
Do not create helpers, hooks, types, wrappers, reducers, or components unless they improve
clarity, safety, or reduce real duplication.
If inlining is clearer, inline it.
3. Keep One Source of Truth
Do not duplicate the same concept in multiple places.
This applies to state, types, constants, validation, errors, and API contracts.
4. Make Ownership Clear
For every piece of data, ask:
Who owns it?
Who creates it?
Who updates it?
Who controls its lifecycle?
5. Separate Responsibilities
Each part of the code should have one clear job.
Avoid mixing rendering, state, API logic, validation, business rules, and data access in the same
place.
6. Organize for Growth
Prefer feature/use-case based structure when the project grows.
The structure should still make sense when more endpoints, flows, or features are added.
7. Design for Change
Avoid solutions that only work because the project is currently small.
Do not overengineer, but avoid obvious future migrations.
8. Make Side Effects Obvious
A reader should know when code calls an API, changes state, writes data, triggers events, or
performs I/O.
9. Keep Code Small and Focused
Split code when it becomes hard to understand, test, or review.
10. Remove Redundant Code
Remove unused imports, dead code, obsolete comments, duplicate types, unnecessary
wrappers, and unused assets.
12. Automate Standards
Use tools like ESLint, Prettier, TypeScript strict mode, and static analysis.
Humans should review architecture and logic, not formatting.
13. Treat PRs as Engineering Artifacts
A PR should explain what changed, why it changed, where to review, and what risks exist.
14. Keep Commits Focused and Clear
Each commit should represent one logical change.
Use:
<file/topic>: <verb> <description>.
Examples:
chat: add optimistic message sending.
auth: add request validation.
test utils: add mock conversation factory.
Frontend
15. Keep State Predictable
One concept should have one owner.
Use reducers only when justified by real complexity.
Use useState for simple state.
16. Handle Async Carefully
Watch for stale state, race conditions, duplicate requests, out-of-order responses, and unstable
references.
Capture important values before async operations begin.
17. Treat Failure as Part of the Feature
Handle success, failure, retry, partial updates, and failed optimistic updates.
18. Preserve User Input
Users should not lose work because something failed.
Keep drafts, restore editable state, show an error, and allow retry.
19. Complete User Flows
Every edit or form flow should define save, cancel, empty input, validation failure, Enter,
Escape, blur, and failed save behavior.
20. Keep Keyboard and Mouse Behavior Consistent
Keyboard shortcuts and buttons should trigger the same logic.
21. Optimize User Experience
Watch for flickering, confusing loading states, inconsistent empty states, unclear errors, and
clearing input too early.
22. Handle Optimistic Updates Fully
Optimistic UI needs temporary state, success replacement, failure rollback, retry option, and
stale-state protection.
23. Build Accessibility In
Consider keyboard navigation, focus management, ARIA attributes, alert roles, screen-reader
behavior, and IME-safe input handling.
Backend
24. Keep Backend Layers Clear
Routes map URLs.
Controllers handle HTTP concerns.
Services hold business logic.
Repositories handle data access.
Orchestrators coordinate cross-domain flows.
Do not bypass layers.
25. Keep Services Inside Their Domain
A service should own its own aggregate/repository.
If it needs another domain, go through that domain’s service or an orchestrator.
26. Keep Controllers Thin
Controllers should parse requests, call application logic, and return responses.
Business decisions, environment checks, and domain rules belong below them.
27. Put Business Logic in the Right Place
Domain rules, validation, normalization, defaults, and decisions belong in services or dedicated
domain components.
Orchestrators should coordinate, not decide.
28. Filter Data at the Correct Layer
If data is user-specific or permission-based, filter it on the server.
The client should only receive the data it actually needs.
29. Avoid Hidden Performance Costs
Watch for repeated lookups, N+1 queries, re-fetching already loaded entities, duplicated
requests, and expensive recalculations.
Prefer batching and reusing existing data.
TypeScript / API Safety
30. Do Not Trust External Data
TypeScript does not validate runtime data.
Handle missing fields, malformed data, empty responses, and unexpected API behavior.
31. Centralize Validation and Errors
Validation and error handling should be consistent.
Prefer shared schemas, shared error types, global error handling, and schema-derived types.
32. Use TypeScript Properly
Avoid unnecessary casts, duplicated types, weak aliases, and suppressed type errors.
Prefer strong domain models, shared types, narrowing, type guards, and schema parsing.
33. NO documentation
No documentation of functions and files. if u need to document it it means that your code isnt
clear enough.
Testing
34. Test Real Behavior
Tests should focus on user behavior and outcomes.
Cover happy paths, failure paths, validation, rollback behavior, state transitions, keyboard flows,
and accessibility behavior.
35. Fail Loudly in Tests
Missing mocks, broken setup, or unexpected behavior should fail clearly.
Do not allow tests to pass accidentally.
Personal Pre-PR Checklist
Before opening a PR:
Is the architecture clearly separated?
Is every abstraction justified?
Is there one source of truth?
Is ownership clear?
Is state predictable?
Are async actions protected from stale state?
Does failure preserve user input?
Are edit and form flows complete?
Do keyboard and mouse actions behave the same?
Are API responses handled safely?
Are validation and errors centralized?
Is filtering done at the correct layer?
Are side effects obvious?
Is the code easy to read?
Has redundant code been removed?
Are loading, error, and empty states handled?
Are tests covering failure paths?
Is accessibility handled?
Is documentation up to date?
Are commits focused and clearly named?
Would another engineer understand this quickly?
Final Reminder
The goal is not just working code.
The goal is code that is clear, safe, testable, accessible, and ready to evolve.