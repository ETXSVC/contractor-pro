# Contractor Pro

A full-stack construction management platform for contractors — project tracking, document vault, time records, proposals, invoices, change orders, budget cost codes, and an AI-powered cost estimator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Express 5, tsx (TypeScript runtime) |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File uploads | multer (disk storage) |
| Containerization | Docker (3-stage Alpine build) |

---

## Features

- **Dashboard** — live project stats, revenue metrics, team activity feed
- **Projects** — create, edit, track progress (In Progress / Bidding / Completed)
- **Tasks** — kanban-style board with priority, assignee, and due date
- **Document Vault** — drag-and-drop file upload (PDF, DWG, DOCX, XLSX, images), view and download in-browser
- **Team** — member directory with department, status, and contact info
- **Proposals** — bid pipeline with status tracking (Drafting → Sent → Approved/Declined)
- **Invoices** — invoice management with Paid/Pending/Overdue status
- **Change Orders** — formal change order tracking with approval workflow
- **Budget** — cost code ledger with budgeted vs actual vs committed amounts
- **Time Records** — billable/non-billable time logging per project and employee
- **Cost Estimator** — instant budget breakdown by sq footage and project type with materials, milestones, and AI tips

---

## Multi-Tenant Architecture

Every record is scoped to a `tenantId`. Registering creates a new isolated tenant. Multiple users under the same company share one tenant. JWT tokens carry the `tenantId` claim and are verified on every protected route.

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker Desktop (for the local PostgreSQL container)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the local database (port 5434 to avoid conflicts)
docker-compose up -d

# 3. Copy and configure environment
# .env is already configured for local dev — verify DATABASE_URL points to port 5434

# 4. Run migrations and generate Prisma client
npx prisma migrate dev

# 5. Start the dev server (frontend + backend on port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account via the **Create Account** tab.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign/verify tokens |
| `NODE_ENV` | `development` or `production` |

---

## Project Structure

```
contractor-pro/
├── server.ts                  # Express app entry point
├── src/
│   ├── main.tsx               # React entry, wraps app in AuthProvider
│   ├── App.tsx                # Root component, data fetching, routing
│   ├── contexts/
│   │   └── AuthContext.tsx    # JWT auth state (login/logout/persist)
│   ├── lib/
│   │   └── api.ts             # Typed fetch client (auto 401 reload)
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── components/            # All page/view components
│   └── api/
│       ├── middleware/
│       │   └── auth.ts        # JWT verification middleware
│       └── routes/            # Express route handlers
│           ├── auth.ts        # POST /auth/register, /auth/login
│           ├── projects.ts
│           ├── tasks.ts
│           ├── documents.ts   # Includes multer multipart upload
│           ├── team.ts
│           ├── proposals.ts
│           ├── invoices.ts
│           ├── changeOrders.ts
│           ├── budgets.ts
│           └── timeRecords.ts
├── prisma/
│   ├── schema.prisma          # Database schema (binaryTargets for Alpine)
│   └── migrations/            # Migration history
├── uploads/                   # Runtime: uploaded files (volume-mounted in prod)
├── Dockerfile                 # 3-stage: deps → builder → runner (Alpine)
├── docker-compose.yml         # Local dev: PostgreSQL on port 5434
└── deploy.bat                 # One-click build + push + deploy to VPS
```

---

## API Routes

All routes except `/api/auth/*` and `/api/health` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account + tenant |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/documents` | List documents |
| POST | `/api/documents/upload` | Upload file (multipart/form-data) |
| DELETE | `/api/documents/:id` | Delete document + file |
| GET | `/api/team` | List team members |
| POST | `/api/team` | Add team member |
| GET/POST | `/api/proposals` | Proposals CRUD |
| GET/POST/PATCH | `/api/invoices` | Invoices CRUD |
| GET/POST/PATCH | `/api/change-orders` | Change orders CRUD |
| GET/POST/PATCH | `/api/budgets` | Budget cost codes CRUD |
| GET/POST/DELETE | `/api/time-records` | Time records CRUD |
| POST | `/api/estimate` | Cost estimator (public, no auth) |

Uploaded files are served as static assets at `/uploads/<filename>`.

---

## Production Deployment

### One-click deploy to VPS

```bat
deploy.bat
```

The script:
1. Builds a Docker image (3-stage Alpine, includes Prisma binary for `linux-musl-openssl-3.0.x`)
2. Pushes to the private registry at `212.28.191.134:5000`
3. SSHs to the VPS and ensures the `contractor-net` Docker network + PostgreSQL container are running
4. Pulls the new image and starts the app container with `contractor_uploads` volume for file persistence

### What runs in the container

```
sh -c "prisma migrate deploy && node dist/server.cjs"
```

Migrations are applied automatically on every deploy before the server starts.

### Volumes

| Volume | Mount | Purpose |
|---|---|---|
| `contractor_pgdata` | `/var/lib/postgresql/data` | Database persistence |
| `contractor_uploads` | `/app/uploads` | Uploaded file persistence |

### Updating `JWT_SECRET`

Edit the `JWT_SECRET` line at the top of `deploy.bat` before your first production deploy. All existing sessions will be invalidated if you change it after users have registered.

---

## Docker Build Details

The Dockerfile uses three stages to keep the production image minimal:

| Stage | Purpose |
|---|---|
| `deps` | `npm ci --omit=dev` — production dependencies only |
| `builder` | Full install + `prisma generate` + `vite build` + `esbuild server.ts` |
| `runner` | Alpine base + OpenSSL + files copied from both stages — no npm install |

The `runner` stage explicitly copies:
- `node_modules` from `deps` (no devDeps)
- `.prisma`, `@prisma/client`, `prisma`, `.bin/prisma` from `builder` (Alpine binary)
- `dist/` (compiled frontend + server)
- `prisma/` (migrations)

`apk add --no-cache openssl` is required in the runner for Prisma's query engine on Alpine Linux.
