import { createClient } from './client'

// Jobs
export async function getJobs() {
  const supabase = createClient()
  const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createJob(job: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('jobs').insert([job]).select()
  if (error) throw error
  return data[0]
}

// Customers
export async function getCustomers() {
  const supabase = createClient()
  const { data, error } = await supabase.from('customers').select('*')
  if (error) throw error
  return data
}

export async function createCustomer(customer: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('customers').insert([customer]).select()
  if (error) throw error
  return data[0]
}

// Leads
export async function getLeads() {
  const supabase = createClient()
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createLead(lead: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('leads').insert([lead]).select()
  if (error) throw error
  return data[0]
}

// Agents
export async function getAgents() {
  const supabase = createClient()
  const { data, error } = await supabase.from('agents').select('*').order('monthly_revenue', { ascending: false })
  if (error) throw error
  return data
}

// Transactions
export async function getTransactions() {
  const supabase = createClient()
  const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTransaction(transaction: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('transactions').insert([transaction]).select()
  if (error) throw error
  return data[0]
}

// Merchandise
export async function getMerchandise() {
  const supabase = createClient()
  const { data, error } = await supabase.from('merchandise').select('*')
  if (error) throw error
  return data
}

// Route Stops
export async function getRouteTodayStops() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('route_stops')
    .select('*')
    .eq('route_date', today)
    .order('stop_order', { ascending: true })
  if (error) throw error
  return data
}

// Spotted Damage
export async function spotDamage(damage: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('spotted_damage').insert([damage]).select()
  if (error) throw error
  return data[0]
}
