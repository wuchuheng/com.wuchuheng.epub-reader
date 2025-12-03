# Context Menu Integration

<cite>
**Referenced Files in This Document**   
- [aiProviders.ts](file://src/config/aiProviders.ts)
- [ToolList.tsx](file://src/pages/ContextMenuSettingsPage/components/ToolList.tsx)
- [selection.service.ts](file://src/pages/EpubReader/services/selection.service.ts)
- [mobileSelection.service.ts](file://src/pages/EpubReader/services/mobileSelection.service.ts)
- [computerSelection.service.ts](file://src/pages/EpubReader/services/computerSelection.service.ts)
- [ContextMenu.tsx](file://src/pages/EpubReader/components/ContextMenu.tsx)
- [epub.ts](file://src/types/epub.ts)
- [ContextMenuSettingsPage.tsx](file://src/pages/ContextMenuSettingsPage/index.tsx)
- [useContextMenuSettings.ts](file://src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts)
- [AIToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/AIToolForm.tsx)
- [IframeToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/IframeToolForm.tsx)
- [useToolForm.ts](file://src/pages/ContextMenuSettingsPage/hooks/useToolForm.ts)
- [renditionEvent.service.ts](file://src/pages/EpubReader/services/renditionEvent.service.ts)
- [epub.ts](file://src/constants/epub.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Text Selection and Context Menu Trigger](#text-selection-and-context-menu-trigger)
3. [AI Providers Configuration](#ai-providers-configuration)
4. [ToolList Component](#toollist-component)
5. [Tool Configuration and User Interface](#tool-configuration-and-user-interface)
6. [Data Flow from Selection to Execution](#data-flow-from-selection-to-execution)
7. [Security Considerations](#security-considerations)
8. [Custom Tool Configuration Examples](#custom-tool-configuration-examples)
9. [User Experience and Settings Management](#user-experience-and-settings-management)
10. [Selection Service Implementation](#selection-service-implementation)

## Introduction
The context menu AI integration system enables users to interact with selected text in EPUB documents through configurable AI tools. When users select text in the EPUB reader, a context menu appears with AI-powered actions that can process the selected content. This system supports both AI-based tools that use language models and iframe-based tools that embed external web content. The configuration is managed through a settings interface where users can add, remove, reorder, and configure tools according to their preferences.

## Text Selection and Context Menu Trigger
The context menu is triggered when users select text in the EPUB reader, with different implementations for mobile and desktop devices. The system uses device detection to determine the appropriate selection handling mechanism.

```mermaid
flowchart TD
A[User selects text] --> B{Mobile device?}
B --> |Yes| C[Handle long press gesture]
B --> |No| D[Handle mouse up event]
C --> E[Start selection on long press]
C --> F[Extend selection on move]
D --> G[Detect mouse up after selection]
E --> H[Complete selection]
F --> H
G --> H
H --> I[Normalize selection to word boundaries]
I --> J[Extract selected text and context]
J --> K[Trigger context menu with AI tools]
```

**Diagram sources**
- [mobileSelection.service.ts](file://src/pages/EpubReader/services/mobileSelection.service.ts#L16-L101)
- [computerSelection.service.ts](file://src/pages/EpubReader/services/computerSelection.service.ts#L6-L18)
- [renditionEvent.service.ts](file://src/pages/EpubReader/services/renditionEvent.service.ts#L29-L57)

**Section sources**
- [mobileSelection.service.ts](file://src/pages/EpubReader/services/mobileSelection.service.ts#L16-L101)
- [computerSelection.service.ts](file://src/pages/EpubReader/services/computerSelection.service.ts#L6-L18)
- [renditionEvent.service.ts](file://src/pages/EpubReader/services/renditionEvent.service.ts#L29-L57)

## AI Providers Configuration
The AI provider configuration is defined in `aiProviders.ts`, which exports a catalog of supported AI services. Each provider has an ID, name, base URL, and documentation URL. The system supports multiple AI providers including OpenAI, OpenRouter, Together AI, Mistral, Groq, and others, as well as a custom option for OpenAI-compatible APIs.

```mermaid
classDiagram
class AiProviderConfig {
+id : AiProviderId
+name : string
+baseUrl? : string
+docsUrl? : string
}
class AiProviderId {
<<enumeration>>
openai
openrouter
together
mistral
groq
fireworks
deepseek
cerebras
perplexity
zhipu
qwen
kimi
minimax
custom
}
class AI_PROVIDER_CATALOG {
+Array of AiProviderConfig
}
AI_PROVIDER_CATALOG --> AiProviderConfig : "contains"
```

**Diagram sources**
- [aiProviders.ts](file://src/config/aiProviders.ts#L1-L109)

**Section sources**
- [aiProviders.ts](file://src/config/aiProviders.ts#L1-L109)

## ToolList Component
The ToolList component renders the configurable AI actions in the settings interface, allowing users to manage their tools. It supports drag-and-drop reordering, enabling/disabling tools, and configuring selection support for single-word and multi-word selections.

```mermaid
classDiagram
class ToolListProps {
+tools : ContextMenuItem[]
+onToolRemove : (index : number) => void
+onToolReorder : (fromIndex : number, toIndex : number) => void
+onToggleEnabled : (index : number, enabled : boolean) => void
+onToggleSupport : (index : number, support : 'single' | 'multi') => void
}
class SortableToolItemProps {
+tool : ContextMenuItem
+index : number
+onToolRemove : (index : number) => void
+onToggleEnabled : (index : number, enabled : boolean) => void
+onToggleSupport : (index : number, support : 'single' | 'multi') => void
}
class ToolList {
+render()
+handleDragEnd(event : DragEndEvent)
}
ToolList --> ToolListProps
ToolList --> SortableToolItemProps
ToolList --> ToolList : "contains multiple"
```

**Diagram sources**
- [ToolList.tsx](file://src/pages/ContextMenuSettingsPage/components/ToolList.tsx#L25-L239)

**Section sources**
- [ToolList.tsx](file://src/pages/ContextMenuSettingsPage/components/ToolList.tsx#L25-L239)

## Tool Configuration and User Interface
The system provides specialized forms for configuring different tool types through AIToolForm and IframeToolForm components. These forms are accessible through the ContextMenuSettingsPage, which manages the overall configuration state.

```mermaid
classDiagram
class AIToolFormProps {
+prompt : string
+reasoningEnabled : boolean
+supportsSingleWord : boolean
+supportsMultiWord : boolean
+supportsDisabled : boolean
+onPromptChange : (prompt : string) => void
+onReasoningToggle : (enabled : boolean) => void
+onSupportChange : (target : 'single' | 'multi', enabled : boolean) => void
}
class IframeToolFormProps {
+url : string
+supportsSingleWord : boolean
+supportsMultiWord : boolean
+supportsDisabled : boolean
+onUrlChange : (url : string) => void
+onSupportChange : (target : 'single' | 'multi', enabled : boolean) => void
}
class ContextMenuSettingsPage {
+handleSaveSettings()
+handleTestConnection()
+renderStatusChip()
+renderStatusBanner()
}
ContextMenuSettingsPage --> AIToolFormProps
ContextMenuSettingsPage --> IframeToolFormProps
ContextMenuSettingsPage --> ToolList : "contains"
```

**Diagram sources**
- [AIToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/AIToolForm.tsx#L6-L110)
- [IframeToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/IframeToolForm.tsx#L6-L90)
- [ContextMenuSettingsPage.tsx](file://src/pages/ContextMenuSettingsPage/index.tsx#L15-L272)

**Section sources**
- [AIToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/AIToolForm.tsx#L6-L110)
- [IframeToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/IframeToolForm.tsx#L6-L90)
- [ContextMenuSettingsPage.tsx](file://src/pages/ContextMenuSettingsPage/index.tsx#L15-L272)

## Data Flow from Selection to Execution
The data flow from text selection to tool execution involves several steps: capturing the selection, normalizing it to word boundaries, extracting context, and passing the data to the appropriate tool. The system handles both AI and iframe tools differently based on their type.

```mermaid
sequenceDiagram
participant User
participant Reader as EPUB Reader
participant Selection as Selection Service
participant ContextMenu as Context Menu
participant Tool as AI/Iframe Tool
User->>Reader : Selects text
Reader->>Selection : handleSelectionEnd()
Selection->>Selection : extractSelectionToWords()
Selection->>Selection : adjust to word boundaries
Selection->>Selection : extract context
Selection->>ContextMenu : onExtractSelection()
ContextMenu->>ContextMenu : render with tools
User->>ContextMenu : chooses tool
ContextMenu->>Tool : execute with words and context
alt AI Tool
Tool->>AI Provider : send prompt with context
AI Provider-->>Tool : return response
Tool-->>User : display AI response
else Iframe Tool
Tool->>Iframe : resolve URL with parameters
Iframe-->>User : display embedded content
end
```

**Diagram sources**
- [selection.service.ts](file://src/pages/EpubReader/services/selection.service.ts#L11-L148)
- [ContextMenu.tsx](file://src/pages/EpubReader/components/ContextMenu.tsx#L152-L713)
- [IframeRender.tsx](file://src/pages/EpubReader/components/IframeRender/IframeRender.tsx)

**Section sources**
- [selection.service.ts](file://src/pages/EpubReader/services/selection.service.ts#L11-L148)
- [ContextMenu.tsx](file://src/pages/EpubReader/components/ContextMenu.tsx#L152-L713)

## Security Considerations
The system implements several security measures for external API calls, including secure storage of API keys, validation of provider configurations, and proper handling of iframe content. API keys are stored in a cache keyed by provider ID and are only transmitted to the configured API endpoints.

```mermaid
flowchart TD
A[User enters API key] --> B[Store in providerApiKeyCache]
B --> C{Provider switch?}
C --> |Yes| D[Restore cached key for provider]
C --> |No| E[Use current provider key]
D --> F[Transmit to configured API endpoint]
E --> F
F --> G[Validate HTTPS connection]
G --> H[Make API call with proper headers]
H --> I[Handle response securely]
I --> J[Display results in isolated context]
K[User configures iframe URL] --> L[Validate URL format]
L --> M[Use URL parameters safely]
M --> N[Open in sandboxed iframe]
N --> O[Restrict permissions]
```

**Diagram sources**
- [useContextMenuSettings.ts](file://src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts#L176-L188)
- [aiProviders.ts](file://src/config/aiProviders.ts#L24-L108)
- [ContextMenu.tsx](file://src/pages/EpubReader/components/ContextMenu.tsx#L683-L689)

**Section sources**
- [useContextMenuSettings.ts](file://src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts#L176-L188)
- [aiProviders.ts](file://src/config/aiProviders.ts#L24-L108)

## Custom Tool Configuration Examples
The system supports various custom tool configurations for different use cases. Users can create AI tools with specific prompts or iframe tools that embed external services with the selected text as parameters.

```mermaid
erDiagram
CONTEXT_MENU_SETTINGS ||--o{ CONTEXT_MENU_ITEM : contains
CONTEXT_MENU_ITEM }|--|| AI_SETTING_ITEM : "type='AI'"
CONTEXT_MENU_ITEM }|--|| IFRAME_SETTING_ITEM : "type='iframe'"
AI_SETTING_ITEM {
string type PK
string name
string shortName
boolean enabled
boolean supportsSingleWord
boolean supportsMultiWord
string prompt
string model
boolean reasoningEnabled
}
IFRAME_SETTING_ITEM {
string type PK
string name
string shortName
boolean enabled
boolean supportsSingleWord
boolean supportsMultiWord
string url
}
CONTEXT_MENU_SETTINGS {
string api
string key
string defaultModel
boolean pinnedMaximized
AiProviderId providerId
map providerApiKeyCache
map providerDefaultModelCache
}
```

**Diagram sources**
- [epub.ts](file://src/types/epub.ts#L8-L108)
- [AIToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/AIToolForm.tsx#L29-L48)
- [IframeToolForm.tsx](file://src/pages/ContextMenuSettingsPage/components/IframeToolForm.tsx#L37-L41)

**Section sources**
- [epub.ts](file://src/types/epub.ts#L8-L108)

## User Experience and Settings Management
The user experience for discovering and managing AI tools is designed to be intuitive through the ContextMenuSettingsPage. Users can easily add new tools, reorder existing ones via drag-and-drop, and configure each tool's behavior.

```mermaid
flowchart TD
A[Settings Page Load] --> B[Load settings from OPFS]
B --> C{Settings exist?}
C --> |No| D[Initialize default settings]
C --> |Yes| E[Sanitize and validate settings]
E --> F[Display provider configuration]
F --> G[Display tool list]
G --> H[User interacts with tools]
H --> I{Add, remove, reorder?}
I --> |Yes| J[Update settings state]
J --> K[Save to OPFS]
I --> |No| L[No changes]
H --> M{Modify provider?}
M --> |Yes| N[Update provider and restore cached keys]
N --> K
M --> |No| O[No changes]
```

**Diagram sources**
- [useContextMenuSettings.ts](file://src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts#L47-L127)
- [ContextMenuSettingsPage.tsx](file://src/pages/ContextMenuSettingsPage/index.tsx#L22-L38)
- [useToolForm.ts](file://src/pages/ContextMenuSettingsPage/hooks/useToolForm.ts#L8-L158)

**Section sources**
- [useContextMenuSettings.ts](file://src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts#L47-L127)
- [ContextMenuSettingsPage.tsx](file://src/pages/ContextMenuSettingsPage/index.tsx#L22-L38)

## Selection Service Implementation
The selection service captures and normalizes text selections across different devices, ensuring consistent behavior. It adjusts selections to word boundaries and extracts contextual information around the selected text to provide better input for AI tools.

```mermaid
flowchart TD
A[Selection detected] --> B[Check for empty space click]
B --> C{Valid selection?}
C --> |No| D[Return undefined]
C --> |Yes| E[Adjust start to word boundary]
E --> F[Adjust end to word boundary]
F --> G[Reset selection with adjusted boundaries]
G --> H[Extract selected text]
H --> I[Find meaningful container]
I --> J[Extract pre-selection context]
J --> K[Extract post-selection context]
K --> L[Combine with <selected> tags]
L --> M{Context sufficient?}
M --> |No| N[Expand context from neighboring nodes]
M --> |Yes| O[Return words and context]
N --> O
```

**Diagram sources**
- [selection.service.ts](file://src/pages/EpubReader/services/selection.service.ts#L33-L148)
- [mobileSelection.service.ts](file://src/pages/EpubReader/services/mobileSelection.service.ts#L103-L230)
- [computerSelection.service.ts](file://src/pages/EpubReader/services/computerSelection.service.ts#L6-L18)

**Section sources**
- [selection.service.ts](file://src/pages/EpubReader/services/selection.service.ts#L33-L148)
- [mobileSelection.service.ts](file://src/pages/EpubReader/services/mobileSelection.service.ts#L103-L230)
- [computerSelection.service.ts](file://src/pages/EpubReader/services/computerSelection.service.ts#L6-L18)