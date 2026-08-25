# AI WorkMate

A no-login AI productivity app that opens straight to the dashboard. Three tools: Research Assistant, Email Generator, Meeting Summarizer. Design follows the "Cool Slate Minimal" direction (indigo accent on cool slate, Space Grotesk headings + Inter body, soft card grid). Saved items live in the browser only.

## Pages

- **Dashboard** (`/`) — hero intro, three feature cards with "Open tool" buttons, quick-action row, and a recent-activity panel fed by locally saved items.
- **Research Assistant** (`/research`) — topic/question input, generates Summary, Key Findings, Important Points, Insights, Recommendations, Suggested Research Questions. Buttons: Copy, Save, Clear, New Research.
- **Email Generator** (`/email`) — purpose + details input, tone chips (Formal, Friendly, Persuasive, Professional, Apologetic). Output: AI subject line + editable email body. Buttons: Copy, Regenerate, Clear.
- **Meeting Summarizer** (`/meetings`) — paste notes, generates Summary, Key Discussion Points, Decisions, Action Items (with owners), Deadlines. Buttons: Copy, Save, Clear, Summarize Again.
- **Settings** (`/settings`) — default email tone, default research depth, output length preference, clear-all-saved-data, light/dark toggle. All stored locally.

No login, signup, account, payment, or subscription anywhere.

## Shared UI

- Persistent left sidebar (Dashboard, Research Assistant, Email Generator, Meeting Summarizer, Settings) that collapses to a top drawer on mobile.
- Top header bar with page context.
- Each tool uses an input panel + structured result panel layout.
- Skeleton/shimmer loading state while generating, toast notifications for copy/save/errors, subtle reveal animation on results.
- Fully responsive down to mobile.

## Technical notes

- TanStack Start file routes under `src/routes/`; root layout holds the sidebar and `<Outlet />`.
- AI calls go through Lovable AI Gateway from `createServerFn` handlers (one per tool) in `src/lib/ai.functions.ts`, each prompting for strict JSON so the UI can render labeled sections rather than raw text. Server helpers in a `*.server.ts` module.
- Generation state via TanStack Query mutations; sonner for toasts (Toaster mounted once in `__root.tsx`).
- Saved research/summaries persist in `localStorage` behind a small `useSavedItems` hook; a Saved view lists and deletes them.
- Design tokens from the chosen direction go into `src/styles.css` (`--brand #4F46E5`, `--brand-soft #EEF2FF`, ink/muted/line/surface); fonts loaded via `<link>` in the root route head.
- Per-route `head()` metadata with unique titles and descriptions.
