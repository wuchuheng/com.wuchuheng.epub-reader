# Active Context: Current Development State

## Current Project State

### Existing Foundation (As of January 2025)

The project currently has a basic React + TypeScript + Vite setup with:

**Implemented Components:**

- Basic Vite development environment
- Redux Toolkit store with counter example
- React Router v6 with minimal routing
- TailwindCSS + LESS styling setup
- ESLint/Prettier configuration

**Current File Structure:**

```
src/
├── config/router.tsx (basic routing)
├── pages/Home/ (placeholder component)
├── store/ (Redux setup with counter slice)
├── types/global.d.ts
└── utils/cssUtil.ts
```

### Immediate Development Focus

**Priority 1: Core Infrastructure Setup**
We need to transform the current starter project into the EPUB reader foundation:

1. **Install Missing Dependencies**

   - EPUB.js for book processing
   - PWA dependencies (Workbox)
   - File system utilities (UUID, JSZip, DOMPurify)
   - TypeScript definitions for OPFS

2. **Update Project Structure**

   - Replace basic Home component with BookshelfPage
   - Create EpubReader, SearchPage, SettingsPage components
   - Set up proper routing for main application pages
   - Create shared components directory

3. **Configure PWA Support**
   - Add Vite PWA plugin
   - Create PWA manifest
   - Set up service worker configuration

**Priority 2: OPFS Storage System**
Implement the core storage layer that everything else depends on:

1. **OPFS Service Implementation**

   - Feature detection for OPFS support
   - Basic file operations (read, write, delete, list)
   - Error handling and fallback strategies
   - Configuration management

2. **Book Metadata Schema**
   - Define TypeScript interfaces for book data
   - Implement metadata extraction from EPUB files
   - Create configuration file structure for OPFS

**Priority 3: Basic Book Management**
Build the foundational book management system:

1. **File Upload System**

   - Drag-and-drop interface
   - File picker fallback
   - File validation and error handling
   - Progress indication for large files

2. **Bookshelf Interface**
   - Grid layout for book display
   - Book card components with cover images
   - Empty state handling
   - Basic book actions (open, delete)

## Development Strategy

### Phase 1: Foundation (Current Focus)

**Goal**: Establish working EPUB reader with basic functionality

**Key Tasks:**

1. Install and configure all required dependencies
2. Set up proper application routing
3. Implement OPFS storage layer
4. Create basic bookshelf with upload capability
5. Integrate EPUB.js for basic reading

**Success Criteria:**

- Users can upload EPUB files and see them in library
- Basic reading interface works with chapter navigation
- PWA can be installed and works offline

### Phase 2: Enhanced Reading Features

**Goal**: Add advanced reading capabilities

**Key Tasks:**

1. Implement Table of Contents sidebar
2. Add text selection and basic popup
3. Integrate Eudic dictionary API
4. Add search functionality within books
5. Implement reading progress tracking

### Phase 3: AI Integration

**Goal**: Add AI-powered features for enhanced reading

**Key Tasks:**

1. Set up AI provider configuration system
2. Implement AI explanation popup tabs
3. Create custom tool management
4. Add responsive tab system
5. Settings page for configuration

## Technical Decisions Made

### Architecture Patterns

- **Component-Based**: React functional components with hooks
- **State Management**: Redux Toolkit for complex state, local state for UI
- **Styling**: TailwindCSS utility-first approach with CSS Modules for components
- **File Organization**: Feature-based folder structure (pages/, components/, services/)

### Storage Strategy

- **Primary**: OPFS for maximum storage and performance
- **Fallback**: IndexedDB for browsers without OPFS support
- **Configuration**: JSON-based metadata stored separately from book files
- **Caching**: Browser cache for static assets, memory cache for active content

### Build Configuration

- **Bundling**: Vite with manual chunk optimization for better loading
- **PWA**: Workbox integration for offline functionality
- **TypeScript**: Strict mode enabled for maximum type safety
- **Code Quality**: ESLint + Prettier with pre-commit hooks

## Current Challenges & Solutions

### Challenge 1: OPFS Browser Support

**Issue**: Limited browser support for OPFS feature
**Solution**: Implement feature detection with graceful fallback to IndexedDB
**Status**: Architecture planned, implementation pending

### Challenge 2: Large EPUB File Handling

**Issue**: Memory management for large books (50MB+)
**Solution**: Implement chapter-based lazy loading and cleanup strategies
**Status**: Patterns defined, implementation pending

### Challenge 3: AI API Integration Security

**Issue**: Secure storage and handling of API keys
**Solution**: Client-side encryption for local storage, no server-side persistence
**Status**: Security patterns documented, implementation pending

## Development Environment

### Current Setup Status

- ✅ Node.js 18+ environment ready
- ✅ Vite development server configured
- ✅ TypeScript strict mode enabled
- ✅ TailwindCSS integrated
- ✅ ESLint + Prettier configured
- ❌ PWA plugin not yet added
- ❌ EPUB.js not yet installed
- ❌ Testing framework not configured

### Next Steps for Environment

1. Add PWA dependencies and configuration
2. Install EPUB processing libraries
3. Set up testing framework (Vitest + Playwright)
4. Configure additional development tools

## Key Files to Monitor

### Critical Configuration Files

- `package.json`: Dependency management and scripts
- `vite.config.ts`: Build configuration and PWA setup
- `tailwind.config.js`: Styling system configuration
- `tsconfig.json`: TypeScript compiler settings

### Implementation Priority Files

1. **src/services/OPFSManager.ts**: Core storage implementation
2. **src/components/BookshelfPage/BookshelfPage.tsx**: Main library interface
3. **src/components/EpubReader/EpubReader.tsx**: Reading interface
4. **src/store/slices/**: Redux state management

## Recent Learnings & Patterns

### EPUB.js Integration Insights

- Requires specific configuration for security (disable script execution)
- Memory management critical for large books
- TOC extraction needs custom parsing for different EPUB structures
- Cover image extraction varies by EPUB format

### OPFS Implementation Notes

- Feature detection must include actual write test, not just API presence
- Error handling crucial for quota exceeded scenarios
- Metadata should be stored separately for faster library loading
- Atomic operations prevent corruption during upload

### PWA Development Considerations

- Service worker registration must handle update scenarios
- Cache strategies need customization for large EPUB files
- Manifest configuration affects installation behavior
- Offline detection needed for graceful degradation

## Next Session Priorities

When development resumes, focus should be on:

1. **Immediate Actions (0-2 hours)**

   - Install missing dependencies (EPUB.js, PWA tools)
   - Update router configuration for main app pages
   - Create basic page components (Bookshelf, Reader, Settings)

2. **Short-term Goals (2-8 hours)**

   - Implement OPFS service layer
   - Create basic bookshelf with upload functionality
   - Integrate EPUB.js for basic reading

3. **Medium-term Objectives (1-2 weeks)**
   - Add TOC sidebar and text selection
   - Implement dictionary integration
   - Create settings page with basic configuration

## Code Patterns to Follow

### Component Structure

```typescript
// Standard component pattern
interface ComponentProps {
  // Explicit prop types
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks and state
  // 2. Effect hooks
  // 3. Event handlers
  // 4. Render logic

  return (
    <div className="component-container">
      {/* JSX with semantic HTML */}
    </div>
  );
};
```

### Service Layer Pattern

```typescript
// Three-phase pattern for all operations
class ServiceName {
  async operationName(input: InputType): Promise<OutputType> {
    // 1. Input handling - validation, preprocessing
    // 2. Core processing - main logic
    // 3. Output handling - formatting, cleanup
  }
}
```

### Error Handling Pattern

```typescript
// Consistent error handling across services
try {
  // Operation
} catch (error) {
  const handledError = ErrorHandler.handle(error, context);
  // Log, notify user, attempt recovery
  throw handledError;
}
```

## Integration Points to Consider

### External APIs

- **Eudic Dictionary**: CORS considerations, iframe embedding
- **AI Providers**: Rate limiting, error handling, fallback strategies
- **File System**: Browser compatibility, permission handling

### Performance Bottlenecks

- **EPUB Loading**: Large file parsing and memory usage
- **Search Operations**: Full-text indexing for multiple books
- **UI Responsiveness**: Smooth text selection and popup rendering

### Security Considerations

- **Content Sanitization**: User-generated AI prompts
- **API Key Storage**: Encryption for local storage
- **CSP Configuration**: Iframe embedding for dictionary API
