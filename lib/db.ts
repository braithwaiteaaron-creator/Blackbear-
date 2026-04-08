import { createClient } from '@/lib/supabase/server'

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[db] Error fetching customers:', error)
    return []
  }
  return data || []
}

export async function getJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[db] Error fetching jobs:', error)
    return []
  }
  return data || []
}

export async function getQuotes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[db] Error fetching quotes:', error)
    return []
  }
  return data || []
}

export async function createJob(jobData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
  
  if (error) {
    console.error('[db] Error creating job:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateJob(id: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('[db] Error updating job:', error)
    return null
  }
  return data?.[0] || null
}

export async function createQuote(quoteData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData])
    .select()
  
  if (error) {
    console.error('[db] Error creating quote:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateQuote(id: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('[db] Error updating quote:', error)
    return null
  }
  return data?.[0] || null
}

export async function createCustomer(customerData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
  
  if (error) {
    console.error('[db] Error creating customer:', error)
    return null
  }
  return data?.[0] || null
}
