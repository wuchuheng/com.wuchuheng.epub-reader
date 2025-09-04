# Technical Context: EPUB Reader Technology Stack

## **Core Technologies**

### **Frontend Framework**

- **React 18**: Component-based UI with concurrent features and hooks
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server with HMR

### **State Management**

- **Redux Toolkit**: State management with optimized reducers and middleware
- **React Hooks**: Local state and side effects management
- **Redux Thunk**: Async action handling for API calls

### **Routing**

- **React Router v6**: Navigation and routing with lazy loading
- **Dynamic Routes**: Parameter-based routing for book IDs

### **Styling**

- **TailwindCSS**: Utility-first CSS framework with custom configuration
- **CSS Modules**: Component-scoped styling for specific components
- **Less**: CSS preprocessor for advanced styling needs

## **EPUB Integration**

### **EPUB.js**

- Book rendering and navigation with CFI support
- Table of contents management and chapter tracking
- Location persistence and progress tracking
- Range selection and text extraction
- Event handling for rendition and user interactions

### **Storage**

- **OPFS (Origin Private File System)**: Browser-based file storage for books
- **LocalStorage**: Settings and configuration persistence
- **Custom Storage Managers**: Type-safe storage abstractions

## **AI Integration**

### **OpenAI API**

- **Streaming Responses**: Real-time AI interactions with chunked responses
- **Token Usage Tracking**: Monitor API consumption and costs
- **Reasoning Content**: AI thinking process display with foldable interface
- **Multiple Models**: Support for various OpenAI model types

### **AI Features**

- **Conversation Interface**: Chat-like AI interactions with message history
- **Template Processing**: Dynamic prompt replacement with variables
- **Markdown Rendering**: Formatted AI responses with GFM support
- **Word Highlighting**: Visual emphasis in user messages
- **Context Awareness**: Paragraph-level text context extraction

## **Service Architecture**

### **Event Management**

- **Service Separation**: Dedicated services for rendition events and selection handling
- **Clean Event Setup**: Centralized event configuration with proper cleanup
- **Debounced Operations**: User interactions optimized with debouncing
- **State Coordination**: Coordinated state updates between services

### **Text Processing**

- **Word Boundary Detection**: Advanced text selection with intelligent boundary detection
- **Context Extraction**: Paragraph-level context extraction for AI analysis
- **Selection Management**: Sophisticated text selection with range manipulation

## **Navigation Systems**

### **Enhanced Navigation**

- **Keyboard Navigation**: Arrow key support for desktop navigation
- **Volume Key Navigation**: Mobile device volume key support for page turning
- **Dedicated Buttons**: Custom next/previous page buttons with proper styling
- **Touch Support**: Long press and touch event handling for mobile devices

## **Context Menu System**

### **Dynamic Context Menu**

- **Multi-Tool Support**: AI tools and iframe tools in unified interface
- **Dynamic Loading**: Settings loaded from OPFS on demand
- **Tab Management**: Seamless switching between different tool types
- **Context Injection**: Selected text and context passed to tools

## **Development Tools**

### **Build System**

- **Vite**: Optimized builds and development server
- **Code Splitting**: Lazy loading and manual chunks for vendors
- **Bundle Optimization**: Vendor separation and size reduction
- **ES Modules**: Modern module system support

### **Code Quality**

- **ESLint**: Code linting and style enforcement with React rules
- **Prettier**: Code formatting and consistency with Tailwind plugin
- **TypeScript**: Type safety and interface definitions
- **EditorConfig**: Consistent editor configuration across team

### **Testing Infrastructure**

- **React Testing Library**: Component testing setup (ready for implementation)
- **Jest**: Unit testing framework (configured but not yet implemented)
- **Type Checking**: Comprehensive TypeScript coverage

## **Performance Optimization**

### **Rendering**

- **Lazy Loading**: Route-based code splitting with Suspense
- **Memoization**: Component and hook optimization with React.memo
- **Debouncing**: User interaction optimization for text selection
- **Virtual Scrolling**: Efficient rendering for long content (planned)

### **Memory Management**

- **Cleanup Patterns**: Proper resource disposal in useEffect
- **Event Listeners**: Removal and prevention of memory leaks
- **Timer Management**: Cleanup for debounced operations
- **Service Separation**: Clean separation of concerns for better resource management

### **Bundle Size**

- **Optimized Imports**: Efficient import strategies
- **Tree Shaking**: Removal of unused code
- **Vendor Separation**: Manual chunking for better caching
- **Lazy Loading**: On-demand loading of components and routes

## **Utility Libraries**

### **Core Utilities**

- **jszip**: ZIP file handling for EPUB processing
- **dompurify**: HTML sanitization for security
- **dayjs**: Date and time manipulation
- **uuid**: Unique identifier generation
- **@wuchuheng/helper**: Utility functions for common operations including debouncing

### **UI Components**

- **React Icons**: Comprehensive icon library
- **React Markdown**: Markdown rendering with plugin support
- **remark-gfm**: GitHub Flavored Markdown support

### **Drag and Drop**

- **@dnd-kit/core**: Modern drag and drop functionality
- **@dnd-kit/sortable**: Sortable list support
- **@dnd-kit/utilities**: Utility functions for DnD operations

## **Browser Support**

### **Modern Features**

- **Web APIs**: OPFS, Fetch, Clipboard API, File System Access
- **ES6+**: Modern JavaScript features and syntax
- **CSS3**: Modern styling capabilities with custom properties
- **Web Workers**: Background processing for heavy operations (planned)

### **Compatibility**

- **Chrome/Edge**: Full feature support with latest APIs
- **Firefox**: Good support with some limitations on OPFS
- **Safari**: Partial support, progressive enhancement approach
- **Mobile**: Touch-optimized interface with responsive design and volume key navigation

---

_Technology stack overview focusing on what's used, not how it's configured_
