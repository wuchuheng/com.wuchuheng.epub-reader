# Epub Reader Project Development Rules

**Purpose**: Extend the universal programming rules from `baseRules.md` with project-specific guidelines for the epub reader application development.

**Base Reference**: All rules defined in [baseRules.md](./baseRules.md) apply universally to this project. This clause provides additional context and project-specific extensions.

---

## 🎯 Project-Specific Goals

### Primary Objectives

1. **Reading Experience**: Create a smooth, intuitive epub reading experience
2. **Performance**: Ensure fast loading and responsive interactions
3. **Accessibility**: Support diverse reading needs and preferences
4. **Cross-Platform**: Work seamlessly across desktop and mobile devices

### Priority Order (Project-Specific)

1. **User Experience** - Reading experience comes first
2. **Performance** - Fast, responsive interactions
3. **Maintainability** - Code that's easy to extend and maintain

---

## 📱 Technology Stack Guidelines

### Core Technologies

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks and context
- **Build Tool**: Vite
- **Testing**: Jest and React Testing Library

### Component Architecture

```
src/
├── components/          # Reusable UI components
│   ├── epub/           # Epub-specific components
│   ├── layout/         # Layout and navigation
│   └── ui/            # Base UI elements
├── hooks/             # Custom React hooks
├── services/          # External integrations
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

---

## 🎨 UI/UX Development Rules

### Component Design Principles

**Readability-First UI Components**:

- Follow the baseRules.md readability principles
- Use semantic HTML elements appropriately
- Ensure proper ARIA labels and accessibility
- Maintain consistent spacing and typography

### Epub-Specific Guidelines

**Content Rendering**:

- Use epub.js for epub parsing and rendering
- Implement custom styling for epub content
- Support user preferences (font size, theme, spacing)
- Handle different epub formats and versions

**Navigation Controls**:

- Provide intuitive chapter navigation
- Support bookmarking and progress tracking
- Implement search functionality
- Add table of contents navigation

---

## 🔧 Code Organization Extensions

### Epub Component Structure

**Three-Phase Pattern for Epub Operations**:

```typescript
/**
 * Loads and renders an epub file with proper error handling.
 * @param file - The epub file to load
 * @returns Promise resolving to loaded book data
 * @throws {EpubError} When file loading or parsing fails
 */
async function loadEpub(file: File): Promise<EpubBook> {
  // 1. Input validation and preparation
  // 1.1 Validate file type and size
  if (!file.name.endsWith('.epub')) {
    throw new EpubError('Invalid file type. Expected .epub');
  }

  // 1.2 Check file size limits
  if (file.size > MAX_FILE_SIZE) {
    throw new EpubError('File size exceeds maximum limit');
  }

  // 2. Core processing
  // 2.1 Parse epub file
  const book = await Epub.parse(file);
  
  // 2.2 Extract metadata
  const metadata = await book.metadata();
  
  // 2.3 Prepare content for rendering
  const content = await book.render();

  // 3. Return structured result
  return {
    metadata,
    content,
    chapters: await book.chapters(),
    file
  };
}
```

### File Organization Rules

**Component Naming Conventions**:

- Epub components: `Epub[Feature].tsx` (e.g., `EpubReader.tsx`, `EpubNavigation.tsx`)
- Layout components: `[Area]Layout.tsx` (e.g., `ReaderLayout.tsx`)
- UI components: `[Element].tsx` (e.g., `Button.tsx`, `ProgressIndicator.tsx`)

**Hook Naming Conventions**:

- Use `use[Feature]` pattern for custom hooks
- Epub-specific hooks: `useEpub[Action]` (e.g., `useEpubNavigation`)
- State management hooks: `use[StateName]State`

---

## 📚 State Management Guidelines

### React Context Usage

**Global State Structure**:

```typescript
// contexts/EpubContext.tsx
interface EpubContextType {
  // Current book state
  currentBook: EpubBook | null;
  currentPage: number;
  totalPages: number;
  
  // User preferences
  preferences: UserPreferences;
  
  // Reading progress
  bookmarks: Bookmark[];
  progress: ReadingProgress;
  
  // Actions
  actions: {
    loadBook: (file: File) => Promise<void>;
    navigateToPage: (page: number) => void;
    updatePreferences: (prefs: Partial<UserPreferences>) => void;
  };
}
```

### State Update Patterns

**Three-Phase State Updates**:

```typescript
function updateReadingPreferences(newPreferences: Partial<UserPreferences>) {
  // 1. Input validation
  const validatedPrefs = validatePreferences(newPreferences);
  
  // 2. State update with side effects
  dispatch({ type: 'UPDATE_PREFERENCES', payload: validatedPrefs });
  savePreferencesToStorage(validatedPrefs);
  
  // 3. Optional: trigger UI updates
  if (validatedPrefs.theme !== currentTheme) {
    applyTheme(validatedPrefs.theme);
  }
}
```

---

## 🎭 Performance Optimization Rules

### Epub Loading Performance

**Lazy Loading Strategy**:

- Load only current chapter initially
- Preload adjacent chapters
- Implement caching for loaded content
- Use Web Workers for heavy parsing operations

### Rendering Optimization

**Virtual Scrolling**:

- Implement virtual scrolling for long chapters
- Use React.memo for expensive components
- Optimize epub content rendering
- Debounce user interactions

---

## 🧪 Testing Guidelines

### Component Testing

**Epub Component Testing Strategy**:

```typescript
describe('EpubReader', () => {
  // 1. Input validation tests
  it('handles invalid epub files gracefully', () => {
    // Test error handling
  });
  
  // 2. Core functionality tests
  it('renders epub content correctly', () => {
    // Test rendering logic
  });
  
  // 3. Integration tests
  it('maintains reading progress across sessions', () => {
    // Test persistence
  });
});
```

### Testing Patterns

**Three-Phase Testing**:

```typescript
test('epub navigation works correctly', () => {
  // 1. Setup test data
  const mockBook = createMockEpubBook();
  
  // 2. Execute test actions
  const { result } = renderHook(() => useEpubNavigation());
  act(() => {
    result.current.navigateToChapter(2);
  });
  
  // 3. Verify expected behavior
  expect(result.current.currentChapter).toBe(2);
});
```

---

## 🔒 Error Handling Guidelines

### Epub-Specific Error Types

```typescript
class EpubError extends Error {
  constructor(
    message: string,
    public type: 'parse' | 'render' | 'navigation' | 'file'
  ) {
    super(message);
    this.name = 'EpubError';
  }
}
```

### Error Handling Pattern

```typescript
async function handleEpubOperation(operation: () => Promise<any>) {
  try {
    // 1. Input validation
    if (typeof operation !== 'function') {
      throw new Error('Operation must be a function');
    }
    
    // 2. Execute operation
    const result = await operation();
    
    // 3. Return result
    return result;
  } catch (error) {
    // Handle specific epub errors
    if (error instanceof EpubError) {
      logger.error('Epub operation failed', { error, type: error.type });
      // Show user-friendly error message
      showErrorToast(error.message);
    } else {
      // Handle unexpected errors
      logger.error('Unexpected error in epub operation', { error });
      showErrorToast('An unexpected error occurred');
    }
  }
}
```

---

## 📊 Logging Extensions

### Epub-Specific Logging

**Key Events to Log**:

- Book loading success/failure
- Navigation events
- User preference changes
- Reading progress milestones
- Performance metrics

```typescript
// 1. Input validation
if (!book || !book.metadata) {
  logger.error('Invalid book data for logging', { book });
  return;
}

// 2. Core processing
const readingSession = {
  bookId: book.metadata.identifier,
  startTime: Date.now(),
  startPage: currentPage,
  estimatedDuration: calculateReadingTime(book)
};

logger.info('Reading session started', readingSession);

// 3. Update tracking
updateReadingSession(readingSession);
```

---

## 🚀 Deployment Guidelines

### Build Optimization

**Performance Build Rules**:

- Enable code splitting for epub parsing libraries
- Optimize bundle size for mobile delivery
- Implement progressive loading for large epubs
- Use service workers for offline reading

### Cross-Platform Considerations

**Mobile-First Development**:

- Design for touch interactions
- Optimize for various screen sizes
- Consider battery usage for long reading sessions
- Implement proper offline support

---

## 📝 Documentation Extensions

### Component Documentation

**Epub Component Docs**:

```typescript
/**
 * Renders epub content with customizable styling and navigation.
 * Supports user preferences for font size, theme, and spacing.
 * 
 * @example
 * ```tsx
 * <EpubReader
 *   book={currentBook}
 *   preferences={userPreferences}
 *   onPageChange={handlePageChange}
 * />
 * ```
 * 
 * @see EpubContext for global state management
 * @see useEpubNavigation for navigation controls
 */
```

### API Documentation

**Service Integration Docs**:

- Document epub.js integration points
- Provide examples of custom styling hooks
- Explain progressive loading strategies
- Document accessibility features

---

## 🔄 Code Review Checklist (Project-Specific)

### Functionality

- [ ] Does the epub loading work across different file formats?
- [ ] Are navigation controls intuitive and accessible?
- [ ] Does reading progress persist correctly?
- [ ] Are user preferences applied consistently?

### Performance

- [ ] Is epub content loading optimized for large files?
- [ ] Are re-renders minimized during navigation?
- [ ] Is memory usage reasonable for long reading sessions?
- [ ] Does the app work well on mobile devices?

### Accessibility

- [ ] Are all controls keyboard accessible?
- [ ] Is content properly structured for screen readers?
- [ ] Are color contrasts sufficient for readability?
- [ ] Does the app support various font sizes?

---

## 🎯 Success Metrics

### User Experience Metrics

- **Loading Time**: < 2 seconds for average epub files
- **Navigation Responsiveness**: < 100ms for page turns
- **Memory Usage**: < 50MB for typical reading sessions
- **Battery Impact**: Minimal impact on device battery

### Code Quality Metrics

- **Test Coverage**: > 80% for epub-related functionality
- **Bundle Size**: < 1MB for the core epub reader
- **Performance Score**: > 90 on Lighthouse audits
- **Accessibility Score**: 100 on WCAG compliance

---

**Note**: This clause document extends the universal rules in `baseRules.md`. All universal principles of readability, maintainability, and robustness apply. This document provides project-specific guidance for epub reader development.