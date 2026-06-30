# Product Requirements Document (PRD)

## StudyOS: Your Complete Preparation Operating System

---

## 1. Vision

StudyOS aims to be the definitive "Preparation Operating System" for students and competitive exam aspirants. Instead of forcing learners to juggle multiple fragmented tools—such as calendars, note-taking applications, Pomodoro timers, syllabus spreadsheets, and test platforms—StudyOS consolidates these into a single, cohesive, AI-powered workspace. The core philosophy is to transition students from passive content consumption to active, disciplined preparation, helping them track progress, manage time, revise scientifically, and succeed in their goals.

---

## 2. Objectives

- **Centralization:** Consolidate syllabus tracking, planning, execution, and analytics into one unified dashboard.
- **Data-Driven Preparation:** Empower users with quantitative insights into their preparation status, productivity levels, and subject-wise readiness.
- **Scientific Revision:** Combat the forgetting curve by automating spaced repetition schedules for notes and concepts.
- **Personalization:** Provide adaptive study planners and AI-assisted doubt clearance customized to specific exam syllabi.
- **Retention & Engagement:** Build high user retention through gamified achievements, progress streaks, and clear milestones.

---

## 3. Problems Solved

| Problem Area                   | Current Scenario                                                                                         | StudyOS Solution                                                                                                   |
| :----------------------------- | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Tool Fragmentation**         | Aspirants use Notion for notes, Excel for syllabus, Google Calendar for schedules, and Toggl for timing. | A unified interface linking notes, syllabus, planner, and timer directly together.                                 |
| **Syllabus Anxiety**           | Students feel overwhelmed by massive syllabi and cannot visualize actual completion percentages.         | Hierarchical progress bars (Subject $\rightarrow$ Topic $\rightarrow$ Sub-topic) with predictive completion dates. |
| **Forgotten Concepts**         | Learners study a topic once but forget it by exam day due to lack of structured revision.                | Automated revision planner employing spaced repetition models (e.g., SM-2 adaptation).                             |
| **Inefficient Study Sessions** | High screen distraction and lack of tracking lead to low-quality study hours.                            | Integrated focus timer with blocklist features, auto-logged directly into a centralized history.                   |
| **Lack of Personalization**    | Standard study resources treat all students identically regardless of individual weaknesses.             | AI Study Assistant that customizes revision schedules and answers context-specific questions.                      |

---

## 4. Target Users

StudyOS targets students and job aspirants preparing for high-stakes examinations:

- **Placement Prep:** Engineering and college students aiming for software engineering, consulting, or corporate roles.
- **GATE:** Engineering graduates vying for postgraduate admissions (IITs/IISc) or Public Sector Undertaking (PSU) recruitments.
- **Semester Exams:** Undergraduate and postgraduate students looking to organize coursework and maintain high GPAs.
- **CAT:** Management aspirants preparing for quantitative aptitude, logical reasoning, and verbal ability tests for business schools.
- **UPSC:** Civil services candidates managing a massive, multi-subject syllabus spanning current affairs, history, and administration.
- **SSC / Banking:** Job seekers preparing for speed-based quantitative, logical, and English exams.
- **Custom Exams:** Candidates of regional, departmental, or niche professional certification exams requiring custom syllabus configuration.

---

## 5. User Personas

### Persona 1: The High-Achiever Tech Aspirant

- **Name:** Aarav Mehta (21, Male)
- **Goal:** Clear GATE CS and secure a software engineering placement at a Tier-1 tech company.
- **Pain Points:** Hard to balance college semester courses with GATE preparation; spends too much time structuring syllabus tracker spreadsheets.
- **How StudyOS Helps:** Uses the concurrent multi-exam configuration to track "GATE CS" and "Semester 7 IT" simultaneously. Automated planners schedule study blocks around university classes.

### Persona 2: The Working Professional Civil Services Aspirant

- **Name:** Priya Sharma (26, Female)
- **Goal:** Crack the UPSC Civil Services Examination while working full-time (40 hours/week).
- **Pain Points:** Extremely limited study time (3-4 hours/day); struggles to maintain revision consistency; overwhelmed by vast humanities subjects.
- **How StudyOS Helps:** Spaced repetition schedules tell her exactly what to revise each morning. Daily planner optimizes short time blocks (e.g., 45-minute lunch breaks).

### Persona 3: The Career Switcher Banking Aspirant

- **Name:** Vikram Singh (24, Male)
- **Goal:** Clear the SBI PO and IBPS exams within 6 months.
- **Pain Points:** Lacks speed in quantitative aptitude; struggles to identify weak topics; prone to procrastination.
- **How StudyOS Helps:** The Study Timer and Mock Test analytics track time-per-question. Gamified achievement badges keep him motivated during long preparation weeks.

---

## 6. Functional Requirements

### Functional Requirements Matrix

| ID        | Module         | Feature Description                                                        | Priority |
| :-------- | :------------- | :------------------------------------------------------------------------- | :------- |
| **FR-01** | Auth           | Multi-tenant auth with OAuth (Google, GitHub) and email login.             | P0       |
| **FR-02** | Dashboard      | Unified dashboard showing weekly progress, active timer, and planner.      | P0       |
| **FR-03** | Exam Mgmt      | Select, configure, and manage target exams with target dates.              | P0       |
| **FR-04** | Subject Mgmt   | Create, edit, and weigh subjects within configured exams.                  | P0       |
| **FR-05** | Topic Mgmt     | Build hierarchical lists of topics and sub-topics with status states.      | P0       |
| **FR-06** | Syllabus Track | Track overall completion metrics and view velocity charts.                 | P0       |
| **FR-07** | Daily Planner  | Time-blocking calendar to schedule tasks and drag-and-drop items.          | P0       |
| **FR-08** | Study Timer    | Pomodoro and stopwatch timers with customizable work/break intervals.      | P0       |
| **FR-09** | Study Logs     | Automated and manual logging of study sessions linked to topics.           | P0       |
| **FR-10** | Notes          | Rich text editor supporting markdown, code snippets, and image uploads.    | P1       |
| **FR-11** | Notifications  | Browser push alerts and daily email digests of scheduled tasks.            | P1       |
| **FR-12** | Revision Plan  | Automated revision scheduler based on spaced repetition.                   | P0       |
| **FR-13** | Mock Tests     | Log mock test scores, analyze subject-wise errors, track time per section. | P1       |
| **FR-14** | Analytics      | Graphical dashboards tracking time distributions and syllabus progress.    | P1       |
| **FR-15** | AI Assistant   | Contextual bot to answer queries, summarize notes, and recommend topics.   | P1       |
| **FR-16** | Reports        | Exportable weekly progress reports (PDF/HTML) for mentors or self-review.  | P2       |
| **FR-17** | Achievements   | Streak tracking, milestones, and virtual badge rewards.                    | P2       |

---

## 7. Non-Functional Requirements

### Performance & Scalability

- **Response Time:** API endpoints must return data in $< 200\text{ ms}$ under normal load conditions.
- **Frontend Load Time:** Core dashboard must achieve a Google Lighthouse performance score of $\ge 90$ on desktop.
- **Concurrent Users:** System architecture must support up to $10,000$ concurrent active users scaling horizontally.

### Usability & Accessibility

- **Responsive Design:** Seamless layout adjustments across desktop (minimum viewport $1024\text{px}$) and mobile (viewport $360\text{px}$).
- **Accessibility:** Adherence to WCAG 2.1 Level AA guidelines, including screen reader compatibility and keyboard navigability.
- **Dark Mode:** System-wide dark/light theme toggle persisting preferences locally or in user profiles.

### Reliability & Availability

- **Uptime:** $\ge 99.9\%$ SLA (excluding scheduled maintenance windows).
- **Data Redundancy:** Continuous automated hourly database backups with multi-region disaster recovery.
- **Offline Sync:** Basic client-side caching via service workers to allow timer use and note writing during temporary network drops.

---

## 8. Authentication Requirements

StudyOS implements a secure, JWT-based authentication system:

- **Authentication Providers:**
  - Password-based registration/login with mandatory password strength checks (min 8 characters, uppercase, numbers, special characters).
  - Social Sign-On (SSO): Google and GitHub OAuth 2.0 integration.
- **Session Management:**
  - Access tokens expire in 15 minutes; refresh tokens kept in secure HTTP-only cookies with a 30-day lifetime.
  - Device Management page displaying active login sessions with the ability to revoke specific devices.
- **Multi-Factor Authentication (MFA):** Optional TOTP-based MFA (via apps like Google Authenticator or Authy) configurable in user settings.
- **Password Reset:** Secure password-reset flow utilizing time-locked, single-use email tokens (valid for 1 hour).

---

## 9. Dashboard Overview

The Dashboard is the centralized command center of StudyOS. It must be highly aesthetic, visual, and action-oriented.

### Dashboard Layout & Wireframe Components

1. **Header Zone:** Warm greeting, current streak counter (flaming icon), and global study status.
2. **Left Panel (Overview & Analytics):**
   - Circular progress ring showing overall target exam completion.
   - Weekly bar chart comparing planned study hours vs. actual logged hours.
3. **Center Panel (Daily Planner & Tasks):**
   - Active day schedule view (Current hour highlighted).
   - "Focus List" of top 3 high-priority tasks for the day.
4. **Right Panel (Quick Utilities):**
   - Mini Pomodoro Timer component (can be launched into full-screen focus mode).
   - Up-next revision recommendations based on spaced repetition.

```
+---------------------------------------------------------------------------------+
|  [Logo] StudyOS       [Streak: 12 Days 🔥]               [Profile Icon / Theme] |
+-----------------------------------+---------------------------------------------+
|                                   |  TODAY'S PLAN (Monday, Jun 29)              |
|  EXAM TARGET PROGRESS             |  [ ] 09:00 - 11:00: GATE CS Quant  (P0)     |
|  +-----------------------------+  |  [ ] 14:00 - 15:30: Data Structures (P0)    |
|  | GATE 2027: [======---] 65%  |  |  [ ] 18:00 - 19:30: Mock Test 2 Review (P1) |
|  +-----------------------------+  +---------------------------------------------+
|                                   |  QUICK TIMER                                |
|  WEEKLY STUDY TIME vs. TARGET     |  +---------------------------------------+  |
|  Mon: [====------] 2.5 / 6 hrs    |  |             [ 25:00 ]                 |  |
|  Tue: [==========] 6.0 / 6 hrs    |  |       [ Start ]   [ Reset ]           |  |
|                                   |  +---------------------------------------+  |
+-----------------------------------+---------------------------------------------+
|  SPACED REPETITION QUEUE          |  AI ASSISTANT                               |
|  - Graph Theory (Overdue 2 days)  |  "Ready to study. What are we revising      |
|  - DBMS Normalization (Due Today) |   today?"                                   |
+-----------------------------------+---------------------------------------------+
```

---

## 10. Exam Management

The core structural block of StudyOS is the Exam Entity. Users can prioritize multiple exams concurrently.

### Exam Management Features

- **Multi-Exam Focus:** Users can track multiple target exams (e.g., GATE and Semester Exams) in parallel, switching dashboards via a drop-down menu.
- **Target Target Dates:** Each exam has an associated exam date, dynamically driving a count-down timer (days remaining) and calculating the required daily study velocity.
- **Custom Exam Creator:** If an exam is not in the system registry, users can build a custom template by inputting:
  - Exam Name & Description
  - Exam Target Date
  - Custom syllabus tree structure (Subject $\rightarrow$ Topic)

```
Target Date Configuration:
Required Study Velocity = (Total Topics - Completed Topics) / Days Remaining
```

---

## 11. Subject Management

Under each exam, the syllabus is split into subjects.

### Subject Attributes

- **Title and Description:** e.g., "Data Structures and Algorithms" under the exam "Placement Prep".
- **Weightage Configuration:** A user-defined percentage representing the importance of this subject in the target exam (e.g., $15\%$ weightage).
- **Visual Coding:** Distinct accent colors (custom HEX values) assigned to each subject to color-code UI charts, logs, and calendar items.
- **Resource Repository:** Ability to link primary textbooks, web links, or playlist URLs to specific subjects for easy retrieval.

---

## 12. Topic Management

Subjects are decomposed into micro-topics and sub-topics to facilitate precise monitoring.

### Topic Structure & Properties

- **Hierarchy:** `Subject` $\rightarrow$ `Topic` $\rightarrow$ `Sub-topic`.
- **Difficulty Tagging:** Every topic is marked as `Easy`, `Medium`, or `Hard` to prioritize studies.
- **Completion States:** A topic can have one of the following states:
  - `Not Started`
  - `In Progress`
  - `Completed (Needs Revision)`
  - `Mastered`
- **Revision Counts:** Increments automatically every time a spaced repetition session or note-review is logged against this topic.

---

## 13. Syllabus Tracking

A highly visual representation of exam completion.

### Key Tracking Dashboards

- **Progress Aggregations:** Interactive tree map showing completion rates of each subject. Clicking a subject expands to show individual topic states.
- **Syllabus Progress Bar:** Global progress calculated as a weighted average:
  $$\text{Syllabus Completion \%} = \sum_{i=1}^{n} \left( \text{Subject } i \text{ Completion \%} \times \text{Subject } i \text{ Weightage} \right)$$
- **Backlog Indicator:** Identifies topics flagged as "In Progress" for more than 14 days, urging the user to reschedule them.

---

## 14. Daily Planner

The daily planner bridges syllabus progress and daily time management.

### Planner Functional Details

- **Time-Blocking Calendar:** Day, Week, and Month views supporting custom events and study blocks.
- **Drag-and-Drop Task System:** Unfinished tasks from the "Backlog" column can be dragged straight onto calendar time slots to schedule them.
- **Calendar Integration:** Two-way sync support with external calendars (Google Calendar and Apple Calendar) to avoid scheduling conflicts with external life events.
- **Task Prioritization:** Color-coded priority levels based on the Eisenhower Matrix (P0: Urgent/Important, P1: Important/Not Urgent, P2: Urgent/Not Important, P3: Low Priority).

---

## 15. Study Timer

A distraction-free module designed to build focused study habits.

### Timer Configurations

- **Pomodoro Mode:** Pre-set intervals (25 min study, 5 min break; or 50 min study, 10 min break) with automated sound alerts (white noise, soft chimes).
- **Stopwatch Mode:** Open-ended timer for long-form exam practice, tracking elapsed time until manually paused.
- **Distraction Shield (Strict Mode):** Optionally block specific browser tabs or prompt users if they navigate away from the StudyOS tab during an active timer.
- **Picture-in-Picture (PiP) Support:** Floating timer widget that remains visible in a small window when users view other resources on their computer.

---

## 16. Study Logs

Every minute spent on the Study Timer must be cataloged for transparency.

### Log Schema & Workflow

- **Auto-Logging:** When a study timer finishes, a log entry is auto-generated. The user is prompted to link the log to a specific `Subject` and `Topic`.
- **Manual Logs:** Ability to retroactively add logs for offline study sessions (e.g., studying from physical textbooks or attending offline lectures).
- **Qualitative Metrics:** Users can rate their focus score (1 to 5 stars) and add brief session notes describing what was achieved.

| Log ID | Timestamp        | Target Exam    | Subject         | Topic                | Duration | Focus Rating |
| :----- | :--------------- | :------------- | :-------------- | :------------------- | :------- | :----------- |
| #2091  | 2026-06-29 10:00 | GATE CS        | Algorithms      | Graph Theory         | 50 mins  | ⭐⭐⭐⭐     |
| #2092  | 2026-06-29 14:30 | Placement Prep | Data Structures | Trees & Binary Trees | 90 mins  | ⭐⭐⭐⭐⭐   |

---

## 17. Notes

A digital notebook built directly into the student operating system.

### Note-Taking Capabilities

- **Rich Markdown Editor:** Support for headers, tables, bold/italic, code blocks with syntax highlighting, and LaTeX math formatting.
- **Dynamic Linking:** Use a Wiki-style notation (e.g., `[[Topic Name]]`) to link notes directly to specific topics and syllabus elements.
- **Flashcard Conversion:** Select any text block in a note and click "Convert to Flashcard" to send it to the Spaced Repetition deck.
- **Exporting Options:** Export individual notes as PDF, HTML, or Markdown files.

---

## 18. Notifications

Notifications keep users accountable and aligned with their targets.

### Notification Channels

- **In-App Notification Center:** A bell icon on the dashboard displaying warnings of overdue tasks and achievements.
- **Browser Push Notifications:** Prompts for break end, session start, and daily planner schedules.
- **Daily Agenda Email:** An email sent at 07:00 AM local time detailing the day's planned study blocks, backlog items, and revision cards due.
- **Slack/Discord Webhooks (Optional):** Integrating accountability notifications to shared study group channels.

---

## 19. Revision Planner

Implements a scientific approach to learning retention.

### Spaced Repetition System (SRS)

- **Review Algorithms:** Based on a modified SM-2 interval algorithm. After a user reviews a flashcard or note, they rate their recall:
  - 1: Forgotten (Review immediately)
  - 2: Struggled (Review in 1 day)
  - 3: Good Recall (Review in 3 days)
  - 4: Perfect Recall (Review in 7 days)
- **Revision Queue:** A visual stack of cards/notes due for review on the dashboard.
- **Auto-Scheduling:** If a student marks a topic as "Completed" in Syllabus Tracking, the Revision Planner automatically creates its first review task 3 days out.

---

## 20. Mock Tests

Mock test management helps track exam readiness.

### Mock Test Modules

- **Test Score Tracker:** Log full-length or sectional mock tests.
- **Sectional Diagnostics:** Input breakdown of scores: Section Name, Questions Attempted, Correct, Incorrect, Marks Obtained, and Time Spent.
- **Error Logbook:** A specific repository where students upload screenshots of questions they got wrong, cataloging them by error type (e.g., "Conceptual Error", "Calculation Mistake", "Time Pressure").
- **Target vs. Actual Charts:** A line graph comparing mock test scores over time against the target cutoff score.

---

## 21. Analytics Dashboard

Transforms raw tracking data into actionable insights.

### Visualization Widgets

- **Time Distribution (Pie Chart):** Percentage of total study time spent on each subject.
- **Study Velocity Line Chart:** Running total of completed topics vs. the target timeline trajectory.
- **Focus Analysis:** A scatter plot mapping Focus Rating against the hour of the day to identify the user's peak performance hours.
- **Subject Mastery Matrix:** A grid mapping subjects across two axes: "Study Hours Logged" vs. "Mock Test Proficiency %".

```
High Mastery |  [Slow Progress / High Score]  |   [Peak Performance - High Score]
             |                                |
Low Mastery  |  [Danger Zone - Low Score]     |   [Time Waster - Low Score]
             +--------------------------------+------------------------------
                                       Study Hours Logged --->
```

---

## 22. AI Study Assistant

A context-aware AI integration utilizing Retrieval-Augmented Generation (RAG) based on user notes and syllabi.

### AI Features

- **Instant Doubt Resolution:** A chatbot panel where users ask questions about their notes or subjects (e.g., "Explain Dijkstra's algorithm time complexity using my notes").
- **Automatic Summarization:** Generates quick summaries and cheat sheets from long markdown notes.
- **Study Plan Generator:** Generates a daily schedule based on an exam date, target syllabus, and available hours.
- **Smart Quizzes:** Reads notes and automatically generates multiple-choice questions for revision checks.

---

## 23. Reports

StudyOS generates structured summaries for retrospective analysis.

### Report Outputs

- **Weekly Performance Review:** A PDF summarizing:
  - Total hours studied (vs. previous week).
  - List of topics completed.
  - Mock test scores.
  - AI-generated recommendations (e.g., "You spent 80% of your time on Math but your mock test scores show DBMS needs attention").
- **Exporting Options:** Secure shareable links to reports that can be sent to parents, mentors, or accountability partners.

---

## 24. Achievements

Gamification elements to maintain high user engagement.

### Gamification Engine

- **Streak Tracking:** Displays current consecutive study days (minimum 30 minutes/day). If a streak is broken, users can buy a "Streak Freeze" using experience points (XP).
- **XP System:** Earn XP by completing timed study sessions, finishing daily planning tasks, or passing a mock test review.
- **Level Up:** Progression system (Level 1 to 100) with visual changes to profile avatars.
- **Badges:** Unlockable badges for specific milestones:
  - _Night Owl:_ Logged study session between 12:00 AM and 04:00 AM.
  - _Deep Worker:_ Logged a continuous 120-minute study session with a focus rating of 5 stars.
  - _Revision Master:_ Completed 100 spaced repetition cards.

---

## 25. Security Requirements

Security measures required for a production-ready cloud application:

- **Data Encryption:**
  - All data in transit encrypted using TLS 1.3.
  - Sensitive user data (passwords, payment details, session tokens) encrypted at rest using AES-256.
- **API Protection:** Rate limiting (max 100 requests/minute per IP/API token) to prevent denial-of-service attacks.
- **Privacy Compliance:** Compliance with GDPR and CCPA guidelines, including:
  - A user-facing "Delete My Account" button executing a soft delete followed by hard purging within 30 days.
  - Simple export tool to retrieve all user notes and study logs in JSON format.
- **Secure Code Practices:** Protection against OWASP Top 10 vulnerabilities (input sanitization against SQL injection and cross-site scripting (XSS)).

---

## 26. Future Scope

Items planned for subsequent release cycles (Phase 2):

- **Collaborative Study Rooms:** Virtual study rooms with shared timers, audio channels, and chat boards.
- **Marketplace for Syllabi:** Crowd-sourced syllabus templates for niche exams, created and monetized by community mentors.
- **Integrated Flashcard Marketplace:** Standardized deck templates for exams (e.g., UPSC current affairs decks, GATE formulas).
- **Native Applications:** Android and iOS apps with local caching and offline widget access.
- **LMS Integrations:** Direct API integrations to fetch assignments and schedules from Canvas, Moodle, and Google Classroom.

---

## 27. Acceptance Criteria

Acceptance criteria defined in a user-scenario format:

### Scenario 1: Configuring a Custom Target Exam

- **Given** a new user logged into StudyOS,
- **When** they click "Add Exam" on their dashboard and select "Custom Exam",
- **And** they input "Deep Learning Certification", set a target date 3 months away, and input 3 primary subjects,
- **Then** the database should initialize the new exam, update the navigation sidebar, and display a count-down timer displaying the correct days remaining on the main dashboard.

### Scenario 2: Logging an Automated Pomodoro Session

- **Given** a user completing a 25-minute Pomodoro timer session,
- **When** the timer runs down to 00:00,
- **Then** the application should trigger a completion sound notification,
- **And** present a modal form prompting the user to select the related subject and topic,
- **And** upon submission, immediately append a study log entry, update the daily study metrics, and increment the topic progress bar.

### Scenario 3: Generating AI Doubt Resolution from Notes

- **Given** a user studying their notes on "Graph Theory",
- **When** they highlight a text snippet and click "Ask AI",
- **Then** the system should pass the snippet along with the question context to the AI assistant,
- **And** stream the AI response in real time inside a split-screen panel, showing citations to existing note segments.

### Scenario 4: Scientific Revision Schedule Trigger

- **Given** a user who marks the topic "Dynamic Programming" as "Completed",
- **When** the status change is saved,
- **Then** the system should calculate a revision interval using the SM-2 algorithm,
- **And** schedule a task in the Revision Planner due exactly 3 days from the current date.
