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
    const activeJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length
    const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length
    const completedJobs = jobs.filter(j => j.status === 'completed').length
    const revenueMTD = jobs
      .filter(j => j.status === 'completed' && j.paid === true)
      .reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)

    // Attach customer info to jobs and quotes
    const jobsWithCustomer = jobs.map(job => ({
      ...job,
      customer: customers.find(c => c.id === job.customer_id) || null
    }))
    
    const quotesWithCustomer = quotes.map(quote => ({
      ...quote,
      customer: customers.find(c => c.id === quote.customer_id) || null
    }))

    return NextResponse.json({
      jobs: jobsWithCustomer,
      quotes: quotesWithCustomer,
      customers,
      stats: {
        activeJobs,
        pendingQuotes,
        completedJobs,
        totalCustomers: customers.length,
        revenueMTD,
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
