import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all jobs for accurate stats, recent ones for display
    const [allJobsRes, jobsRes, quotesRes, customersRes] = await Promise.all([
      supabase.from('jobs').select('status, paid, actual_amount, estimated_amount'),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('customers').select('*').limit(100),
    ])

    // Check for errors
    if (allJobsRes.error) console.error('[v0] allJobsRes error:', allJobsRes.error)
    if (jobsRes.error) console.error('[v0] jobsRes error:', jobsRes.error)
    if (quotesRes.error) console.error('[v0] quotesRes error:', quotesRes.error)
    if (customersRes.error) console.error('[v0] customersRes error:', customersRes.error)

    const allJobs = allJobsRes.data || []
    const jobs = jobsRes.data || []
    const quotes = quotesRes.data || []
    const customers = customersRes.data || []

    console.log('[v0] Dashboard data counts:', {
      allJobs: allJobs.length,
      jobs: jobs.length,
      quotes: quotes.length,
      customers: customers.length
    })

    // Calculate stats from ALL jobs, not just recent ones
    const activeJobs = allJobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length
    const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length
    const completedJobs = allJobs.filter(j => j.status === 'completed').length
    const paidJobs = allJobs.filter(j => j.status === 'completed' && j.paid === true)
    console.log('[v0] Paid jobs for revenue:', paidJobs)
    const revenueMTD = paidJobs
      .reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)
    console.log('[v0] Revenue MTD calculated:', revenueMTD)

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
