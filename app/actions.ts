'use server'

import { createClient } from '@/lib/supabase/server'

export async function createJobAction(formData: FormData) {
  try {
    const supabase = await createClient()
    
    const jobData = {
      customer_id: formData.get('customer_id') as string,
      description: formData.get('description') as string || 'Tree service',
      service_type: formData.get('service_type') as string,
      status: 'scheduled',
      scheduled_date: formData.get('scheduled_date') as string || null,
      estimated_amount: parseFloat(formData.get('estimated_amount') as string) || 0,
      notes: formData.get('notes') as string || null,
    }
    
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

export async function createQuoteAction(formData: FormData) {
  try {
    const supabase = await createClient()
    
    const quoteData = {
      customer_id: formData.get('customer_id') as string || null,
      description: formData.get('description') as string || 'Quote for tree services',
      service_type: formData.get('service_type') as string,
      amount: parseFloat(formData.get('amount') as string) || 0,
      status: 'pending',
      valid_until: formData.get('valid_until') as string || null,
      notes: formData.get('notes') as string || null,
    }
    
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

export async function createCustomerAction(formData: FormData) {
  try {
    const supabase = await createClient()
    
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      state: 'TX',
      notes: formData.get('notes') as string || null,
    }
    
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
