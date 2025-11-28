# Repository Guidelines

## AI Assistant Compliance
- Always read `.clinerules/base_rules.md` before making or reviewing code changes; treat every rule in it as mandatory.
- Do not propose or accept code that violates those rules (readability first, 120-char lines, function/parameter limits, numeric comments only inside functions using the 1/2/3 pattern).
- Prefer refactors that bring code into compliance over adding exceptions; favor descriptive names over explanatory comments.
- Call out and block requests that would break `.clinerules/base_rules.md` until the approach is corrected.

## Project Structure & Module Organization
- `src/main.tsx` boots the React + Vite app; routing lives in `src/config/router.tsx`.
- Pages under `src/pages/` (Home, EpubReader, Settings, ContextMenuSettingsPage, ToolEditPage, ToolExtractPage) own route-level UI and state wiring.
- Shared UI sits in `src/components/`; assets live in `src/assets/`; persistent config/storage helpers are in `src/services/` (OPFS manager, context-menu settings) and `src/utils/`.
- Global state uses Redux Toolkit in `src/store/`; types are centralized in `src/types/`; constants/default context-menu entries are in `src/constants/` and `src/config/`.
- `public/` serves static files; `dist/` is generated output; `docs/` and `DESIGN.md` hold product notes; `deploy.sh` runs the production build.

## Build, Test, and Development Commands
- Install deps with `pnpm install` (pnpm is preferred; lockfile present).
- `pnpm dev`: start the Vite dev server with HMR.
- `pnpm build`: type-check via `tsc -b` then produce production assets with Vite into `dist/`.
- `pnpm preview`: serve the built `dist/` bundle locally.
- `pnpm lint` / `pnpm lint:fix`: run ESLint across the repo, with an optional autofix for `src/**/*.ts*`.

## Coding Style & Naming Conventions
- Primary style source: follow `.clinerules/base_rules.md` (readability first, 120-char lines, low complexity) alongside repo ESLint/Prettier config.
- TypeScript + React 18; prefer function components and hooks. Enable strict equality (`eqeqeq`), arrow callbacks, `object-shorthand`, and avoid `var` as enforced by ESLint (`eslint.config.js`).
- Use 2-space indentation (Prettier defaults). Tailwind class ordering is handled via `prettier-plugin-tailwindcss`; keep class lists compact and semantic.
- Component/page files use PascalCase; utilities are camelCase; constants uppercase. Prefix intentionally unused args/vars with `_` to satisfy the `no-unused-vars` rule.

## Testing Guidelines
- No automated test suite is present yet; default to `pnpm lint` plus manual smoke tests (upload EPUB, open reader, context menu tools, AI tool editing).
- When adding tests, co-locate `*.test.tsx` alongside components and cover Redux slices and critical hooks. Aim for fast unit coverage before adding integration/UI cases.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit style: `feat(scope): message`, `docs: ...`, etc. Keep scopes small and descriptive (e.g., `feat(contextmenu): add tool editor`).
- PRs should include: a short summary of the change, linked issue/reference, manual test notes, and screenshots or a quick clip for UI-facing updates.
- Ensure `pnpm lint` and, when applicable, `pnpm build` pass before requesting review. Favor small, focused PRs over large mixed changes.

## Security & Configuration Tips
- API endpoints/keys for AI tools are user-provided via the Context Menu Settings page and stored in-browser; never commit real keys. Use placeholder values in docs and tests.
- Prefer HTTPS endpoints, and trim logs before sharing if they contain request URLs or token usage details.
