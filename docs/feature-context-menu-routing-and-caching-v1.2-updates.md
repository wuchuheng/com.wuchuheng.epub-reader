# Feature Spec v1.2 - Key Updates

## Changes from v1.1 to v1.2

### 1. Text Selection Behavior (CRITICAL CHANGE)

**OLD Behavior (v1.1):**

- User could select new text while context menus were open
- New selection would close all existing menus and open a new one

**NEW Behavior (v1.2):**

- ⚠️ **Text selection is DISABLED when any context menu is open**
- Users MUST close existing menus first before selecting new text
- Prevents conflicts and ensures clear workflow

### 2. Closing Triggers (Updated List)

**Removed:**

- ~~New selection~~ (no longer possible while menus are open)

**Remaining Triggers:**

1. **Close button (X)**
2. **Outside click**
3. **ESC key** (recommended method)
4. **Navigation** (page/chapter change)

### 3. Help System (NEW FEATURE)

#### 3.1 Help Icon Button

- **Location**: In context menu header, **near the pin icon button**
- **Visual**: Question mark icon (?)
- **Action**: Opens help popup overlay

#### 3.2 Help Popup Content

```
📖 Context Menu Quick Guide

✅ Opening Context Menu:
• Select any word or phrase in the book
• Context menu appears automatically

❌ Closing Context Menu:
• Press ESC key (recommended)
• Click the X button in the header
• Click anywhere outside the menu

📌 Features:
• Pin icon: Keep menu maximized
• Multiple menus: Open several at once
• Cached responses: Instant results for repeated queries

⚠️ Note: You cannot select new text while menus are open.
     Close existing menus first (press ESC).
```

#### 3.3 Implementation Details

- Help icon appears on **ALL context menus** (not just topmost)
- Popup is modal (semi-transparent backdrop, blocks interaction)
- Optional: Auto-show on first context menu open for new users
- User preference in localStorage to prevent repeat popups

### 4. Coding Style: Numeric Comments (NEW REQUIREMENT)

**All functions MUST use numeric comments (three-phase pattern from `base_rules.md`):**

```typescript
/**
 * Generates a SHA256 hash from context string.
 * @param context - The context string to hash
 * @returns 32-character hex string
 */
const generateContextHash = async (context: string): Promise<string> => {
  // 1. Input handling
  // 1.1 Validate input
  if (!context || context.trim().length === 0) {
    throw new Error('Context cannot be empty');
  }

  // 1.2 Prepare data for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(context.trim());

  // 2. Core processing
  // 2.1 Generate SHA256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // 2.2 Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 3. Output handling
  return hashHex;
};

/**
 * Retrieves or creates a context ID for given words and context.
 * @param words - Selected words
 * @param context - Surrounding context
 * @returns Context ID (reused if exists, new if not)
 */
const getOrCreateContextId = async (words: string, context: string): Promise<number> => {
  // 1. Input handling
  // 1.1 Generate context hash
  const hash = await generateContextHash(context);

  // 2. Core processing
  // 2.1 Check if hash already exists
  const existingMapping = await readHashMapping(hash);

  if (existingMapping) {
    // 2.2 Return existing ID
    return existingMapping.id;
  }

  // 2.3 Create new ID
  const latestId = await getLatestId();
  const newId = latestId + 1;

  // 2.4 Save mappings (parallel execution)
  await Promise.all([
    saveHashMapping(hash, newId),
    saveContextMetadata({ id: newId, words, context }),
    updateLatestId(newId),
  ]);

  // 3. Output handling
  return newId;
};
```

**Key Requirements:**

- ✅ **Phase 1** (`// 1.`): Input validation and preparation
- ✅ **Phase 2** (`// 2.`): Core business logic
- ✅ **Phase 3** (`// 3.`): Return/output result
- ✅ **Sub-steps**: `1.1`, `1.2`, `2.1`, `2.2` (max 3 levels deep)
- ✅ **Numeric comments ONLY inside function bodies** (never at file/module scope)

### 5. Implementation Phases (Updated)

**Added Phase 5:**

```
Phase 5: Help System & UX Improvements
- Add help icon button (?) near pin icon
- Create help popup component
- Implement first-time user auto-popup (optional)
- Store user preference in localStorage
```

---

## Summary of ALL Requirements (v1.2)

### Functional Programming

- ✅ Pure functions, no classes
- ✅ Immutability (no mutations)
- ✅ Declarative style (`map`/`filter`/`reduce`)
- ✅ Function composition

### Numeric Comments (base_rules.md)

- ✅ Three-phase pattern: `// 1.` `// 2.` `// 3.`
- ✅ Sub-steps: `// 1.1` `// 2.2` etc.
- ✅ Inside function bodies ONLY

### Context Menu Behavior

- ✅ URL-based state: `?contextMenu=1,2,3`
- ✅ Stacking order: left→right = bottom→top
- ✅ Z-index: `baseZIndex + arrayIndex`
- ✅ **Text selection DISABLED while menus open**

### Help System

- ✅ Help icon (?) near pin icon
- ✅ Modal popup with usage guide
- ✅ ESC key recommended for closing
- ✅ First-time user auto-popup (optional)

### Closing Triggers

1. Close button (X)
2. Outside click
3. ESC key (recommended)
4. Navigation

---

**Document Version**: 1.2  
**Date**: 2025-12-03  
**Status**: Awaiting User Approval

**Please review these changes before I proceed with implementation!** 🚀
