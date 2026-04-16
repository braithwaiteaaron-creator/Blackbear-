<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project overview
Bear Hub Pro is a single Next.js 16 app (TypeScript, Tailwind CSS v4, shadcn/ui) for tree care business management. It uses Supabase (hosted PostgreSQL) as its database — there is no local database.

### Development branch
The application code lives on the `bear-hub-pro` branch. The `main` branch contains only the initial commit (README, LICENSE, .gitignore). Always work from `bear-hub-pro`.

### Running the dev server
```
pnpm dev
```
The server starts on `http://localhost:3000`. The UI renders and is navigable even without Supabase credentials — API calls return errors but the frontend handles them gracefully (empty states).

### Environment variables (Supabase)
Required for full data flow but **not** for running the dev server or navigating the UI:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Place them in `.env.development.local`. Without them, all CRUD operations will fail but the UI still loads.

### Lint & Build
- **Lint**: `pnpm lint` — runs ESLint. The codebase has pre-existing warnings and errors (unused vars, `no-explicit-any`, `set-state-in-effect`). These are not blockers for development.
- **Build**: `pnpm build` — has a pre-existing TypeScript error in `app/analytics/page.tsx` (undefined not assignable). The dev server (`pnpm dev`) is unaffected and works fine.

### Key directories
- `app/` — Next.js App Router pages and API routes
- `components/` — React components (shadcn/ui in `components/ui/`)
- `lib/supabase/` — Supabase client setup (server, client, middleware)
- `lib/db.ts` — Database helper functions
- `scripts/` — SQL migration files (run manually in Supabase SQL Editor)
- `hooks/` — Custom React hooks (dashboard data, mobile detection)

### No automated tests
The codebase has no test framework or test files configured.
