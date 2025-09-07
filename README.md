# EPUB Reader with AI Integration

<p align="center">
  <a href="https://github.com/wuchuheng/com.wuchuheng.epub-reader">
    <img src="https://img.shields.io/badge/version-0.0.8-blue" alt="Version" />
  </a>
  <a href="https://github.com/wuchuheng/com.wuchuheng.epub-reader">
    <img src="https://img.shields.io/badge/status-Phase%203%20AI%20Integration%20%2890%25%29-yellow" alt="Status" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-18.3.1-61DAFB" alt="React" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6" alt="TypeScript" />
  </a>
</p>

A modern EPUB reader application with AI-powered text analysis and conversation capabilities. Built with React and TypeScript, featuring a clean interface, advanced reading features, and sophisticated AI integration.

## 📖 Overview

The EPUB Reader is a cutting-edge reading application that combines traditional EPUB reading capabilities with advanced AI-powered text analysis. Currently in Phase 3 of AI Integration (90% complete), the project offers a comprehensive reading experience with real-time AI conversations, multiple navigation methods, and mobile-optimized interactions.

### Current Status

- **Version**: v0.0.8
- **Development Phase**: Phase 3 AI Integration - 90% Complete
- **Focus**: Final polish and remaining minor features
- **Next Milestone**: Complete feature implementation and optimization

### Target Audience

- **Students & Researchers**: AI-powered text analysis and explanations
- **Casual Readers**: Modern reading experience with AI assistance
- **Power Users**: Advanced customization and extensible AI tools
- **Mobile Users**: Optimized interface with volume key navigation

## ✨ Features

### 📚 Core Reading Experience

- **Full EPUB Support**: Complete EPUB book rendering with CFI-based navigation
- **Table of Contents**: Interactive chapter navigation with progress tracking
- **Reading Progress**: Automatic save and restore of reading position across sessions
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile devices
- **OPFS Storage**: Efficient browser-based file management and storage

### 🤖 AI Integration (90% Complete)

- **Smart Text Analysis**: Select any text for instant AI-powered explanations
- **Real-time Conversations**: Chat with AI about book content with streaming responses
- **Context-Aware Analysis**: AI understands paragraph context and selected text relationships
- **Thinking Process**: View AI's reasoning with foldable display for transparency
- **Usage Monitoring**: Real-time tracking of token consumption and API costs
- **Template Processing**: Dynamic prompt replacement with context variables
- **Word Highlighting**: Automatic emphasis of analyzed words in user messages

### 🧭 Advanced Navigation

- **Multiple Navigation Methods**: Choose preferred navigation style
  - **Keyboard Navigation**: Arrow key support with intelligent text selection detection
  - **Volume Key Navigation**: Mobile device volume keys for page turning
  - **Dedicated Buttons**: Custom next/previous page controls with proper styling
  - **Touch Support**: Long press and gesture support for mobile devices
- **Smart Auto-scroll**: Intelligent scrolling behavior that respects user interaction patterns
- **Progress Tracking**: Visual progress indicators and chapter completion status

### 🎨 User Interface

- **Modern Design**: Clean, intuitive interface with TailwindCSS styling
- **Context Menu System**: Right-click access to AI tools and iframe features
- **Settings Management**: Comprehensive configuration interface for AI behavior and preferences
- **Mobile Optimization**: Touch-optimized interface with responsive design
- **Accessibility Features**: ARIA labels and keyboard navigation support
- **Enhanced Security**: API configuration with password visibility toggle

## 🛠 Technology Stack

### Frontend Framework

- **React 18**: Component-based UI with concurrent features and hooks
- **TypeScript**: Type safety and better development experience (100% coverage)
- **Vite**: Fast build tool and development server with HMR

### State Management & Routing

- **Redux Toolkit**: State management with optimized reducers and middleware
- **React Hooks**: Local state and side effects management
- **React Router v6**: Navigation and routing with lazy loading
- **Redux Thunk**: Async action handling for API calls

### Styling & UI

- **TailwindCSS**: Utility-first CSS framework with custom configuration
- **CSS Modules**: Component-scoped styling for specific components
- **React Icons**: Comprehensive icon library
- **Less**: CSS preprocessor for advanced styling needs

### EPUB & Storage

- **EPUB.js**: Book rendering and navigation with CFI support
- **OPFS (Origin Private File System)**: Browser-based file storage for books
- **LocalStorage**: Settings and configuration persistence
- **jszip**: ZIP file handling for EPUB processing

### AI Integration

- **OpenAI API**: Streaming responses with token usage tracking
- **React Markdown**: Markdown rendering with GFM support
- **dompurify**: HTML sanitization for security
- **Template Processing**: Dynamic prompt replacement with variables

### Development Tools

- **ESLint**: Code linting and style enforcement with React rules
- **Prettier**: Code formatting with Tailwind plugin
- **PostCSS**: CSS processing with autoprefixer
- **EditorConfig**: Consistent editor configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Modern web browser with OPFS support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/wuchuheng/com.wuchuheng.epub-reader.git
   cd com.wuchuheng.epub-reader
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Building for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 📖 Usage

### Basic Reading

1. **Upload Books**: Drag and drop EPUB files to your personal library
2. **Start Reading**: Click any book to begin reading
3. **Navigate**: Use your preferred navigation method:
   - **Desktop**: Arrow keys or dedicated navigation buttons
   - **Mobile**: Volume keys, touch gestures, or on-screen buttons
4. **Track Progress**: Your reading position is automatically saved

### AI Features

1. **Text Analysis**: Select any text in the book for AI analysis
2. **Context Menu**: Right-click selected text for quick AI access
3. **Conversations**: Chat with AI about book content with real-time responses
4. **Custom Prompts**: Create personalized AI analysis tools in settings

> 💡 **Pro Tip**: Check out [`prompt-samples.md`](./prompt-samples.md) for ready-to-use context menu prompt templates! This file contains comprehensive AI prompt templates for vocabulary analysis, context analysis, and translation that you can easily add to your context menu settings.

### Settings & Customization

1. **AI Configuration**: Set up OpenAI API keys and preferences
2. **Navigation Options**: Choose your preferred navigation method
3. **Tool Management**: Configure AI tools and context menu options
4. **Data Management**: Control storage and privacy settings

## 🏗 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── epub/           # EPUB-specific components
│   ├── layout/         # Layout and navigation
│   └── ui/            # Base UI elements
├── pages/             # Page-level components
│   ├── EpubReader/    # Main reading interface
│   ├── HomePage/      # Book library
│   └── SettingsPage/  # Configuration
├── hooks/             # Custom React hooks
├── services/          # External integrations
├── store/             # Redux state management
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── config/            # Application configuration
```

### Key Architectural Patterns

#### Service Architecture

- **Separation of Concerns**: Dedicated services for rendition events and selection handling
- **Clean Event Setup**: Centralized event configuration with proper cleanup
- **Debounced Operations**: User interactions optimized with debouncing

#### Component Patterns

- **Hook Pattern**: Consolidated business logic in custom hooks
- **Three-Phase Processing**: Input validation → Core processing → Output handling
- **Type Safety**: 100% TypeScript coverage with zero 'any' types

#### State Management

- **Redux Toolkit**: Efficient state management with optimized reducers
- **Async Thunks**: Clean handling of API calls and side effects
- **Local State**: React hooks for component-level state management

### Code Standards

- **ESLint**: Strict linting with React and TypeScript rules
- **Prettier**: Consistent code formatting with Tailwind plugin
- **TypeScript**: Full type safety with comprehensive interface definitions
- **Component Structure**: Consistent organization with clear separation of concerns

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the existing code style and patterns**
4. **Ensure all code passes linting**: `npm run lint`
5. **Test your changes thoroughly**
6. **Submit a pull request with a clear description**

### Code Standards

- Use TypeScript for all new code
- Follow the established component patterns
- Implement proper error handling and cleanup
- Add JSDoc comments for public APIs
- Use the three-phase processing pattern for complex functions

### Testing

- Currently in development - testing infrastructure is configured
- React Testing Library and Jest are set up
- Component and integration tests should be added for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **EPUB.js**: For robust EPUB rendering and navigation
- **OpenAI**: For powering the AI integration capabilities
- **React Community**: For the excellent framework and ecosystem
- **TailwindCSS**: For the utility-first CSS framework

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

For more information about the project development status and architecture, see the [memory bank](.memory-bank/) directory.
