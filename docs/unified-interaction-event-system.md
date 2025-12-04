# Unified Interaction Event System - Specification

## Problem Statement

### Current Issue

The EPUB reader currently has conflicting event handling logic where **selection events** and **click events** are emitted simultaneously, causing unexpected behavior:

1. **Symptom**: When a user clicks on a word to select it, both events fire:

   - `onSelect` event is triggered (text selection)
   - `onClick` event is triggered (zone-based navigation/menu toggle)

2. **Root Cause**: The system treats mouse/touch down-up sequences as independent events rather than a unified interaction gesture that should result in **only one** action.

3. **Current Mitigation**: A 500ms time-based suppression in `useReaderInteraction.ts` (line 79) prevents click handlers from running immediately after selection, but this is a workaround that doesn't address the architectural issue.

### Current Architecture Analysis

#### Event Flow (Mobile)

```
touchstart → Long Press Timer (500ms) → touchmove → touchend
                                                       ↓
                                            completeSelection()
                                                       ↓
                                            handleSelectionEnd()
                                                       ↓
                                            onSelectionCompleted callback
```

#### Event Flow (Desktop)

```
mousedown → (native browser selection) → mouseup
                                            ↓
                                  handleSelectionEnd()
                                            ↓
                                  onSelectionCompleted callback
                                            ↓
                                  onClick callback (from rendition)
```

#### Conflict Points

1. **Mobile**: `touchend` triggers both selection completion AND can trigger click zones
2. **Desktop**: `mouseup` triggers selection handling AND click event propagation
3. **Selection Detection**: The system only knows if text was selected AFTER the mouse/finger is released
4. **Zone Navigation**: Click handlers execute based on viewport position regardless of selection intent

---

## Proposed Solution

### Core Concept: Unified Interaction Event

Replace the dual `onSelect` + `onClick` callbacks with a **single unified interaction event** that is resolved at the **pointer-up moment** (mouseup/touchend) based on interaction context.

### Event Priority Hierarchy

When a pointer-up event occurs, determine the event type in this priority order:

1. **Selection Event** (Highest Priority)

   - Condition: User has selected text (non-collapsed range with content)
   - Payload: `{ type: 'selection', words: string, context: string, position: {x, y} }`

2. **Click Event** (Fallback)

   - Condition: No text selected, click on readable content area
   - Payload: `{ type: 'click', position: {x, y}, timestamp: number }`

3. **No Event**
   - Condition: Click too far from text, or on non-interactive areas
   - Result: No callback triggered

### New Interface Design

```typescript
/**
 * Unified interaction event representing the result of a pointer down-up gesture
 */
type InteractionEvent = SelectionEvent | ClickEvent;

/**
 * Selection event - user selected text
 */
type SelectionEvent = {
  type: 'selection';
  words: string; // Selected text
  context: string; // Surrounding context
  position: {
    // Click/touch position for UI anchoring
    x: number;
    y: number;
  };
  timestamp: number;
};

/**
 * Click event - user clicked without selecting text
 */
type ClickEvent = {
  type: 'click';
  position: {
    x: number;
    y: number;
  };
  viewportRatio: number; // Horizontal position ratio (0-1) for zone detection
  timestamp: number;
};

/**
 * Callback for unified interaction events
 */
type OnInteraction = (event: InteractionEvent) => void;
```

---

## Implementation Strategy

### Phase 1: Create Unified Event Handler

**File**: `src/pages/EpubReader/services/interactionEvent.service.ts` (NEW)

```typescript
/**
 * Determines the interaction type from a pointer-up event
 *
 * Decision Logic:
 * 1. Check if there's a text selection
 * 2. If selection exists and has content → SelectionEvent
 * 3. If no selection, check proximity to text → ClickEvent
 * 4. If not near text → null (no event)
 */
export const resolveInteractionEvent = (
  doc: Document,
  position: { x: number; y: number },
  viewportRatio: number
): InteractionEvent | null => {
  const selection = doc.getSelection();

  // Priority 1: Check for text selection
  if (selection && !selection.isCollapsed) {
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      // Extract context and return selection event
      return {
        type: 'selection',
        words: selectedText,
        context: extractContext(doc, selection),
        position,
        timestamp: Date.now(),
      };
    }
  }

  // Priority 2: Check for click on text (collapsed selection)
  if (selection && selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate proximity to text
    const distX = Math.max(rect.left - position.x, 0, position.x - rect.right);
    const distY = Math.max(rect.top - position.y, 0, position.y - rect.bottom);
    const distance = Math.sqrt(distX * distX + distY * distY);

    // If click is near text, treat as click event
    if (distance <= 10) {
      return {
        type: 'click',
        position,
        viewportRatio,
        timestamp: Date.now(),
      };
    }
  }

  // Not near text, no event
  return null;
};
```

### Phase 2: Refactor Selection Services

**Changes Required**:

1. **`mobileSelection.service.ts`**

   - Change `completeSelection()` to call `resolveInteractionEvent()`
   - Replace `onSelectionCompleted` callback with `onInteraction` callback
   - Remove timestamp-based workarounds

2. **`computerSelection.service.ts`**

   - Change `mouseup` handler to call `resolveInteractionEvent()`
   - Replace `onSelectionCompleted` with `onInteraction`

3. **`selection.service.ts`**
   - Rename `handleSelectionEnd()` to `resolveInteractionEvent()`
   - Return `InteractionEvent | null` instead of `SelectInfo`
   - Include click detection logic

### Phase 3: Update Hook Interfaces

**File**: `src/pages/EpubReader/hooks/useEpubReader.ts`

```typescript
interface UseReaderProps {
  book: Book;
  onInteraction: (event: InteractionEvent) => void; // NEW unified callback
  selectionEnabled: boolean;
}
```

**File**: `src/pages/EpubReader/hooks/useReaderInteraction.ts`

```typescript
const { containerRef, ... } = useReader({
  book,
  onInteraction: (event: InteractionEvent) => {
    if (event.type === 'selection') {
      // Handle selection
      onSelection({ words: event.words, context: event.context });
      setMenuVisible(false);
      setTocVisible(false);
    } else if (event.type === 'click') {
      // Handle click zones
      if (tocVisible) {
        setTocVisible(false);
      } else if (menuStackLength > 0) {
        onMenuClose();
      } else {
        // Zone-based navigation
        const ratio = event.viewportRatio;
        if (ratio < 0.2) {
          onPrev();
        } else if (ratio > 0.8) {
          onNext();
        } else {
          setMenuVisible(prev => !prev);
        }
      }
    }
  },
  selectionEnabled: menuStackLength === 0,
});
```

### Phase 4: Remove Deprecated Code

**Remove**:

- `onClick` callback from `useEpubReader`
- `clickHandlerRef` from `useReaderInteraction`
- `lastSelectionTimeRef` time-based suppression
- `markSelectionActivity` workaround
- Separate `onSelect` callback

---

## Benefits

### 1. **Architectural Clarity**

- Single responsibility: One event type per interaction
- No conflicting callbacks
- Clear priority hierarchy

### 2. **Eliminates Race Conditions**

- No time-based workarounds (500ms delay)
- Deterministic event resolution
- Predictable behavior

### 3. **Better User Experience**

- Clicking a word for selection won't trigger zone navigation
- Clicking empty space near text behaves as intended
- Mobile and desktop behavior consistency

### 4. **Maintainability**

- Centralized interaction logic
- Easier to debug (one event path)
- Self-documenting event types

---

## Migration Path

### Backward Compatibility

Since this changes the public API of `useReader` hook:

1. **Phase 1**: Create new `onInteraction` alongside existing callbacks (support both)
2. **Phase 2**: Update all consumers to use `onInteraction`
3. **Phase 3**: Deprecate and remove old callbacks

### Testing Checklist

- [ ] Desktop: Click word → Selection event only
- [ ] Desktop: Click empty space → Click event only
- [ ] Mobile: Tap word → Click event only
- [ ] Mobile: Long press + drag → Selection event only
- [ ] Mobile: Quick tap near text → Click event only
- [ ] Zone navigation: Left/right zones work without selection
- [ ] Zone navigation: Center zone toggles menu
- [ ] Selection doesn't trigger zone navigation
- [ ] Click proximity detection (10px threshold)

---

## Open Questions

1. **Long Press on Mobile**: Should long press without movement trigger selection of the nearest word?

   - Current: Only highlights caret position
   - Proposed: Auto-select word under finger

2. **Double-Click**: Should we add a third event type for double-click word selection?

   - Desktop browsers support this natively
   - May simplify single-word selection

3. **Gesture Conflicts**: How to handle swipe gestures vs. click detection?

   - Consider movement threshold
   - Minimum distance to cancel click intent

4. **Click Position Storage**: For click events, should we store the position for future UI use?
   - Context menu placement
   - Annotation anchoring

---

## Conclusion

This refactoring addresses the fundamental conflict between selection and click events by:

- Unifying both into a single interaction event model
- Establishing clear priority: selection > click > no-event
- Removing time-based workarounds in favor of deterministic logic
- Creating a more maintainable and predictable codebase

The proposed solution is **appropriate and recommended** because it:

- Solves the root cause rather than symptoms
- Aligns with functional programming principles
- Improves code clarity and testability
- Provides better UX with predictable behavior
