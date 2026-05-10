import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = await createClient()
  
  // Fetch data on the server
  const [allJobsRes, jobsRes, quotesRes, customersRes] = await Promise.all([
    supabase.from('jobs').select('status, paid, actual_amount, estimated_amount'),
    supabase.from('jobs').select('*, customer:customers(*)').order('created_at', { ascending: false }).limit(20),
    supabase.from('quotes').select('*, customer:customers(*)').order('created_at', { ascending: false }).limit(20),
    supabase.from('customers').select('*').limit(100),
  ])

  console.log('[v0] Server Dashboard - Fetching data...')
  const allJobs = allJobsRes.data || []
  const jobs = jobsRes.data || []
  const quotes = quotesRes.data || []
  const customers = customersRes.data || []

  console.log('[v0] Server data:', {
    allJobsCount: allJobs.length,
    jobsCount: jobs.length,
    quotesCount: quotes.length,
    customersCount: customers.length
  })

  // Calculate stats
  const activeJobs = allJobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length
  const completedJobs = allJobs.filter(j => j.status === 'completed').length
  const paidJobs = allJobs.filter(j => j.status === 'completed' && j.paid === true)
  const revenueMTD = paidJobs.reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)

  console.log('[v0] Calculated stats:', { activeJobs, pendingQuotes, completedJobs, revenueMTD })

  const initialData = {
    jobs,
    quotes,
    customers,
    stats: {
      activeJobs,
      pendingQuotes,
      completedJobs,
      totalCustomers: customers.length,
      revenueMTD,
    },
  }

  console.log('[v0] Passing initialData to client:', initialData)

  return <DashboardClient initialData={initialData} />
}
