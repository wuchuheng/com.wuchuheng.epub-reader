# I18n (Internationalization) Implementation Specification

## 1. Overview

This document outlines the implementation plan for adding internationalization (I18n) support to the EPUB Reader application. The default language will be **Chinese (Simplified)** with support for **English** as an alternative language.

## 2. Project Analysis

### 2.1 Current State

- **No existing I18n infrastructure** - All text strings are hardcoded in components
- **Multi-page application** with distinct sections:
  - **HomePage** (Bookshelf) - Main landing page with book library
  - **EpubReader** - Reading interface with headers, TOC, AI features
  - **SettingsPage** - Multi-section settings with nested routes (General, Storage, Context Menu, About)
  - **ToolEditPage/ToolExtractPage** - Context menu tool management pages

### 2.2 Text Coverage Areas

Based on code analysis, the following areas contain user-facing text:

#### HomePage (Bookshelf)

- Header: "Epub reader", button labels
- Empty state: "No books yet", "Start building your digital library..."
- Upload prompts: "Upload Your First Book", "Drop EPUB file here"
- Alerts: "Are you sure you want to delete this book?", error messages
- Browser compatibility warnings

#### EpubReader Page

- Navigation controls, TOC sidebar ("Table of Contents")
- Help overlay content
- AI Agent interface (status bar, prompts, messages)
- Error states

#### Settings Pages

- Navigation rail: "General", "Storage", "Context Menu", "About"
- Breadcrumbs: "Home", "Settings"
- General: "General Settings", "Coming Soon", "Theme Customization", "Language Selection"
- Storage: Storage management labels
- Context Menu: Tool management forms, API configuration
- About: Version info, changelog

#### Shared Components

- BackButton: "Back"
- Error/Success messages
- Form validation messages

## 3. Technical Implementation Plan

### 3.1 I18n Library Selection

**Recommended: `react-i18next`**

- Industry standard for React applications
- Lightweight and performant
- Supports React hooks (`useTranslation`)
- LocalStorage persistence for language preference
- TypeScript support
- Easy integration with existing codebase

**Alternative: `react-intl` (Formatjs)**

- More comprehensive but heavier
- Better for complex pluralization/formatting needs

### 3.2 Architecture Design

```
src/
├── i18n/
│   ├── config.ts              # i18next configuration & initialization
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json    # Common UI elements (buttons, labels)
│   │   │   ├── homepage.json  # HomePage-specific text
│   │   │   ├── reader.json    # EpubReader-specific text
│   │   │   ├── settings.json  # Settings pages text
│   │   │   └── errors.json    # Error messages & alerts
│   │   └── en/
│   │       ├── common.json
│   │       ├── homepage.json
│   │       ├── reader.json
│   │       ├── settings.json
│   │       └── errors.json
│   └── useLanguage.ts         # Custom hook for language switching
```

### 3.3 Configuration Setup

#### Install Dependencies

```bash
pnpm add react-i18next i18next i18next-browser-languagedetector
pnpm add -D @types/i18next
```

#### i18n Config (`src/i18n/config.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import commonZh from './locales/zh-CN/common.json';
import homepageZh from './locales/zh-CN/homepage.json';
import readerZh from './locales/zh-CN/reader.json';
import settingsZh from './locales/zh-CN/settings.json';
import errorsZh from './locales/zh-CN/errors.json';

import commonEn from './locales/en/common.json';
import homepageEn from './locales/en/homepage.json';
import readerEn from './locales/en/reader.json';
import settingsEn from './locales/en/settings.json';
import errorsEn from './locales/en/errors.json';

const resources = {
  'zh-CN': {
    common: commonZh,
    homepage: homepageZh,
    reader: readerZh,
    settings: settingsZh,
    errors: errorsZh,
  },
  en: {
    common: commonEn,
    homepage: homepageEn,
    reader: readerEn,
    settings: settingsEn,
    errors: errorsEn,
  },
};

i18n
  .use(LanguageDetector) // Detect language from localStorage/browser
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN', // Default language: Chinese
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'epub-reader-lang',
    },
  });

export default i18n;
```

### 3.4 Custom Hook for Language Switching (`src/i18n/useLanguage.ts`)

```typescript
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export type SupportedLanguage = 'zh-CN' | 'en';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    changeLanguage(newLang);
  }, [currentLanguage, changeLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
  };
};
```

### 3.5 Integration Points

#### Update `src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config'; // Initialize i18n BEFORE app render
import { Provider } from 'react-redux';
// ... rest of imports

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <MessageProvider>
      <RouterProvider router={router} />
    </MessageProvider>
  </Provider>
);
```

### 3.6 Language Switcher Component

Create a new component that uses the existing `I18nSvg` icon:

**Location:** `src/components/LanguageSwitcher/index.tsx`

```typescript
import React from 'react';
import I18nSvg from '../I18nSvg';
import { useLanguage } from '../../i18n/useLanguage';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`text-gray-600 hover:text-gray-900 ${className || ''}`}
      aria-label={`Switch language (current: ${currentLanguage})`}
      title={`Current: ${currentLanguage === 'zh-CN' ? '中文' : 'English'}`}
    >
      <I18nSvg />
    </button>
  );
};
```

### 3.7 HomePage Header Update

**Location:** `src/pages/HomePage/index.tsx`

Add the LanguageSwitcher button in the header (line 189-233):

```typescript
{/* Header */}
<header className="border-b bg-white shadow-sm">
  <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{t('homepage:appTitle')}</h1>
      <div className="flex items-center gap-4">
        {/* Language Switcher - NEW */}
        <LanguageSwitcher />

        {/* Existing buttons */}
        {!isInstalled && canInstall && (
          <button onClick={installPWA} /* ... */ >
            <MdInstallDesktop />
          </button>
        )}
        <button onClick={() => navigate('/settings')} /* ... */ >
          <Settings />
        </button>
        <button onClick={handleUploadBtnClick} /* ... */ >
          <Plus />
        </button>
      </div>
    </div>
  </div>
</header>
```

### 3.8 Settings Page Integration

Add language switcher to `Container` component header OR as a dedicated section in General Settings page.

**Option 1: Add to Container header** (shows on all settings pages)
**Option 2: Add to General Settings page** (more organized, specific to settings)

**Recommended: Option 2** - Add language selection UI in General Settings

## 4. Translation File Structure

### 4.1 Sample Translation Files

#### `src/i18n/locales/zh-CN/common.json`

```json
{
  "back": "返回",
  "cancel": "取消",
  "save": "保存",
  "delete": "删除",
  "edit": "编辑",
  "add": "添加",
  "upload": "上传",
  "settings": "设置",
  "loading": "加载中...",
  "error": "错误",
  "success": "成功",
  "confirm": "确认",
  "dismiss": "关闭"
}
```

#### `src/i18n/locales/zh-CN/homepage.json`

```json
{
  "appTitle": "电子书阅读器",
  "emptyState": {
    "title": "还没有书籍",
    "description": "通过拖拽 EPUB 文件到这里或点击加号图标开始建立您的数字图书馆。",
    "uploadButton": "上传您的第一本书"
  },
  "dragOverlay": {
    "title": "将 EPUB 文件拖放到这里",
    "description": "松开以上传您的书籍"
  },
  "alerts": {
    "deleteConfirm": "您确定要删除这本书吗？",
    "deleteFailed": "删除书籍失败：{{error}}",
    "uploadFailed": "上传失败：{{error}}",
    "invalidFile": "请拖放有效的 EPUB 文件"
  },
  "browserWarning": {
    "title": "浏览器不支持",
    "description": "此浏览器不支持所需的文件系统功能。请使用 Chrome 86+、Edge 86+ 或 Firefox 102+。"
  },
  "loadingBookshelf": "正在加载您的书架..."
}
```

#### `src/i18n/locales/zh-CN/settings.json`

```json
{
  "nav": {
    "general": "通用",
    "storage": "存储",
    "contextMenu": "上下文菜单",
    "about": "关于"
  },
  "breadcrumbs": {
    "home": "首页",
    "settings": "设置"
  },
  "general": {
    "title": "通用设置",
    "description": "配置通用应用程序首选项。",
    "comingSoon": "即将推出",
    "themeCustomization": "主题自定义",
    "languageSelection": "语言选择"
  },
  "storage": {
    "title": "存储管理",
    "description": "管理本地缓存和数据。"
  },
  "contextMenu": {
    "title": "上下文菜单",
    "description": "配置 AI 提供商和自定义工具。",
    "addTool": "添加新工具",
    "editTool": "编辑工具",
    "toolName": "工具名称",
    "shortName": "简称",
    "toolType": "工具类型",
    "aiTool": "AI 工具",
    "iframeTool": "Iframe 工具"
  },
  "about": {
    "title": "关于",
    "version": "版本",
    "changelog": "更新日志"
  }
}
```

#### `src/i18n/locales/en/homepage.json`

```json
{
  "appTitle": "Epub Reader",
  "emptyState": {
    "title": "No books yet",
    "description": "Start building your digital library by dragging an EPUB file here or clicking the Plus icon.",
    "uploadButton": "Upload Your First Book"
  },
  "dragOverlay": {
    "title": "Drop EPUB file here",
    "description": "Release to upload your book"
  },
  "alerts": {
    "deleteConfirm": "Are you sure you want to delete this book?",
    "deleteFailed": "Failed to delete book: {{error}}",
    "uploadFailed": "Upload failed: {{error}}",
    "invalidFile": "Please drop a valid EPUB file"
  },
  "browserWarning": {
    "title": "Browser Not Supported",
    "description": "This browser doesn't support the required file system features. Please use Chrome 86+, Edge 86+, or Firefox 102+."
  },
  "loadingBookshelf": "Loading your bookshelf..."
}
```

## 5. Component Migration Strategy

### 5.1 Using `useTranslation` Hook

**Before:**

```typescript
<h1 className="text-2xl font-bold text-gray-900">Epub reader</h1>
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('homepage');
<h1 className="text-2xl font-bold text-gray-900">{t('appTitle')}</h1>
```

### 5.2 With Interpolation (for dynamic content)

**Before:**

```typescript
alert(`Failed to delete book: ${error}`);
```

**After:**

```typescript
const { t } = useTranslation('homepage');
alert(t('alerts.deleteFailed', { error }));
```

### 5.3 Component-by-Component Migration List

#### Phase 1: Core Navigation & Common Elements

1. ✅ `BackButton` - "Back" label
2. ✅ `Breadcrumb` - "Home", "Settings"
3. ✅ `Container` header elements

#### Phase 2: HomePage

1. ✅ Header title & buttons
2. ✅ Empty state messages
3. ✅ Drag overlay
4. ✅ Alert dialogs
5. ✅ Error/Warning messages

#### Phase 3: SettingsPage

1. ✅ Navigation rail labels
2. ✅ General Settings page
3. ✅ Storage page
4. ✅ Context Menu settings
5. ✅ About page

#### Phase 4: EpubReader

1. ✅ Reader header
2. ✅ TOC sidebar
3. ✅ AI Agent interface
4. ✅ Help overlay

#### Phase 5: Tool Management Pages

1. ✅ ToolExtractPage
2. ✅ ToolEditPage
3. ✅ Form labels & validation

## 6. Settings Page Language Selection UI

Add a new section in **General Settings** (`src/pages/SettingsPage/index.tsx`):

```typescript
import { useLanguage } from '../../i18n/useLanguage';
import { useTranslation } from 'react-i18next';

export const GeneralPage: React.FC = () => {
  const { t } = useTranslation('settings');
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {t('general.title')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('general.description')}
        </p>
      </div>

      {/* Language Selection */}
      <div className="rounded-lg bg-white border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('general.languageSelection')}
        </h4>
        <div className="flex gap-3">
          <button
            onClick={() => changeLanguage('zh-CN')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === 'zh-CN'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Coming Soon section */}
      <div className="rounded-lg bg-gray-50 p-4">
        {/* ... existing code ... */}
      </div>
    </div>
  );
};
```

## 7. Implementation Steps

### Step 1: Setup & Configuration

1. ✅ Install dependencies (`react-i18next`, `i18next`, `i18next-browser-languagedetector`)
2. ✅ Create `src/i18n/` directory structure
3. ✅ Create configuration file (`config.ts`)
4. ✅ Create custom hook (`useLanguage.ts`)
5. ✅ Initialize i18n in `main.tsx`

### Step 2: Create Translation Files

1. ✅ Create all JSON translation files for Chinese (zh-CN)
2. ✅ Create all JSON translation files for English (en)
3. ✅ Organize by namespace (common, homepage, reader, settings, errors)

### Step 3: Create UI Components

1. ✅ Create `LanguageSwitcher` component
2. ✅ Update General Settings page with language selection UI
3. ✅ Test language switching functionality

### Step 4: Migrate Components (Incremental)

1. ✅ Start with common components (`BackButton`, `Breadcrumb`)
2. ✅ Migrate HomePage
3. ✅ Migrate Settings pages
4. ✅ Migrate EpubReader page
5. ✅ Migrate Tool management pages

### Step 5: Testing & Validation

1. ✅ Test language switching on all pages
2. ✅ Verify localStorage persistence
3. ✅ Test browser language detection
4. ✅ Verify all text is properly translated
5. ✅ Test dynamic text with interpolation

## 8. UI/UX Considerations

### 8.1 Language Switcher Placement

- **HomePage Header**: Add I18n icon button next to Settings button
- **Settings > General**: Primary language selection interface with full buttons

### 8.2 Visual Design

- Use the existing `I18nSvg` component for the icon
- Match existing button styles (gray text, hover effects)
- Maintain consistent spacing (gap-4) with other header buttons

### 8.3 Accessibility

- Add proper `aria-label` for screen readers
- Show current language in tooltip
- Keyboard navigation support

## 9. Future Enhancements

### 9.1 Additional Languages

- Add support for Traditional Chinese (zh-TW)
- Add support for Japanese (ja)
- Add support for Spanish (es)

### 9.2 Advanced Features

- RTL language support (Arabic, Hebrew)
- Pluralization rules
- Date/time formatting per locale
- Number formatting per locale
- Dynamic language loading (code splitting)

### 9.3 Translation Management

- Use translation management platform (e.g., Crowdin, Lokalise)
- Add missing translation warnings in development
- Translation coverage reports

## 10. Files to Create/Modify

### New Files

- ✅ `src/i18n/config.ts`
- ✅ `src/i18n/useLanguage.ts`
- ✅ `src/i18n/locales/zh-CN/common.json`
- ✅ `src/i18n/locales/zh-CN/homepage.json`
- ✅ `src/i18n/locales/zh-CN/reader.json`
- ✅ `src/i18n/locales/zh-CN/settings.json`
- ✅ `src/i18n/locales/zh-CN/errors.json`
- ✅ `src/i18n/locales/en/common.json`
- ✅ `src/i18n/locales/en/homepage.json`
- ✅ `src/i18n/locales/en/reader.json`
- ✅ `src/i18n/locales/en/settings.json`
- ✅ `src/i18n/locales/en/errors.json`
- ✅ `src/components/LanguageSwitcher/index.tsx`

### Modified Files

- ✅ `src/main.tsx` - Add i18n initialization
- ✅ `src/pages/HomePage/index.tsx` - Add LanguageSwitcher, migrate text
- ✅ `src/pages/SettingsPage/index.tsx` - Add language selection UI, migrate text
- ✅ `src/pages/SettingsPage/SettingsLayout.tsx` - Migrate nav labels
- ✅ `src/components/BackButton/index.tsx` - Migrate "Back" label
- ✅ `src/components/Breadcrumb/index.tsx` - Support translated labels
- ✅ Other component files as listed in Section 5.3

### Package Files

- ✅ `package.json` - Add i18n dependencies

## 11. TypeScript Support

Add type definitions for better IDE support:

**`src/i18n/types.ts`**

```typescript
import 'react-i18next';
import common from './locales/zh-CN/common.json';
import homepage from './locales/zh-CN/homepage.json';
import reader from './locales/zh-CN/reader.json';
import settings from './locales/zh-CN/settings.json';
import errors from './locales/zh-CN/errors.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      homepage: typeof homepage;
      reader: typeof reader;
      settings: typeof settings;
      errors: typeof errors;
    };
  }
}
```

## 12. Summary

This specification provides a complete roadmap for implementing I18n support in the EPUB Reader application:

1. **Default language**: Chinese (Simplified)
2. **Additional language**: English
3. **UI Integration**: I18n button in HomePage header + language selection in Settings
4. **Incremental migration**: Component-by-component approach
5. **Best practices**: Namespaced translations, custom hooks, TypeScript support
6. **User-friendly**: Persistent language preference, browser detection

The implementation maintains the existing UI/UX design while adding seamless language switching capabilities.
