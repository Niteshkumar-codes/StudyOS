# StudyOS

StudyOS is a monorepo study workspace for planning exams, organizing subjects and syllabus topics, logging study sessions, tracking notes, and reviewing study analytics. The supported authentication flow is Google-only sign-in and sign-up.

## Overview

The application is split into a React/Vite frontend and an Express/MongoDB backend. Most study data is stored in MongoDB through the API. The exam management module is client-side and persists to browser localStorage.

## Features

- Google-only authentication with refresh-token session handling.
- Dashboard with summary cards for subjects, tasks, notes, study time, sessions, and syllabus progress.
- Exam management with create, edit, delete, and detail views.
- Subjects with embedded syllabus topics and completion tracking.
- Planner with dated tasks, status changes, and subject linking.
- Study timer with session save and session history.
- Analytics for daily activity, study totals, subject distribution, and syllabus progress.
- Notes workspace with create, edit, delete, search, and subject filtering.
- Responsive desktop and mobile layouts.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 5
- Tailwind CSS
- TanStack React Query
- React Router DOM 7
- Axios
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express 4
- TypeScript
- MongoDB
- Mongoose 9
- Passport Google OAuth
- JWT auth
- Helmet, CORS, cookie-parser, express-rate-limit, Zod

### Monorepo Tooling

- pnpm workspaces
- Turborepo
- ESLint
- Prettier

## Project Structure

```text
StudyOS/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── .env.example
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   ├── layouts/
│       │   ├── lib/
│       │   └── pages/
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── config/
│   ├── types/
│   ├── ui/
│   └── utils/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Authentication

StudyOS uses Google OAuth for account access. The frontend sends users to the backend Google auth endpoint, the backend creates or links a verified user, and the frontend stores the short-lived access token in memory while relying on an HTTP-only refresh cookie for session renewal.

Email OTP registration is not part of the supported flow.

## Feature Notes

### Exam Management

The exam module runs in the browser and uses localStorage. It supports create, edit, delete, and detail views, but it does not sync exam records to MongoDB.

### Subjects and Syllabus

Subjects are stored in MongoDB and include embedded syllabus topics with progress percentages derived from completed topics.

### Planner

Planner tasks are stored in MongoDB and can be filtered by date or status.

### Study Timer and History

Saved study sessions go to MongoDB and feed dashboard, history, and analytics views.

### Notes

Notes are persisted in MongoDB and support search, subject filtering, editing, and deletion.

## Environment Variables

### API: `apps/api/.env`

Copy from `apps/api/.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port, defaults to `5000` |
| `NODE_ENV` | No | Development or production mode |
| `CORS_ORIGIN` | Yes | Frontend origin used by CORS and OAuth redirects |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh-token signing secret |
| `JWT_ACCESS_EXPIRY` | No | Access-token lifetime, defaults to `15m` |
| `JWT_REFRESH_EXPIRY` | No | Refresh-token lifetime, defaults to `7d` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth callback URL |
| `SMTP_HOST` | Optional | SMTP server for password reset emails |
| `SMTP_PORT` | Optional | SMTP port |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password or app password |
| `SMTP_FROM` | Optional | From address for mail delivery |

### Web: `apps/web/.env`

Copy from `apps/web/.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base API URL used by the frontend |

## Local Setup

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- MongoDB running locally or a MongoDB Atlas URI
- Google OAuth credentials for the backend

### Steps

1. Install dependencies.

   ```bash
   pnpm install
   ```

2. Create the API environment file.

   ```bash
   copy apps\api\.env.example apps\api\.env
   ```

3. Create the web environment file.

   ```bash
   copy apps\web\.env.example apps\web\.env
   ```

4. Set valid Google OAuth and MongoDB values in `apps/api/.env`.

5. Start the development servers.

   ```bash
   pnpm dev
   ```

6. Open the web app at `http://localhost:3000`.

## Running Frontend and Backend

### Backend only

```bash
pnpm --filter @studyos/api dev
```

### Frontend only

```bash
pnpm --filter @studyos/web dev
```

## Build Commands

```bash
pnpm --filter @studyos/api build
pnpm --filter @studyos/web build
pnpm --filter @studyos/web lint
pnpm build
pnpm lint
```

## Authentication and Google OAuth Setup

1. Create a Google OAuth client in Google Cloud Console.
2. Add the backend callback URL, for example `http://localhost:5000/api/auth/google/callback`.
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/api/.env`.
4. Set `CORS_ORIGIN` to the frontend origin.
5. For production, update the callback URL and frontend origin to your deployed domains.

## MongoDB Setup

### Local

- Run MongoDB locally and set `MONGODB_URI=mongodb://127.0.0.1:27017/studyos`.

### Atlas or managed MongoDB

- Create a database cluster.
- Copy the connection string into `MONGODB_URI`.
- Ensure the deployment network allows the app to connect.

## Deployment Notes

- Build the API and web apps before deployment.
- Set `NODE_ENV=production` in production environments.
- Set the production frontend URL in `CORS_ORIGIN`.
- Set `VITE_API_URL` in the frontend to the deployed API base URL.
- Ensure Google OAuth redirect URLs match the deployed API callback.
- Ensure MongoDB credentials are available in the deployed environment.
- If password reset email is enabled, configure the SMTP variables.
- The Vite build reports a chunk-size warning, but the build succeeds.

## API Summary

### Auth

- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/google/status`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

### Profile

- `GET /api/profile`
- `PUT /api/profile`

### Study

- `GET /api/study/summary`
- `GET|POST|PUT|DELETE /api/study/subjects`
- `GET|POST|PUT|DELETE /api/study/subjects/:subjectId/topics`
- `GET|POST|PUT|DELETE /api/study/tasks`
- `GET|POST|PUT|DELETE /api/study/sessions`
- `GET /api/study/analytics`

### Notes

- `GET|POST|PUT|DELETE /api/notes`

## Verification

Validated locally with:

- `pnpm --filter @studyos/api build`
- `pnpm --filter @studyos/web build`
- `pnpm --filter @studyos/web lint`

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
