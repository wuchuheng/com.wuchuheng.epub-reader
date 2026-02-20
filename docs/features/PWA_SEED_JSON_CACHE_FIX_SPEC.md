# PWA Caching and Seed Manifest Robustness Specification

## 1. Overview

This document outlines an improved fetching and caching strategy for the `seed.json` manifest file to enhance robustness and provide a better offline experience.

The core goal is to implement a **Network-First, then Cache** strategy. The application will always try to get the latest `seed.json` from the server, but if the user is offline or the server is unavailable, it will fall back to a cached version. If both methods fail, the app will load gracefully without preset books.

This fixes two issues:

1.  **PWA Caching Was Too Aggressive:** The previous configuration precached `seed.json`, preventing updates.
2.  **Fetching Was Not Offline-Ready:** The fetch logic didn't account for network failures.

## 2. Technical Solution

### 2.1. PWA Cache Configuration (`vite.config.ts`)

We will configure Workbox to handle `seed.json` as a special case. It will be excluded from precaching and instead managed by a runtime caching rule.

1.  **Exclude from Precaching:** We ensure `seed.json` is not bundled with the initial service worker install.
2.  **Implement `NetworkFirst` Runtime Caching:** We instruct the service worker to try the network first for `seed.json`. If the network request fails, it will serve the file from a dedicated cache.

**File:** `vite.config.ts`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Exclude seed.json from precaching
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vue,txt,woff2}'],
        // --- Existing rules ---
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            // ... (existing font caching)
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            // ... (existing font caching)
          },
          // --- NEW RULE FOR seed.json ---
          {
            // Match the seed.json file specifically
            urlPattern: /seed\.json$/,
            // Use NetworkFirst strategy
            handler: 'NetworkFirst',
            options: {
              // Use a dedicated cache for the manifest
              cacheName: 'seed-manifest-cache',
              // Keep only one version of the file
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              // Fail the network request after 3 seconds, then try cache
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /\.(?:epub|pdf)$/i,
            // ... (existing book caching)
          },
        ],
      },
      // ... (rest of the manifest config)
    }),
  ],
  // ... (rest of the vite config)
});

```

### 2.2. Graceful Fetch Handling (`bookshelfSlice.ts`)

The `fetch` call for `seed.json` will remain a standard request, allowing the service worker to intercept it. We will update the logic to handle cases where both the network and cache fail, preventing the app from crashing.

**File:** `src/store/slices/bookshelfSlice.ts`

```typescript
// src/store/slices/bookshelfSlice.ts

export const loadBookshelf = createAsyncThunk('bookshelf/loadBookshelf', async (_, { rejectWithValue }) => {
  try {
    if (!OPFSManager.isSupported()) {
      // ...
    }
    await OPFSManager.initialize();

    const [localBooks, seedResponse] = await Promise.all([
      OPFSManager.getAllBooks(),
      fetch('/seed.json'), // Standard fetch is intercepted by Service Worker
    ]);

    let seedData = {}; // Default to an empty object

    if (seedResponse.ok) {
      seedData = await seedResponse.json();
    } else {
      // This block runs if network fails AND there's no cache.
      // It's a graceful failure, not an error.
      console.warn('Could not fetch seed.json from network or cache. Proceeding with local books only.');
    }

    // Reconcile and Merge logic will run safely with empty seedData
    const localHashes = new Set(localBooks.map((book) => book.hash).filter(Boolean));
    const placeholders: BookMetadata[] = [];

    for (const hash in seedData) {
      if (!localHashes.has(hash)) {
        const seedEntry = seedData[hash];
        placeholders.push({
          id: `placeholder-${hash}`,
          hash,
          name: seedEntry.title,
          fileName: seedEntry.fileName,
          remoteUrl: seedEntry.url,
          status: 'not-downloaded',
          isPreset: true,
          path: '',
          coverPath: '',
          createdAt: Date.now(),
        });
      }
    }
    
    return [...localBooks, ...placeholders];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error during bookshelf load');
  }
});
```

## 3. Testing Strategy

1.  **Online Test:**
    *   Clear browser cache.
    *   Load the app.
    *   **Expected:** A request for `seed.json` succeeds (200 OK). In the Application tab, `seed-manifest-cache` is created and contains `seed.json`. Preset books are shown.
2.  **Offline Test:**
    *   Load the app once while online.
    *   Go offline using browser dev tools.
    *   Reload the page.
    *   **Expected:** The network request for `seed.json` fails, but the file is served from the service worker. Preset books are still shown.
3.  **First-Time Offline Test (Graceful Failure):**
    *   Clear all browser data (cache, service workers).
    *   Go offline.
    *   Load the app.
    *   **Expected:** The app loads without crashing. A warning "Could not fetch seed.json..." appears in the console. No preset books are shown.
4.  **Manifest Update Test:**
    *   Go online.
    *   Modify `public/seed.json` on the server and deploy.
    *   Reload the app.
    *   **Expected:** The new `seed.json` is fetched from the network, the `seed-manifest-cache` is updated, and the list of preset books reflects the changes.
