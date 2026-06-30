# Navigation Map

## StudyOS: Your Complete Preparation Operating System

This document outlines the navigation architecture, layout frameworks, and responsive transition mappings for StudyOS.

---

## 1. Global Navigation Layout Hierarchy

```
+-------------------------------------------------------------------------------+
|  TOPBAR: [Logo] StudyOS  (Breadcrumbs: Dashboard > Planner)  [Streak] [Avatar]|
+----------+--------------------------------------------------------------------+
|          |                                                                    |
|          |                                                                    |
| SIDEBAR  |  MAIN APPLICATION WORKSPACE (S-XXX Screens)                        |
|          |                                                                    |
|          |                                                                    |
|          |                                                                    |
+----------+--------------------------------------------------------------------+
|  MOBILE NAVIGATION BAR (Visible only on <1024px screens)                      |
+-------------------------------------------------------------------------------+
```

---

## 2. Navigation Components Specifications

### Sidebar (Desktop Navigation)

- **Position:** Fixed left sidebar panel (width: $240\text{px}$). Collapses to a slim icon-only sidebar (width: $72\text{px}$) on medium viewport scales ($1024\text{px}$ to $1200\text{px}$).
- **Navigation Links Groupings:**
  - **Section 1: General**
    - `Dashboard` (Icon: `LayoutDashboard`, Route: `/dashboard`)
    - `Syllabus Tracker` (Icon: `BookOpen`, Route: `/syllabus`)
  - **Section 2: Execution**
    - `Daily Planner` (Icon: `Calendar`, Route: `/planner`)
    - `Study Timer` (Icon: `Timer`, Route: `/focus`)
  - **Section 3: Review**
    - `Notes Workspace` (Icon: `FileText`, Route: `/notes`)
    - `Revision Deck` (Icon: `Layers`, Route: `/revision`)
    - `Mock Tests` (Icon: `Award`, Route: `/mock-tests`)
  - **Section 4: System**
    - `Analytics` (Icon: `BarChart3`, Route: `/analytics`)
    - `Settings` (Icon: `Settings`, Route: `/settings`)

### Topbar (Global Context Controls)

- **Breadcrumbs:** Left-aligned link sequence displaying nested pathways (e.g., `Syllabus` $\rightarrow$ `Algorithms` $\rightarrow$ `Graph Search`).
- **Context Dropdown:** Allows switching between active exam profiles (e.g., `GATE 2027` vs. `Semester 7`).
- **Streak Status Widget:** Flame counter linking to achievements page when clicked.
- **User Actions Menu:** Clickable avatar trigger displaying:
  - Profile Settings (`/settings`)
  - Security configuration (`/settings/security`)
  - Divider
  - Logout (Triggers session termination API)

### Mobile Navigation Layout (Viewports $< 1024\text{px}$)

- **Desktop Sidebar:** Hidden. Replaced by a responsive bottom tab bar and a collapsible slide-out hamburger drawer.
- **Bottom Navigation Tabs (Primary Paths):**
  - Tab 1: `Home` (`/dashboard`)
  - Tab 2: `Planner` (`/planner`)
  - Tab 3: `Timer` (`/focus`)
  - Tab 4: `Notes` (`/notes`)
  - Tab 5: `Menu` (Triggers drawer overlay)
- **Menu Drawer Overlay:** Contains links to secondary dashboards: `Syllabus Tracker`, `Revision Deck`, `Mock Tests`, `Analytics`, and `Settings`.

---

## 3. Screen Navigation Matrix

The mapping below outlines the expected navigation pathways between screens:

| Origin Screen        | Navigation Action      | Target Screen           | UI Element Trigger               |
| :------------------- | :--------------------- | :---------------------- | :------------------------------- |
| **S-102 Login**      | Successful Login       | **S-301 Dashboard**     | "Submit" button / OAuth callback |
| **S-301 Dashboard**  | Click active countdown | **S-303 Focus Timer**   | Countdown widget                 |
| **S-301 Dashboard**  | Click review warning   | **S-402 Revision Deck** | "Revise Now" alert button        |
| **S-401 Notes**      | Convert text to card   | **S-402 Revision Deck** | Note editor context menu         |
| **S-403 Mock Tests** | Click diagnostic check | **S-404 Analytics**     | "Analyze Error Log" link         |
| **S-501 Settings**   | Select security tab    | **S-502 Security**      | Segmented page tab bar           |
