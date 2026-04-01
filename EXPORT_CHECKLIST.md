# Bear Hub Pro - Claude Code Export Checklist

## Pre-Export Setup

This app is ready to export to Claude Code for full Supabase integration.

### What to Tell Claude Code:

```
Here is my Bear Hub Pro app from v0.dev. 
Wire Supabase for:
- Jobs table
- Clients table  
- Quotes table
- Payment splits/bookkeeper
- Auth (owner login)
```

### Database Schema (Run in Supabase SQL Editor)

The schema is in `/scripts/001_create_tables.sql`. Copy the entire file and run it in your Supabase dashboard > SQL Editor.

### What's Ready for Integration

- ✅ All components separated into individual files
- ✅ Props-driven data (no hardcoded lists)
- ✅ TODO markers for Supabase integration points
- ✅ Controlled form inputs with useState
- ✅ Next.js App Router file structure
- ✅ Database types defined in `/lib/types/database.ts`
- ✅ Hooks skeleton in `/lib/supabase/hooks.ts`
- ✅ Query functions in `/lib/supabase/queries.ts`

### Files Claude Code Will Wire Up

1. `/lib/supabase/hooks.ts` - Database hooks (useJobs, useLeads, useCustomers, etc.)
2. `/lib/supabase/queries.ts` - SQL query functions
3. `/components/jobs-panel.tsx` - Jobs CRUD
4. `/components/leads-panel.tsx` - Leads management
5. `/components/agents-panel.tsx` - Agent data
6. `/components/financials-panel.tsx` - Transactions
7. `/components/referral-panel.tsx` - Winners Circle
8. `/components/route-panel.tsx` - Route tracking
9. `/app/page.tsx` - Main dashboard
10. `/app/referral/[id]/page.tsx` - Personalized referral pages

### Environment Variables Needed

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key (optional)
```

### Next Steps in Claude Code

1. Replace TODO comments with real Supabase calls
2. Implement authentication (owner login)
3. Wire up RLS policies
4. Test all CRUD operations
5. Deploy to production

---

**Your Bear Hub Pro app is production-ready once Claude Code completes the Supabase integration.** 🐻🔥
