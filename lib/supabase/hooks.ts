"use client"

import { useState, useEffect } from "react"
import type { 
  Job, 
  Lead, 
  Customer, 
  Agent, 
  Transaction, 
  Referrer, 
  MerchItem,
  RouteStop,
  SpottedDamage 
} from "@/lib/types/database"

// TODO: Connect to Supabase - Replace mock data with real database calls

// ============================================
// JOBS
// ============================================

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs([]) // Replace with real data
    setLoading(false)
  }

  async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('jobs').insert(job).select().single()
    return { data: null, error: null }
  }

  async function updateJob(id: string, updates: Partial<Job>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single()
    return { data: null, error: null }
  }

  async function deleteJob(id: string) {
    // TODO: Connect to Supabase
    // const { error } = await supabase.from('jobs').delete().eq('id', id)
    return { error: null }
  }

  return { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob }
}

// ============================================
// LEADS
// ============================================

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads([])
    setLoading(false)
  }

  async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('leads').insert(lead).select().single()
    return { data: null, error: null }
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single()
    return { data: null, error: null }
  }

  async function convertLeadToJob(leadId: string) {
    // TODO: Connect to Supabase - Convert lead to job and update status
    return { data: null, error: null }
  }

  return { leads, loading, error, fetchLeads, createLead, updateLead, convertLeadToJob }
}

// ============================================
// CUSTOMERS
// ============================================

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('customers').select('*').order('name')
    setCustomers([])
    setLoading(false)
  }

  async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('customers').insert(customer).select().single()
    return { data: null, error: null }
  }

  async function updateCustomer(id: string, updates: Partial<Customer>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single()
    return { data: null, error: null }
  }

  return { customers, loading, error, fetchCustomers, createCustomer, updateCustomer }
}

// ============================================
// AGENTS
// ============================================

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('agents').select('*').order('name')
    setAgents([])
    setLoading(false)
  }

  async function updateAgentStats(id: string, updates: Partial<Agent>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('agents').update(updates).eq('id', id).select().single()
    return { data: null, error: null }
  }

  return { agents, loading, error, fetchAgents, updateAgentStats }
}

// ============================================
// TRANSACTIONS (Financials)
// ============================================

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
    setTransactions([])
    setLoading(false)
  }

  async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('transactions').insert(transaction).select().single()
    return { data: null, error: null }
  }

  async function updateTransactionStatus(id: string, status: Transaction['status']) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('transactions').update({ status }).eq('id', id).select().single()
    return { data: null, error: null }
  }

  return { transactions, loading, error, fetchTransactions, createTransaction, updateTransactionStatus }
}

// ============================================
// REFERRERS (Winners Circle)
// ============================================

export function useReferrers() {
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReferrers()
  }, [])

  async function fetchReferrers() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('referrers').select('*').order('total_value', { ascending: false })
    setReferrers([])
    setLoading(false)
  }

  async function createReferrer(referrer: Omit<Referrer, 'id' | 'created_at' | 'referral_code'>) {
    // TODO: Connect to Supabase - Generate unique referral_code
    // const { data, error } = await supabase.from('referrers').insert({ ...referrer, referral_code: generateCode() }).select().single()
    return { data: null, error: null }
  }

  async function trackReferral(referralCode: string) {
    // TODO: Connect to Supabase - Increment referral count
    return { data: null, error: null }
  }

  return { referrers, loading, error, fetchReferrers, createReferrer, trackReferral }
}

// ============================================
// MERCHANDISE
// ============================================

export function useMerch() {
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('merch_items').select('*').order('name')
    setItems([])
    setLoading(false)
  }

  async function updateStock(id: string, quantity: number) {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('merch_items').update({ stock: quantity }).eq('id', id).select().single()
    return { data: null, error: null }
  }

  return { items, loading, error, fetchItems, updateStock }
}

// ============================================
// ROUTES & SPOTTED DAMAGE
// ============================================

export function useRoutes(date?: string) {
  const [stops, setStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoute()
  }, [date])

  async function fetchRoute() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('route_stops').select('*').eq('scheduled_date', date).order('order_index')
    setStops([])
    setLoading(false)
  }

  async function addStop(stop: Omit<RouteStop, 'id'>) {
    // TODO: Connect to Supabase
    return { data: null, error: null }
  }

  async function reorderStops(stopIds: string[]) {
    // TODO: Connect to Supabase - Batch update order_index
    return { error: null }
  }

  return { stops, loading, fetchRoute, addStop, reorderStops }
}

export function useSpottedDamage() {
  const [damages, setDamages] = useState<SpottedDamage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDamages()
  }, [])

  async function fetchDamages() {
    setLoading(true)
    // TODO: Connect to Supabase
    // const { data, error } = await supabase.from('spotted_damage').select('*').eq('converted_to_lead', false).order('spotted_at', { ascending: false })
    setDamages([])
    setLoading(false)
  }

  async function logDamage(damage: Omit<SpottedDamage, 'id' | 'created_at' | 'converted_to_lead' | 'lead_id'>) {
    // TODO: Connect to Supabase
    return { data: null, error: null }
  }

  async function convertToLead(damageId: string) {
    // TODO: Connect to Supabase - Create lead from damage, update damage record
    return { data: null, error: null }
  }

  return { damages, loading, fetchDamages, logDamage, convertToLead }
}
