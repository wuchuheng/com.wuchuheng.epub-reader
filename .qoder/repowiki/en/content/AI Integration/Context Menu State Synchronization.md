# Context Menu State Synchronization

<cite>
**Referenced Files in This Document**   
- [useContextMenuState.ts](file://src/pages/EpubReader/hooks/useContextMenuState.ts)
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts)
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts)
- [ContextHashService.ts](file://src/services/ContextHashService.ts)
- [opfs.ts](file://src/services/opfs.ts)
- [contextMenuCache.ts](file://src/types/contextMenuCache.ts)
- [fileOperations.ts](file://src/utils/fileOperations.ts)
- [EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Core Components](#core-components)
3. [State Synchronization Architecture](#state-synchronization-architecture)
4. [URL State Management](#url-state-management)
5. [Persistent Storage System](#persistent-storage-system)
6. [Data Flow Analysis](#data-flow-analysis)
7. [Error Handling and Recovery](#error-handling-and-recovery)
8. [Performance Considerations](#performance-considerations)

## Introduction
This document details the context menu state synchronization system in the EPUB reader application. The system maintains consistent state between the user interface, URL parameters, and persistent storage, ensuring that context menu states are preserved across navigation, page reloads, and browser sessions. The implementation uses React hooks, URL search parameters, and the Origin Private File System (OPFS) for persistent storage.

## Core Components

The context menu state synchronization system consists of several key components that work together to maintain consistent state across different layers of the application.

**Section sources**
- [useContextMenuState.ts](file://src/pages/EpubReader/hooks/useContextMenuState.ts#L1-L248)
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)

## State Synchronization Architecture

The state synchronization architecture follows a layered approach with clear separation of concerns between state management, URL synchronization, and persistent storage.

```mermaid
graph TD
A[User Selection] --> B(useContextMenuState Hook)
B --> C[Menu Stack State]
C --> D(useUrlSync Hook)
D --> E[URL Parameters]
D --> F[OPFS Storage]
F --> G[ContextHashService]
F --> H[ContextMenuCacheService]
G --> I[SHA-256 Hashing]
H --> J[Persistent Caching]
E --> K[Browser History]
K --> D
J --> B
```

**Diagram sources**
- [useContextMenuState.ts](file://src/pages/EpubReader/hooks/useContextMenuState.ts#L1-L248)
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)

## URL State Management

The URL state management system synchronizes the context menu state with URL parameters, enabling bookmarking, sharing, and back/forward navigation while preserving context menu states.

```mermaid
sequenceDiagram
participant UI as User Interface
participant Hook as useContextMenuState
participant UrlSync as useUrlSync
participant Browser as Browser History
UI->>Hook : Text selection triggers menu
Hook->>Hook : Updates menuStack state
Hook->>UrlSync : Propagates state change
UrlSync->>UrlSync : Extracts context menu IDs
UrlSync->>UrlSync : Compares with URL parameter
alt State changed
UrlSync->>Browser : Updates URL parameter
Browser-->>UrlSync : Navigation event
UrlSync->>UrlSync : Detects URL change
UrlSync->>Hook : Rehydrates state from storage
Hook->>Hook : Updates menuStack
end
Browser->>UrlSync : Back/Forward navigation
UrlSync->>UrlSync : Detects URL parameter change
UrlSync->>Hook : Rehydrates state from storage
Hook->>Hook : Updates menuStack
```

**Diagram sources**
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)
- [useContextMenuState.ts](file://src/pages/EpubReader/hooks/useContextMenuState.ts#L1-L248)

**Section sources**
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)

## Persistent Storage System

The persistent storage system uses OPFS to store context menu data, ensuring that user context is preserved across sessions and application restarts.

```mermaid
erDiagram
CONTEXT_MENU ||--o{ HASH_MAPPING : contains
CONTEXT_MENU ||--o{ CONTEXT_CACHE : contains
CONTEXT_MENU ||--o{ LATEST_ID : manages
CONTEXT_MENU {
string dirName "contextMenu"
}
HASH_MAPPING {
string hash PK
int id
datetime createdAt
}
CONTEXT_CACHE {
int id PK
string words
string context
datetime createdAt
}
LATEST_ID {
int latestId
}
```

**Diagram sources**
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)
- [opfs.ts](file://src/services/opfs.ts#L1-L65)

**Section sources**
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)
- [opfs.ts](file://src/services/opfs.ts#L1-L65)

## Data Flow Analysis

The data flow for context menu state synchronization follows a specific pattern from user interaction to persistent storage and back.

```mermaid
flowchart TD
A[User selects text] --> B{Valid selection?}
B --> |No| C[Show error message]
B --> |Yes| D[Generate context hash]
D --> E{Hash exists in mapping?}
E --> |Yes| F[Reuse existing context ID]
E --> |No| G[Generate new context ID]
G --> H[Save hash-to-ID mapping]
H --> I[Save context metadata]
I --> J[Update latest ID counter]
J --> K[Update menu stack state]
K --> L[Update URL parameter]
L --> M[Persist state in OPFS]
N[URL navigation] --> O[Parse contextMenu parameter]
O --> P{Valid IDs?}
P --> |No| Q[Clear menu stack]
P --> |Yes| R[Rehydrate from OPFS]
R --> S[Update menu stack state]
```

**Diagram sources**
- [useContextMenuState.ts](file://src/pages/EpubReader/hooks/useContextMenuState.ts#L1-L248)
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)

## Error Handling and Recovery

The system implements comprehensive error handling to ensure robustness and graceful degradation when errors occur during state synchronization.

```mermaid
flowchart TD
A[Operation Start] --> B{Error occurs?}
B --> |No| C[Operation successful]
B --> |Yes| D[Log error details]
D --> E{Critical failure?}
E --> |Yes| F[Use fallback mechanism]
F --> G[Generate new ID]
G --> H[Continue with degraded functionality]
E --> |No| I[Return null/empty result]
I --> J[Handle gracefully in UI]
H --> K[Update state]
J --> K
K --> L[Ensure consistency]
```

**Diagram sources**
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)
- [fileOperations.ts](file://src/utils/fileOperations.ts#L1-L91)

**Section sources**
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)
- [fileOperations.ts](file://src/utils/fileOperations.ts#L1-L91)

## Performance Considerations

The context menu state synchronization system has been designed with performance in mind, minimizing redundant operations and optimizing data access patterns.

### Key Performance Optimizations

| Optimization | Description | Benefit |
|------------|-----------|--------|
| Hash-based deduplication | Uses SHA-256 hashes to identify duplicate contexts | Prevents redundant storage and processing |
| Batched file operations | Groups related file operations together | Reduces I/O overhead |
| Reference comparison | Uses refs to track previous state | Minimizes unnecessary URL updates |
| Lazy initialization | Initializes OPFS structure only when needed | Improves startup performance |
| Memoized calculations | Caches computed values | Reduces CPU usage |

**Section sources**
- [useUrlSync.ts](file://src/pages/EpubReader/hooks/useUrlSync.ts#L1-L167)
- [ContextMenuCacheService.ts](file://src/services/ContextMenuCacheService.ts#L1-L200)
- [ContextHashService.ts](file://src/services/ContextHashService.ts#L1-L133)