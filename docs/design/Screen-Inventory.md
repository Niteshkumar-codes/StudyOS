# Screen Inventory Specification

## StudyOS: Your Complete Preparation Operating System

This document catalogs every application screen, identifying primary layout features, sub-components, and permission protections.

---

## 1. Authentication Screens Group

### S-101: Landing & Marketing Page

- **Purpose:** Public landing page to convert visitors into registered users.
- **Components:** Hero tagline, feature list cards, mock test dashboard preview images, call-to-action buttons.
- **Route:** `/` (Public)

### S-102: Login Screen

- **Purpose:** Authenticate returning users.
- **Components:** Email/password input forms, OAuth button group (Google/GitHub SSO), password reset link.
- **Route:** `/login` (Public)

### S-103: Registration & Verification Screen

- **Purpose:** Account creation and initial email validation.
- **Components:** Registration fields, 6-digit OTP verification panel with countdown timer for resending OTPs.
- **Route:** `/register` (Public)

---

## 2. Workspace & Setup Screens Group

### S-201: Onboarding Setup Dialog

- **Purpose:** Initial setup step for new accounts.
- **Components:** Choice selector (Pre-configured vs. Custom Exam), target date picker calendar, initial study target slider.
- **Route:** `/onboarding` (Auth Required)

### S-202: Syllabus Management Portal

- **Purpose:** Manage subjects, topics, and completion status.
- **Components:** Search/filter bar, tree view listing subjects and topics, "Add Subject" and "Edit Topic" dialog forms, weightage verification indicators.
- **Route:** `/syllabus` (Auth Required)

---

## 3. Daily Execution Screens Group

### S-301: Main Dashboard Console

- **Purpose:** Command center displaying streaks, daily progress, and current task lists.
- **Components:** Streak indicator widget, circular progress charts, Focus list card, Pomodoro widget panel, revision alert queue cards.
- **Route:** `/dashboard` (Auth Required)

### S-302: Time-Blocking Planner

- **Purpose:** Plan scheduled blocks calendar views.
- **Components:** Calendar workspace (Day/Week/Month views), draggable backlog queue sidebar panel, quick add events modal.
- **Route:** `/planner` (Auth Required)

### S-303: Focus Timer Studio

- **Purpose:** Distraction-free countdown screen.
- **Components:** Large fullscreen digital clock countdown display, white noise selection panel, focus pause/abort buttons.
- **Route:** `/focus` (Auth Required)

---

## 4. Academic review & Analytics Screens Group

### S-401: Notes Workspace

- **Purpose:** Document study guides and concepts.
- **Components:** File navigation drawer sidebar, markdown editor workspace with split-screen preview, KaTeX mathematical components editor toolbar, "Create Flashcard" button.
- **Route:** `/notes` (Auth Required)

### S-402: Spaced Repetition Flashcard deck

- **Purpose:** Active flashcard reviews.
- **Components:** Card review interface (Question/Answer 3D rotations), SM-2 recall rating slider button group, progress bar showing remaining cards in deck.
- **Route:** `/revision` (Auth Required)

### S-403: Mock Test Logbook

- **Purpose:** Record mock test performance details.
- **Components:** "Log Mock Test" dialog panel, error log upload section with cloud attachments widgets, cutoff benchmark charts, wrong questions logs.
- **Route:** `/mock-tests` (Auth Required)

### S-404: Performance Analytics Centre

- **Purpose:** Graph and metrics visualization hub.
- **Components:** Subject time distribution pie chart widgets, Mastery Matrix scatter plot maps, daily study logs grid table, export button.
- **Route:** `/analytics` (Auth Required)

---

## 5. Configuration & Future Management

### S-501: User Profile Settings

- **Purpose:** Custom configuration settings.
- **Components:** Profile edit form, avatar upload dropzones, theme dark/light selector toggles, API data portability backup export actions.
- **Route:** `/settings` (Auth Required)

### S-502: Security Options

- **Purpose:** Secure identity configurations.
- **Components:** Password change form, active login sessions overview grid, MFA setup QR displays.
- **Route:** `/settings/security` (Auth Required)

### S-601: SuperAdmin Control Panel (Future Release)

- **Purpose:** Global catalog, exam templates, and user administration.
- **Components:** User metrics grid list, global pre-configured exam syllabus creator, user report analytics.
- **Route:** `/admin` (SuperAdmin Role Required)
