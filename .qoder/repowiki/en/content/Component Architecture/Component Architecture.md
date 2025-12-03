# Component Architecture

<cite>
**Referenced Files in This Document**   
- [main.tsx](file://src/main.tsx)
- [HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [SettingsPage/index.tsx](file://src/pages/SettingsPage/index.tsx)
- [BookCard/index.tsx](file://src/components/BookCard/index.tsx)
- [UploadZone/index.tsx](file://src/components/UploadZone/index.tsx)
- [TOCSidebar.tsx](file://src/pages/EpubReader/components/TOCSidebar.tsx)
- [ReaderHeader.tsx](file://src/pages/EpubReader/components/ReaderHeader.tsx)
- [store/index.ts](file://src/store/index.ts)
- [slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)
- [book.ts](file://src/types/book.ts)
- [router.tsx](file://src/config/router.tsx)
- [useBookDisplayData.ts](file://src/components/BookCard/hooks/useBookDisplayData.ts)
- [EPUBMetadataService.ts](file://src/services/EPUBMetadataService.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive architectural documentation for the React component system in the EPUB reader application. It describes the high-level design principles, component hierarchy, state management patterns, and integration strategies used throughout the codebase. The documentation covers functional components with Hooks, PascalCase naming convention, composition over inheritance, and other key architectural decisions that shape the application's structure and behavior.

## Project Structure

The project follows a feature-based organization with clear separation of concerns. Components are organized by functionality, with pages containing route-specific logic and components providing reusable UI elements.

```mermaid
graph TD
A[src/] --> B[components/]
A --> C[pages/]
A --> D[store/]
A --> E[types/]
A --> F[services/]
A --> G[config/]
B --> H[BookCard/]
B --> I[UploadZone/]
B --> J[BackButton/]
B --> K[Breadcrumb/]
C --> L[HomePage/]
C --> M[EpubReader/]
C --> N[SettingsPage/]
D --> O[slices/]
D --> P[index.ts]
O --> Q[bookshelfSlice.ts]
```

**Diagram sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

**Section sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

## Core Components

The application's core components follow React best practices with functional components and Hooks. The architecture emphasizes composition over inheritance, using PascalCase naming convention for all component files. Key components include page-level containers (HomePage, EpubReader, SettingsPage) and reusable UI elements (BookCard, UploadZone, TOCSidebar). State management is handled through a combination of local component state and global Redux store for shared application state.

**Section sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)

## Architecture Overview

The application architecture follows a layered approach with clear separation between presentation, business logic, and data management layers. React Router handles navigation between pages, while Redux manages global application state. The component hierarchy flows from App.tsx down to page components and then to reusable UI components.

```mermaid
graph TD
A[App] --> B[HomePage]
A --> C[EpubReader]
A --> D[SettingsPage]
B --> E[BookCard]
B --> F[UploadZone]
C --> G[ReaderHeader]
C --> H[TOCSidebar]
C --> I[ReaderFooter]
C --> J[AIAgent]
E --> K[BookCover]
E --> L[ProgressBar]
E --> M[BookActions]
style A fill:#4CAF50,stroke:#388E3C
style B fill:#2196F3,stroke:#1976D2
style C fill:#2196F3,stroke:#1976D2
style D fill:#2196F3,stroke:#1976D2
style E fill:#FF9800,stroke:#F57C00
style F fill:#FF9800,stroke:#F57C00
style G fill:#FF9800,stroke:#F57C00
style H fill:#FF9800,stroke:#F57C00
style I fill:#FF9800,stroke:#F57C00
style J fill:#FF9800,stroke:#F57C00
```

**Diagram sources**
- [src/main.tsx](file://src/main.tsx)
- [src/config/router.tsx](file://src/config/router.tsx)
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)

## Detailed Component Analysis

### HomePage Analysis
The HomePage component serves as the bookshelf interface, displaying all available books in a responsive grid layout. It handles book uploads via drag-and-drop or file picker, manages deletions, and provides navigation to the reader interface.

```mermaid
flowchart TD
Start([Component Mount]) --> Init[Initialize Bookshelf]
Init --> Load[Load Books from OPFS]
Load --> Display[Render Book Grid]
Upload[Handle File Upload] --> Validate[Validate EPUB File]
Validate --> Process[Dispatch uploadBook Action]
Process --> Refresh[Reload Books List]
Delete[Handle Delete Book] --> Confirm[Show Confirmation Dialog]
Confirm --> Remove[Dispatch deleteBook Action]
Remove --> Update[Update Book List]
Click[Open Book] --> Navigate[Route to EpubReader]
style Start fill:#E3F2FD
style Init fill:#BBDEFB
style Load fill:#90CAF9
style Display fill:#64B5F6
style Upload fill:#E8F5E8
style Validate fill:#C8E6C9
style Process fill:#A5D6A7
style Refresh fill:#81C784
style Delete fill:#FFEBEE
style Confirm fill:#FFCDD2
style Remove fill:#EF9A9A
style Update fill:#E57373
style Click fill:#FFF3E0
style Navigate fill:#FFB74D
```

**Diagram sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

**Section sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

### BookCard Analysis
The BookCard component displays individual book information in the bookshelf grid. It receives book metadata as props and uses composition to include smaller components for specific UI elements.

#### Component Composition
```mermaid
classDiagram
class BookCard {
+book : BookMetadata
+onOpen : (bookId : string) => void
+onDelete : (bookId : string) => void
}
class BookCover {
+coverPath : string
+title : string
}
class ProgressBar {
+progress : number
}
class BookActions {
+onRead : () => void
+onDelete : () => void
}
class useBookDisplayData {
+useBookDisplayData(book : BookMetadata)
}
BookCard --> BookCover : "contains"
BookCard --> ProgressBar : "contains"
BookCard --> BookActions : "contains"
BookCard --> useBookDisplayData : "uses"
useBookDisplayData --> BookMetadata : "processes"
```

**Diagram sources**
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)
- [src/components/BookCard/hooks/useBookDisplayData.ts](file://src/components/BookCard/hooks/useBookDisplayData.ts)
- [src/types/book.ts](file://src/types/book.ts)

**Section sources**
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)
- [src/components/BookCard/hooks/useBookDisplayData.ts](file://src/components/BookCard/hooks/useBookDisplayData.ts)

### EpubReader Analysis
The EpubReader component provides the full reading experience, integrating multiple subcomponents to create a cohesive interface for reading EPUB files.

#### Reader Component Flow
```mermaid
sequenceDiagram
participant Browser as "Browser"
participant EpubReader as "EpubReader"
participant useReader as "useEpubReader"
participant EPUBMetadataService as "EPUBMetadataService"
participant Book as "epubjs Book"
Browser->>EpubReader : Navigate to /reader/ : bookId
EpubReader->>EPUBMetadataService : getBookByBookId(bookId)
EPUBMetadataService->>OPFSManager : getBookFile(bookId)
OPFSManager-->>EPUBMetadataService : ArrayBuffer
EPUBMetadataService->>Book : new Book(arrayBuffer)
Book-->>EPUBMetadataService : Book instance
EPUBMetadataService-->>EpubReader : Book instance
EpubReader->>useReader : Initialize with book
useReader->>Book : Load metadata and TOC
Book-->>useReader : Table of Contents
useReader-->>EpubReader : Reader state
EpubReader->>Browser : Render reader interface
```

**Diagram sources**
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [src/services/EPUBMetadataService.ts](file://src/services/EPUBMetadataService.ts)
- [src/pages/EpubReader/hooks/useEpubReader.ts](file://src/pages/EpubReader/hooks/useEpubReader.ts)

**Section sources**
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [src/services/EPUBMetadataService.ts](file://src/services/EPUBMetadataService.ts)

### ReaderHeader Analysis
The ReaderHeader component manages navigation controls and state for the reading interface, demonstrating effective use of React Hooks for state management.

```mermaid
flowchart TD
A[ReaderHeader] --> B[State: visible]
A --> C[Props: onOpenToc, onHelpClick]
A --> D[useEffect: Keyboard Navigation]
A --> E[Smart Zone Click Handler]
D --> F[Listen for Volume Keys]
F --> G[Map to Page Navigation]
E --> H[Calculate Click Position]
H --> I[Left Zone: Previous Page]
H --> J[Right Zone: Next Page]
H --> K[Middle Zone: Toggle Menu]
style A fill:#FF9800,stroke:#F57C00
style B fill:#C5CAE9,stroke:#303F9F
style C fill:#C5CAE9,stroke:#303F9F
style D fill:#C5CAE9,stroke:#303F9F
style E fill:#C5CAE9,stroke:#303F9F
style F fill:#BBDEFB,stroke:#1976D2
style G fill:#BBDEFB,stroke:#1976D2
style H fill:#BBDEFB,stroke:#1976D2
style I fill:#BBDEFB,stroke:#1976D2
style J fill:#BBDEFB,stroke:#1976D2
style K fill:#BBDEFB,stroke:#1976D2
```

**Diagram sources**
- [src/pages/EpubReader/components/ReaderHeader.tsx](file://src/pages/EpubReader/components/ReaderHeader.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)

**Section sources**
- [src/pages/EpubReader/components/ReaderHeader.tsx](file://src/pages/EpubReader/components/ReaderHeader.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)

## Dependency Analysis

The application's dependency structure shows a clear flow of data and control from top-level components to specialized subcomponents, with proper separation between UI presentation and business logic.

```mermaid
graph LR
A[main.tsx] --> B[Provider]
B --> C[RouterProvider]
C --> D[App Routes]
D --> E[HomePage]
D --> F[EpubReader]
D --> G[SettingsPage]
E --> H[BookCard]
E --> I[UploadZone]
H --> J[useBookDisplayData]
F --> K[ReaderHeader]
F --> L[TOCSidebar]
F --> M[ReaderFooter]
F --> N[AIAgent]
A --> O[Redux Store]
O --> P[bookshelfSlice]
E --> P
I --> P
H --> P
P --> Q[OPFSManager]
R[EPUBMetadataService] --> Q
style A fill:#4CAF50,stroke:#388E3C
style B fill:#2196F3,stroke:#1976D2
style C fill:#2196F3,stroke:#1976D2
style D fill:#2196F3,stroke:#1976D2
style E fill:#FF9800,stroke:#F57C00
style F fill:#FF9800,stroke:#F57C00
style G fill:#FF9800,stroke:#F57C00
style H fill:#FFC107,stroke:#FFA000
style I fill:#FFC107,stroke:#FFA000
style K fill:#FFC107,stroke:#FFA000
style L fill:#FFC107,stroke:#FFA000
style M fill:#FFC107,stroke:#FFA000
style N fill:#FFC107,stroke:#FFA000
style O fill:#9C27B0,stroke:#7B1FA2
style P fill:#9C27B0,stroke:#7B1FA2
style Q fill:#009688,stroke:#00796B
style R fill:#009688,stroke:#00796B
```

**Diagram sources**
- [src/main.tsx](file://src/main.tsx)
- [src/store/index.ts](file://src/store/index.ts)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)
- [src/services/OPFSManager.ts](file://src/services/OPFSManager.ts)
- [src/services/EPUBMetadataService.ts](file://src/services/EPUBMetadataService.ts)

**Section sources**
- [src/main.tsx](file://src/main.tsx)
- [src/store/index.ts](file://src/store/index.ts)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

## Performance Considerations

The application implements several performance optimizations to ensure smooth user experience, particularly in the bookshelf and reader interfaces.

### Memoization and Optimization
```mermaid
flowchart TD
A[Performance Strategies] --> B[Memoization]
A --> C[Lazy Loading]
A --> D[Event Delegation]
B --> E[useCallback for Event Handlers]
B --> F[useMemo for Derived Data]
B --> G[React.memo for Components]
C --> H[React.lazy for Routes]
C --> I[Dynamic Imports]
D --> J[Debounced Search]
D --> K[Throttled Scroll Events]
style A fill:#E3F2FD,stroke:#2196F3
style B fill:#BBDEFB,stroke:#1976D2
style C fill:#BBDEFB,stroke:#1976D2
style D fill:#BBDEFB,stroke:#1976D2
style E fill:#E1BEE7,stroke:#9C27B0
style F fill:#E1BEE7,stroke:#9C27B0
style G fill:#E1BEE7,stroke:#9C27B0
style H fill:#C8E6C9,stroke:#4CAF50
style I fill:#C8E6C9,stroke:#4CAF50
style J fill:#FFCDD2,stroke:#F44336
style K fill:#FFCDD2,stroke:#F44336
```

**Diagram sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [src/components/BookCard/index.tsx](file://src/components/BookCard/index.tsx)

The application uses `useCallback` to memoize event handlers in components like HomePage and UploadZone, preventing unnecessary re-renders. Derived data is memoized using `useMemo`, such as the active tools calculation in EpubReader. The component structure favors composition over deep nesting, reducing re-render costs. For large book collections, the grid layout uses efficient rendering with minimal inline functions and callbacks.

## Troubleshooting Guide

This section documents common issues and their solutions based on the application's error handling patterns and state management.

**Section sources**
- [src/pages/HomePage/index.tsx](file://src/pages/HomePage/index.tsx)
- [src/pages/EpubReader/index.tsx](file://src/pages/EpubReader/index.tsx)
- [src/store/slices/bookshelfSlice.ts](file://src/store/slices/bookshelfSlice.ts)

### Common Issues and Solutions
- **Book upload fails**: Check file extension (.epub) and size (must be under 100MB). The application validates these conditions before upload.
- **Book not loading**: Ensure the browser supports OPFS (Chrome 86+, Edge 86+, Firefox 102+). The application shows a compatibility warning when OPFS is not supported.
- **Context menu not appearing**: Verify that at least one tool is enabled in Settings > Context Menu. The application checks for active tools before showing the context menu.
- **Page navigation not working**: Check for JavaScript errors in the console. The smart zone click handler logs debug information about click positions and zone detection.

## Conclusion

The EPUB reader application demonstrates a well-structured React component architecture that follows modern best practices. The use of functional components with Hooks provides a clean and maintainable codebase, while the PascalCase naming convention ensures consistency across the project. Composition over inheritance allows for flexible and reusable components, with proper separation between presentation and business logic. The Redux store effectively manages global state, particularly for the bookshelf functionality, while local component state handles UI-specific concerns. The application's performance optimizations ensure a smooth user experience, and the clear component hierarchy makes the codebase easy to navigate and extend.