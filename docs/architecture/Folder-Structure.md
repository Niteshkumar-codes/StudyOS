# Project Folder Structure
## StudyOS: Your Complete Preparation Operating System

This document outlines the production-ready monorepo layout, detailing components, configuration targets, and resource directories.

---

## 1. Directory Tree Overview

```
studyos-workspace/
├── apps/
│   ├── frontend/             # React/Vite Client SPA
│   └── backend/              # Node.js/Express REST API Server
├── packages/
│   └── shared/               # Shared TypeScript schemas, validation rules, and types
├── docs/                     # Planning and Technical Documentation
├── assets/                   # Global media assets (logos, icons, illustrations)
├── package.json              # Root package configuration (npm workspaces)
└── tsconfig.json             # Root TypeScript config
```

---

## 2. Directory Details

### Frontend Application (`apps/frontend/`)
```
apps/frontend/
├── public/                   # Static assets (favicons, robots.txt)
├── src/
│   ├── assets/               # Local page layouts media elements (SVGs, PNGs)
│   ├── components/           # Reusable UI elements (Buttons, Inputs, Cards)
│   │   ├── ui/               # Core atomic layout elements (Buttons, Dialogs)
│   │   └── dashboard/        # Specialized widget elements
│   ├── context/              # React Context Providers (AuthContext, ThemeContext)
│   ├── hooks/                # Custom React hooks (useTimer, useFetch)
│   ├── layouts/              # Screen containers (AuthLayout, DashboardLayout)
│   ├── pages/                # Screen-level views (Landing, Notes, Analytics)
│   ├── services/             # API client connections (Axios wrapper instances)
│   ├── styles/               # Global styling configurations (index.css, theme.css)
│   ├── utils/                # Helper utilities (date formatters, algorithms)
│   ├── App.tsx               # Primary page routes mapping
│   ├── main.tsx              # React mounting root
│   └── vite-env.d.ts         # Vite environment variables types
├── index.html
├── tailwind.config.js        # UI configurations (if Tailwind is integrated)
├── tsconfig.json
└── vite.config.ts
```

### Backend Application (`apps/backend/`)
```
apps/backend/
├── src/
│   ├── config/               # System setups (db.ts, passport.ts, redis.ts)
│   ├── controllers/          # API route handler controllers (authController.ts)
│   ├── middleware/           # Express middleware (authMiddleware.ts, rateLimiter.ts)
│   ├── models/               # MongoDB schema declarations (User.ts, StudyLog.ts)
│   ├── routes/               # API route maps (authRoutes.ts, examRoutes.ts)
│   ├── services/             # Pure business utilities (aiService.ts, sm2Service.ts)
│   ├── utils/                # Helper utilities (sendEmail.ts, logger.ts)
│   └── app.ts                # App initialization
├── Dockerfile                # Deployment container configuration
├── tsconfig.json
└── package.json
```

### Shared Package (`packages/shared/`)
```
packages/shared/
├── src/
│   ├── validation/           # Validation rules (authValidation.ts, logValidation.ts)
│   ├── types/                # Unified TypeScript type declarations (index.ts)
│   └── constants/            # Common settings (examDefaults.ts)
├── package.json
└── tsconfig.json
```

### Assets & Docs Directories
- `assets/`: Contains global branding vectors, design assets, and marketing layouts.
- `docs/`: Structure matches the planning configurations:
  ```
  docs/
  ├── api/                    # REST Endpoint specifications
  ├── architecture/           # Technical drawings, system layouts
  ├── database/               # Database structure diagrams
  ├── design/                 # Colors, screens, and design guidelines
  └── planning/               # Roadmaps, user stories, requirements
  ```
