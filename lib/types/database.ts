// Bear Hub Pro - Database Types for Supabase Integration

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address: string
  properties_count: number
  total_jobs: number
  total_value: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  customer_id: string
  address: string
  type: string
  status: "quoted" | "scheduled" | "in-progress" | "completed" | "urgent"
  value: number
  permit_required: boolean
  clearance_required: boolean
  climbing_required: boolean
  trees: string[]
  notes?: string
  photos: string[]
  created_at: string
  updated_at: string
  scheduled_date?: string
  completed_date?: string
}

export interface Lead {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  source: "instagram" | "linkedin" | "referral" | "website" | "storm-chase" | "other"
  status: "new" | "contacted" | "quoted" | "converted" | "lost"
  priority: "hot" | "warm" | "cold"
  estimated_value: number
  trees_count: number
  properties_count: number
  notes?: string
  referrer_id?: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id?: string
  name: string
  role: "owner" | "manager" | "sales" | "climber"
  avatar_url?: string
  phone?: string
  email?: string
  status: "active" | "on-job" | "off-duty"
  jobs_completed: number
  monthly_revenue: number
  commission_rate: number
  commission_earned: number
  rating: number
  trees_this_month: number
  investment_balance?: number
  created_at: string
}

export interface Transaction {
  id: string
  job_id?: string
  customer_id?: string
  type: "payment" | "expense" | "commission" | "refund"
  method: "e-transfer" | "cash" | "cheque" | "qr-code"
  amount: number
  status: "pending" | "completed" | "overdue" | "cancelled"
  description?: string
  due_date?: string
  paid_date?: string
  created_at: string
}

export interface RouteStop {
  id: string
  job_id?: string
  lead_id?: string
  address: string
  type: "job" | "quote" | "follow-up" | "damage-check"
  order_index: number
  status: "pending" | "completed" | "skipped"
  notes?: string
  scheduled_date: string
  completed_at?: string
}

export interface SpottedDamage {
  id: string
  address: string
  description?: string
  severity: "low" | "moderate" | "high"
  photos: string[]
  converted_to_lead: boolean
  lead_id?: string
  spotted_at: string
  created_at: string
}

export interface Referrer {
  id: string
  name: string
  phone?: string
  email?: string
  referral_code: string
  total_referrals: number
  converted_referrals: number
  total_value: number
  commission_rate: number
  commission_earned: number
  status: "active" | "inactive"
  created_at: string
}

export interface MerchItem {
  id: string
  name: string
  category: "apparel" | "accessories" | "marketing" | "custom-orders"
  price: number
  cost: number
  stock: number
  min_stock: number
  has_qr: boolean
  customizable: boolean
  description?: string
  image_url?: string
  created_at: string
}
