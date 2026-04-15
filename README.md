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
- `DEFAULT_USER_ROLE` (optional, default `user`)

Prisma commands:

```bash
npx prisma generate
```
