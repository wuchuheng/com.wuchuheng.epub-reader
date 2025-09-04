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

## **Text Selection Patterns**

### **Selection Handler Pattern**

```typescript
// Text extraction with context
const extractSelectedInfo = async ({
  book,
  cfiRange,
}: SelectionHandlerProps): Promise<SelectInfo | undefined> => {
  // 1. Input validation
  // 2. Core processing - get range and extract text
  // 3. Output handling - return structured selection info
};
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

## **Navigation & Settings Patterns**

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
