# Project Brief: EPUB Reader Application

## Core Mission

Build a modern, privacy-first EPUB reader web application that combines offline functionality with AI-enhanced reading tools, giving users complete control over their digital library and reading experience.

## Project Vision

"A powerful, privacy-first EPUB reader that combines offline functionality with AI-enhanced reading tools, giving users complete control over their digital library and reading experience."

## Current Status

**🚀 PRODUCTION READY FOR PHASE 3 AI INTEGRATION**

The project has successfully completed **ALL foundational infrastructure** for Phases 1, 2, 5, and 6, and is now **production-ready for immediate Phase 3 AI integration implementation**. All navigation, settings, and context menu systems are in place with proper TypeScript interfaces, responsive design, and comprehensive error handling.

## Essential Requirements

### 1. Book Management System ✅ COMPLETED

- **OPFS Storage**: Leverage Origin Private File System for offline book storage
- **Upload Interface**: Drag-and-drop or file picker for EPUB uploads
- **Library View**: Grid-based bookshelf with cover images and progress tracking
- **Metadata Handling**: Extract and display book titles, authors, progress, and reading statistics

### 2. Core Reading Experience ✅ COMPLETED

- **EPUB Rendering**: Use EPUB.js for accurate book rendering
- **Navigation**: Chapter-based navigation with progress tracking
- **Customization**: Font size, theme (light/dark), and layout preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 3. Enhanced Reading Features 🔄 READY FOR IMPLEMENTATION

- **Table of Contents**: ✅ Collapsible sidebar with chapter navigation
- **Text Selection**: ⏳ Ready for word-level selection with context menus
- **Dictionary Integration**: ⏳ Ready for Eudic API with contextual information
- **AI Explanations**: ⏳ Ready for configurable AI providers (OpenAI, Anthropic, Custom)
- **Custom Tools**: ⏳ Ready for user-defined AI prompts for specialized text analysis
- **Navigation Components**: ✅ Container, BackButton, Breadcrumb with TypeScript interfaces

### 4. Search & Discovery ⏳ FUTURE

- **Full-text Search**: Search within individual books with highlighted results
- **Cross-book Search**: Global search across library (future enhancement)
- **Search History**: Recently searched terms and suggestions

### 5. Progressive Web App ⏳ FUTURE

- **Offline Capability**: Service worker for offline reading
- **Installable**: PWA manifest for native-like installation
- **Performance**: Fast loading, efficient memory management
- **Caching**: Intelligent caching strategies for books and assets

### 6. Settings & Configuration ✅ COMPLETED

- **Settings Pages**: ✅ Context menu settings and general settings with navigation
- **Navigation Components**: ✅ BackButton, Breadcrumb, Container components with sticky headers
- **Configuration Management**: ✅ Complete AI provider configuration and tool management system
- **Advanced Tool Management**: ✅ Full CRUD operations for custom AI tools with validation
- **Form System**: ✅ Dynamic forms for different tool types with real-time feedback
- **Modal System**: ✅ Dialog system for tool creation and editing
- **Persistence**: ✅ LocalStorage integration for settings persistence

## Technical Foundation

### Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: TailwindCSS + CSS Modules
- **Storage**: OPFS + LocalStorage for settings

### Key Dependencies

- **EPUB.js**: Core EPUB parsing and rendering
- **Workbox**: PWA service worker management
- **File System Access API**: For OPFS implementation
- **Dictionary APIs**: Eudic integration
- **AI APIs**: OpenAI/Anthropic/Custom providers

## Success Criteria

### ✅ Completed Success Criteria

1. **Core Functionality**: Users can upload, organize, and read EPUB files offline
2. **Navigation**: Intuitive table of contents and page navigation with persistent reading locations
3. **Type Safety**: 100% TypeScript coverage with zero `any` types
4. **Responsive Design**: Works on desktop, tablet, and mobile devices
5. **Component Architecture**: Clean, maintainable code with proper separation of concerns

### 🔄 Phase 3 Success Criteria (Ready for Implementation)

1. **AI Integration**: Dictionary and AI explanations work seamlessly with configurable providers
2. **Text Selection**: Word-level selection with context menus for instant lookups
3. **Custom Tools**: User-defined AI prompts for specialized text analysis
4. **Settings Management**: Hierarchical settings with consistent navigation patterns
5. **Performance**: Books load within 2 seconds with smooth page navigation and responsive UI

## Scope Boundaries

### Included

- EPUB format support (v2 and v3)
- Offline-first architecture
- Basic reading statistics
- Customizable AI tools
- PWA installation

### Excluded (Future Phases)

- Multi-format support (PDF, MOBI)
- Cloud synchronization
- Social features
- Advanced analytics
- Multi-language UI

## Project Constraints

- **Browser Support**: Chrome 86+, Firefox 102+, Safari 15.2+, Edge 86+
- **Storage**: Client-side only (OPFS + LocalStorage)
- **Dependencies**: Minimal external dependencies for performance
- **Security**: Client-side processing only, no server-side data storage
