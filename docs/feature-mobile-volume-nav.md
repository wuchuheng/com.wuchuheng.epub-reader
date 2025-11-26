# Feature Specification: Mobile Volume Key Navigation

## 1. Problem Description
Users on mobile devices often prefer using physical buttons for page turning as it offers tactile feedback and doesn't require touching the screen. The goal is to enable the volume up and down buttons to trigger page turns in the EPUB reader.

## 2. Proposed Solution
We will intercept the `VolumeUp` and `VolumeDown` key events in the `useKeyboardNavigator` hook and map them to the `goToPrev` and `goToNext` actions, respectively. This feature will be conditionally enabled only for mobile devices.

**Constraint:**
It is important to note that intercepting volume keys is not universally supported across all mobile browsers and OS versions (especially on iOS). However, the implementation will follow standard web practices for where it *is* supported (e.g., Android Chrome, Firefox).

## 3. Implementation Details

### 3.1. Update `src/pages/EpubReader/hooks/useKeyboardNavigator.ts`
Modify the hook signature to accept an optional configuration object.

```typescript
type KeyboardNavOptions = {
  enableVolumeKeys?: boolean;
};

export const useKeyboardNavigation = (
  onNext: () => void,
  onPrev: () => void,
  options?: KeyboardNavOptions
) => {
  // ...
  const handleKeyDown = (event: KeyboardEvent) => {
    // Existing logic...
    if (event.key === 'ArrowRight') onNext();
    if (event.key === 'ArrowLeft') onPrev();

    // New logic
    if (options?.enableVolumeKeys) {
      if (event.key === 'VolumeUp') {
        event.preventDefault(); // Try to prevent system volume change
        onPrev();
      }
      if (event.key === 'VolumeDown') {
        event.preventDefault();
        onNext();
      }
    }
  };
  // ...
};
```

### 3.2. Update `src/pages/EpubReader/hooks/useEpubReader.ts`
1.  Import `isMobileDevice` from `../services/renditionEvent.service`.
2.  Call `useKeyboardNavigation` with the new option.

```typescript
import { isMobileDevice } from '../services/renditionEvent.service';

// ... inside useReader hook ...

// Setup keyboard navigation
useKeyboardNavigation(
  navigation.goToNext, 
  navigation.goToPrev, 
  { enableVolumeKeys: isMobileDevice() }
);
```

## 4. Verification Plan
1.  **Desktop Check:** Open the reader on a desktop browser. Pressing Volume keys (if your keyboard has them) should *not* trigger page turns (unless we mock `isMobileDevice` or force the option). Regular arrow keys should still work.
2.  **Mobile Check (Android):** Open the reader on an Android device (Chrome/Firefox). Press Volume Down -> Should go to next page. Press Volume Up -> Should go to previous page.
3.  **Code Logic:** Ensure `event.preventDefault()` is called to attempt to suppress the system volume UI (though not guaranteed).

## 5. File Changes
- `src/pages/EpubReader/hooks/useKeyboardNavigator.ts`: Add volume key handling logic.
- `src/pages/EpubReader/hooks/useEpubReader.ts`: Pass `enableVolumeKeys: true` when on mobile.
