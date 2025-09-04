# System Patterns: EPUB Reader Architecture

## **Core Architecture Patterns**

### **Component-Based Architecture**

```
Application Layer
├── Pages (Route-level)
├── Components (Reusable UI)
├── Hooks (Business logic)
├── Services (External integrations)
└── Store (State management)
```

### **Data Flow**

```
User Action → Component → Hook/Service → State Update → Component Re-render
```

## **Storage Patterns**

### **OPFS Strategy**

```
/books/
    {book-id}/
        book-name.epub
        cover.jpg|png|webp
/config.json (metadata + settings)
```

### **Key Storage Patterns**

- **Singleton Pattern**: OPFSManager for consistent access
- **Atomic Operations**: Complete file writes only
- **Metadata Separation**: Store metadata separately from content
- **Error Recovery**: Validate file integrity after operations

## **Component Patterns**

### **Hook Pattern**

```typescript
// Consolidated hook for component logic
export const useReader = (props: UseReaderProps): UseReaderReturn => {
  // State and refs
  // Core logic
  // Effects
  // Return state and functions
};
```

### **Service Pattern**

```typescript
// Three-phase service operations
export async function getBookByBookId(bookId: string): Promise<Book> {
  // 1. Input validation
  // 2. Core processing
  // 3. Output handling
}
```

### **Async Thunk Pattern**

```typescript
// Redux async operations
export const uploadBook = createAsyncThunk(
  'bookshelf/uploadBook',
  async (file: File, { rejectWithValue }) => {
    try {
      // Processing logic
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## **Service Architecture Patterns**

### **Service Separation Pattern**

```typescript
// Rendition event service - handles EPUB.js events
export const setupRenditionEvents = (props: SetupRenditionEventsProps) => {
  // Location tracking
  props.rendition.on('relocated', (location: RenditionLocation) => {
    // Handle location changes
  });

  // Chapter tracking
  props.rendition.on('rendered', (section: Section, iframeView: EpubIframeView) => {
    // Handle chapter rendering and setup selection events
  });
};

// Selection service - handles text extraction
export const handleSelectionEnd = (doc: Document, onExtractSelection: OnExtractSelection) => {
  // Extract selection with word boundary detection
  const result = extractSelectionToWords(doc);

  if (result) {
    onExtractSelection(result);
  }
};
```

### **Event Management Pattern**

- **Separation of Concerns**: Rendition events separated from selection handling
- **Clean Event Setup**: Centralized event configuration with proper cleanup
- **Debounced Operations**: User interactions optimized with debouncing
- **State Management**: Coordinated state updates between services

## **Text Selection Patterns**

### **Advanced Selection Handler Pattern**

```typescript
// Text extraction with word boundary detection
function extractSelectionToWords(doc: Document): SelectInfo | undefined {
  // 1. Input validation
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // 2. Core processing - adjust to word boundaries
  // 2.1 Adjust start to word boundaries
  while (
    range.startOffset > 0 &&
    /\w/.test(range.startContainer.textContent?.[range.startOffset - 1] ?? '')
  ) {
    range.setStart(range.startContainer, range.startOffset - 1);
  }

  // 2.2 Adjust end to word boundaries
  while (
    range.endOffset < (range.endContainer.textContent?.length ?? 0) &&
    /\w/.test(range.endContainer.textContent?.[range.endOffset] ?? '')
  ) {
    range.setEnd(range.endContainer, range.endOffset + 1);
  }

  // 3. Output handling - return structured selection info
  return { words: selectedText, context };
}
```

### **Context Extraction Pattern**

```typescript
// Find paragraph context for selected text
const findParagraphElement = (node: Node): HTMLElement | null => {
  // Traverse up DOM to find paragraph container
  // Return context for AI analysis
};
```

### **Touch Event Pattern**

```typescript
// Touch state management for mobile
type TouchState = {
  isLongPress: boolean;
  startTime: number;
  startPos: { x: number; y: number };
  timer: NodeJS.Timeout | null;
};
```

## **Navigation Patterns**

### **Enhanced Navigation Pattern**

```typescript
// Multiple navigation methods support
const useKeyboardNavigation = (goToNext: () => void, goToPrev: () => void) => {
  // Arrow key navigation
  // Volume key navigation for mobile
  // Custom navigation button support
};

// Dedicated navigation buttons
const NextPageButton = ({ onClick }) => <button onClick={onClick}>Next</button>;
const PrevPageButton = ({ onClick }) => <button onClick={onClick}>Previous</button>;
```

### **Container Layout**

```typescript
// Consistent layout with sticky header
const Container = ({ children }) => (
  <div className="flex h-full flex-col bg-gray-50">
    <header className="sticky top-0 border-b bg-white shadow-sm">
      {/* Navigation */}
    </header>
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
);
```

### **Breadcrumb Navigation**

- Hierarchical navigation trail
- Dynamic generation based on route
- Accessibility support with ARIA labels

### **Settings Management**

- CRUD operations for configuration
- Form validation with real-time feedback
- LocalStorage persistence
- Type-safe interfaces

## **Context Menu Patterns**

### **Context Menu Implementation**

```typescript
// Dynamic context menu with multiple tool types
const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  // Load settings from OPFS
  // Render AI tools or iframe tools based on selection
  // Handle tab switching between different tools
};
```

### **Tool Integration Pattern**

- **AI Tools**: OpenAI integration with template processing
- **Iframe Tools**: External content rendering with context injection
- **Dynamic Loading**: Settings loaded from OPFS on demand
- **Tab Management**: Switch between different tool types seamlessly

## **AI Agent Patterns**

### **Conversation Interface**

```
User Message → AI Processing → Response Display
├── User input with word highlighting
├── AI streaming responses
├── Reasoning content (foldable)
└── Token usage tracking
```

### **Template Processing**

```typescript
// Dynamic prompt replacement
const result = template.replace(/\{words\}/g, selectedWords).replace(/\{context\}/g, context);
```

### **Message Rendering**

- Markdown support for formatted responses
- Foldable reasoning content
- Token usage status bar
- Copy/refresh functionality

### **Auto-scroll Pattern**

```typescript
// Smart scrolling based on user behavior
const useAutoScrollOnUpdate = (conversationRef, messageList, smoothScrollToBottom, threshold) => {
  // Auto-scroll when new messages arrive if user is near bottom
  // Respect user scroll position to prevent unwanted scrolling
};
```

## **Type Safety Patterns**

### **Interface Design**

```typescript
// Clear, focused interfaces
interface UseReaderReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  tableOfContents: TocItem[];
  totalPages: number;
  currentPage: number;
  // ... other essential properties
}
```

### **Zero 'any' Types**

- Complete TypeScript coverage
- Proper error handling
- Type-safe props and returns

## **Performance Patterns**

### **Debouncing Pattern**

```typescript
// Debounced user interactions
const onSelectionCompleted = useCallback(
  debounce<void>(() => {
    // Handle selection after user stops interacting
  }, 200),
  []
);
```

### **Code Splitting**

- Lazy loading for routes
- Manual chunks for vendor separation
- Suspense fallbacks

### **Memory Management**

- Proper cleanup in useEffect
- Event listener removal
- Resource disposal
- Timer cleanup for debounced operations

### **Optimization**

- Bundle size reduction
- Lazy loading strategies
- Efficient rendering
- Smart scrolling behavior

---

_Patterns focus on essential architecture, not implementation details_
