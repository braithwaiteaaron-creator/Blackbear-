'use server'

import { createClient } from '@/lib/supabase/server'

export async function createJobAction(jobData: {
  customer_id: string
  description: string
  service_type: string
  status: string
  scheduled_date?: string
  amount: number
  address?: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Create job error:', error)
    return { success: false, error: String(error) }
  }
}

export async function updateJobAction(
  jobId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Update job error:', error)
    return { success: false, error: String(error) }
  }
}

export async function createQuoteAction(quoteData: {
  customer_id?: string
  description: string
  service_type: string
  amount: number
  status?: string
  valid_until?: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Create quote error:', error)
    return { success: false, error: String(error) }
  }
}

export async function updateQuoteAction(
  quoteId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', quoteId)
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Update quote error:', error)
    return { success: false, error: String(error) }
  }
}

export async function createCustomerAction(customerData: {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
}) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Create customer error:', error)
    return { success: false, error: String(error) }
  }
}
