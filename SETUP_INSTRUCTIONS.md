# Bear Hub Pro - Setup Instructions for Live Supabase Connection

## Current Status
- **UI/Frontend**: 100% complete and running
- **Database Schema**: Created (tables, triggers, functions defined)
- **Supabase Connection**: Environment variables set ✓
- **Live Data Flow**: Ready to connect

## What Needs to Happen (Henry's Task)

### Step 1: Execute Database Migration in Supabase Dashboard
The tables don't exist yet. You need to run the SQL in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the entire contents of `/scripts/001_create_tables.sql`
5. Click "Run"

This creates:
- `customers` table (name, email, phone, address)
- `quotes` table (customer_id, service_type, amount, status)
- `jobs` table (customer_id, quote_id, service_type, status, scheduled_date, amount)
- Auto-generating triggers for quote_number and job_number
- Indexes for performance

### Step 2: Verify Database Connection
After running the migration:
1. In Supabase dashboard, go to Tables
2. You should see `customers`, `quotes`, and `jobs` tables listed
3. The app will automatically fetch from these tables

### Step 3: Test Live Data Flow (Real Field Test - Step 21)
1. Open Bear Hub Pro in browser
2. Go to Overview tab → Click "Add Customer"
3. Fill in customer info and submit
4. Check Supabase dashboard Tables → customers table
5. Verify the customer appears in the database

Then proceed with full test:
- Create a quote for that customer
- Create a job from that customer
- Track status changes
- Watch data persist to Supabase in real-time

## Payment Buckets Configuration
Once live data is flowing, update `/app/actions.ts` line ~80 to calculate payment splits:
- Labour: 45% of job amount
- Materials: 20% of job amount  
- Equipment: 15% of job amount
- Tax: 20% of job amount

These will be calculated automatically when a job is marked paid.

## What Henry Needs to Do RIGHT NOW
1. Copy the SQL from `/scripts/001_create_tables.sql`
2. Paste it into Supabase SQL Editor
3. Click Run
4. Come back and run a test customer through the system

## If Something Breaks
- Check Supabase error logs (red exclamation in SQL Editor)
- Verify all three tables exist in your Tables view
- Check environment variables are set correctly (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
