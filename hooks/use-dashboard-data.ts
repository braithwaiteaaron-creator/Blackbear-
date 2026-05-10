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
  scheduled_date: string | null
  estimated_amount: number
  actual_amount: number | null
  final_amount: number | null
  paid: boolean
  job_notes: string | null
  time_started_at: string | null
  time_ended_at: string | null
  duration_minutes: number | null
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
    completedJobs: number
    totalCustomers: number
    revenueMTD: number
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json
}

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
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
