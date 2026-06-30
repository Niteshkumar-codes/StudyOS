# Design System

## StudyOS: Your Complete Preparation Operating System

This document establishes the UI design system tokens, typography rules, interactive states, and theme guidelines to build a premium, glassmorphism-based user interface.

---

## 1. Color Palette Tokens

The design uses a dark-mode-first aesthetic with dynamic, vibrant accent gradients to highlight active elements.

### Color Swatches

| Token Name               | Light Theme Hex | Dark Theme Hex | Semantic Usage                                      |
| :----------------------- | :-------------- | :------------- | :-------------------------------------------------- |
| `--color-bg-primary`     | `#F8F9FA`       | `#0B0F19`      | Main screen canvas background.                      |
| `--color-bg-secondary`   | `#FFFFFF`       | `#161F30`      | Cards, panels, and dropdown containers.             |
| `--color-text-primary`   | `#1A202C`       | `#F7FAFC`      | Primary titles, navigation items, body copy.        |
| `--color-text-secondary` | `#4A5568`       | `#94A3B8`      | Subtitles, helper text, timestamps.                 |
| `--color-accent-primary` | `#4F46E5`       | `#6366F1`      | Primary button, focus timer ring, highlight states. |
| `--color-accent-success` | `#10B981`       | `#34D399`      | Completion milestones, streaks, active logs.        |
| `--color-accent-warning` | `#F59E0B`       | `#FBBF24`      | Delayed warnings, high-importance items.            |
| `--color-accent-danger`  | `#EF4444`       | `#F87171`      | Backlog topics, expired tokens, timer cancel.       |

### Gradient Utilities

- **Primary Accent Gradient:** `linear-gradient(135deg, #6366F1 0%, #A855F7 100%)` (Indigo to Purple)
- **Glassmorphism Overlay:** `rgba(22, 31, 48, 0.7)` with `backdrop-filter: blur(12px)` and border border line `rgba(255, 255, 255, 0.05)`.

---

## 2. Typography Guidelines

Utilizes the modern sans-serif typeface **Outfit** (via Google Fonts) for a premium, operating-system-like look.

| Style Name            | Font Size                  | Line Height | Weight         | Tailwind Class Equivalent |
| :-------------------- | :------------------------- | :---------- | :------------- | :------------------------ |
| **Display Heading 1** | `2.25rem` ($36\text{px}$)  | `1.2`       | Bold (700)     | `text-4xl font-bold`      |
| **Section Heading 2** | `1.5rem` ($24\text{px}$)   | `1.3`       | SemiBold (600) | `text-2xl font-semibold`  |
| **Card Header 3**     | `1.125rem` ($18\text{px}$) | `1.4`       | Medium (500)   | `text-lg font-medium`     |
| **Body Standard**     | `1rem` ($16\text{px}$)     | `1.6`       | Regular (400)  | `text-base font-normal`   |
| **Helper Small**      | `0.875rem` ($14\text{px}$) | `1.5`       | Light (300)    | `text-sm font-light`      |

---

## 3. Spacing Grid (8pt System)

All margins, padding, and layout grid offsets are built using multiples of $8\text{px}$ to maintain layout consistency.

- `xs`: $4\text{px}$ (Text adjustments, small badges padding)
- `sm`: $8\text{px}$ (Button internal padding, micro gaps)
- `md`: $16\text{px}$ (Card internal padding, standard gaps)
- `lg`: $24\text{px}$ (Grid spacing, card titles offsets)
- `xl`: $32\text{px}$ (Dashboard section margins)

---

## 4. UI Components Specifications

### Buttons

- **Primary Active:** Accent Gradient, white text, $8\text{px}$ border radius, subtle drop shadow. Hover state uses a scale animation (`scale(1.02)`) with a brightness boost.
- **Secondary Outline:** Glass overlay background with a thin border.
- **Interactive States:** Transition duration configured at `150ms ease-in-out` for hover, focus, and active clicks.

### Cards

- **Premium Glass Card:**
  ```css
  .glass-card {
    background: rgba(22, 31, 48, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  ```

### Tables

- **Metrics Tables:** Minimalist rows without borders. Zebra striping with a background color change using `--color-bg-secondary`. Header row uses uppercase text with a letter-spacing adjustment.

### Charts Color Mapping

- **Primary Line/Bar Charts:** Accent Indigo line with a soft gradient fill.
- **Syllabus completion:** Segment colors match subject color coding.
- **Mock Tests Trend:** Cutoff marker is represented by a dashed red line (`#EF4444`).

---

## 5. UI Animations & Transitions

Smooth micro-animations make the interface feel responsive and active.

- **Timer Countdown Pulse:** A scale transition (`scale(1.0) -> scale(1.03)`) applied on the countdown label during the final 10 seconds of a study block.
- **Task Complete Slide:** Checked items slide slightly to the right with a transition delay before fading out.
- **View Transitions:** Screen-level swaps utilize CSS page transitions:
  ```css
  .page-enter {
    opacity: 0;
    transform: translateY(8px);
  }
  .page-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 250ms,
      transform 250ms ease-out;
  }
  ```

---

## 6. Icons System

StudyOS maps visual icons using **Lucide Icons**:

- **Streak Tracker:** `Flame` (Orange/Yellow glow gradient)
- **Daily Planner:** `Calendar`
- **Study Timer:** `Timer` / `Play` / `Pause`
- **Notes Workspace:** `FileText` / `Link` / `Edit3`
- **Settings Panel:** `Settings` / `User` / `Shield`
