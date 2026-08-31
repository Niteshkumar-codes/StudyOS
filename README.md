# StudyOS 📚

> A modern, unified web workspace built for students and competitive exam aspirants to organize subjects, track syllabus progress, plan daily tasks, time study sessions, analyze productivity, and manage study notes.

---

## 📋 Table of Contents

1. [StudyOS Overview](#1-studyos-overview)
2. [Problem It Solves](#2-problem-it-solves)
3. [Main Features](#3-main-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture Overview](#5-architecture-overview)
6. [Project Structure](#6-project-structure)
7. [Authentication Flow](#7-authentication-flow)
8. [Exam Management](#8-exam-management)
9. [Subjects & Syllabus](#9-subjects--syllabus)
10. [Daily Planner](#10-daily-planner)
11. [Study Timer](#11-study-timer)
12. [Study Session History](#12-study-session-history)
13. [Progress Analytics](#13-progress-analytics)
14. [Notes Workspace](#14-notes-workspace)
15. [MongoDB Setup](#15-mongodb-setup)
16. [Environment Variables](#16-environment-variables)
17. [Local Development Setup](#17-local-development-setup)
18. [Backend and Frontend Commands](#18-backend-and-frontend-commands)
19. [Production Build Commands](#19-production-build-commands)
20. [API Overview](#20-api-overview)
21. [Security Considerations](#21-security-considerations)
22. [Future Improvements](#22-future-improvements)
23. [Screenshots](#23-screenshots)
24. [License](#24-license)

---

## 1. StudyOS Overview

**StudyOS** is a specialized, open-source productivity dashboard built specifically for students preparing for competitive and academic examinations (e.g., GATE, JEE, UPSC, University finals). It consolidates fragmented tools—like task lists, stopwatch timers, syllabus checklists, exam countdowns, and notes apps—into a single workspace with continuous progress feedback, streak counters, and gamified XP metrics.

---

## 2. Problem It Solves

Competitive exam preparation requires long-term consistency, multi-subject tracking, and daily discipline. Existing tools suffer from several flaws:
- **Fragmented Workflows:** Students juggle separate apps for task management, timers, notes, and syllabus tracking.
- **Lack of Syllabus Visibility:** Generic task managers do not model hierarchical syllabus topics (`NOT_STARTED` ➔ `IN_PROGRESS` ➔ `COMPLETED`) or calculate granular progress metrics per subject.
- **Distracting Analytics:** Generic productivity apps lack study-specific analytics such as subject time distribution, daily activity trends, and target exam countdowns.
- **Inconsistent Session Tracking:** Manual logs are tedious, whereas automated timers connected directly to subject statistics eliminate friction.

StudyOS solves these problems by uniting syllabus completion tracking, focused study timers, exam countdowns, daily planning, and revision notes inside one secure, full-stack application.

---

## 3. Main Features

- 🔐 **Dual Authentication & Security:** Standard register/login with hashed passwords (`bcryptjs`) alongside single-click Google OAuth 2.0. Session control via short-lived JWT Access Tokens and HTTP-only Refresh Cookies.
- 📊 **Centralized Executive Dashboard:** At-a-glance metrics covering total study hours, active streak days, user level & XP, upcoming exam countdowns, today's top tasks, and active subject progress.
- 🎯 **Exam Management:** Target exam tracker displaying countdown days, target scores, target ranks, and exam dates.
- 📚 **Subjects & Syllabus Tracker:** Hierarchical subject organization with color codes, topic breakdown, topic status toggling, and automated percentage completion calculations.
- 📅 **Daily Task Planner:** Flexible task scheduling with date filters, status tracking, and today's priority view.
- ⏱️ **Integrated Study Timer:** Dual-mode timer (stopwatch & countdown) with subject/topic tagging, session persistence, automatic XP gains, and streak updates.
- 📜 **Study Session History:** Comprehensive history log showing duration, subject tags, timestamps, and session notes with deletion support.
- 📈 **Productivity Analytics:** Visual graphs breakdown for daily activity, weekly trends, total study hours, subject time allocation, and syllabus progress.
- 📝 **Notes Workspace:** Full-featured note-taking environment supporting Markdown/plain text, tags, subject filtering, quick search, and updated timestamps.
- 📱 **Responsive UI Design:** Optimized layout for desktop monitors, tablets, and mobile browsers.

---

## 4. Tech Stack

### Frontend (`apps/web`)
- **Core Library:** React 19, TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **UI Components & Icons:** Lucide React icons
- **State & Data Fetching:** TanStack React Query v5, Axios
- **Form Handling & Validation:** React Hook Form, Zod, @hookform/resolvers
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM v7

### Backend (`apps/api`)
- **Runtime Environment:** Node.js (v20+)
- **Framework:** Express v4, TypeScript
- **Database & ODM:** MongoDB, Mongoose v9
- **Authentication:** Passport.js (`passport-google-oauth20`), `jsonwebtoken`, `bcryptjs`
- **Security & Utilities:** Helmet, CORS, Cookie-parser, Express Rate Limit, Zod validation

### Monorepo & Tooling
- **Package Manager:** pnpm (v9) with pnpm workspaces
- **Orchestration:** Turborepo
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

---

## 5. Architecture Overview

StudyOS follows a clean monorepo architecture separating client applications, server APIs, and shared configuration/type packages:

```
                      ┌──────────────────────────┐
                      │   React 19 Frontend      │
                      │       (@studyos/web)      │
                      └─────────────┬────────────┘
                                    │ HTTP / REST API (Axios + Credentials)
                                    │ JWT Bearer Token / HTTP-only Refresh Cookie
                                    ▼
                      ┌──────────────────────────┐
                      │   Express REST API       │
                      │       (@studyos/api)      │
                      └─────────────┬────────────┘
                                    │ Mongoose ODM
                                    ▼
                      ┌──────────────────────────┐
                      │    MongoDB Database      │
                      └──────────────────────────┘
```

---

## 6. Project Structure

```
StudyOS/
├── apps/
│   ├── api/                  # Express REST API application
│   │   ├── src/
│   │   │   ├── config/       # Database & Passport OAuth configurations
│   │   │   ├── controllers/  # Auth, Notes, Profile, and Study controllers
│   │   │   ├── middleware/   # Auth check, rate limiting, validation
│   │   │   ├── models/       # Mongoose Schemas (User, Subject, Exam, Task, Note, Session)
│   │   │   ├── routes/       # Express API routes
│   │   │   ├── services/     # Mail and Token management services
│   │   │   └── app.ts        # Express app initialization
│   │   ├── .env.example      # Backend environment template
│   │   └── tsconfig.json
│   │
│   └── web/                  # Vite + React 19 Frontend application
│       ├── src/
│       │   ├── components/   # Reusable UI components & layouts
│       │   ├── contexts/     # Auth Context Provider
│       │   ├── lib/          # Axios client instance
│       │   ├── pages/        # Dashboard, Exams, Planner, Timer, Notes, Analytics
│       │   └── App.tsx       # React router & providers
│       ├── .env              # Frontend environment variables
│       └── vite.config.ts
│
├── packages/
│   ├── config/               # Shared TypeScript & ESLint configurations
│   ├── types/                # Shared TypeScript domain interfaces
│   ├── ui/                   # Shared UI primitives
│   └── utils/                # Shared utility helpers
│
├── pnpm-workspace.yaml       # Monorepo workspace definition
├── turbo.json                # Turborepo task pipeline configuration
├── package.json              # Root dependencies & scripts
└── README.md                 # Project documentation
```

---

## 7. Authentication Flow

```
   [User] ──(Register/Login)──► [POST /api/auth/register | /login] ──► Validate Credentials
                                                                                │
                                 ┌──────────────────────────────────────────────┘
                                 ▼
                   Generate JWT Access Token (15m)
                   Set HTTP-Only Refresh Cookie (7d)
                                 │
                                 ▼
                     Returned User Payload & Access Token
```

- **Standard Auth:** User registers with name, username, email, password, and preparation goals. Passwords are salt-hashed via `bcryptjs`.
- **Google OAuth 2.0:** Single click authentication redirects through Google Consent screen. User profile data creates or links to an existing verified StudyOS account.
- **Session Persistence:** Access token stored in React memory (`AuthContext`); refresh token saved securely in HTTP-only `sameSite` cookie. Token rotation occurs automatically on 401 response via Axios interceptors.

> **Note on Setup:** Google OAuth requires configuring valid client ID and client secret credentials in environment variables (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`).

---

## 8. Exam Management

Track upcoming target exams with precision:
- Create target exams with title, date, target score, target rank, and preparation type.
- Automatic live calculations of days remaining (`Countdown`).
- Quick edit and deletion controls.
- Visual status cards integrated directly into the central dashboard.

---

## 9. Subjects & Syllabus

Detailed hierarchical syllabus management:
- Create subjects with custom title, code, description, and accent color.
- Add topics to subjects, assign target hours, and set topic status:
  - `NOT_STARTED`
  - `IN_PROGRESS`
  - `COMPLETED`
- Automated real-time subject progress calculations:
  $$\text{Progress \%} = \left( \frac{\text{Completed Topics}}{\text{Total Topics}} \right) \times 100$$
- Total completed topic counts update dashboard metrics dynamically.

---

## 10. Daily Planner

Streamlined daily task planning:
- Create tasks linked to subjects or general study goals.
- Fields include title, date, priority (`LOW`, `MEDIUM`, `HIGH`), and status (`PENDING`, `COMPLETED`).
- Filter view by Today's tasks, upcoming dates, or completed tasks.
- One-click task completion toggles.

---

## 11. Study Timer

Focus-enhancing study timer engine:
- **Modes:** Stopwatch (count-up) and Countdown Timer modes.
- **Subject Association:** Select target subject and topic before starting.
- **Control Actions:** Start, Pause, Resume, Stop, and Discard.
- **Session Saver:** Saves session duration, subject ID, topic ID, and optional reflection notes.
- **Gamification Mechanics:** Saving a session awards XP points to the user profile and maintains/increments daily active study streak count.

---

## 12. Study Session History

Complete record of completed study effort:
- Chronological list of logged study sessions.
- Displays subject tag, duration (minutes/hours), date timestamp, and reflection notes.
- Deletion support to remove accidental logs.

---

## 13. Progress Analytics

Data-driven productivity insights:
- **Total Study Hours:** Total accumulative study duration.
- **Time Window Filters:** Today, Weekly, and Monthly aggregations.
- **Subject Distribution:** Percentage breakdown of study time per subject.
- **Daily Activity Graph:** Visual bar representations of daily study duration over time.
- **Syllabus Progress Summary:** Comparative progress bars across all enrolled subjects.

---

## 14. Notes Workspace

Centralized study notes editor:
- Create, view, edit, and delete study notes.
- Attach subject tags and custom topic tags.
- Full-text search across titles and content.
- Filter notes by subject or tag.
- Displays last updated timestamps.

---

## 15. MongoDB Setup

StudyOS uses MongoDB for document storage via Mongoose.

### Local MongoDB Setup
Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017/studyos`.

### MongoDB Atlas Setup (Production)
1. Create a MongoDB Atlas cluster.
2. Obtain your connection string.
3. Set the `MONGODB_URI` environment variable in your production deployment.

---

## 16. Environment Variables

### Backend Environment Variables (`apps/api/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `CORS_ORIGIN` | Allowed client URL for CORS & OAuth redirects | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/studyos` |
| `JWT_ACCESS_SECRET` | Secret key for signing Access Tokens | `your_access_secret_key` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `your_refresh_secret_key` |
| `JWT_ACCESS_EXPIRY` | Access Token expiration duration | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh Token expiration duration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your_google_client_secret` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI callback | `http://localhost:5000/api/auth/google/callback` |
| `SMTP_HOST` | *(Optional)* SMTP host for password resets | `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional)* SMTP port | `587` |
| `SMTP_USER` | *(Optional)* SMTP username | `your_email@gmail.com` |
| `SMTP_PASS` | *(Optional)* SMTP app password | `your_app_password` |
| `SMTP_FROM` | *(Optional)* Sender email header | `StudyOS <no-reply@studyos.com>` |

### Frontend Environment Variables (`apps/web/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint URL for REST API | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Display name of the web application | `StudyOS` |

---

## 17. Local Development Setup

### Prerequisites
- Node.js (v20.x or higher)
- pnpm (`npm install -g pnpm`)
- MongoDB (running locally or MongoDB Atlas URI)

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/studyos.git
   cd studyos
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Files:**
   Create `.env` inside `apps/api/` based on `apps/api/.env.example`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Ensure `apps/web/.env` contains valid Vite configuration.

4. **Start Development Servers:**
   ```bash
   pnpm dev
   ```
   Or run specific applications:
   ```bash
   # Start API server only (port 5000)
   pnpm --filter @studyos/api dev

   # Start Web client only (port 3000)
   pnpm --filter @studyos/web dev
   ```

5. **Access Application:**
   Open browser at `http://localhost:3000`.

---

## 18. Backend and Frontend Commands

| Task | Command |
| :--- | :--- |
| **Run Monorepo (Dev)** | `pnpm dev` |
| **Run Backend API (Dev)** | `pnpm --filter @studyos/api dev` |
| **Run Frontend Web (Dev)** | `pnpm --filter @studyos/web dev` |
| **Build All** | `pnpm build` |
| **Build Backend API** | `pnpm --filter @studyos/api build` |
| **Build Frontend Web** | `pnpm --filter @studyos/web build` |
| **Lint All** | `pnpm lint` |
| **Lint Frontend Web** | `pnpm --filter @studyos/web lint` |
| **Format Code** | `pnpm format` |

---

## 19. Production Build Commands

```bash
# Build TypeScript backend and Vite frontend bundle
pnpm build

# Start production API server
pnpm --filter @studyos/api start
```

---

## 20. API Overview

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login with username/email & password
- `POST /api/auth/logout` — Revoke refresh session and clear cookie
- `POST /api/auth/refresh` — Refresh access token using cookie
- `GET  /api/auth/google` — Trigger Google OAuth 2.0 flow
- `GET  /api/auth/google/callback` — Google OAuth callback handler
- `GET  /api/auth/google/status` — Check Google OAuth configuration status
- `POST /api/auth/forgot-password` — Request password reset email
- `POST /api/auth/reset-password` — Complete password reset with token

### Profile & Stats (`/api/profile`)
- `GET  /api/profile` — Fetch current user profile details
- `PUT  /api/profile` — Update user profile details

### Study & Planner (`/api/study`)
- `GET / POST / PUT / DELETE /api/study/exams` — Manage target exams
- `GET / POST / PUT / DELETE /api/study/subjects` — Manage subjects & syllabus topics
- `GET / POST / PUT / DELETE /api/study/tasks` — Manage planner tasks
- `GET / POST / DELETE /api/study/sessions` — Manage study sessions & duration logs
- `GET /api/study/analytics` — Get aggregated study metrics & progress reports

### Notes Workspace (`/api/notes`)
- `GET / POST / PUT / DELETE /api/notes` — Manage study notes

---

## 21. Security Considerations

- **Secrets Handling:** Secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_SECRET`) are strictly loaded via environment variables and never hardcoded into source control.
- **CORS Policies:** Configured dynamically via `CORS_ORIGIN` to restrict cross-origin access.
- **HTTP-Only Refresh Cookies:** Refresh tokens are transmitted strictly via secure HTTP-only cookies to prevent XSS extraction.
- **Password Protection:** User passwords are encrypted using `bcryptjs` with salt rounds prior to persistence.
- **Rate Limiting:** Auth routes and global routes utilize Express Rate Limit middleware to prevent brute-force attacks.
- **HTTP Hardening:** Express application uses `helmet()` header protections against clickjacking, MIME sniffing, and cross-site scripting vulnerabilities.

---

## 22. Future Improvements

- 🔔 Push and browser desktop notifications for upcoming exams and task reminders.
- 👥 Collaborative study groups and shared subject syllabus templates.
- 📱 Native mobile app built with React Native.
- 📊 CSV/PDF Export for study analytics and session log reports.

---

## 23. Screenshots

*(Place screenshots of Dashboard, Study Timer, Subjects & Syllabus, Daily Planner, Notes, and Analytics here when deployed)*

---

## 24. License

This project is open source and available under the [MIT License](LICENSE).
