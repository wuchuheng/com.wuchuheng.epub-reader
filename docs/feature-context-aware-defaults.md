# Feature Specification: Context-Aware Default AI Tools

## 1. Objective
Enhance the Context Menu in the EPUB Reader to automatically select the most appropriate AI tool based on the user's text selection. Specifically, distinguish between "Single Word" and "Multi-Word" (phrase/sentence) selections.

## 2. Problem Statement
Currently, when a user selects text, the Context Menu always defaults to the first tool in the list (Index 0). Users often want different tools for different contexts (e.g., a Dictionary for single words, a Translator or Explainer for sentences). Manually switching tabs every time is inefficient.

## 3. Proposed Solution
Introduce a "Default Situation" configuration for each AI Tool.
- **Situations**:
  1.  **Single Word**: The selected text contains exactly one word.
  2.  **Multi-Word**: The selected text contains more than one word.
- **Constraint**: Only *one* tool can be the default for a given situation. (e.g., Only one "Single Word" default, only one "Multi-Word" default).
- **Fallback**: If no tool is configured for the current situation, default to the first item in the list.

## 4. Technical Implementation

### 4.1. Data Model Updates
Update the `ContextMenuItem` type in `src/types/epub.ts` to include a new optional field:

```typescript
export type SelectionSituation = 'word' | 'sentence';

export interface ContextMenuItem {
  // ... existing fields (id, name, type, etc.)
  
  /**
   * Specifies if this tool is the default for a specific selection situation.
   * null/undefined means it's never a default (unless it's the first item).
   */
  defaultFor?: SelectionSituation; 
}
```

### 4.2. Settings UI (`/settings/contextmenu`)

#### A. Tool Edit Form (`AIToolForm.tsx`)
- Add a form section for "Default Behavior".
- Options:
  - [ ] Default for Single Word
  - [ ] Default for Multi-Word Selection
- **Validation**:
  - Ensure that checking "Default for Single Word" unchecks it from any other tool (or handle this logic on save).

#### B. Tool List (`ToolList.tsx`)
- Update each list item to display its current default status.
- Add quick-toggle buttons (e.g., small icons or badges that act as checkboxes) directly on the list item:
  - "Word" icon/badge: Active if `defaultFor === 'word'`. Clicking it sets this tool as the word default (and unsets others).
  - "Sentence" icon/badge: Active if `defaultFor === 'sentence'`. Clicking it sets this tool as the sentence default (and unsets others).
- This allows users to change defaults without entering the edit page.

### 4.3. Logic & State Management
1.  **State Access**: The `EpubReaderRender` component needs access to `ContextMenuSettings`.
2.  **Mutual Exclusivity**:
    - When a tool is set as default for a situation (e.g., 'word'), iterate through all other tools and set their `defaultFor` to `undefined` (if it matched the new assignment).
    - This logic should ideally live in `useContextMenuSettings.ts` or a specialized service method to ensure consistency whether updated via List or Form.

### 4.4. Reader Logic (`EpubReader`)
1.  **Selection Handler**: Update the `onSelect` callback in `EpubReaderRender`:
    ```typescript
    const onSelect = (selectedInfo: SelectInfo) => {
      if (selectedInfo.words.trim() === '') return;

      const wordCount = selectedInfo.words.trim().split(/\s+/).length;
      const situation: SelectionSituation = wordCount === 1 ? 'word' : 'sentence';

      // Find the index of the tool that is set as default for this situation
      let targetIndex = settings?.items.findIndex(item => item.defaultFor === situation);

      // Fallback to 0 if no specific default is found
      if (targetIndex === -1 || targetIndex === undefined) {
        targetIndex = 0;
      }

      setContextMenu({ tabIndex: targetIndex, ...selectedInfo });
      // ...
    };
    ```

## 5. User Stories
- **Scenario A**: User configures "English Dictionary" as default for "Single Word". When they select "hello", the Dictionary tool opens automatically.
- **Scenario B**: User configures "Translator" as default for "Multi-Word". When they select "Hello world", the Translator tool opens.
- **Scenario C**: User selects a word, but no "Single Word" default is set. The first tool in the list opens.

## 6. Implementation Plan
1.  **Type Definitions**: Update `src/types/epub.ts`.
2.  **Settings Service**: Ensure `updateContextMenuSettings` handles the mutual exclusivity logic (unsetting previous defaults).
3.  **UI Update**: Add checkbox/radio controls to `AIToolForm`.
4.  **Reader Integration**: Inject settings into `EpubReader` and implement the selection logic.
