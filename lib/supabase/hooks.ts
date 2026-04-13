"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "./client"

// ============================================
// JOBS
// ============================================

export interface Job {
  id: string
  customer_id?: string
  quote_id?: string
  job_number?: string
  description: string
  service_type: string
  status: string
  address?: string
  estimated_amount?: number
  actual_amount?: number
  paid?: boolean
  notes?: string
  job_notes?: string
  scheduled_date?: string
  completed_date?: string
  time_started_at?: string
  time_ended_at?: string
  duration_minutes?: number
  customer_phone?: string
  customer_email?: string
  reminder_3day_sent?: boolean
  reminder_1day_sent?: boolean
  reminder_morning_sent?: boolean
  created_at?: string
  updated_at?: string
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching jobs:", error)
      setError(error.message)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function createJob(job: Partial<Job>) {
    const supabase = createClient()
    
    // Only include fields that are defined
    const cleanJob = Object.fromEntries(
      Object.entries(job).filter(([, value]) => value !== undefined && value !== null)
    )
    
    const { data, error } = await supabase
      .from("jobs")
      .insert([cleanJob])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating job:", error)
      return { data: null, error }
    }
    
    setJobs((prev) => [data, ...prev])
    return { data, error: null }
  }

  async function updateJob(id: string, updates: Partial<Job>) {
    const supabase = createClient()
    
    // Only include fields that are defined
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined && value !== null)
    )
    
    const { data, error } = await supabase
      .from("jobs")
      .update(cleanUpdates)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating job:", error)
      return { data: null, error }
    }
    
    setJobs((prev) => prev.map((j) => (j.id === id ? data : j)))
    return { data, error: null }
  }

  async function deleteJob(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("jobs").delete().eq("id", id)
    
    if (error) {
      console.error("Error deleting job:", error)
      return { error }
    }
    
    setJobs((prev) => prev.filter((j) => j.id !== id))
    return { error: null }
  }

  return { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob }
}

// ============================================
// LEADS
// ============================================

export interface Lead {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  source: string
  status: string
  priority: string
  estimated_value: number
  trees: number
  properties: number
  notes?: string
  last_contact?: string
  referrer_id?: string
  created_at: string
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching leads:", error)
      setError(error.message)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function createLead(lead: Omit<Lead, "id" | "created_at">) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating lead:", error)
      return { data: null, error }
    }
    
    setLeads((prev) => [data, ...prev])
    return { data, error: null }
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating lead:", error)
      return { data: null, error }
    }
    
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)))
    return { data, error: null }
  }

  async function deleteLead(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().eq("id", id)
    
    if (error) {
      console.error("Error deleting lead:", error)
      return { error }
    }
    
    setLeads((prev) => prev.filter((l) => l.id !== id))
    return { error: null }
  }

  return { leads, loading, error, fetchLeads, createLead, updateLead, deleteLead }
}

// ============================================
// AGENTS
// ============================================

export interface Agent {
  id: string
  name: string
  role: string
  avatar?: string
  avatar_image?: string
  phone?: string
  email?: string
  jobs_completed: number
  monthly_revenue: number
  commission: number
  rating: number
  status: string
  investment_balance: number
  trees_this_month: number
  created_at: string
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching agents:", error)
      setError(error.message)
    } else {
      setAgents(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  async function createAgent(agent: Omit<Agent, "id" | "created_at">) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("agents")
      .insert([agent])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating agent:", error)
      return { data: null, error }
    }
    
    setAgents((prev) => [data, ...prev])
    return { data, error: null }
  }

  async function updateAgent(id: string, updates: Partial<Agent>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating agent:", error)
      return { data: null, error }
    }
    
    setAgents((prev) => prev.map((a) => (a.id === id ? data : a)))
    return { data, error: null }
  }

  return { agents, loading, error, fetchAgents, createAgent, updateAgent }
}

// ============================================
// TRANSACTIONS (Financials)
// ============================================

export interface Transaction {
  id: string
  job_id?: string
  customer_id?: string
  customer_name: string
  address?: string
  amount: number
  payment_type: string
  status: string
  job_type?: string
  notes?: string
  created_at: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching transactions:", error)
      setError(error.message)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  async function createTransaction(tx: Omit<Transaction, "id" | "created_at">) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("transactions")
      .insert([tx])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating transaction:", error)
      return { data: null, error }
    }
    
    setTransactions((prev) => [data, ...prev])
    return { data, error: null }
  }

  async function updateTransaction(id: string, updates: Partial<Transaction>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating transaction:", error)
      return { data: null, error }
    }
    
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)))
    return { data, error: null }
  }

  return { transactions, loading, error, fetchTransactions, createTransaction, updateTransaction }
}

// ============================================
// REFERRERS (Winners Circle)
// ============================================

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
  status: string
  created_at: string
}

export function useReferrers() {
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReferrers = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("referrers")
      .select("*")
      .order("total_value", { ascending: false })
    
    if (error) {
      console.error("Error fetching referrers:", error)
      setError(error.message)
    } else {
      setReferrers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReferrers()
  }, [fetchReferrers])

  async function createReferrer(referrer: Omit<Referrer, "id" | "created_at">) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("referrers")
      .insert([referrer])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating referrer:", error)
      return { data: null, error }
    }
    
    setReferrers((prev) => [data, ...prev])
    return { data, error: null }
  }

  async function updateReferrer(id: string, updates: Partial<Referrer>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("referrers")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating referrer:", error)
      return { data: null, error }
    }
    
    setReferrers((prev) => prev.map((r) => (r.id === id ? data : r)))
    return { data, error: null }
  }

  async function deleteReferrer(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("referrers").delete().eq("id", id)
    
    if (error) {
      console.error("Error deleting referrer:", error)
      return { error }
    }
    
    setReferrers((prev) => prev.filter((r) => r.id !== id))
    return { error: null }
  }

  return { referrers, loading, error, fetchReferrers, createReferrer, updateReferrer, deleteReferrer }
}
