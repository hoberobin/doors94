## doors94 UX & Product Review Notes

### Desktop & Window UX

- **Discoverability of key features**
  - The bottom-right desktop cluster (`Read Me`, `Agent Creator`, `Playground`, `Control Panel`) is clear once noticed, but on smaller screens it can feel visually distant from the main focus area.
  - Consider opening at least one helpful window by default on first load (e.g., `Read Me` or a small \"Welcome\" window) so new users immediately see what to do.
  - The new landing page now explains the core loop before users enter the desktop, which helps set expectations.

- **Window behavior**
  - Windows are constrained to the viewport on move/resize, and default sizes differ per app, which feels polished.
  - Saved window state can restore a cluttered or confusing layout on subsequent visits; a future enhancement could be a \"Reset layout\" option that clears saved window state.

### Onboarding & Learnability

- **ReadMe content**
  - The `ReadMeWindow` is rich and mostly aligned with the project `README.md`, but it is hidden behind a desktop icon.
  - The landing page now mirrors the Overview/Features sections so users understand doors94 before entering the OS.
  - Future improvement: reference the Tutorial agent explicitly on the landing page or add a small \"Next steps\" hint after launching.

- **First-run guidance**
  - The Quick Start workflow in `ReadMeWindow` is strong; consider surfacing a condensed version in a smaller, always-visible window the first time the desktop loads.
  - A subtle inline tip near the desktop (e.g., \"Double-click icons to open windows\") could help non-technical users.

### Agent Workflow & Validation

- **Agent Creator**
  - Wizard steps are well-structured with inline help, character counters, and real-time validation.
  - The \"Load Example\" button is great for demonstrating a high-quality manifest; consider hint text near it (\"Good starting point if you're new to prompts\").
  - Improvement idea: surface a small, inline \"What makes a good rule?\" example under the Rules step, reusing content from `ReadMeWindow`.

- **Control Panel**
  - Inline editing with live compiled-prompt preview is powerful and clearly reflects validation issues.
  - Edit vs view modes are explicit; success and delete confirmation dialogs follow the Win95 aesthetic nicely.
  - Improvement idea: add a one-line helper above the agent list explaining built-in vs user agents and how to use Duplicate to iterate.

- **Playground**
  - The split view and copy (“Left: Raw GPT / Right: Agent”) make the comparison mental model very clear.
  - Keyboard shortcut (Cmd/Ctrl+Enter) is excellent; consider a small static tip just under the textarea showing the shortcut.
  - Improvement idea: optionally show a tiny summary of the active agent’s purpose in the right header to keep context visible.

### Technical / Architecture Notes

- **Agent manifest & storage**
  - `agentManifest.ts` and `agentStorage.ts` enforce good constraints and robust validation with clear error messages.
  - LocalStorage usage is guarded against `window` being undefined and handles quota errors with explanatory messages.
  - Future improvement: expose some of these validation messages in a user-facing log panel or status area when things go wrong silently.

- **Conversations & API**
  - Conversation storage is scoped per-agent with trimming logic, which is a good balance between history and storage limits.
  - `/api/chat` validates inputs and manifest, differentiates `raw` vs `agent` modes, and checks prompt length; error responses are explicit and user-friendly.
  - Future improvement: consider streaming responses for a more dynamic Win95-style \"typing\" feel, if you want a richer UX later.


