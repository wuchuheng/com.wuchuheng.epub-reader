# Specification: Multi-Font Support & Customization

## 1. Objective
Allow users to select from a variety of typography options to enhance reading comfort. This includes support for Serif, Sans-Serif, and specifically **Rounded (圆体)** fonts for both Chinese and English.

## 2. Font Selection
We will provide the following built-in options:

| Font Category | English Candidate | Chinese Candidate | Notes |
| :--- | :--- | :--- | :--- |
| **Default** | System Sans | Noto Sans SC | Clean and native |
| **Rounded (圆体)** | **Quicksand** | **ZCOOL KuaiLe** / **Chill Round** | User's primary requirement |
| **Serif (衬线)** | Lora / Playfair | Source Han Serif | Classic book feel |
| **Script (手写)** | Dancing Script | Ma Shan Zheng | Literary feel |

## 3. Technical Architecture

### 3.1. Common Layout Component
We will extract a `CommonSettingLayout` from the "Context Menu Settings" page to be reused across all specialized setting pages.

**Layout Structure:**
- **Row 1 (Split View)**:
    - **Sidebar (Col 1)**: List of options (e.g., Font families, Tools).
    - **Content/Preview (Col 2)**: Main configuration area or real-time render preview.
- **Row 2 (Action Bar)**:
    - **Sticky Bottom Bar**: Centered "Save" button and status messages.

### 3.2. Font Storage & Loading
- **Latin Fonts**: Loaded via Google Fonts API (Web-first) with `@font-face` fallbacks.
- **Chinese Fonts**: Hosted as static files in `/public/fonts/` to ensure offline availability (PWA requirement).
- **Dynamic CSS**: A utility will generate the `@font-face` and theme CSS required by `epub.js`.

### 3.3. Global Font Application
Unlike traditional readers that only style the book content, this feature will apply the selected font **globally** to the entire application.

- **Implementation**: We will use a CSS variable (e.g., `--app-font-family`) defined in `src/index.css`.
- **Dynamic Update**: A root-level effect will update this variable on the `<html>` or `<body>` element whenever the setting changes.
- **Scope**: This includes the Home Page, Settings, Sidebar, and all UI components, ensuring a truly unified aesthetic.

### 3.4. State Management (Redux)
Update `src/store/slices/settingsSlice` (or equivalent) to include:
- `fontFamily`: The unique ID of the selected font.
- `fontSize`: (Existing or new) to complement the typography settings.

### 3.5. Reader Integration (`epub.js`)
When the `rendition` is created:
1.  Register the font theme: `rendition.themes.font(selectedFontFamily)`.
2.  Inject the font URL into the iframe: `rendition.hooks.content.register((contents) => { contents.addStylesheet(fontUrl); })`.
3.  Ensure the iframe inherits the global font variable if possible, or explicitly set it via the theme.

## 4. User Interface (UX)

### 4.1. Font Settings Page (using CommonSettingLayout)
- **Sidebar**: List of fonts with their names rendered in their own style.
- **Preview Area**: A beautifully rendered book fragment (e.g., from *Heidi* or a generic "Lorem Ipsum") that updates instantly as the user clicks a font in the sidebar.
- **Action Bar**: A large "Save Changes" button.

### 4.2. Reader Toolbar
- Quick-access font size and font family buttons within the reader's top/bottom menu.

## 5. Development Plan
1.  **Preparation**: Download and optimize the "Rounded" font files.
2.  **State Layer**: Add `fontFamily` to Redux settings.
3.  **Service Layer**: Create `FontService.ts` to manage CSS injection logic.
4.  **UI Layer**: Implement the Font Picker component.
5.  **Integration**: Connect the picker to the `EpubReader` rendition themes.

## 6. Acceptance Criteria
- [ ] Users can change the font from the settings menu.
- [ ] Changes apply instantly to the current book without reloading.
- [ ] The "Rounded" font works perfectly for both Chinese and English characters.
- [ ] Settings are saved and restored automatically across sessions.
- [ ] Fonts are available offline via PWA caching.
