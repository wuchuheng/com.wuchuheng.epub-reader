# Technical Context: EPUB Reader Technology Stack

## **Core Technologies**

### **Frontend Framework**

- **React 18**: Component-based UI with concurrent features
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server

### **State Management**

- **Redux Toolkit**: State management with optimized reducers
- **React Hooks**: Local state and side effects

### **Routing**

- **React Router v6**: Navigation and routing with lazy loading

### **Styling**

- **TailwindCSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styling

## **EPUB Integration**

### **EPUB.js**

- Book rendering and navigation
- Table of contents management
- Location persistence

### **Storage**

- **OPFS (Origin Private File System)**: Browser-based file storage
- **LocalStorage**: Settings and configuration persistence

## **AI Integration**

### **OpenAI API**

- **Streaming Responses**: Real-time AI interactions
- **Token Usage Tracking**: Monitor API consumption
- **Reasoning Content**: AI thinking process display

### **AI Features**

- **Conversation Interface**: Chat-like AI interactions
- **Template Processing**: Dynamic prompt replacement
- **Markdown Rendering**: Formatted AI responses
- **Word Highlighting**: Visual emphasis in user messages

## **Development Tools**

### **Build System**

- **Vite**: Optimized builds and development server
- **Code Splitting**: Lazy loading and manual chunks
- **Bundle Optimization**: Vendor separation and size reduction

### **Code Quality**

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting and consistency
- **TypeScript**: Type safety and interface definitions

### **Testing Infrastructure**

- **React Testing Library**: Component testing setup
- **Jest**: Unit testing framework (ready for implementation)

## **Performance Optimization**

### **Rendering**

- **Lazy Loading**: Route-based code splitting
- **Suspense**: Loading states and fallbacks
- **Memoization**: Component and hook optimization

### **Memory Management**

- **Cleanup Patterns**: Proper resource disposal
- **Event Listeners**: Removal and prevention of memory leaks
- **Bundle Size**: Optimized imports and tree shaking

## **Browser Support**

### **Modern Features**

- **Web APIs**: OPFS, Fetch, Clipboard API
- **ES6+**: Modern JavaScript features
- **CSS3**: Modern styling capabilities

### **Compatibility**

- **Chrome/Edge**: Full feature support
- **Firefox**: Good support with some limitations
- **Safari**: Partial support, progressive enhancement

---

_Technology stack overview focusing on what's used, not how it's configured_
