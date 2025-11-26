# Immersive Reader (EPUB Reader) - Project Context

## 📋 Project Overview
**Immersive Reader** is a React-based EPUB reader application focused on enhancing the reading experience through Context-based AI integration. It allows users to read EPUB books offline, manages them via the Origin Private File System (OPFS), and provides instant AI-powered explanations, translations, and answers to contextual questions.

**Current Status:** Phase 3 AI Integration (90% Complete)
**Version:** 0.0.9

## 🛠 Technology Stack
- **Frontend:** React 18, TypeScript (Strict), Vite
- **State Management:** Redux Toolkit, React Context
- **Styling:** TailwindCSS, CSS Modules, Less
- **Core Libraries:**
  - `epubjs`: Rendering and navigation of EPUB files.
  - `openai`: AI integration.
  - `react-router-dom`: Routing (v6).
  - `react-markdown`: Rendering AI responses.
  - `@dnd-kit`: Drag-and-drop functionality.
- **Storage:** OPFS (Origin Private File System) for book storage, LocalStorage for settings.

## 🏗 Architecture & Design
The project follows a clean, feature-based modular architecture.
- **`src/pages/`**: Top-level page components (`EpubReader`, `HomePage`, `SettingsPage`).
- **`src/components/`**: Reusable UI components.
  - **`EpubReader/components/`**: Specific components for the reader view (e.g., `TOCSidebar`, `ContextMenu`, `AIAgent`).
- **`src/store/`**: Redux store slices (`bookshelfSlice`, `counterSlice`).
- **`src/services/`**: Business logic and external integrations (`OPFSManager`, `EPUBMetadataService`, `selection.service`).
- **`src/hooks/`**: Custom React hooks for encapsulating logic (`useEpubReader`, `useBookDisplayData`).

**Key Patterns:**
- **Service Layer:** Logic for heavy operations (like file handling and text selection) is delegated to services to keep components clean.
- **Three-Phase Processing:** Complex functions often follow an Input -> Processing -> Output pattern.
- **Strict Typing:** 100% TypeScript coverage is a strict requirement.

## 🚀 Development Workflow

### Prerequisites
- Node.js 18+
- pnpm (preferred)

### Key Commands
- **Start Development Server:**
  ```bash
  pnpm dev
  ```
  (Runs on `http://localhost:5173`)

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

- **Linting:**
  ```bash
  npm run lint
  ```

### Testing
*Note: While the design document mentions testing strategies (Jest/Playwright), explicit test scripts are currently missing from `package.json`. Future development should prioritize adding these.*

## 📂 Directory Structure Highlights
- **`src/pages/EpubReader/`**: The core reading interface. Contains complex logic for text selection, highlighting, and context menus.
- **`src/pages/ContextMenuSettingsPage/`**: Configuration for the AI tools and context menu.
- **`src/services/OPFSManager.ts`**: Critical service for handling file storage operations in the browser.
- **`.clinerules/`**: Contains project-specific coding rules and guidelines.
- **`DESIGN.md`**: Comprehensive design document detailing architecture, features, and future roadmap.

## 💡 Coding Conventions
- **Style:** Functional components with Hooks.
- **Naming:** PascalCase for components, camelCase for functions/variables.
- **State:** Redux for global state (bookshelf, settings), local state for UI interactions.
- **Comments:** Use JSDoc for public APIs and services. Comments should explain *why*, not *what*.
- **Safety:** Always check for `null`/`undefined` when dealing with DOM elements or external data.

## 📝 Notes for AI Agents
- When modifying the **Reader**, be extremely careful with event listeners (selection, interactions) to avoid memory leaks or conflicting behaviors.
- The **AI Integration** relies on capturing specific text contexts. Ensure `selection.service.ts` logic is preserved when refactoring.
- **OPFS** operations are asynchronous and can fail. Always implement proper error handling for file operations.
