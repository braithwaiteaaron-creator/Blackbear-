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

// Mark job as paid - triggers payment bucket calculation automatically via database trigger
export async function markJobPaidAction(
  jobId: string,
  actualAmount?: number
) {
  try {
    const supabase = await createClient()
    
    const updates: Record<string, unknown> = {
      paid: true,
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0]
    }
    
    if (actualAmount !== undefined) {
      updates.actual_amount = actualAmount
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
    
    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('[action] Mark job paid error:', error)
    return { success: false, error: String(error) }
  }
}

// Get payment allocations for analytics
export async function getPaymentAllocationsAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payment_allocations')
      .select('*, jobs(job_number, service_type, customer:customers(name))')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[action] Get payment allocations error:', error)
    return { success: false, error: String(error) }
  }
}

// Get aggregated bucket totals for dashboard
export async function getPaymentBucketTotalsAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payment_allocations')
      .select('total_amount, labour_amount, materials_amount, overhead_amount, tax_reserve_amount, profit_amount')
    
    if (error) throw error
    
    // Sum up all buckets
    const totals = (data || []).reduce((acc, row) => ({
      total: acc.total + Number(row.total_amount),
      labour: acc.labour + Number(row.labour_amount),
      materials: acc.materials + Number(row.materials_amount),
      overhead: acc.overhead + Number(row.overhead_amount),
      taxReserve: acc.taxReserve + Number(row.tax_reserve_amount),
      profit: acc.profit + Number(row.profit_amount)
    }), { total: 0, labour: 0, materials: 0, overhead: 0, taxReserve: 0, profit: 0 })
    
    return { success: true, data: totals }
  } catch (error) {
    console.error('[action] Get bucket totals error:', error)
    return { success: false, error: String(error) }
  }
}
