'use client'

import useSWR from 'swr'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  created_at: string
}

interface Job {
  id: string
  job_number: string
  customer_id: string
  service_type: string
  description: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date: string
  estimated_amount: number
  final_amount: number | null
  created_at: string
  customer?: Customer
}

interface Quote {
  id: string
  quote_number: string
  customer_id: string
  service_type: string
  description: string
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected'
  amount: number
  valid_until: string
  created_at: string
  customer?: Customer
}

interface DashboardData {
  customers: Customer[]
  jobs: Job[]
  quotes: Quote[]
  stats: {
    activeJobs: number
    pendingQuotes: number
    totalCustomers: number
    revenueMTD: number
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  }
}

export type { Customer, Job, Quote, DashboardData }
