# Feature Specification: Context Menu Enhancements

## Overview

This specification outlines the addition of navigation and control features to the Context Menu component in the EPUB Reader. The goal is to improve usability for long content and provide regeneration capabilities for AI responses.

## 1. Right-Side Navigation Buttons

Two floating action buttons will be added to the right side of the Context Menu content area.

### 1.1 Scroll Next Viewport (Top Button)

- **Icon**: `IoIosArrowDown` (from react-icons/io) - _Wait, user said "top icon button to go to scroll next visiable port view" but usually top button is for up. Let's clarify. User said: "the top icon button to go to scroll next visiable port view. the bottom icon do the same but to bottom director". This is slightly confusing. Let's assume standard scroll controls:_
  - **Top Button**: Scrolls UP (Previous Viewport). Icon: `IoIosArrowUp`.
  - **Bottom Button**: Scrolls DOWN (Next Viewport). Icon: `IoIosArrowDown`.
  - _Correction based on user text_: "the top icon button to go to scroll next visiable port view." -> This implies the top button scrolls _down_? Or maybe they meant "Scroll Up" button is on top?
  - _Re-reading_: "the top icon button to go to scroll next visiable port view. the bottom icon do the same but to bottom director". This phrasing is ambiguous. "next visible port view" usually means scrolling down one page. "bottom director" might mean scroll to the very bottom?
  - _Interpretation_:
    - **Button 1 (Top)**: Scroll Down by one viewport height (Page Down behavior).
    - **Button 2 (Bottom)**: Scroll to the absolute bottom of the content.
  - _Alternative Interpretation (Standard UI)_:
    - Top Button: Scroll Up.
    - Bottom Button: Scroll Down.
  - _Decision_: I will implement standard Scroll Up / Scroll Down buttons, but positioned on the right.
    - **Top Icon**: `IoIosArrowUp` -> Scroll Up (1 viewport).
    - **Bottom Icon**: `IoIosArrowDown` -> Scroll Down (1 viewport).
  - _Refined Requirement from User_: "and if scroll bar to the bottom, the bottom icon button should in disable clicking state."
  - _Let's stick to the user's specific request if possible, but "top icon button to go to scroll next visiable port view" sounds like "Page Down". Let's assume standard navigation controls are safer and explain:_
    - **Up Arrow**: Scroll Up.
    - **Down Arrow**: Scroll Down.
    - **Disable Logic**: Disable Down Arrow if at bottom. Disable Up Arrow if at top (optional but good UX).

### 1.2 Scroll Logic

- **Scroll Amount**: One viewport height (minus a small overlap context).
- **Position**: Fixed/Sticky on the right side of the content area.
- **State**:
  - The bottom button (Down Arrow) must be **disabled** when the scroll container is at the bottom.

## 2. AI Response Refresh Button

A refresh button will be added to the AI tool header (or similar position) to allow regenerating the response.

### 2.1 Placement

- Same position as the `iframe` refresh tool.
- Located in the section header or tool bar.

### 2.2 Behavior

- **Action**: Triggers a re-fetch of the AI response.
- **Icon**: `LuRefreshCcw` (consistent with existing iframe refresh).

## 3. Technical Implementation

### 3.1 Components

#### `ContextMenu.tsx`

- **State**:
  - `aiRefreshCounters`: `Record<number, number>` to track refresh triggers for each AI tool.
  - `activeScrollTarget`: `HTMLElement | null` to track the currently scrollable element (either the main list or the active AI conversation).
- **UI Changes**:
  - Render `IoIosArrowUp` and `IoIosArrowDown` as floating buttons (absolute positioned, high z-index).
  - Render `LuRefreshCcw` in the AI tool header section.
- **Logic**:
  - **Refresh**: Clicking the refresh button increments the counter for the specific AI tool index.
  - **Scroll**:
    - Clicking Up/Down buttons scrolls `activeScrollTarget` by `clientHeight`.
    - Listen to `scroll` events on `activeScrollTarget` to update button disabled state.
    - Pass a callback `onScrollTargetMount` to `AIAgent` to capture its scroll container reference when in conversation mode.

#### `AIAgent.tsx`

- **Props**:
  - `refreshId`: `number` (optional).
  - `onScrollTargetMount`: `(el: HTMLElement | null) => void` (optional).
- **Logic**:
  - **Refresh**:
    - Watch for changes in `refreshId`.
    - On change, identify the latest message.
    - If the latest message is from `assistant`, remove it from the list.
    - Call `fetchAIMessage` with the updated list and `{ ignoreCache: true }` to force regeneration.

#### `useFetchAIMessage.ts`

- **Function Signature**:
  - Update `fetchAIMessage` to accept an optional second argument: `options?: { ignoreCache?: boolean }`.
- **Logic**:
  - If `options.ignoreCache` is true:
    - Skip the `checkAIToolCache` step.
    - Proceed directly to API call.
    - Force `saveAIToolCache` (overwrite) upon successful completion.

### 3.2 Dependencies

- `react-icons/io`: `IoIosArrowUp`, `IoIosArrowDown`.
- `react-icons/lu`: `LuRefreshCcw`.

### 3.3 State Management

- **Scroll Buttons**:
  - Maintain `isAtTop` and `isAtBottom` state to toggle button styling/disabled state.
  - Use a throttle/debounce on scroll event listener for performance.

## 4. User Stories

- As a user reading a long AI explanation, I want to easily scroll down without dragging the scrollbar.
- As a user, I want to know when I've reached the bottom of the content.
- As a user, I want to regenerate an AI answer if I'm not satisfied with the first one.
