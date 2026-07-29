# Sentinel — Content Usage Tracker

A full-stack platform that lets creators and agencies track unauthorized usage of their digital assets (images, videos) across the internet. Upload content, run scans, get alerts, and manage takedowns — all from a single dashboard.

![CI](https://github.com/palakaeron/content-tracking/actions/workflows/ci.yml/badge.svg)

---

## Features

- **Authentication** — JWT access/refresh token rotation with HTTP-only cookies and CSRF protection
- **Content Library** — Upload images and videos (up to 50 MB), browse with search and pagination
- **Detection Scans** — Run on-demand scans against simulated web sources; every match creates a report
- **Alerts** — Every detection generates a severity-tagged alert (LOW / MEDIUM / HIGH / CRITICAL)
- **Analytics Dashboard** — Area chart of detection trends, stat cards, recent activity feed
- **Usage Reports** — Paginated table of all detected matches; export to CSV
- **Activity Timeline** — Chronological log of all detections; export to CSV
- **User Profile** — Per-account profile with real name, email, role, and join date
- **Settings** — Notification preferences, 2FA placeholder, profile editing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Zustand, React Query, Recharts |
| Backend | Node.js, Express.js, Prisma ORM, Zod validation |
| Database | PostgreSQL (production), SQLite (local dev option) |
| Auth | JWT (access + refresh), HTTP-only cookies, CSRF tokens |
| Monorepo | pnpm workspaces |
| CI | GitHub Actions |

---

## Project Structure

```
content-tracking/
├── apps/
│   ├── api/                  # Express.js REST API
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── services/     # Business logic (auth, upload, detection)
│   │   │   ├── middleware/   # Auth, CSRF, validation
│   │   │   ├── routes/       # API route definitions
│   │   │   └── config/       # Prisma client, env config
│   │   └── prisma/           # Schema and migrations
│   └── web/                  # Next.js frontend
│       ├── app/              # App Router pages
│       ├── components/       # Shared UI components (AppShell)
│       └── lib/              # API client, auth store, hooks
├── packages/
│   └── shared/               # Zod schemas and TypeScript types
├── docker-compose.yml        # Local Postgres
├── .env.example              # Environment variable template
└── package.json              # Monorepo scripts
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL (or use Docker)

### 1. Clone the repo

```bash
git clone https://github.com/palakaeron/content-tracking.git
cd content-tracking
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/content_tracking
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/content_tracking

# JWT secrets — use long random strings in production
JWT_ACCESS_SECRET=change_me_to_a_long_random_secret
JWT_REFRESH_SECRET=change_me_to_another_long_random_secret

# App
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 4. Start Postgres (via Docker)

```bash
docker-compose up -d postgres
```

Or point `DATABASE_URL` at any existing PostgreSQL instance.

### 5. Run database migrations

```bash
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma generate
```

### 6. Start the development servers

```bash
# Run both API and web in parallel
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authenticated routes require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account |
| POST | `/auth/login` | — | Sign in, returns access token |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | ✓ | Revoke session |
| GET | `/auth/me` | ✓ | Get current user info |

### Content

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/content` | ✓ | List assets (paginated, searchable) |
| POST | `/content` | ✓ | Create text asset |
| POST | `/content/upload` | ✓ | Upload image/video file |
| GET | `/content/:id` | ✓ | Get single asset |
| PATCH | `/content/:id` | ✓ | Update asset metadata |
| DELETE | `/content/:id` | ✓ | Delete asset |
| POST | `/content/:id/scan` | ✓ | Trigger detection scan |

### Reports & Alerts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports` | ✓ | List detection reports (paginated) |
| GET | `/reports/:id` | ✓ | Get single report |
| GET | `/alerts` | ✓ | List all alerts |
| PATCH | `/alerts/:id` | ✓ | Update alert status (DISMISSED / CONFIRMED) |
| GET | `/analytics/summary` | ✓ | Dashboard aggregate data |

---

## Running Tests & Checks

```bash
# Lint all packages
pnpm lint

# TypeScript type checking
pnpm typecheck

# Run tests
pnpm test

# Production build
pnpm build
```

All four run automatically on every push and pull request via GitHub Actions.

---

## Deployment

### Frontend → Netlify

1. Connect your GitHub repo on [netlify.com](https://netlify.com)
2. Configure the site:
   - **Base directory:** `apps/web`
   - **Build command:** `pnpm build`
   - **Publish directory:** `apps/web/.next`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your deployed API URL

Install the Netlify Next.js plugin in `apps/web`:
```bash
pnpm --filter web add -D @netlify/plugin-nextjs
```

Create `apps/web/netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Backend → Railway / Render

**Railway (recommended):**

1. New project → Deploy from GitHub
2. Set **Root Directory** to `apps/api`
3. Add environment variables from your `.env`
4. Railway auto-detects the build and start commands

**Render:**

1. New Web Service → connect repo
2. Root directory: `apps/api`
3. Build command: `pnpm install && pnpm build`
4. Start command: `node dist/server.js`

**Docker (self-hosted):**

```bash
docker-compose up --build
```

### Environment variables required in production

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL URL (same as DATABASE_URL for most hosts) |
| `JWT_ACCESS_SECRET` | Long random string for signing access tokens |
| `JWT_REFRESH_SECRET` | Long random string for signing refresh tokens |
| `NODE_ENV` | `production` |
| `WEB_ORIGIN` | Your Netlify frontend URL (for CORS) |
| `NEXT_PUBLIC_API_URL` | Your Railway/Render API URL |

---

## How Detection Works

The detection engine is a pluggable service (`apps/api/src/services/detection.service.ts`). The current implementation is a **deterministic simulator** that:

1. Derives a seed from the content's UUID via SHA-256
2. Generates 1–3 simulated matches against realistic platform domains (Instagram, Pinterest, Reddit, etc.)
3. Assigns confidence scores between 0.72 – 0.99
4. Creates a `Report` and an `Alert` for every match found

Severity is assigned automatically:

| Confidence | Severity |
|---|---|
| ≥ 0.95 | CRITICAL |
| ≥ 0.88 | HIGH |
| ≥ 0.80 | MEDIUM |
| < 0.80 | LOW |

To plug in a real detection provider, implement the `DetectionProvider` interface and call `setDetectionProvider()`.

---

## License

MIT
