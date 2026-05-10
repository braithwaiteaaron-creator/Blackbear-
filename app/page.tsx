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

  const allJobs = allJobsRes.data || []
  const jobs = jobsRes.data || []
  const quotes = quotesRes.data || []
  const customers = customersRes.data || []

  // Calculate stats
  const activeJobs = allJobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length
  const completedJobs = allJobs.filter(j => j.status === 'completed').length
  const paidJobs = allJobs.filter(j => j.status === 'completed' && j.paid === true)
  const revenueMTD = paidJobs.reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)

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

  return <DashboardClient initialData={initialData} />
}
