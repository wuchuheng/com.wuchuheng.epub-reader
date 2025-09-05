<!-- cspell:ignore Eudic -->

# EPUB Reader - Software Design Document

## 1. Introduction

### 1.1 Purpose

Document the architecture and implementation details of the EPUB reader application.

### 1.2 Goals and Objectives

- Provide offline EPUB reading capabilities
- Implement fast loading via PWA
- Support book management via OPFS
- Enable rich reading features

### 1.3 Scope

Covers frontend implementation using React, TypeScript and related technologies.

## 2. Architecture Overview

### 2.1 Tech Stack

- React 18 with TypeScript
- Vite build system
- Redux Toolkit state management
- React Router v6 navigation
- TailwindCSS styling
- EPUB.js for rendering
- Workbox for PWA

### 2.2 System Architecture Diagram

```
sequenceDiagram
    User->>ReaderView: Selects text
    ReaderView->>SelectionHandler: Capture context
    SelectionHandler->>DictionaryService: Extract section + query
    DictionaryService->>ReaderView: Display iframe with results
```

### 2.3 Folder Structure

```
src/
├── pages/
│   ├── BookshelfPage/
│   │   └── BookshelfPage.tsx       # Main library/bookshelf view
│   ├── SearchPage/
│   │   └── SearchPage.tsx          # Global book search
│   ├── EpubReader/
│   │   └── EpubReader.tsx          # EPUB reading interface
│   └── SettingsPage/
│       └── SettingsPage.tsx        # Settings and configuration
├── components/                      # Shared components
│   ├── BookCard/
│   ├── DictionaryPopup/
│   ├── TOCSidebar/
│   ├── TopMenuBar/
│   └── common/
├── config/
│   └── router.tsx                   # React Router configuration
├── store/                          # Redux Toolkit store
│   ├── index.ts
│   └── slices/
├── types/                          # TypeScript definitions
├── utils/                          # Utility functions
├── assets/                         # Static assets
└── hooks/                          # Custom React hooks
```

## 3. Core Functionality

### 3.1 Bookshelf Management

#### UI Components:

- Book cards with:
  - Cover images
  - Reading progress
  - Titles
- Upload button (+ icon)
- Empty state handling

#### OPFS Implementation:

##### File Structure:

```
books/
    book1.epub
    book2.epub
config.json
```

##### Configuration Schema:

```typescript
interface BookMetadata {
  name: string; // Display name
  path: string; // OPFS path (e.g., 'books/book1.epub')
  createdAt: number; // Unix timestamp
  progress?: number; // 0-100 reading percentage
  lastRead?: number; // Last accessed timestamp
  size?: string; // Human-readable file size
}

interface OPFSConfig {
  version: 1;
  books: BookMetadata[];
}
```

##### Key Operations:

1. **File Upload**:

```typescript
async function uploadToOPFS(file: File) {
  // 1. Request file system access
  const root = await navigator.storage.getDirectory();

  // 2. Create books directory if needed
  const booksDir = await root.getDirectoryHandle('books', { create: true });

  // 3. Write file to OPFS
  const fileHandle = await booksDir.getFileHandle(file.name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();

  // 4. Update config
  await updateConfig(file.name, file.size);
}
```

2. **Config Management**:

```typescript
async function updateConfig(filename: string, size: number) {
  const configFile = await root.getFileHandle('config.json', { create: true });
  const config = await readConfig();

  config.books.push({
    name: filename.replace('.epub', ''),
    path: `books/${filename}`,
    createdAt: Date.now(),
    size: formatFileSize(size),
  });

  await writeConfig(config);
}
```

##### Error Handling:

- File size validation (max 100MB)
- Duplicate file detection
- Storage quota checks

### 3.2 EPUB Reader Features

#### 3.2.1 Core Reading Experience

- EPUB.js integration for rendering
- Page navigation controls
- Column-based layout
- Font size adjustment
- Theme customization (light/dark)

#### 3.2.2 Table of Contents Sidebar

**UI Behavior:**

- Left sidebar overlay/slide-in triggered by TOC icon
- Displays EPUB chapter hierarchy with navigation
- Auto-close on chapter selection or outside click
- Responsive collapse on mobile devices

**Implementation:**

```typescript
interface TOCItem {
  id: string;
  label: string;
  href: string;
  level: number; // 0=chapter, 1=subsection, etc.
  children?: TOCItem[];
}

interface TOCSidebarProps {
  toc: TOCItem[];
  currentLocation: string;
  onNavigate: (href: string) => void;
  onClose: () => void;
  isOpen: boolean;
}
```

**Visual Structure:**

```
┌──────────────────┐
│ Table of Contents │
├──────────────────┤
│ Chapter 1        │ ←active
│   1.1 Introduction│
│   1.2 Overview   │
│ Chapter 2        │
│   2.1 Setup      │
│ Chapter 3        │
└──────────────────┘
```

#### 3.2.3 Enhanced Dictionary Popup System

**Text Selection Behavior:**

- **Minimum Unit**: Complete words only (word-boundary detection)
- **Single Click**: Select single word → trigger popup
- **Click & Drag**: Multi-word selection with highlight → popup on release
- **Context Extraction**: Surrounding paragraph/sentence for API calls

**API Integration:**

```typescript
const EUDIC_API =
  'https://dict.eudic.net/dicts/MiniDictSearch2?word={{word}}&context={context}&platform=extension';

interface SelectionContext {
  selectedText: string;
  contextText: string; // Surrounding paragraph
  startOffset: number;
  endOffset: number;
}
```

**Kindle-Style Popup UI:**

```
┌─────────────────────────────────────────┐
│                                         │
│         [Dictionary iframe content]     │
│                                         │
├─────────────────────────────────────────┤
│ Dictionary │   AI   │ Custom │ Tool1 │..│
│  (active)  │        │ Tools  │       │  │
└─────────────────────────────────────────┘
```

**Tab System:**

1. **Dictionary Tab (Default)**: Eudic API iframe integration
2. **AI Tab**: AI-powered explanations and translations
3. **Custom Tools Tab**: User-defined AI prompts
4. **Dynamic Tabs**: Additional custom tools created by user

**Popup Behavior:**

- Position near selected text (above/below based on viewport)
- Click outside to close
- Escape key to close
- Tab switching preserves context

#### 3.2.4 Search System

- Full-text search across book content
- Results highlighting with context
- Chapter-based result grouping
- Search history and suggestions

#### 3.2.5 Top Menu Bar System

**Updated Menu Structure:**

```
┌─────────────────────────────────────────┐
│ [☰] [🔍] [⚙] EPUB Reader    [⛶]       │
└─────────────────────────────────────────┘
  TOC Search Settings           Fullscreen
```

**Menu Actions:**

- **TOC Icon (☰)**: Toggle Table of Contents sidebar
- **Search Icon (🔍)**: Open search overlay
- **Settings Icon (⚙)**: Navigate to Settings page
- **Fullscreen Icon (⛶)**: Toggle fullscreen mode

### 3.3 Settings Page & Custom AI Tool Management

#### 3.3.1 Settings Page Structure

**Navigation Route:** `/settings`

**Page Layout:**

```
┌─────────────────────────────────────────┐
│  ← Back to Reader    Settings           │
├─────────────────────────────────────────┤
│                                         │
│ 📚 Reading Preferences                  │
│ 🎨 Appearance                          │
│ 🔧 Context Menu Configuration          │
│ 📱 Application Settings                 │
│                                         │
└─────────────────────────────────────────┘
```

#### 3.3.2 Context Menu Configuration Section

**Custom AI Tools Manager:**

```
Context Menu Configuration
├─────────────────────────────────────────┤
│ Default Dictionary Settings             │
│ ☑ Enable Eudic Dictionary              │
│ ☑ Show context in popup                │
│                                         │
├─────────────────────────────────────────┤
│ AI Tools Configuration                  │
│ ☑ Enable AI explanations               │
│                                         │
│ Provider: ○ OpenAI ● Anthropic ○ Custom│
│ Model: [claude-3-haiku ▼]               │
│ API URL: [https://api.anthropic.com...] │
│ API Token: [sk-ant-***************] [👁]│
│                                         │
│ Advanced Settings: [▼ Show]             │
│ ├─ Max Tokens: [────●──] 1000           │
│ ├─ Temperature: [──●────] 0.3           │
│ └─ Custom Prompt: [Edit System Prompt] │
│                                         │
│ Connection: [Test Connection] ✅        │
│                                         │
├─────────────────────────────────────────┤
│ Custom Tools                    [+ Add] │
│                                         │
│ ┌─ Custom Tool 1 ──────────── [Edit][×]│
│ │ Name: "Simple Explanation"            │
│ │ Prompt: "Explain like I'm 5..."       │
│ │ Status: Active                        │
│ └───────────────────────────────────────│
│                                         │
│ ┌─ Custom Tool 2 ──────────── [Edit][×]│
│ │ Name: "Spanish Translation"           │
│ │ Prompt: "Translate to Spanish..."     │
│ │ Status: Active                        │
│ └──────────────────────────────────────│
```

#### 3.3.3 Custom Tool Creation Flow

**Add New Tool Dialog:**

```typescript
interface CustomAITool {
  id: string;
  name: string;
  shortName?: string; // Optional short name for narrow screens (e.g., "Dict" for "Dictionary")
  prompt: string;
  isActive: boolean;
  createdAt: number;
  order: number;
}

interface CustomToolFormData {
  name: string; // Display name for tab
  shortName?: string; // Optional short name for responsive display
  prompt: string; // AI prompt template with {selectedText} and {context} variables
}
```

**Creation Dialog UI:**

```
┌─────────────────────────────────────────┐
│           Create Custom Tool            │
├─────────────────────────────────────────┤
│ Tool Name: [_________________]          │
│ Short Name (optional): [________]       │
│ ┌────────────────────────────────────── │
│ │ 💡 Short name used when screen       │
│ │ space is limited (e.g., "Spanish"    │
│ │ instead of "Spanish Translation")    │
│ └────────────────────────────────────── │
│                                         │
│ AI Prompt:                              │
│ ┌─────────────────────────────────────┐ │
│ │ Explain "{selectedText}" in the     │ │
│ │ context of "{context}" using        │ │
│ │ simple language suitable for        │ │
│ │ beginners.                          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Variables available:                    │
│ • {selectedText} - Selected word/phrase │
│ • {context} - Surrounding text         │
│                                         │
│           [Cancel]  [Create]            │
└─────────────────────────────────────────┘
```

#### 3.3.4 Dynamic Tab Management

**Tab Order & Display:**

- Dictionary (fixed first position)
- AI (fixed second position)
- Custom Tools (fixed third position)
- Dynamic custom tools (user-defined order)

**Tab State Management:**

```typescript
interface DictionaryPopupState {
  isOpen: boolean;
  selectedText: string;
  contextText: string;
  activeTab: string; // 'dictionary' | 'ai' | 'custom' | custom-tool-id
  position: { x: number; y: number };
  customTools: CustomAITool[];
}

interface TabConfig {
  id: string;
  name: string;
  shortName?: string; // Optional short name for responsive display
  type: 'default' | 'custom';
  component: React.ComponentType<TabProps>;
  isActive: boolean;
}
```

**Dynamic Tab Rendering:**

```typescript
const renderTabs = () => {
  const defaultTabs = ['dictionary', 'ai', 'custom'];
  const customTabs = customTools.filter(tool => tool.isActive);

  return [...defaultTabs, ...customTabs].map(tab => (
    <TabButton key={tab.id} active={activeTab === tab.id}>
      {tab.name}
    </TabButton>
  ));
};
```

#### 3.3.6 Responsive Tab Display System

**Purpose:**
Handle limited screen width scenarios by automatically switching to shorter tab names when needed.

**Default Short Names:**

```typescript
const DEFAULT_TAB_NAMES = {
  dictionary: { name: 'Dictionary', shortName: 'Dict' },
  ai: { name: 'AI', shortName: 'AI' }, // Already short
  custom: { name: 'Custom Tools', shortName: 'Tools' },
};
```

**Tab Width Calculation Logic:**

```typescript
interface TabDisplayManager {
  calculateTabWidth(tabName: string): number;
  shouldUseShortNames(tabs: TabConfig[], containerWidth: number): boolean;
  getDisplayName(tab: TabConfig, useShort: boolean): string;
}

const useResponsiveTabNames = (tabs: TabConfig[], containerRef: RefObject<HTMLElement>) => {
  const [useShortNames, setUseShortNames] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const tabPadding = 16; // px padding per tab
    const minTabWidth = 60; // minimum viable tab width

    // 1. Calculate total width needed for full names
    const fullNameWidth = tabs.reduce((total, tab) => {
      return total + calculateTextWidth(tab.name) + tabPadding;
    }, 0);

    // 2. Switch to short names if full names exceed container
    if (fullNameWidth > containerWidth - 20) {
      // 20px buffer
      const shortNameWidth = tabs.reduce((total, tab) => {
        const displayName = tab.shortName || tab.name;
        return total + calculateTextWidth(displayName) + tabPadding;
      }, 0);

      // 3. Only use short names if they actually fit better
      setUseShortNames(shortNameWidth <= containerWidth - 20);
    } else {
      setUseShortNames(false);
    }
  }, [tabs, containerRef]);

  return useShortNames;
};
```

**Progressive Shortening Strategy:**

1. **Full Names First**: Always try to display full names when space allows
2. **Automatic Detection**: Monitor tab container width changes (resize, orientation)
3. **Smart Fallback**: Only switch to short names if they provide meaningful space savings
4. **Mixed Mode**: In future versions, could show some tabs short, others full based on priority

**Responsive Behavior:**

- **Desktop**: Usually display full names unless many custom tools are active
- **Tablet**: Mixed approach based on orientation and tool count
- **Mobile**: Automatically prefer short names for better UX
- **Dynamic**: Responds to window resize and device rotation

**Implementation Details:**

```typescript
const DictionaryPopupTabs: React.FC<PopupTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const useShortNames = useResponsiveTabNames(tabs, tabsContainerRef);

  const getTabDisplayName = (tab: TabConfig): string => {
    if (!useShortNames) return tab.name;
    return tab.shortName || tab.name;
  };

  return (
    <div ref={tabsContainerRef} className="flex overflow-x-auto">
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          title={tab.name} // Full name always in tooltip
        >
          {getTabDisplayName(tab)}
        </TabButton>
      ))}
    </div>
  );
};
```

#### 3.3.5 Settings Storage

**LocalStorage Schema:**

```typescript
interface AppSettings {
  reader: {
    fontSize: number;
    theme: 'light' | 'dark';
    fontFamily: string;
  };
  dictionary: {
    enableEudic: boolean;
    showContext: boolean;
    autoOpen: boolean;
  };
  ai: {
    enabled: boolean;
    provider: 'openai' | 'anthropic' | 'custom';
    model: string;
    apiUrl?: string; // Custom API endpoint URL
    apiToken?: string; // API authentication token
    maxTokens?: number; // Maximum tokens for responses
    temperature?: number; // Response creativity (0.0-1.0)
    systemPrompt?: string; // Custom system prompt
  };
  customTools: CustomAITool[];
  ui: {
    sidebarWidth: number;
    popupPosition: 'auto' | 'fixed';
  };
}
```

### 3.4 AI Integration Technical Implementation

#### 3.4.1 Provider Configuration System

**Provider-Specific Settings:**

```typescript
interface AIProviderConfig {
  openai: {
    name: 'OpenAI';
    baseUrl: 'https://api.openai.com/v1';
    defaultModel: 'gpt-3.5-turbo';
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    headers: { Authorization: 'Bearer ${apiToken}' };
    messageFormat: 'openai'; // Standard OpenAI format
  };
  anthropic: {
    name: 'Anthropic';
    baseUrl: 'https://api.anthropic.com/v1';
    defaultModel: 'claude-3-haiku-20240307';
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
    headers: { 'x-api-key': '${apiToken}'; 'anthropic-version': '2023-06-01' };
    messageFormat: 'anthropic'; // Anthropic-specific format
  };
  custom: {
    name: 'Custom Provider';
    baseUrl: ''; // User-defined
    defaultModel: ''; // User-defined
    models: []; // User-defined
    headers: {}; // User-defined
    messageFormat: 'openai'; // Assume OpenAI compatibility by default
  };
}
```

#### 3.4.2 API Service Implementation

**Core AI Service:**

```typescript
class AIService {
  private config: AppSettings['ai'];
  private provider: AIProviderConfig[keyof AIProviderConfig];

  constructor(config: AppSettings['ai']) {
    this.config = config;
    this.provider = AIProviderConfig[config.provider];
  }

  /**
   * Test API connection and validate credentials
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Input validation
      if (!this.config.apiToken) {
        return { success: false, error: 'API token is required' };
      }

      // 2. Core processing - send test request
      const response = await this.makeRequest({
        model: this.config.model || this.provider.defaultModel,
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 10,
        temperature: 0,
      });

      // 3. Output handling
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Generate AI response for selected text
   */
  async generateResponse(
    selectedText: string,
    context: string,
    customPrompt?: string
  ): Promise<string> {
    // 1. Input handling
    const systemPrompt = customPrompt || this.config.systemPrompt || this.getDefaultSystemPrompt();
    const userMessage = this.buildUserMessage(selectedText, context);

    // 2. Core processing
    const response = await this.makeRequest({
      model: this.config.model || this.provider.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      maxTokens: this.config.maxTokens || 1000,
      temperature: this.config.temperature || 0.3,
    });

    // 3. Output handling
    return this.extractResponseContent(response);
  }

  private async makeRequest(params: AIRequestParams): Promise<any> {
    const apiUrl = this.config.apiUrl || this.provider.baseUrl;
    const endpoint = this.getEndpoint();

    const headers = this.buildHeaders();
    const body = this.formatRequestBody(params);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Apply provider-specific headers
    Object.entries(this.provider.headers).forEach(([key, value]) => {
      headers[key] = value.replace('${apiToken}', this.config.apiToken || '');
    });

    return headers;
  }

  private formatRequestBody(params: AIRequestParams): any {
    switch (this.provider.messageFormat) {
      case 'anthropic':
        return {
          model: params.model,
          messages: params.messages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
        };
      case 'openai':
      default:
        return {
          model: params.model,
          messages: params.messages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
        };
    }
  }

  private getEndpoint(): string {
    switch (this.config.provider) {
      case 'anthropic':
        return '/messages';
      case 'openai':
      case 'custom':
      default:
        return '/chat/completions';
    }
  }

  private extractResponseContent(response: any): string {
    switch (this.provider.messageFormat) {
      case 'anthropic':
        return response.content?.[0]?.text || 'No response generated';
      case 'openai':
      default:
        return response.choices?.[0]?.message?.content || 'No response generated';
    }
  }

  private getDefaultSystemPrompt(): string {
    return 'You are a helpful reading assistant. Explain the selected text clearly and concisely, providing context and meaning to help the reader understand better.';
  }

  private buildUserMessage(selectedText: string, context: string): string {
    return `Please explain the meaning of "${selectedText}" in the context of: "${context}"`;
  }
}
```

#### 3.4.3 Connection Testing UI

**Test Connection Implementation:**

```typescript
const AIConnectionTest: React.FC<{ settings: AppSettings['ai'] }> = ({ settings }) => {
  const [testStatus, setTestStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const handleTestConnection = async () => {
    // 1. Input handling
    setTestStatus({ status: 'testing' });

    try {
      // 2. Core processing
      const aiService = new AIService(settings);
      const result = await aiService.testConnection();

      // 3. Output handling
      if (result.success) {
        setTestStatus({
          status: 'success',
          message: 'Connection successful! API is working correctly.'
        });
      } else {
        setTestStatus({
          status: 'error',
          message: result.error || 'Connection failed'
        });
      }
    } catch (error) {
      setTestStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unexpected error occurred'
      });
    }
  };

  const getStatusIcon = () => {
    switch (testStatus.status) {
      case 'testing': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTestConnection}
        disabled={testStatus.status === 'testing' || !settings.apiToken}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {testStatus.status === 'testing' ? 'Testing...' : 'Test Connection'}
      </button>

      <span className="flex items-center gap-1">
        {getStatusIcon()}
        {testStatus.message && (
          <span className={`text-sm ${
            testStatus.status === 'error' ? 'text-red-600' : 'text-green-600'
          }`}>
            {testStatus.message}
          </span>
        )}
      </span>
    </div>
  );
};
```

#### 3.4.4 Error Handling & Fallbacks

**Comprehensive Error Handling:**

```typescript
class AIErrorHandler {
  static handleAPIError(error: any, provider: string): string {
    // 1. Input handling - categorize error types
    if (error.status === 401) {
      return 'Invalid API token. Please check your credentials.';
    }

    if (error.status === 403) {
      return 'Access forbidden. Verify your API permissions.';
    }

    if (error.status === 429) {
      return 'Rate limit exceeded. Please wait and try again.';
    }

    if (error.status >= 500) {
      return `${provider} service is temporarily unavailable. Please try again later.`;
    }

    // 2. Core processing - provider-specific error handling
    if (provider === 'anthropic' && error.error?.type) {
      switch (error.error.type) {
        case 'invalid_request_error':
          return 'Invalid request format. Please check your configuration.';
        case 'authentication_error':
          return 'Authentication failed. Please verify your Anthropic API key.';
        default:
          return `Anthropic API error: ${error.error.message}`;
      }
    }

    if (provider === 'openai' && error.error?.code) {
      switch (error.error.code) {
        case 'invalid_api_key':
          return 'Invalid OpenAI API key. Please check your credentials.';
        case 'model_not_found':
          return 'The specified model is not available. Please choose a different model.';
        case 'context_length_exceeded':
          return 'Text is too long. Please select a shorter passage.';
        default:
          return `OpenAI API error: ${error.error.message}`;
      }
    }

    // 3. Output handling - generic fallback
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  static shouldRetry(error: any): boolean {
    // Retry on network errors or temporary server issues
    return error.status === 429 || error.status >= 500 || !error.status;
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, attempt), 8000);
  }
}
```

#### 3.4.5 Integration with Dictionary Popup

**AI Tab Component:**

```typescript
const AITabContent: React.FC<{
  selectedText: string;
  context: string;
  settings: AppSettings['ai'];
}> = ({ selectedText, context, settings }) => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIResponse = async (customPrompt?: string) => {
    // 1. Input handling
    if (!settings.enabled || !settings.apiToken) {
      setError('AI integration is not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Core processing
      const aiService = new AIService(settings);
      const result = await aiService.generateResponse(selectedText, context, customPrompt);

      // 3. Output handling
      setResponse(result);
    } catch (error) {
      const errorMessage = AIErrorHandler.handleAPIError(error, settings.provider);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedText && settings.enabled) {
      generateAIResponse();
    }
  }, [selectedText, context]);

  return (
    <div className="p-4 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          Generating explanation...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => generateAIResponse()}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {response && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
};
```

## 4. UI/UX Design

### 4.1 Visual Design System

#### Color Scheme

- Primary: Blue gradient (#3B82F6 to #1D4ED8)
- Secondary: Gray scale (#F8FAFC to #0F172A)
- Accent: Green for progress (#10B981)
- Error: Red (#EF4444)

#### Typography

- Headers: Inter/System font
- Body: Georgia/serif for reading
- UI: Inter/sans-serif

#### Spacing & Layout

- Grid: 12-column responsive
- Breakpoints: Mobile (320px), Tablet (768px), Desktop (1024px)
- Padding: 8px increments

### 4.2 Component Specifications

#### Book Card

```
┌──────────────────┐
│  [Cover Image]   │
│                  │
│ Book Title       │
│[Progress Bar 45%]│
│ Last read: 2d ago│
└──────────────────┘
```

#### Updated Reader Interface

```
┌─────────────────────────────────────────────────────────┐
│ [☰] [🔍] [⚙] EPUB Reader                      [⛶]     │
├─────────────────────────────────────────────────────────┤
│ TOC │                                                   │
│ ├─1 │     Chapter content with selectable text         │
│ ├─2 │                                                   │
│ └─3 │     "highlighted word" ← selection triggers      │
│     │                         dictionary popup         │
├─────┼───────────────────────────────────────────────────┤
│     │ [◀] Chapter 5/12  75% Progress    [Settings] [▶] │
└─────┴───────────────────────────────────────────────────┘
         ↑                                      ↑
    TOC Sidebar                           Dictionary Popup
    (toggleable)                          (on text selection)
```

#### Dictionary Popup Component

```
                    ┌─────────────────────────────────────┐
                    │ Selected: "serendipity"             │
                    │ Context: "It was pure serendipity  │
                    │ that led to this discovery..."      │
                    ├─────────────────────────────────────┤
                    │Dictionary│ AI │Custom│Tool1│Tool2 │
                    │ (active) │    │Tools │     │      │
                    ├─────────────────────────────────────┤
                    │                                     │
                    │ [Dictionary iframe content showing  │
                    │  definition, pronunciation, usage]  │
                    │                                     │
                    │ Serendipity (noun):                 │
                    │ The faculty of making happy and     │
                    │ unexpected discoveries...           │
                    │                                     │
                    └─────────────────────────────────────┘
```

#### Table of Contents Sidebar

```
┌─────────────────┐
│ Table of Contents│
├─────────────────┤
│ Chapter 1       │ ← current chapter (highlighted)
│   1.1 Intro     │
│   1.2 Overview  │
│ Chapter 2       │
│   2.1 Setup     │
│   2.2 Config    │
│ Chapter 3       │
│   3.1 Advanced  │
│ Chapter 4       │
│   4.1 Deploy    │
│                 │
│    [× Close]    │
└─────────────────┘
```

#### Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Reader              Settings                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📚 Reading Preferences                                  │
│ ├─ Font Size: [─────●─────] 16px                       │
│ ├─ Font Family: [Georgia ▼]                            │
│ ├─ Theme: ○ Light ● Dark ○ Auto                        │
│ └─ Line Height: [─────●────] 1.6                       │
│                                                         │
│ 🎨 Appearance                                          │
│ ├─ Reader Width: [────●─────] 800px                    │
│ └─ Margin: [──●────────] 40px                          │
│                                                         │
│ 🔧 Context Menu Configuration                          │
│ ├─ ☑ Enable Dictionary Popup                          │
│ ├─ ☑ Show Context Text                                │
│ ├─ ☑ Enable AI Explanations                           │
│ └─ Custom Tools: [Manage Tools →]                     │
│                                                         │
│ 📱 Application                                         │
│ ├─ ☑ Enable Offline Mode                              │
│ ├─ Storage Used: 2.3MB / 100MB                        │
│ └─ [Clear Cache] [Export Settings]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Custom Tool Management Dialog

```
┌─────────────────────────────────────────────────────────┐
│ Custom AI Tools                                [+ Add] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Simple Explanation ──────────────── [Edit] [×] [↕] │
│ │ Name: "Simple Explanation" | Short: "Simple"         │
│ │ "Explain {selectedText} in simple terms"             │
│ │ Status: Active | Created: 2024-01-15                 │
│ └─────────────────────────────────────────────────────│
│                                                         │
│ ┌─ Spanish Translation ──────────────── [Edit] [×] [↕] │
│ │ Name: "Spanish Translation" | Short: "Spanish"       │
│ │ "Translate {selectedText} to Spanish"                │
│ │ Status: Active | Created: 2024-01-12                 │
│ └─────────────────────────────────────────────────────│
│                                                         │
│ ┌─ Etymology ─────────────────────────── [Edit] [×] [↕] │
│ │ Name: "Etymology" | Short: "Etym"                    │
│ │ "Explain the etymology of {selectedText}"            │
│ │ Status: Inactive | Created: 2024-01-10              │
│ └─────────────────────────────────────────────────────│
│                                                         │
│                              [Close] [Save Changes]    │
└─────────────────────────────────────────────────────────┘
```

#### Search Overlay

```
┌─────────────────────────────────────────────────────────┐
│ Search in Book                                     [×]  │
├─────────────────────────────────────────────────────────┤
│ [🔍] [_________________________________] [Search]      │
│                                                         │
│ Results for "serendipity":                             │
│                                                         │
│ Chapter 1: Introduction                        3 matches│
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ...pure serendipity that led to this discovery...  │ │
│ │ ...another case of serendipity in research...      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Chapter 3: Advanced Topics                     1 match │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ...serendipity often plays a role in...            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Responsive Behavior

#### Mobile (320-767px)

- Single column layout
- Touch-friendly buttons (44px min)
- Bottom navigation

#### Tablet (768-1023px)

- 2-3 column book grid
- Sidebar navigation
- Split reader view option

#### Desktop (1024px+)

- 4+ column book grid
- Persistent sidebar
- Multi-column reading

## 5. Error Handling and Fallbacks

### 5.1 OPFS Error Scenarios

1. **Storage Quota Exceeded**

   - Show user-friendly error
   - Suggest removing old books
   - Implement size validation before upload

2. **File Access Denied**

   - Handle permission errors
   - Provide retry mechanism
   - Fallback to IndexedDB if persistent

3. **Corrupt EPUB**
   - Validate file structure
   - Show error with file details
   - Allow re-upload

### 5.2 PWA Fallbacks

1. **Offline Mode**

   - Cache essential assets
   - Show offline indicator
   - Queue sync operations

2. **Service Worker Errors**
   - Auto-recovery attempts
   - Manual refresh option
   - Degrade gracefully

### 5.3 EPUB.js Error Handling

1. **Rendering Failures**

   - Fallback rendering modes
   - Chapter skip option
   - Error reporting

2. **Metadata Errors**
   - Default title/author handling
   - Cover image fallbacks
   - Progress tracking safety

## 6. Performance Optimization

### 6.1 Loading Strategies

#### Initial Load

- Code splitting by routes
- Lazy load EPUB.js library
- Preload critical CSS
- Service Worker caching

#### Book Loading

- Progressive EPUB parsing
- Chapter-level lazy loading
- Image optimization and caching
- Background asset prefetching

### 6.2 Memory Management

#### EPUB Content

- Chapter-based memory cleanup
- Image disposal strategies
- DOM node recycling
- Garbage collection optimization

#### OPFS Operations

- Batched file operations
- Stream processing for large files
- Connection pooling
- Cache invalidation strategies

### 6.3 Rendering Performance

#### Text Rendering

- Virtual scrolling for long chapters
- CSS containment for reader area
- GPU acceleration for animations
- Debounced resize handlers

#### Search Operations

- Indexed search with Web Workers
- Progressive result loading
- Query debouncing (300ms)
- Result pagination

### 6.4 PWA Optimization

#### Caching Strategy

```typescript
// Service Worker cache priorities
const CACHE_PRIORITIES = {
  critical: ['index.html', 'main.css', 'main.js'],
  books: ['epub files', 'cover images'],
  dictionary: ['definition data', 'lookup API'],
  ui: ['fonts', 'icons', 'themes'],
};
```

#### Offline Sync

- Queue operations during offline
- Conflict resolution on reconnect
- Background sync for progress
- Delta updates for config

## 7. Development Workflow

### 7.1 Project Setup

#### Prerequisites

- Node.js 18+ with pnpm
- VS Code with recommended extensions
- Chrome/Edge for OPFS testing

#### Installation

```bash
git clone <repo>
cd epub-reader
pnpm install
pnpm dev
```

### 7.2 Development Process

#### Feature Development

1. Create feature branch from `main`
2. Implement in `src/features/` directory
3. Add corresponding tests
4. Update documentation
5. Submit PR with review

#### Code Quality

- ESLint + Prettier formatting
- TypeScript strict mode
- Husky pre-commit hooks
- Jest unit tests
- Playwright e2e tests

### 7.3 Build & Deployment

#### Production Build

```bash
pnpm build         # Vite production build
pnpm preview      # Test production build
pnpm test         # Run all tests
```

#### PWA Deployment

- Netlify/Vercel hosting
- Service Worker registration
- Manifest validation
- HTTPS requirement

### 7.4 Testing Strategy

#### Unit Tests

- Component rendering tests
- OPFS utility functions
- Redux store logic
- Error boundary testing

#### Integration Tests

- File upload workflows
- EPUB parsing pipeline
- Search functionality
- Reader navigation

#### E2E Tests

- Complete user journeys
- Cross-browser compatibility
- PWA installation flow
- Offline functionality

## 8. Future Considerations

### 8.1 Feature Roadmap

#### Phase 1 (MVP)

- Basic EPUB reading
- OPFS book storage
- Simple library management
- PWA installation

#### Phase 2 (Enhanced)

- Dictionary integration
- Advanced search
- Reading statistics
- Export/sync features

#### Phase 3 (Advanced)

- Multi-language support
- Accessibility improvements
- Social features
- AI-powered recommendations

### 8.2 Technical Improvements

#### Performance

- Web Workers for heavy processing
- IndexedDB for metadata caching
- CDN for static assets
- Progressive loading strategies

#### Scalability

- Micro-frontend architecture
- Plugin system for extensions
- API abstraction layer
- Cloud sync capabilities

### 9.2 Browser Support

#### Minimum Requirements

- Chrome 86+ (OPFS support)
- Firefox 102+ (limited OPFS)
- Safari 15.2+ (partial support)
- Edge 86+

#### Feature Detection

```typescript
const hasOPFS = 'storage' in navigator && 'getDirectory' in navigator.storage;
const hasFileSystem = 'showOpenFilePicker' in window;
```

### 9.3 API References

#### OPFS API Usage

- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Origin Private File System API](https://web.dev/opfs/)

#### EPUB Specifications

- [EPUB 3.3 Specification](https://www.w3.org/publishing/epub3/epub-spec.html)
- [EPUB.js Documentation](http://futurepress.org/)
