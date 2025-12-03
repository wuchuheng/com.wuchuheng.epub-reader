# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [index.html](file://index.html)
- [src/main.tsx](file://src/main.tsx)
- [vite.config.ts](file://vite.config.ts)
- [tsconfig.json](file://tsconfig.json)
- [tsconfig.app.json](file://tsconfig.app.json)
- [tsconfig.node.json](file://tsconfig.node.json)
- [eslint.config.js](file://eslint.config.js)
- [tailwind.config.js](file://tailwind.config.js)
- [src/config/router.tsx](file://src/config/router.tsx)
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/store/index.ts](file://src/store/index.ts)
- [src/services/OPFSManager.ts](file://src/services/OPFSManager.ts)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Quick Start Example](#quick-start-example)
6. [Expected Directory Structure](#expected-directory-structure)
7. [Configuration Notes](#configuration-notes)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Development Workflow Tips](#development-workflow-tips)
10. [Conclusion](#conclusion)

## Introduction
This guide helps you set up the development environment and run the EPUB Reader application locally. It covers installing prerequisites, installing dependencies, starting the development server, building for production, and previewing the build. It also explains why pnpm is preferred over npm, how to keep TypeScript strict mode enabled, and how to troubleshoot common issues. Finally, it includes a quick start example for uploading an EPUB file and accessing the reader interface.

## Prerequisites
- Node.js 18 or newer. The project targets modern JavaScript environments and relies on features available in Node 18+.
- pnpm (preferred). The repository includes a lockfile indicating pnpm is the intended package manager. Using npm instead of pnpm can lead to dependency mismatches due to differences in lockfile semantics.

Why pnpm is preferred:
- The repository ships with a lockfile that aligns with pnpm’s deterministic resolution model. Using npm may resolve packages differently, potentially causing runtime or build inconsistencies.

**Section sources**
- [package.json](file://package.json#L1-L61)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)

## Installation
Follow these steps to prepare your local environment:

1. Install Node.js 18+.
   - Verify installation: node --version
2. Install pnpm globally (if not installed).
   - Verify installation: pnpm --version
3. Install dependencies.
   - Run: pnpm install
   - This installs both runtime and development dependencies defined in the project.

Notes:
- The scripts section defines the standard commands for development, building, and previewing.
- The lockfile confirms pnpm usage.

**Section sources**
- [package.json](file://package.json#L1-L61)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)

## Running the Application
Use the following commands to manage the development lifecycle:

- Start the development server:
  - Command: pnpm dev
  - Behavior: Launches the Vite dev server with hot module replacement and React Fast Refresh.

- Build for production:
  - Command: pnpm build
  - Behavior: Compiles TypeScript and bundles assets using Vite. The build artifacts are emitted to the default output directory.

- Preview the production build:
  - Command: pnpm preview
  - Behavior: Serves the built assets locally to preview how the app behaves after bundling.

- Linting (optional):
  - Command: pnpm lint
  - Command: pnpm lint:fix
  - Behavior: Runs ESLint on TypeScript files with configured rules.

**Section sources**
- [package.json](file://package.json#L1-L61)
- [vite.config.ts](file://vite.config.ts#L1-L24)

## Quick Start Example
Follow these steps to upload an EPUB file and access the reader interface:

1. Start the development server:
   - Command: pnpm dev
2. Open the app in your browser (Vite serves it on a local port).
3. On the home page, drag and drop an EPUB file onto the page or click the upload button.
4. After successful upload, the app navigates to the reader route for that book.
5. Use the reader controls to browse chapters and interact with the EPUB content.

How it works:
- The home page handles drag-and-drop and file selection, validates EPUB files, and triggers upload actions.
- Uploading saves the EPUB to the browser’s origin-private file system and updates the configuration.
- The router navigates to the reader route for the newly uploaded book.

**Section sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx#L1-L292)
- [src/config/router.tsx](file://src/config/router.tsx#L1-L58)
- [src/services/OPFSManager.ts](file://src/services/OPFSManager.ts#L1-L510)

## Expected Directory Structure
After installation, the project follows a typical Vite + React + TypeScript structure. The most important files and directories for getting started are:

- Root-level configuration and scripts:
  - package.json: Scripts for dev, build, preview, and linting; dependencies and devDependencies.
  - vite.config.ts: Vite configuration with React plugin and path aliases.
  - tsconfig.json, tsconfig.app.json, tsconfig.node.json: TypeScript project references and compiler options.
  - eslint.config.js: ESLint configuration for TypeScript and React.
  - tailwind.config.js: Tailwind CSS configuration scanning HTML and TSX files.
  - index.html: Minimal HTML shell with a root element and module script pointing to main.tsx.

- Source code:
  - src/main.tsx: Entry point mounting the React app with Redux Provider and RouterProvider.
  - src/config/router.tsx: Routes for the home page, reader, and settings.
  - src/pages/HomePage/index.tsx: Home page with drag-and-drop upload and book list.
  - src/store/index.ts: Redux store setup.
  - src/services/OPFSManager.ts: File system operations for EPUB storage and metadata.

**Section sources**
- [package.json](file://package.json#L1-L61)
- [vite.config.ts](file://vite.config.ts#L1-L24)
- [tsconfig.json](file://tsconfig.json#L1-L8)
- [tsconfig.app.json](file://tsconfig.app.json#L1-L38)
- [tsconfig.node.json](file://tsconfig.node.json#L1-L30)
- [eslint.config.js](file://eslint.config.js#L1-L39)
- [tailwind.config.js](file://tailwind.config.js#L1-L9)
- [index.html](file://index.html#L1-L16)
- [src/main.tsx](file://src/main.tsx#L1-L13)
- [src/config/router.tsx](file://src/config/router.tsx#L1-L58)
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx#L1-L292)
- [src/store/index.ts](file://src/store/index.ts#L1-L24)
- [src/services/OPFSManager.ts](file://src/services/OPFSManager.ts#L1-L510)

## Configuration Notes
Maintain strict TypeScript mode:
- Strict mode is enabled in both app and node TypeScript configurations. This ensures robust type checking and reduces runtime errors.
- Keep strict mode enabled when adding new files or changing compiler options.

Path aliases:
- The Vite configuration sets an alias for @ pointing to src/, enabling shorter import paths across the codebase.

Tailwind CSS:
- Tailwind scans index.html and all TSX/JSX/TS files under src/ for class usage. Ensure your new files are included in the scan pattern if you add new UI components.

ESLint:
- The ESLint configuration enforces modern JavaScript/TypeScript practices and React-specific rules. Run linting regularly to keep code quality consistent.

**Section sources**
- [tsconfig.app.json](file://tsconfig.app.json#L1-L38)
- [tsconfig.node.json](file://tsconfig.node.json#L1-L30)
- [vite.config.ts](file://vite.config.ts#L1-L24)
- [tailwind.config.js](file://tailwind.config.js#L1-L9)
- [eslint.config.js](file://eslint.config.js#L1-L39)

## Troubleshooting Guide
Common issues and resolutions:

- Port conflicts:
  - Symptom: The dev server fails to start because the default port is in use.
  - Resolution: Configure a different port in the Vite configuration or stop the conflicting service. Then restart the dev server.

- Missing dependencies after switching package managers:
  - Symptom: Runtime errors or build failures after switching from pnpm to npm.
  - Resolution: Reinstall dependencies using pnpm to align with the lockfile. The repository includes a lockfile indicating pnpm usage.

- Build errors:
  - Symptom: TypeScript compilation errors or Vite build failures.
  - Resolution: Fix type errors reported by the TypeScript compiler. Ensure strict mode remains enabled and that all new files conform to the project’s type system.

- Browser compatibility for file system features:
  - Symptom: OPFS-related features fail or show unsupported warnings.
  - Resolution: Use a compatible browser (Chrome 86+, Edge 86+, or Firefox 102+). The home page displays a compatibility notice when OPFS is not supported.

- Unexpected behavior after clearing data:
  - Symptom: Books disappear or configuration resets unexpectedly.
  - Resolution: The OPFS manager supports resetting all data. Use the reset functionality if you need to clear stored books and configuration.

**Section sources**
- [vite.config.ts](file://vite.config.ts#L1-L24)
- [package.json](file://package.json#L1-L61)
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx#L1-L292)
- [src/services/OPFSManager.ts](file://src/services/OPFSManager.ts#L1-L510)

## Development Workflow Tips
- Prefer pnpm:
  - The repository includes a lockfile and scripts tailored for pnpm. Using npm can cause dependency drift and subtle runtime differences.

- Keep TypeScript strict:
  - Strict mode catches many potential bugs early. Avoid disabling strict mode unless absolutely necessary.

- Use the provided scripts:
  - Use pnpm dev for local development, pnpm build for production builds, and pnpm preview to test the built app locally.

- Leverage ESLint:
  - Run pnpm lint and pnpm lint:fix to keep code clean and consistent with project standards.

- Understand the entry and routing:
  - The app mounts at index.html with a root element and loads src/main.tsx. Routing is handled by the router configuration, which includes routes for the home page, reader, and settings.

**Section sources**
- [package.json](file://package.json#L1-L61)
- [index.html](file://index.html#L1-L16)
- [src/main.tsx](file://src/main.tsx#L1-L13)
- [src/config/router.tsx](file://src/config/router.tsx#L1-L58)
- [eslint.config.js](file://eslint.config.js#L1-L39)

## Conclusion
You now have the essentials to install prerequisites, install dependencies, run the development server, build for production, and preview the app. By keeping pnpm and strict TypeScript mode, you reduce the risk of environment-related issues. The quick start example demonstrates uploading an EPUB and accessing the reader interface. Use the troubleshooting guide to resolve common problems, and follow the workflow tips to maintain a smooth development experience.