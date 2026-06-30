# User Flows

## StudyOS: Your Complete Preparation Operating System

This document outlines the visual and logic flows for the primary user paths within StudyOS.

---

## 1. Authentication User Flows

### Landing Page & Register Flow

```mermaid
graph TD
    A[Visitor on Landing Page] --> B{Has Account?}
    B -- Yes --> C[Click 'Login' -> Navigate to Login Screen]
    B -- No --> D[Click 'Get Started' -> Navigate to Register Screen]
    D --> E[Enter Name, Email, Password]
    E --> F[Submit Registration Form]
    F --> G{Form Valid?}
    G -- No --> H[Show Inline Validation Errors]
    G -- Yes --> I[Trigger Email OTP Generation]
    I --> J[Navigate to OTP Verification Screen]
```

### Email OTP Verification Flow

```mermaid
graph TD
    A[OTP Screen Loaded] --> B[Retrieve OTP from Email]
    B --> C[Input 6-Digit OTP]
    C --> D[Submit Verification]
    D --> E{OTP Valid & Not Expired?}
    E -- No --> F[Show OTP Error / Request Resend]
    E -- Yes --> G[Authenticate User -> Generate Session JWT]
    G --> H[Redirect to Onboarding / Dashboard]
```

### Google Login Flow

```mermaid
graph TD
    A[Click 'Continue with Google'] --> B[Redirect to Google OAuth Consent Page]
    B --> C{Consent Given?}
    C -- No --> D[Redirect back to Login with Cancel Alert]
    C -- Yes --> E[Google OAuth Callback with Code]
    E --> F[Backend Validates Code with Google API]
    F --> G{User exists in DB?}
    G -- No --> H[Auto-Register User with Google Email/Avatar]
    G -- Yes --> I[Generate Session JWT]
    H --> I
    I --> J[Redirect to Dashboard]
```

---

## 2. Onboarding & Core Syllabus Management

### Create Exam & Syllabus Selection Flow

```mermaid
graph TD
    A[First-time User Login] --> B[Redirect to Welcoming Onboarding Dialog]
    B --> C{Choose Setup Method}
    C -- Pre-Configured Exam --> D[Select Exam: GATE, UPSC, CAT, SSC, etc.]
    C -- Custom Exam --> E[Input Custom Exam Name & Date]
    D --> F[Confirm Syllabus Import]
    E --> G[Build Initial Subjects Tree]
    F --> H[Populate Subjects & Topics Database]
    G --> H
    H --> I[Redirect to Main Dashboard]
```

### Subject & Topic Configuration Flow

```mermaid
graph TD
    A[User on Exam Syllabus Screen] --> B[Click 'Add Subject' or 'Add Topic']
    B --> C[Enter Title, Weightage %, and Difficulty Tag]
    C --> D[Submit Details]
    D --> E{Validation Checked?}
    E -- Weightage Over 100% --> F[Show Dynamic Balancing Error]
    E -- Valid --> G[Save to database]
    G --> H[Update progress tree visuals in real-time]
```

---

## 3. Core Productivity & Log Loops

### Daily Planner Flow

```mermaid
graph TD
    A[User Opens Daily Planner] --> B[View calendar layout & unscheduled items list]
    B --> C[Drag unscheduled task card onto Calendar slot]
    C --> D[System schedules item and adjusts calendar events]
    D --> E{Update status?}
    E -- Complete Task --> F[Click Task Checkbox -> Logs progress]
    E -- Reschedule --> G[Drag to alternative time block]
```

### Study Timer Focus Loop

```mermaid
graph TD
    A[User Launches Study Timer] --> B[Configure Duration: Pomodoro or Stopwatch]
    B --> C[Click 'Start focus session']
    C --> D[Launch full-screen strict mode focus window]
    D --> E[Timer running...]
    E --> F{Session Ended?}
    F -- Cancelled --> G[Log time as aborted -> Return to dashboard]
    F -- Completed --> H[Trigger completion notification chime]
    H --> I[Open Study Log prompt modal]
    I --> J[Link session to Subject & Topic -> Enter focus rating]
    J --> K[Submit Log -> Save records & updates streak progress]
```

---

## 4. Academic Review & Analytics Loops

### Notes & Flashcards Creation Flow

```mermaid
graph TD
    A[User Opens Notes Workspace] --> B[Select Subject -> Create New Markdown Note]
    B --> C[Write rich text notes using syntax/LaTeX]
    C --> D[Highlight concept text in editor]
    D --> E[Click 'Convert to Flashcard']
    E --> F[Input card question & answer details]
    F --> G[Save card -> Insert into active Spaced Repetition queue]
```

### Mock Test & Error Log Flow

```mermaid
graph TD
    A[Navigate to Mock Test Panel] --> B[Select 'Log Mock Test']
    B --> C[Input scores, sections breakdown, and upload errors screenshots]
    C --> D[Save Test Diagnostics]
    D --> E[Update mock test analytics timeline]
    E --> F[Add incorrect questions to the active Error Logbook]
```

### Reports & Analytics Flow

```mermaid
graph TD
    A[User Opens Reports Dashboard] --> B[View Mastery Matrix, Focus charts, and Completion progress]
    B --> C[Click 'Generate Performance Review']
    C --> D[Compile PDF detailing study log ratios and mock test profiles]
    D --> E[Download PDF or share secure viewing link]
```
