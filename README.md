# DFOLIO — Construction Execution Management System

![DFOLIO Construction Platform](https://img.shields.io/badge/Platform-Construction%20Execution-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![Express](https://img.shields.io/badge/Express-4.18-green)
![Prisma](https://img.shields.io/badge/Prisma-5.10-indigo)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Active-blue)
![Supabase](https://img.shields.io/badge/Supabase-Storage-emerald)
![License](https://img.shields.io/badge/License-MIT-purple)

**DFOLIO** is an enterprise-grade Construction Execution Management System engineered for modern general contractors, real estate developers, site supervisors, subcontractors, and project owners. It seamlessly integrates project planning, structural level breakdown, task scheduling, dependency tracking, delay calculations, defect snagging, site photo capture via Supabase Storage, rich-text note publishing, client read-only transparency, contractor field updating, global multi-entity search, and automated PDF reporting.

---

## 📖 Table of Contents

- [Features](#-features)
- [User Roles & Access Control](#-user-roles--access-control)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Folder Structure](#-folder-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Production Deployment Guide](#-production-deployment-guide)
- [Performance & Security Hardening](#-performance--security-hardening)
- [License](#-license)

---

## ✨ Features

### 🏢 1. Construction Portfolio Management
- Multi-project construction portfolio overview with live database tracking.
- Site location logging, schedule timelines, and status lifecycle (`PLANNING`, `ACTIVE`, `COMPLETED`, `SUSPENDED`).
- Dynamic level count breakdowns (`Floors`, `Rooms`, `Tasks`, `Snags`).

### 🏗️ 2. Structural Levels & Room Hierarchy
- Hierarchy mapping from **Project** ➔ **Floors/Levels** ➔ **Rooms/Areas**.
- Floor level assignment (`Ground Floor`, `Floor 1`, `Substructure`, `Superstructure`).
- Room allocation tied to execution tasks and defects.

### 📋 3. Work Categories & Sub-Works Breakdown
- Work category configuration (`Civil`, `Plumbing`, `Electrical`, `HVAC`, `Finishing`, `Structural`).
- Sub-work granular decomposition (`Masonry`, `Piping`, `Wiring`, `Ducting`, `Painting`).

### 📅 4. Task Scheduling & Gantt Timeline
- 5-stage task lifecycle status tracking: `NOT_STARTED` ➔ `IN_PROGRESS` ➔ `HOLD` ➔ `INSPECTION` ➔ `COMPLETED`.
- Task progress percentage sliders, priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and labor force counts.
- **Task Dependencies**: Predecessor-successor task linking.
- **Delay Calculation**: Dynamic delay variance detection between planned targets and actual execution status.
- Interactive Gantt chart timeline visualization.

### ⚠️ 5. Snag & Defect Management
- Site defect tracking with statuses: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- Defect photo attachment uploaded directly to **Supabase Storage**.
- Defect assignment to specific subcontractors and structural rooms with target due dates.

### 📷 6. Site Inspection Photos & Rich Text Notes
- Direct photo upload memory streaming to **Supabase Storage** with fallback URI generation.
- Rich-text field note publisher with attachment support and XSS sanitization via **DOMPurify**.

### 📊 7. Automated Reports & PDF Export
- Dynamic dataset generation for **Daily Log**, **Weekly Summary**, **Snag Defect List**, and **Completion Reports**.
- One-click client-side PDF export utilizing `jspdf` and `html2canvas`.

### 🔍 8. Global Multi-Entity Search
- Instant search popover overlay across Projects, Tasks, Snags, Rooms, Work Categories, and Site Photos with a 300ms debounced backend API endpoint.

### 👥 9. Client & Contractor Portals
- **Client Portal**: Executive read-only interface providing progress bars, photo feeds, and milestone status without edit permissions.
- **Contractor Execution Portal**: Subcontractor-focused field portal for assigned task status updates, photo uploads, and progress tracking.

---

## 👥 User Roles & Access Control

| Role | Code | Permissions & Scope |
| :--- | :--- | :--- |
| **Admin** | `ADMIN` | Full system access across all portfolios, project settings, users, and deletions. |
| **Project Manager** | `PROJECT_MANAGER` | Portfolio management, task scheduling, dependency updates, snag resolution, report generation. |
| **Site Engineer** | `SITE_ENGINEER` | Field inspection, snag creation, photo uploading, room management, progress updates. |
| **Contractor / Subcontractor** | `CONTRACTOR` | Field execution portal: view assigned tasks, update progress status, upload site inspection photos. |
| **Client / Owner** | `CLIENT` | Executive read-only portal: view progress, photos, milestone reports, and timelines. |
| **Labour Lead** | `LABOUR` | Labor count assignment and daily task log view. |

---

## 🛠 System Architecture & Tech Stack

```
                               ┌───────────────────────────┐
                               │   Vite + React 18         │
                               │   TailwindCSS + Lucide    │
                               └─────────────┬─────────────┘
                                             │ REST API (Axios)
                                             ▼
                               ┌───────────────────────────┐
                               │   Express Node.js API     │
                               │   TypeScript + Helmet     │
                               └──────┬─────────────┬──────┘
                                      │             │
                         Prisma ORM   │             │ Supabase SDK
                                      ▼             ▼
            ┌───────────────────────────┐         ┌───────────────────────────┐
            │    PostgreSQL Database    │         │  Supabase Storage Bucket  │
            │   (Custom 'dfolio' Schema)│         │   (dfolio-site-photos)    │
            └───────────────────────────┘         └───────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS + Tailwind, Lucide Icons, Axios, DOMPurify, jsPDF, html2canvas.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Multer, BcryptJS, JSON Web Tokens (JWT), Helmet, Express Rate Limit.
- **Database**: PostgreSQL (Prisma ORM with 15 optimized foreign key indexes).
- **Storage**: Supabase Object Storage (`dfolio-site-photos` bucket).

---

## 📁 Folder Structure

```
DFOLIO/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Supabase client initialization (prisma.ts, supabase.ts)
│   │   ├── controllers/     # Express route handlers (auth, project, task, snag, photo, note, etc.)
│   │   ├── middleware/      # JWT Authentication & Role Authorization middleware
│   │   ├── routes/          # API route definitions
│   │   ├── app.ts           # Express application configuration (Helmet, CORS, Rate Limit)
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor (client.ts)
│   │   ├── components/      # Sidebar, Topbar, ErrorBoundary layout components
│   │   ├── pages/           # 12 React views (Dashboard, Tasks, Timeline, Snags, Portals, etc.)
│   │   ├── App.tsx          # Dynamic React.lazy route switcher & tab layout
│   │   ├── index.css        # Glassmorphism design system styles & tokens
│   │   └── main.tsx         # React root DOM renderer
│   ├── package.json
│   ├── vercel.json          # Vercel SPA deployment manifest
│   └── vite.config.ts       # Vite chunk splitting configuration
├── prisma/
│   └── schema.prisma        # PostgreSQL models & indexed relations
├── .env.example             # Root environment variable template
├── docker-compose.yml       # Production Docker container orchestration
├── Dockerfile               # Multi-stage container build manifest
├── railway.json             # Railway backend deployment configuration
├── render.yaml              # Render deployment configuration
└── README.md                # System documentation
```

---

## 🗄 Database Schema

The Prisma database schema is defined in [prisma/schema.prisma](file:///d:/PROJECTS/DFOLIO/prisma/schema.prisma):

- **User**: System users (`id`, `name`, `email`, `password`, `role`, `createdAt`).
- **Project**: Site portfolios (`id`, `name`, `location`, `startDate`, `endDate`, `status`).
- **Floor**: Building levels (`id`, `projectId`, `name`, `number`).
- **Room**: Floor rooms (`id`, `floorId`, `name`).
- **Category**: Main work categories (`id`, `name`).
- **SubWork**: Sub-work items (`id`, `categoryId`, `name`).
- **Task**: Execution tasks (`id`, `projectId`, `roomId`, `subWorkId`, `dependsOnTaskId`, `contractorId`, `status`, `progress`, `priority`, `startDate`, `endDate`).
- **Snag**: Site defects (`id`, `projectId`, `roomId`, `taskId`, `assignedToId`, `status`, `priority`, `dueDate`).
- **Photo**: Site images (`id`, `url`, `caption`, `taskId`, `snagId`, `uploadedById`).
- **Note**: Field notes (`id`, `content`, `attachmentUrl`, `taskId`, `snagId`, `createdById`).

---

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate user & issue 24h JWT.
- `GET /api/auth/profile` — Get authenticated user details.
- `GET /api/auth/users` — List system users (filterable by `?role=CONTRACTOR`).

### Projects (`/api/projects`)
- `GET /api/projects` — List construction projects with counts.
- `POST /api/projects` — Create project portfolio.
- `GET /api/projects/:id` — Get project details with floors, tasks, and snags.
- `PUT /api/projects/:id` — Update project details.
- `DELETE /api/projects/:id` — Remove project portfolio.

### Tasks (`/api/tasks`)
- `GET /api/tasks` — List tasks with filters (`?projectId=...`, `?contractorId=...`).
- `POST /api/tasks` — Create task schedule item.
- `PUT /api/tasks/:id` — Update task status, progress, priority, or dates.
- `DELETE /api/tasks/:id` — Remove task item.

### Snags & Defects (`/api/snags`)
- `GET /api/snags` — List site snags.
- `POST /api/snags` — Log defect snag item.
- `PUT /api/snags/:id` — Update snag status (`OPEN` ➔ `CLOSED`).
- `DELETE /api/snags/:id` — Delete snag record.

### Photos & Storage (`/api/photos`)
- `POST /api/photos/upload` — Upload site photo to Supabase Storage & store record.
- `GET /api/photos/task/:taskId` — Retrieve task photos.
- `DELETE /api/photos/:id` — Delete photo record & storage object.

### Reports & Search (`/api/reports`, `/api/search`)
- `GET /api/reports/daily` — Fetch daily construction log dataset.
- `GET /api/reports/weekly` — Fetch weekly progress dataset.
- `GET /api/reports/snag` — Fetch defect report dataset.
- `GET /api/reports/completion` — Fetch project handover completion dataset.
- `GET /api/search?q=query` — Perform global multi-entity search.

---

## 💻 Installation & Local Setup

### Prerequisites
- Node.js (v18.x or v20.x)
- npm (v9.x or later)
- PostgreSQL Database instance

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-org/dfolio.git
cd dfolio

# Install monorepo dependencies
npm install
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to create root, backend, and frontend `.env` files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Database Migration & Prisma Setup
```bash
# Push schema to PostgreSQL database
npx prisma db push --schema=prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=prisma/schema.prisma
```

### 4. Start Local Development Servers
```bash
# Run both backend API (port 5000) and frontend Vite server (port 5173) concurrently
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Configuration

### Root `.env` Template
```env
DATABASE_URL="postgresql://dfolio_user:password@localhost:5432/dfolio?schema=public"
JWT_SECRET="dfolio_jwt_secret_2026_super_secure"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_STORAGE_BUCKET="dfolio-site-photos"
```

### Frontend `.env.production`
```env
VITE_API_BASE_URL="https://your-backend-api.railway.app"
```

---

## 🚀 Production Deployment Guide

### Deployment Overview
1. **Frontend (Vercel)**: Build directory `frontend/dist` with HTML5 SPA rewrite rules configured in `frontend/vercel.json`.
2. **Backend API (Railway / Render)**: Express application configured via `railway.json` or `render.yaml`.
3. **Database (PostgreSQL)**: Managed database on Railway, Supabase, or Render.
4. **Storage (Supabase Storage)**: Object storage bucket `dfolio-site-photos`.

### Automated Monorepo Build Command
```bash
npm run build
```

---

## 🛡 Performance & Security Hardening

- **XSS Protection**: HTML content sanitized using `DOMPurify.sanitize()` before DOM injection.
- **File Upload Security**: Strict MIME type validation (`jpeg`, `png`, `webp`, `gif`) and extension blacklisting (`.exe`, `.bat`, `.sh`, `.php`) enforced.
- **SQL Injection Safeguard**: All database queries executed via parameterized Prisma ORM calls.
- **Code-Splitting & Lazy Loading**: Frontend routes dynamically loaded via `React.lazy()` and `<Suspense>`, reducing initial JS bundle size from **168 kB to 20.8 kB** (**87% size reduction**).
- **Database Indexing**: 15 database indexes applied to foreign key and query status attributes in Prisma schema.
- **Rate Limiting & Security Headers**: Express protected by `Helmet` security headers and `express-rate-limit`.

---

## 📄 License

This project is licensed under the MIT License — see the `LICENSE` file for details.
