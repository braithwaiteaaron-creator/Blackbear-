-- Bear Hub Pro Database Schema
-- Create all necessary tables for job management, leads, agents, and financials

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  properties_count INTEGER DEFAULT 1,
  trees_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'quoted',
  value DECIMAL(10,2) DEFAULT 0,
  permit_required BOOLEAN DEFAULT FALSE,
  clearance_required BOOLEAN DEFAULT FALSE,
  climbing_required BOOLEAN DEFAULT FALSE,
  trees TEXT[] DEFAULT '{}',
  notes TEXT,
  photos_count INTEGER DEFAULT 0,
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  source TEXT DEFAULT 'direct',
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'warm',
  estimated_value DECIMAL(10,2) DEFAULT 0,
  trees_count INTEGER DEFAULT 0,
  properties_count INTEGER DEFAULT 1,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  rating DECIMAL(2,1) DEFAULT 5.0,
  jobs_completed INTEGER DEFAULT 0,
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  trees_this_month INTEGER DEFAULT 0,
  investment_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'income',
  payment_method TEXT DEFAULT 'e-transfer',
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  customer_name TEXT,
  stop_order INTEGER DEFAULT 0,
  route_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  is_storm_chase BOOLEAN DEFAULT FALSE,
  notes TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.spotted_damage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  converted_to_lead BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  spotted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  has_qr BOOLEAN DEFAULT FALSE,
  customizable BOOLEAN DEFAULT FALSE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrers table (Winners Circle)
CREATE TABLE IF NOT EXISTS public.referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  converted_referrals INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 0.10,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referrer_id to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.referrers(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_route_stops_date ON public.route_stops(route_date);
CREATE INDEX IF NOT EXISTS idx_referrers_code ON public.referrers(referral_code);
CREATE INDEX IF NOT EXISTS idx_leads_referrer ON public.leads(referrer_id);
