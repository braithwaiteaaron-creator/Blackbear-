import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const [jobsRes, quotesRes, customersRes] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('customers').select('*').limit(50),
    ])

    const jobs = jobsRes.data || []
    const quotes = quotesRes.data || []
    const customers = customersRes.data || []

    // Calculate stats
    const activeJobs = jobs.filter(j => j.status === 'in_progress').length
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length
    const completedJobs = jobs.filter(j => j.status === 'completed').length
    const totalRevenue = jobs
      .filter(j => j.status === 'completed')
      .reduce((sum, j) => sum + (Number(j.amount) || 0), 0)

    return NextResponse.json({
      jobs,
      quotes,
      customers,
      stats: {
        activeJobs,
        pendingQuotes,
        completedJobs,
        totalCustomers: customers.length,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error('[api] Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
