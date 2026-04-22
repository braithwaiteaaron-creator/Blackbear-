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
  - supports intro/trial rules via configurable trial day settings and per-user usage limits
  - returns `checkoutUrl` for immediate client redirect
- `POST /api/v1/billing/portal` (legacy alias: `POST /api/billing/portal`)
  - creates Stripe Billing Portal session for authenticated users
  - reuses existing Stripe customer when available, otherwise initializes from user email
  - returns `portalUrl` for immediate client redirect
- `POST /api/v1/billing/webhooks/stripe` (legacy alias: `POST /api/billing/webhooks/stripe`)
  - verifies Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`
  - persists webhook events for replay protection and observability
  - syncs subscription rows and user subscription tiers from subscription lifecycle events
  - handles invoice payment failures/success to drive dunning state updates
  - stores processing status and error details for failed event handling
- `GET /api/v1/billing/reports/finance/summary` (legacy alias: `GET /api/billing/reports/finance/summary`)
  - admin-protected finance summary endpoint for subscription status and estimated recurring revenue
  - supports `preset` windows (`all`, `last_30_days`, `quarter_to_date`, `year_to_date`)
  - supports custom `from` / `to` ISO date range filters
- `GET /api/v1/billing/reports/finance/export` (legacy alias: `GET /api/billing/reports/finance/export`)
  - admin-protected CSV export for subscription-level finance reporting rows
  - supports same `preset` and `from` / `to` filters as summary endpoint
  - returns CSV attachment with estimated monthly recurring revenue per subscription
- `GET /api/v1/certifications/me` (legacy alias: `GET /api/certifications/me`)
  - returns current user's issued certifications (newest first)
  - includes tier, issue/expiry dates, verification code, and downloadable certificate URL
- `POST /api/v1/certifications/me` (legacy alias: `POST /api/certifications/me`)
  - issues a certificate from the most recent completed certification purchase
  - returns `402 PAYMENT_REQUIRED` with `requiredCertificationTier` when no completed purchase exists
  - generates and stores a downloadable PDF under `/public/certificates`
  - returns existing active certificate for the purchased tier if already issued
  - includes provider sync metadata in response meta (`providerSync`) for mock/Credly/Badgr integration state
- `POST /api/v1/certifications/checkout` (legacy alias: `POST /api/certifications/checkout`)
  - creates Stripe one-time Checkout session for a certification purchase
  - accepts optional `certificationTier` (`foundation|developing|advanced|expert`, default `advanced`)
  - requires `acceptCertificationTerms: true` and `certificationTermsVersion` matching the current legal version
  - persists pending purchase records and returns `checkoutUrl` for client redirect
- `POST /api/v1/certifications/issue` (legacy alias: `POST /api/certifications/issue`)
  - explicitly issues certificate from latest completed purchase
  - returns `purchaseId` plus issued credential metadata
- `GET /api/v1/certifications/purchases/me` (legacy alias: `GET /api/certifications/purchases/me`)
  - lists current user's certification purchase history (status, tier, amount, completion timestamp)
- `GET /api/v1/admin/certifications` (legacy alias: `GET /api/admin/certifications`)
  - admin-only listing endpoint for issued certifications with status (`active|revoked|expired`)
  - supports `limit` query parameter for operational pagination
- `PATCH /api/v1/admin/certifications/{certificationId}` (legacy alias: `PATCH /api/admin/certifications/{certificationId}`)
  - admin-only revoke control that marks a certification revoked, records revocation reason, and expires active credentials immediately
- `POST /api/v1/admin/certifications/reissue` (legacy alias: `POST /api/admin/certifications/reissue`)
  - admin-only reissue control that revokes current active certs for the selected tier and generates a replacement credential
  - returns provider sync metadata for downstream badge provider visibility
- `GET /api/v1/admin/certifications/risk-events` (legacy alias: `GET /api/admin/certifications/risk-events`)
  - admin-only abuse/fraud signal stream for certification misuse checks
  - supports `limit` and `unresolvedOnly` filters
- `PATCH /api/v1/admin/certifications/risk-events/{eventId}` (legacy alias: `PATCH /api/admin/certifications/risk-events/{eventId}`)
  - admin-only resolution endpoint to mark a risk event reviewed with a resolution note
- `GET /api/v1/org/organizations` (legacy alias: `GET /api/org/organizations`)
  - org-admin/admin endpoint to load the caller's managed organization context (organization, members, seat usage)
- `POST /api/v1/org/organizations` (legacy alias: `POST /api/org/organizations`)
  - creates an organization for org-admin/admin users with team/enterprise subscription
  - accepts `name`, `domain`, `subscriptionType`, `seatCount`, and optional initial member list
  - auto-provisions caller as active admin membership and updates caller role/tier context
- `GET /api/v1/org/members` (legacy alias: `GET /api/org/members`)
  - org-admin/admin endpoint to list organization members with optional `status` and `limit` filters
- `POST /api/v1/org/members` (legacy alias: `POST /api/org/members`)
  - provisions a member invite or active membership by email/role for the caller's managed organization
  - enforces seat capacity guardrails and tracks invitation metadata
- `GET /api/v1/org/dashboard` (legacy alias: `GET /api/org/dashboard`)
  - org-admin/admin dashboard metrics endpoint with live organization aggregates
  - returns organization profile, seat utilization, member status counts, and assessment snapshot metrics
  - includes latest top knowledge gaps and latest report URL when assessments exist
- `GET /api/v1/certifications/verify/{verificationCode}` (legacy alias: `GET /api/certifications/verify/{verificationCode}`)
  - public verification endpoint for credential metadata lookup by verification code
  - returns credential status (`active|revoked|expired`), holder display name, issuer metadata, tier, issue/expiry dates, and certificate URL
  - validates code format and returns standard API errors for invalid/missing credentials
- `/badges` now includes an interactive verification workflow:
  - accepts a verification code input
  - fetches and renders verification result states (success/invalid/not found)
  - links directly to certificate artifact and issuer URL
- Badge sharing now includes referral attribution links:
  - results and dashboard badge surfaces include one-click share actions for LinkedIn/X plus copy-link
  - share URLs include UTM and referral context (`utm_source=badge_share`, `utm_medium=social`, `utm_campaign=badge_attribution`, `ref=...`, optional `session=...`)
- Legacy `/api/quiz-sessions*` routes include deprecation headers:
  - `Deprecation: true`
  - `Sunset: <date>`
  - `Link: </api/v1/...>; rel="successor-version"`
- Internal queue worker route:
  - `POST /api/internal/jobs/process`
  - requires `x-job-worker-key` header matching `JOB_WORKER_KEY`
  - processes pending async jobs in small batches
- Internal certification renewal scheduler route:
  - `POST /api/internal/certifications/renewals/schedule`
  - requires `x-job-worker-key` header matching `JOB_WORKER_KEY`
  - scans expiring certificates and enqueues renewal notice jobs

## Enterprise identity planning artifacts

- SSO/SAML implementation plan: `docs/sso-saml-implementation-plan.md`
  - covers IdP metadata model, tenant configuration surfaces, SAML authn flow, claim mapping, security controls, and rollout strategy
  - defines migration approach from current NextAuth social login toward enterprise SSO without breaking existing users
  - includes API/interface contracts and validation checklist for production readiness

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
- `BILLING_INTRO_TRIAL_DAYS_DEFAULT` (optional; defaults to `14`)
- `BILLING_INTRO_TRIAL_DAYS_PREMIUM` (optional; overrides Premium trial duration)
- `BILLING_INTRO_TRIAL_DAYS_TEAM` (optional; overrides Team trial duration)
- `BILLING_INTRO_ELIGIBLE_PLANS` (optional; comma-separated, defaults to `premium,team`)
- `BILLING_DUNNING_ENABLED` (optional; set `false` to disable dunning queue behavior)
- `CREDENTIAL_PROVIDER` (optional; `mock|credly|badgr`, defaults to `mock`)
- `CREDLY_API_TOKEN` / `CREDLY_ORGANIZATION_ID` (optional; used when `CREDENTIAL_PROVIDER=credly`)
- `BADGR_API_TOKEN` / `BADGR_ISSUER_ID` (optional; used when `CREDENTIAL_PROVIDER=badgr`)
- `STRIPE_CERT_PRICE_FOUNDATION` / `STRIPE_CERT_PRICE_DEVELOPING` / `STRIPE_CERT_PRICE_ADVANCED` / `STRIPE_CERT_PRICE_EXPERT` (reserved for future Stripe product/price mapping)
- `CERTIFICATION_TERMS_VERSION` (optional server override for legal terms version, default `2026-04-15`)
- `CERTIFICATION_TERMS_EFFECTIVE_DATE` (optional server override for legal terms effective date; defaults to terms version)
- `NEXT_PUBLIC_CERTIFICATION_TERMS_VERSION` (optional client-visible override, should match server version)
- `NEXT_PUBLIC_CERTIFICATION_TERMS_EFFECTIVE_DATE` (optional client-visible override for display text)
- `CERTIFICATION_RENEWAL_SCHEDULER_ENABLED` (optional; set `false` to disable renewal scheduling)
- `CERTIFICATION_RENEWAL_LOOKAHEAD_DAYS` (optional; default `30`)
- `CERTIFICATION_RENEWAL_SCHEDULED_BY` (optional; default `system-renewal-scheduler`)

Certification artifacts:

- Generated certificate PDFs are written to `public/certificates/`.
- Each generated certificate includes a verification code saved in the `certifications` table.
- Verification metadata is publicly queryable via `/api/v1/certifications/verify/{verificationCode}`.
- `/badges` includes an interactive verification form and credential result display for public checks.
- Certificate issuance now runs through a provider abstraction (`mock`, `credly`, `badgr`) and returns provider sync metadata in issuance responses.
- Renewal scheduler scans certificates expiring in the configured lookahead window and enqueues `certification_renewal_notice` jobs.
- Admin revoke/reissue actions append metadata history to certification records and surface in admin certification controls on `/admin/users`.
- Abuse/fraud protections now log certification risk events (`checkout_without_assessment`, `checkout_tier_mismatch`, `checkout_pending_flood`, `issuance_without_assessment`, `issuance_tier_mismatch`, `revoked_credential_verification`) and expose unresolved events in admin controls.
- Purchase and issuance flows enforce guardrails against tier mismatch, repeated pending checkouts, and issuance without a valid assessment context.
- Certification checkout now records auditable terms acceptance metadata (`certificationTermsVersion`, acceptance timestamp) in Stripe metadata and persisted purchase metadata.
- Public certification legal terms are published at `/certifications/terms`; dashboard checkout requires explicit acceptance of the current version before redirecting to Stripe.
- Organization provisioning now supports create-and-invite workflows with seat-aware membership controls exposed in `/org/members`.
- `/org/dashboard` now renders live organization metrics from API data (seat utilization, member mix, latest assessment averages, and top knowledge gaps) instead of placeholder cards.

### Authorization behavior

- Unauthenticated users visiting `/dashboard/*`, `/org/*`, `/admin/*` are redirected to `/`.
- Authenticated users without sufficient permission are redirected to `/unauthorized`.
- Access checks are enforced in **both middleware and server route guards**.

Prisma commands:

```bash
npx prisma generate
npm run db:seed
```
