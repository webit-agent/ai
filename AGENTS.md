# AGENTS.md — Competitor Tracker Project Guide

> **AGENT DIRECTIVE**: 
> - **Do not scan or read `node_modules`, `dist`, `build`, or `.git` directories.**
> - At the start of every new session, **read this file (`AGENTS.md`) first** before doing anything else.
> - Only read additional source files when a specific task requires inspecting or editing their exact contents.
> - Whenever you make a structural change (new major folder, new dependency, changed architecture, or new script/command), **update this file** immediately so it remains accurate.

---

## 1. Project Overview & Purpose

**Competitor Tracker** is a SaaS application designed for small-to-medium e-commerce businesses, solo entrepreneurs, and marketing teams to automatically monitor competitor websites. 

### Core Problems Solved & Key Differentiators
- **Reliable automated scraping**: Resilient price extraction combining fast HTTP/Cheerio extraction with a headless Puppeteer fallback for JavaScript-rendered sites.
- **Proactive broken-link detection**: Continuously verifies tracked URLs to alert users immediately when competitor pages return errors, 404s, or change structure.
- **Price history & trend visualization**: Built-in historical price charts (not paywalled).
- **Competitor comparison**: Side-by-side product pricing comparison matrix across up to 5 competitors.
- **Multi-channel alerts & digests**: Email alerts via Nodemailer, instant alerts and bot interaction via Telegram, and daily summary digests.
- **AI-powered insights**: Uses Anthropic Claude (`claude-3-5-sonnet`) to summarize price changes, detect recurring pricing patterns/cycles, and analyze competitor strategies.
- **Visual content monitoring**: Periodic full-page screenshots via Puppeteer with SHA-256 hash comparison to detect competitor landing page changes.
- **PDF reporting**: Downloadable weekly summary reports generated on the fly via PDFKit.

---

## 2. Tech Stack

### Backend
- **Runtime & Language**: Node.js (v20+), TypeScript (v5.4+)
- **Execution & Dev Tools**: `ts-node`, `ts-node-dev` (hot-reloading in dev)
- **Web Framework**: Express 4.19
- **Database**: PostgreSQL 16 (connected via `pg` connection pool, raw parameterized SQL)
- **Scraping & Automation**:
  - `axios` (v1.6+) & `cheerio` (v1.0-rc.12) for fast static HTML scraping
  - `puppeteer` (v22.6+) for JS-rendered pages and full-page screenshots
- **Scheduler**: `node-cron` (v3.0) running in-process scheduled tasks
- **AI Integration**: `@anthropic-ai/sdk` (v0.32+) utilizing `claude-3-5-sonnet-20241022`
- **Authentication & Security**:
  - `jsonwebtoken` (JWT Bearer tokens, 7-day expiration)
  - `bcryptjs` (password hashing with 10 salt rounds)
  - `helmet` (HTTP security headers)
  - `cors` (cross-origin resource sharing)
  - `express-rate-limit` (API, auth, and scraper rate limiting)
- **Validation**: `zod` (v3.22+)
- **Notifications & Output**:
  - `nodemailer` (v6.9) for SMTP email alerts and daily digests
  - `node-telegram-bot-api` (v0.66) for Telegram bot commands and alerts
  - `pdfkit` (v0.20) for server-side PDF generation

### Frontend
- **Framework & Build**: React 18 (SPA), TypeScript (v5.2+), Vite 5
- **Routing**: `react-router-dom` (v6.22) with protected routes
- **Server State Management**: `@tanstack/react-query` (v5.29)
- **Client State**: `zustand` (v4.5) with `localStorage` persistence for auth credentials
- **Styling**: Tailwind CSS (v3.4), PostCSS, Autoprefixer
- **Visualizations & UI**:
  - `recharts` (v2.12) for responsive price history line graphs
  - `lucide-react` (v0.368) for icons
- **HTTP Client**: `axios` (v1.6) with automatic JWT bearer injection and 401 auto-logout

### Infrastructure & Deployment
- **Database**: PostgreSQL 16 alpine in Docker
- **Containers**: `docker-compose.yml` defining `db`, `backend`, and `pgadmin`
- **Target Deployment**: Frontend on Netlify; Backend API & cron on VPS behind Nginx reverse proxy

---

## 3. Directory & File Structure

```
.
├── AGENTS.md                  # This file (Agent reference & session start guide)
├── README.md                  # Project brief, feature roadmap, and specs
├── LICENSE                    # Apache 2.0 License
├── docker-compose.yml         # Postgres, Backend API, and pgAdmin containers
├── backend/
│   ├── Dockerfile             # Multi-stage container build with Puppeteer OS deps
│   ├── package.json           # Backend dependencies and scripts
│   ├── tsconfig.json          # Backend TypeScript configuration
│   ├── .env.example           # Backend environment template
│   └── src/
│       ├── index.ts           # App bootstrap: Express setup, routes, middleware, cron & bot init
│       ├── db/
│       │   ├── index.ts       # pg.Pool database instance
│       │   ├── schema.sql     # PostgreSQL schema definitions & migrations
│       │   └── queries/       # Parameterized SQL queries modularized by entity:
│       │       ├── alerts.ts
│       │       ├── competitors.ts
│       │       ├── contentSnapshots.ts
│       │       ├── notificationSettings.ts
│       │       ├── priceHistory.ts
│       │       ├── trackedProducts.ts
│       │       └── users.ts
│       ├── middleware/        # Express middleware:
│       │   ├── auth.ts        # Bearer JWT verification (attaches req.userId, req.userEmail)
│       │   ├── errorHandler.ts# Centralized error handler
│       │   ├── rateLimit.ts   # Rate limiters: apiLimiter, authLimiter, scrapeLimiter
│       │   └── validate.ts    # Zod schema validation middleware
│       ├── services/          # Business logic layer:
│       │   ├── alertService.ts
│       │   ├── auth.ts        # JWT generation/verification, bcrypt hashing
│       │   ├── competitorService.ts
│       │   └── productService.ts
│       ├── jobs/              # node-cron scheduled background tasks:
│       │   ├── scheduler.ts   # Cron definitions (prices, links, digests, content)
│       │   ├── priceCheckJob.ts    # Runs every 2h: scrapes active products, records history, emits alerts
│       │   ├── linkCheckJob.ts     # Runs every 6h: checks HTTP status and product page heuristics
│       │   ├── digestJob.ts        # Runs daily at 08:00: sends unread alert digests via email
│       │   └── contentMonitorJob.ts# Runs daily at 02:00: screenshots homepages, computes diffs
│       ├── tools/             # Utilities and integrations:
│       │   ├── aiInsights.ts   # Anthropic Claude pricing insights & pattern detection
│       │   ├── linkChecker.ts  # URL reachability and product-page heuristic checker
│       │   ├── notifier.ts     # Email (Nodemailer) & Telegram alert/digest sender
│       │   ├── pdfReporter.ts  # PDFKit weekly report generator
│       │   ├── priceExtractor.ts # Currency detection, format normalization, price comparison
│       │   ├── scraper.ts      # Multi-stage scraper: Axios -> Cheerio -> Puppeteer fallback
│       │   ├── screenshotter.ts# Puppeteer screenshot capture & hash comparison
│       │   └── telegramBot.ts  # Telegram bot client, account linking (/start <token>)
│       └── routes/            # Express HTTP routers (mounted under /api):
│           ├── alerts.ts           # GET /api/alerts, PATCH /api/alerts/:id/read, read-all
│           ├── auth.ts             # POST /api/auth/register, /login, GET /me
│           ├── comparison.ts       # GET /api/comparison?competitorIds=...
│           ├── competitors.ts      # GET, POST, DELETE /api/competitors, GET /:id
│           ├── contentSnapshots.ts # GET /api/snapshots/:competitorId, /latest.png
│           ├── insights.ts         # GET /api/insights/product/:id, /product/:id/patterns, /competitor/:id
│           ├── priceHistory.ts     # GET /api/products/:id/history
│           ├── reports.ts          # GET /api/reports/weekly.pdf
│           ├── settings.ts         # GET, PUT /api/settings
│           ├── telegram.ts         # POST /api/telegram/link-token
│           └── trackedProducts.ts  # GET, POST, PATCH, DELETE /api/products, GET /:id, POST /:id/check
└── frontend/
    ├── index.html             # Single-page application root HTML
    ├── package.json           # Frontend dependencies and scripts
    ├── vite.config.ts         # Vite build configuration (React plugin)
    ├── tsconfig.json          # TypeScript project configuration
    ├── tsconfig.node.json     # TypeScript Vite config
    ├── tailwind.config.js     # Tailwind CSS theme & content paths
    ├── postcss.config.js      # PostCSS configuration
    ├── .env.example           # Frontend environment template
    └── src/
        ├── main.tsx           # React DOM root & React Query QueryClientProvider setup
        ├── App.tsx            # App routing, ProtectedRoute wrapper, Navbar
        ├── index.css          # Tailwind CSS directives
        ├── store/
        │   └── authStore.ts   # Zustand store for user & JWT (persisted to localStorage)
        ├── api/               # Axios API client & endpoints:
        │   ├── client.ts      # Base Axios instance with Bearer auth & 401 interceptors
        │   ├── alerts.ts
        │   ├── auth.ts
        │   ├── comparison.ts
        │   ├── competitors.ts
        │   ├── insights.ts
        │   ├── products.ts
        │   ├── reports.ts
        │   ├── settings.ts
        │   ├── snapshots.ts
        │   └── telegram.ts
        ├── components/        # Shared UI components:
        │   ├── AlertsBell.tsx      # Navbar alert counter & quick-view dropdown
        │   ├── Navbar.tsx          # Global navigation bar & logout
        │   ├── PriceChart.tsx      # Recharts historical price line chart
        │   ├── SnapshotViewer.tsx  # Competitor screenshot display & history list
        │   └── StatusBadge.tsx     # Status indicator badge (ok, broken, pending, error)
        └── pages/             # View pages:
            ├── Login.tsx           # Authentication login form
            ├── Register.tsx        # Authentication registration form
            ├── Dashboard.tsx       # Main dashboard: metrics, competitors list, manual check triggers
            ├── CompetitorDetail.tsx# Single competitor view with products & snapshot viewer
            ├── ProductDetail.tsx   # Product details, price history chart, AI insights
            ├── AddCompetitor.tsx   # Add competitor form
            ├── Comparison.tsx      # Side-by-side product pricing comparison grid
            ├── Alerts.tsx          # Alerts history & mark-as-read controls
            └── Settings.tsx        # Notification preferences (email/telegram) & Telegram linking
```

---

## 4. Run, Build, and Test Commands

### Database & Docker
```bash
# Start PostgreSQL, Backend, and pgAdmin containers
docker compose up -d

# Start only the PostgreSQL database container (port 5432)
docker compose up -d db

# Stop all containers
docker compose down

# Apply schema manually if not using docker-entrypoint:
psql -U postgres -d competitor_tracker -f backend/src/db/schema.sql
```

### Backend Commands (run inside `backend/`)
```bash
# Install dependencies
npm install

# Start development server with hot reload (ts-node-dev)
npm run dev

# Build TypeScript to JavaScript (/backend/dist)
npm run build

# Start production server from compiled code / ts-node
npm start
```

### Frontend Commands (run inside `frontend/`)
```bash
# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev

# Typecheck and build for production (/frontend/dist)
npm run build

# Run ESLint linter
npm run lint

# Preview production build locally
npm run preview
```

### Automated Testing
*Note: Automated test runners are not configured yet in `package.json`. When writing tests in future tasks, use Vitest/Jest and ensure external network calls (`axios`, `puppeteer`, `anthropic`, `nodemailer`, `telegram`) are mocked.*

---

## 5. Coding Conventions & Architecture Patterns

### Backend Conventions
1. **Layered Architecture**:
   - **Router (`src/routes/`)**: Defines HTTP routes, validation middleware, and parameters.
   - **Middleware (`src/middleware/`)**: Validates input (`validate.ts`), verifies JWTs (`auth.ts`), applies rate limits (`rateLimit.ts`).
   - **Service (`src/services/`)**: Contains business rules, cross-query coordination, and tool invocations.
   - **Database Queries (`src/db/queries/`)**: Raw, parameterized PostgreSQL queries (`$1, $2, ...`) via `pg` connection pool. Explicit UUID generation with `uuidv4()`.
   - **Tools (`src/tools/`)**: Standalone, reusable modules (scraping, AI, notifications, PDF generation).
2. **Scraping Pipeline Pattern**:
   - Fast path: `axios.get` HTML check.
   - Fallback: Headless Puppeteer (`--no-sandbox`, `--disable-setuid-sandbox`).
   - Price parsing cascade: JSON-LD schema -> OpenGraph meta -> Common CSS selectors -> Regex body match.
   - Currency normalization: Standardizes symbols (`$`, `€`, `£`) and strings to codes (`USD`, `EUR`, `GBP`).
3. **Error Handling**:
   - Async route handlers wrap execution in `try / catch (err) { next(err); }`.
   - Central `errorHandler` logs error and returns `{ error: message }` with status code (default 500).
4. **Validation**:
   - Strict Zod schemas validate `req.body`, `req.query`, or `req.params`.

### Frontend Conventions
1. **Server vs Client State**:
   - Server state (competitors, products, history, snapshots, alerts) is managed via **TanStack Query** (`useQuery`, `useMutation`).
   - Cache invalidation via `queryClient.invalidateQueries({ queryKey: [...] })` is performed on mutations.
   - Client auth state is managed in `authStore.ts` using **Zustand** and synced to `localStorage`.
2. **API Communication**:
   - Centralized Axios instance in `frontend/src/api/client.ts`.
   - Request interceptor automatically attaches `Authorization: Bearer <token>`.
   - Response interceptor automatically triggers `logout()` on `401 Unauthorized`.
3. **Component Structure & Styling**:
   - React functional components with TypeScript interfaces for props.
   - Fully responsive UI styled using utility classes in **Tailwind CSS**.
   - Modular page-level views in `src/pages/` and reusable UI components in `src/components/`.

---

## 6. Important Gotchas & Architectural Decisions

1. **API Base URL Path**:
   - Backend routes are mounted under `/api/...` in `backend/src/index.ts`.
   - Frontend `client.ts` uses `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`.
   - *Gotcha*: If defining `VITE_API_URL` in `.env`, it must include `/api` (e.g. `http://localhost:3000/api`), otherwise endpoint calls will 404.
2. **Puppeteer Dependencies in Docker / Linux**:
   - Puppeteer requires specific Debian/Ubuntu shared libraries (`libnss3`, `libatk-bridge2.0-0`, `fonts-liberation`, etc.).
   - Launching Puppeteer must always include `args: ['--no-sandbox', '--disable-setuid-sandbox']` when running inside containers or headless Linux environments.
3. **In-Process Scheduler**:
   - The cron scheduler (`node-cron`) runs in the same Node.js process as the Express server (`startScheduler()` in `backend/src/index.ts`).
   - If running multiple instances of the backend behind a load balancer, jobs would execute multiple times. In a scaled deployment, extract scheduler to a dedicated worker container or use a persistent queue.
4. **Screenshots & Content Storage**:
   - Full-page screenshots are written to the local disk at `SCREENSHOTS_DIR` (defaults to `./screenshots/` in the working directory).
   - Only filename hashes and relative paths are stored in the `content_snapshots` table.
   - Ensure the directory is writable and preserved across container restarts.
5. **Telegram Bot Webhook vs Polling**:
   - Telegram bot runs in **polling mode** (`polling: true`). Do not run multiple backend instances with the same bot token simultaneously to avoid Telegram polling conflict errors (`409 Conflict`).
6. **Rate Limiting Guardrails**:
   - General API has a rate limit of 100 requests / 15 min.
   - Auth endpoints are limited to 10 requests / 15 min.
   - Manual scraping triggers (`POST /api/products/:id/check`) are limited to 20 requests / hour per IP.

---

## 7. Environment Variables & Configuration

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for Express server | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/competitor_tracker` |
| `JWT_SECRET` | Secret key for signing auth tokens | `supersecretjwtkey` |
| `SMTP_HOST` | SMTP server host | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP port | `2525` |
| `SMTP_USER` | SMTP username | `user` |
| `SMTP_PASS` | SMTP password | `pass` |
| `FROM_EMAIL` | Sender address for emails | `alerts@competitortracker.com` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | `123456789:ABCdefGhIJKlmNo...` |
| `TELEGRAM_BOT_USERNAME`| Username of your Telegram bot | `MyCompetitorTrackerBot` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | `sk-ant-api03-...` |
| `FRONTEND_URL` | Frontend URL for email action links | `http://localhost:5173` |
| `SCREENSHOTS_DIR` | Directory to save visual diff screenshots | `./screenshots` |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Full base URL of the backend API | `http://localhost:3000/api` |
