# Frontend — React Chat UI

React 18 + Vite + TypeScript (strict). Talks to the backend API; auth token stored client-side and sent on every request.

## Commands

Run from `frontend/`:

- `npm run dev` — Vite dev server on port 5173.
- `npm run build` — `tsc --noEmit && vite build`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint over `.ts`/`.tsx`.

## Structure

Feature-first under `src/`:

- `app/` — bootstrap (`main.tsx`) and routing (`App.tsx`).
- `pages/<Page>/` — a page owns its slice:
  - `components/` — UI for that page, nested by feature area.
  - `domain/<entity>/` — business logic per entity (`conversation`, `message`, `user`): `api/`, `hooks/`, `state/`, `types/`.
  - `view/` — the page-level component.
- `shared/` — cross-cutting: `api/` (`httpClient.ts`, `ApiError.ts`), `auth/` (context, provider, token storage), `ui/` (Avatar, IconButton, Spinner, icons), `theme/` (`tokens.css`, `global.css`), `routing/`, `hooks/`, `utils/`.

A non-trivial component splits into `view/` (markup) + `hooks/` (logic). Lightweight components live as a single file in their folder.

## Naming

- **Components**: PascalCase `*.tsx`, exported as a named function returning `ReactElement`.
- **Hooks**: `useXxx.ts`, return a typed interface. Context-backed hooks throw if used outside their provider.
- **API modules**: camelCase `*.ts` under `domain/*/api/`; the exported function name is the action (`getMessages`, `sendMessage`, `login`).
- **Types**: lowercase file (`conversation.ts`), PascalCase exported types.
- **Styles**: CSS Modules, `ComponentName.module.css` colocated with the component.

## Conventions

- All network calls go through `shared/api/httpClient.ts` (`request<T>()`), which attaches the bearer token and throws `ApiError` on non-2xx. Don't call `fetch` directly elsewhere.
- State: React Context + custom hooks; non-trivial state uses `useReducer` (e.g. `messagesReducer.ts`). No Redux/Zustand.
- Optimistic sends with rollback on failure; handle loading / empty / error states explicitly.
- Import alias `@/` → `src/`.
- No `any`; explicit return types. `@typescript-eslint/no-explicit-any` is an error; `explicit-function-return-type` is a warning.

## Tooling note

Frontend stays on ESLint 8 (`.eslintrc.cjs`) with the `react-hooks` / `react-refresh` plugins — left as-is intentionally. The backend uses ESLint 9 flat config. Prettier rules (`.prettierrc`) are identical across both packages: single quotes, trailing commas, width 100, 2-space tabs.
