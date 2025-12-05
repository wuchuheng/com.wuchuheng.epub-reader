# PWA Automatic Update Specification

## Objective
Enable the Progressive Web App (PWA) to automatically detect and apply updates from the remote server without requiring manual user intervention (e.g., confirmation dialogs). This ensures the user is always running the latest version of the application, even during long-running sessions.

## Current State Analysis
- **Configuration**: `vite.config.ts` is currently set to `registerType: 'autoUpdate'`.
- **Implementation**: `src/main.tsx` uses `registerSW` with an `onNeedRefresh` callback that triggers a standard browser `confirm` dialog ("New version available! Reload to update?").
- **Behavior**: Although `autoUpdate` is configured, the current client-side code explicitly intercepts the update event and asks for user permission, which contradicts the goal of "automatic updates". Additionally, there is no mechanism to check for updates periodically while the app is open.

## Proposed Changes

### 1. Update `vite.config.ts`
Ensure the PWA plugin is optimally configured for automatic updates.
- Confirm `registerType: 'autoUpdate'` is present (already exists).
- Ensure `workbox` options are configured to clean up outdated caches to prevent storage bloat.

### 2. Refactor `src/main.tsx`
Modify the `registerSW` implementation to support silent, automatic updates and periodic polling.

#### Key Changes:
1.  **Remove Confirmation Dialog**: Remove the `onNeedRefresh` callback that prompts the user.
2.  **Periodic Update Check**: Implement a polling mechanism to check for updates at a set interval (e.g., every hour). This is crucial for users who keep the tab open for extended periods.
3.  **Automatic Reload**: Configure the application to reload automatically when a new Service Worker is activated, ensuring the latest assets are loaded.

#### Implementation Logic:
```typescript
import { registerSW } from 'virtual:pwa-register';

const intervalMS = 60 * 60 * 1000; // Check for updates every hour

const updateSW = registerSW({
  onRegisteredSW(swUrl, r) {
    r && setInterval(async () => {
      if (!(!r.installing && !r.waiting)) return;
      
      if ('connection' in navigator && !navigator.onLine) return;

      const resp = await fetch(swUrl, {
        cache: 'no-store',
        headers: {
          'cache': 'no-store',
          'cache-control': 'no-cache',
        },
      });

      if (resp?.status === 200) {
        await r.update();
      }
    }, intervalMS);
  },
  onNeedRefresh() {
    // With autoUpdate, this might still fire if the SW is waiting.
    // We can force the update here without asking.
    updateSW(true);
  },
});
```
*Note: The actual implementation will be streamlined. `registerType: 'autoUpdate'` handles most of the heavy lifting. The critical addition is the `setInterval` loop to trigger `r.update()`.*

### 3. UX Considerations
- **Disruption**: Automatic reloading can be disruptive if the user is in the middle of reading.
- **Mitigation**: 
    - Ideally, we should only reload if the app is idle, but for "automatic update" as a primary requirement, immediate consistency is prioritized. 
    - *Alternative*: Show a non-intrusive toast "Updating..." before reloading, but the user asked for "automatic update" which implies minimal interaction. We will proceed with immediate update for now, as per the request.

## Verification Plan
1.  **Build & Preview**: Run `npm run build` and `npm run preview`.
2.  **Initial Load**: Open the app in the browser.
3.  **Simulate Update**: Modify the built code (or rebuild with a small change) while the preview server is running.
4.  **Verify**: Observe that the open tab detects the change (after the polling interval or manual trigger) and reloads automatically without a confirmation dialog.

## Checklist
- [ ] Modify `vite.config.ts` (if necessary to add cleanup options).
- [ ] Modify `src/main.tsx` to remove `confirm` and add polling.
- [ ] Verify build passes.
