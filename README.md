# Immersive Reader(沉浸式阅读器)

<p align="center">
  <a href="https://github.com/wuchuheng/com.wuchuheng.epub-reader">
    <img src="https://img.shields.io/badge/version-0.0.9-blue" alt="Version" />
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

## 📖 Overview

"Immersive Reader" is based on Context-based AI technology, designed to enhance the reading experience by providing instant explanations and answers to questions that arise during reading.

When reading, people often encounter unfamiliar words or concepts that require further explanation. Additionally, readers may have extended questions related to the current context. If these questions cannot be answered quickly and effectively, it can lead to interruptions in the reading flow and a diminished experience.

The inefficiency in reading stems from the need to interrupt the flow to seek answers when encountering unavoidable questions. These questions can be categorized into two types: semantic questions, such as encountering unfamiliar words, and extended questions, which arise from the current context. If either type of question cannot be resolved quickly and effectively, the reading experience suffers.

So, how does the traditional process of seeking answers consume time?

How do unfamiliar words waste time? When you look up an unfamiliar word in a dictionary, you face information overload. The dictionary presents all possible definitions, ranging from a few to dozens, forcing you to spend time filtering through the options. Furthermore, and more time-consuming, is the inability to make a correct judgment due to a lack of background knowledge.

Another cause of reading interruption is extended questions. These questions typically cannot be resolved with indexed tools like dictionaries and often require searching online or asking others for the answer. However, this process is very time-consuming.

In essence, the smoothness of the reading experience depends on the efficiency with which questions are answered. This is precisely why this tool was created.

To provide immediate and precise answers to unfamiliar words, the reader sends the selected word and its surrounding context to the AI. This allows the AI to pinpoint the exact meaning of the word as it applies to the specific context, thereby saving time.

Furthermore, to quickly address the reader's extended questions, when a user queries the AI, it generates answers based on the current contextual information.

Through these features, the overall reading experience is enhanced.

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

## 📋 TODO List

The following features and improvements are currently in development or planned for future releases:

- [x] Implement the autoscroll guard feature in the context menu.
- [ ] Simplify the upload UI,
- [ ] Upload epub files while users drag them into the window.
- [ ] Add a switch to enable the specified context menu item.
- [ ] Add a settings icon to the home page.
- [ ] Make the input box of the prompt adjustable in size.
- [ ] Add built-in prompt recommendations.
- [ ] Make the app support PWA features.
- [x] The page-turning keys should be centered at the top and bottom.
- [ ] Volume keys should be used for page turning. We could play MP3 files (without metadata) and listen for volume changes when users tap the volume keys.

- [x] Minimize menu bar icons and page-turning icons to give as much space as possible to display book content.
- [ ] Add a built-in context menu component that serves as an aggregated translation component supporting multiple translations, with customizable enable/disable functionality.

  - [ ] 有道翻译
  - [ ] DeepL在线翻译引擎
  - [ ] Google在线翻译
  - [ ] 腾讯交互式在线翻译引擎
  - [ ] 火山在线翻译引擎
  - [ ] Bing在线翻译引擎

  - [x] Issue: AI context menu tab switching was unsuccessful when users attempted to switch tabs; consequently, the tab body was not visible for the expected tab.

- [x] Issue: Make the cursor in the prompt input bar automatically focused when the input bar is displayed.

- [ ] Issue: AI completion suggestions are not stopping when the component is destroyed.

- [x] Issue: Context menu appears when users click on blank areas, which is unexpected behavior.

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
