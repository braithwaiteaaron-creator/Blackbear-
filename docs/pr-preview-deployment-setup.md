# PR Preview Deployment Setup

This guide shows how to enable automatic preview links for every pull request.

The recommended path for this Next.js repo is **Vercel + GitHub integration**.

## 1) Prerequisites

- GitHub repository admin access.
- Vercel account with access to create/import projects.
- Project already builds locally with:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

## 2) Connect repository to Vercel

1. Open Vercel dashboard and click **Add New Project**.
2. Import this GitHub repository.
3. Configure the framework as **Next.js** (usually auto-detected).
4. Keep build command default (`next build`) unless customized.
5. Set root directory to repository root (`/`) unless you use a monorepo setup.

## 3) Configure environment variables for preview

In Vercel Project Settings -> Environment Variables:

- Add the same variables your app needs in production/staging:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (set per preview domain behavior if needed)
  - Stripe variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.) if relevant to the preview scope
  - OAuth variables if auth testing is needed in previews

Recommended:
- Provide safe preview/test credentials and isolated preview database.
- Do not use production secrets for PR preview environments.

## 4) Enable PR preview comments/checks

After repository integration:

- Every pushed PR branch commit should trigger a Vercel Preview Deployment.
- GitHub PR checks should show a Vercel deployment status.
- PR timeline should include a **Preview URL**.

If checks are not appearing:
- Verify Vercel GitHub app is installed with repository access.
- Confirm project is linked to the correct GitHub repo.
- Confirm branch is pushed to GitHub and PR is open.

## 5) Optional domain and auth hardening

- Keep preview URLs on default `*.vercel.app` unless custom domain is required.
- If OAuth callbacks are strict, add preview callback URLs to provider config.
- For NextAuth, ensure preview URLs are allowed and session cookies work on Vercel domains.

## 6) Recommended preview safety profile

- Use lower-privilege API keys.
- Use non-production billing/test mode (Stripe test keys).
- Use non-production webhook endpoints.
- Keep preview DB isolated and disposable.

## 7) Troubleshooting checklist

If preview builds fail:

1. Check Vercel build logs for missing env vars.
2. Run `npm run lint`, `npm run typecheck`, `npm run build` locally.
3. Verify Prisma client generation if schema changed:
   - `npx prisma generate`
4. Ensure Node version compatibility in Vercel project settings.
5. Check NextAuth URL/secret configuration for preview.

## 8) Result

When configured correctly, each PR gets:

- a unique preview URL
- deployment status checks in GitHub
- a shareable link for UI/UX review before merge

