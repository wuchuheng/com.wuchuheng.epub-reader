# Project Brief: EPUB Reader Application

## Core Mission

Build a modern, offline-capable EPUB reader web application that provides rich reading experiences with advanced features like dictionary integration, AI-powered explanations, and comprehensive book management.

## Essential Requirements

### 1. Book Management System

- **OPFS Storage**: Leverage Origin Private File System for offline book storage
- **Upload Interface**: Drag-and-drop or file picker for EPUB uploads
- **Library View**: Grid-based bookshelf with cover images and progress tracking
- **Metadata Handling**: Extract and display book titles, authors, progress, and reading statistics

### 2. Core Reading Experience

- **EPUB Rendering**: Use EPUB.js for accurate book rendering
- **Navigation**: Chapter-based navigation with progress tracking
- **Customization**: Font size, theme (light/dark), and layout preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 3. Enhanced Reading Features

- **Table of Contents**: Collapsible sidebar with chapter navigation
- **Text Selection**: Word-level selection triggering context menus
- **Dictionary Integration**: Eudic API for definitions with contextual information
- **AI Explanations**: Configurable AI providers (OpenAI, Anthropic, Custom) for text explanations
- **Custom Tools**: User-defined AI prompts for specialized text analysis

### 4. Search & Discovery

- **Full-text Search**: Search within individual books with highlighted results
- **Cross-book Search**: Global search across library (future enhancement)
- **Search History**: Recently searched terms and suggestions

### 5. Progressive Web App

- **Offline Capability**: Service worker for offline reading
- **Installable**: PWA manifest for native-like installation
- **Performance**: Fast loading, efficient memory management
- **Caching**: Intelligent caching strategies for books and assets

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

1. **Functionality**: Users can upload, organize, and read EPUB files offline
2. **Performance**: Books load within 2 seconds, smooth page navigation
3. **Features**: Dictionary and AI explanations work seamlessly
4. **Compatibility**: Works on modern browsers with OPFS support
5. **User Experience**: Intuitive interface matching modern reading applications

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
