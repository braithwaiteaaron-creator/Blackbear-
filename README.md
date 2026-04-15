# GitHub Mastery Ecosystem

Interactive SaaS assessment and learning platform prototype aligned to the "Complete Application Build Document" (Version 1.0, April 15, 2026).

## What is implemented

- Next.js App Router + TypeScript + Tailwind CSS application scaffold.
- Complete 15-question quiz content across Beginner, Intermediate, and Advanced tiers.
- Immediate answer feedback with rationale display and progression lock.
- Scoring and badge framework:
  - Foundation Builder (0-4)
  - Developing Proficiency (5-8)
  - Advanced Practitioner (9-12)
  - GitHub Expert (13-15)
- Public, dashboard, organization, and admin route scaffolding aligned to product IA.
- Data model scaffolding:
  - Prisma schema
  - SQL DDL in `docs/database-schema.sql`
- Analytics event map in `docs/analytics-events.md`.

## Routes

### Public

- `/`
- `/quiz`
- `/quiz/beginner`
- `/quiz/intermediate`
- `/quiz/advanced`
- `/results`
- `/badges`
- `/learn`
- `/learn/[topic-slug]`
- `/certifications`
- `/community`
- `/enterprise`
- `/pricing`

### Authenticated

- `/dashboard`
- `/dashboard/results`
- `/dashboard/badges`
- `/dashboard/certifications`
- `/dashboard/learning-path`

### Organization

- `/org/dashboard`
- `/org/assessments`
- `/org/reports`
- `/org/members`

### Admin

- `/admin/analytics`
- `/admin/content`
- `/admin/users`
- `/admin/organizations`
- `/admin/reports`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open <http://localhost:3000>.

## Validation commands

```bash
npm run lint
npm run typecheck
npm run build
```

## API behavior (current)

- `POST /api/v1/quiz-sessions` (legacy alias: `POST /api/quiz-sessions`)
  - request body validated via `zod`
  - standardized success/error envelope with error codes
  - idempotency support through `x-idempotency-key` header
  - 24-hour retake cooldown enforced per authenticated user
- `GET /api/v1/quiz-sessions/me` (legacy alias: `GET /api/quiz-sessions/me`)
  - standardized response envelope
  - pagination (`page`, `pageSize`)
  - filters (`tierCompleted`, `minScore`, `maxScore`)
  - returns pagination details in `data`
- `GET /api/v1/billing/plans` (legacy alias: `GET /api/billing/plans`)
  - returns Stripe-backed plan catalog for Free/Premium/Team/Enterprise
  - legacy alias includes deprecation/sunset headers
- `POST /api/v1/billing/checkout` (legacy alias: `POST /api/billing/checkout`)
  - creates Stripe Checkout session for paid tiers (Premium + Team)
  - requires authenticated user and configured Stripe price ID
  - returns `checkoutUrl` for immediate client redirect
- `POST /api/v1/billing/portal` (legacy alias: `POST /api/billing/portal`)
  - creates Stripe Billing Portal session for authenticated users
  - reuses existing Stripe customer when available, otherwise initializes from user email
  - returns `portalUrl` for immediate client redirect
- `POST /api/v1/billing/webhooks/stripe` (legacy alias: `POST /api/billing/webhooks/stripe`)
  - verifies Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`
  - persists webhook events for replay protection and observability
  - syncs subscription rows and user subscription tiers from subscription lifecycle events
  - stores processing status and error details for failed event handling
- Legacy `/api/quiz-sessions*` routes include deprecation headers:
  - `Deprecation: true`
  - `Sunset: <date>`
  - `Link: </api/v1/...>; rel="successor-version"`
- Internal queue worker route:
  - `POST /api/internal/jobs/process`
  - requires `x-job-worker-key` header matching `JOB_WORKER_KEY`
  - processes pending async jobs in small batches

## Backend, auth, and access control setup

This project includes:

- NextAuth (`/api/auth/[...nextauth]`) with optional GitHub/Google OAuth providers
- Prisma 7 client setup with PostgreSQL adapter
- Quiz persistence API endpoints:
  - `POST /api/quiz-sessions` to save the current attempt
  - `GET /api/quiz-sessions/me` to fetch saved attempts for the signed-in user
- RBAC route protection for:
  - `/dashboard/*` (authenticated users)
  - `/org/*` (role: `org_admin` or `admin`)
  - `/admin/*` (role: `admin`)
  enforced by both middleware and server-side route layouts

Set environment variables (see `.env.example`):

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` (optional)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (optional)
- `DEFAULT_USER_ROLE` (optional, `user|org_admin|admin`, default `user`)
- `DEFAULT_SUBSCRIPTION_TIER` (optional, `free|premium|team|enterprise`, default `free`)
- `ADMIN_EMAILS` (optional, comma-separated emails promoted to `admin`)
- `ORG_ADMIN_EMAILS` (optional, comma-separated emails promoted to `org_admin`)
- `TEAM_TIER_EMAILS` (optional, comma-separated emails promoted to `team`)
- `ENTERPRISE_TIER_EMAILS` (optional, comma-separated emails promoted to `enterprise`)
- `JOB_WORKER_KEY` (required to run internal queue processing endpoint)
- `STRIPE_SECRET_KEY` (required for Stripe server operations)
- `STRIPE_WEBHOOK_SECRET` (required for webhook signature validation)
- `STRIPE_WEBHOOK_TOLERANCE_SECONDS` (optional; defaults to `300`)
- `STRIPE_PRICE_PREMIUM_MONTHLY` / `STRIPE_PRICE_PREMIUM_YEARLY`
- `STRIPE_PRICE_TEAM_MONTHLY` / `STRIPE_PRICE_TEAM_YEARLY`
- `STRIPE_PRICE_ENTERPRISE_MONTHLY` / `STRIPE_PRICE_ENTERPRISE_YEARLY` (optional if enterprise is fully sales-led)
- `STRIPE_CHECKOUT_SUCCESS_URL` / `STRIPE_CHECKOUT_CANCEL_URL` (optional; defaults to `NEXTAUTH_URL`)
- `STRIPE_BILLING_PORTAL_RETURN_URL` (optional; defaults to `/dashboard` under `NEXTAUTH_URL`)

### Authorization behavior

- Unauthenticated users visiting `/dashboard/*`, `/org/*`, `/admin/*` are redirected to `/`.
- Authenticated users without sufficient permission are redirected to `/unauthorized`.
- Access checks are enforced in **both middleware and server route guards**.

Prisma commands:

```bash
npx prisma generate
npm run db:seed
```
