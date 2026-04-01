'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export default function QuoteForm({ customers, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    description: '',
    service_type: '',
    amount: '',
    status: 'pending',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('quotes').insert([formData])
      if (error) throw error
      onSuccess()
      setFormData({
        customer_id: '',
        description: '',
        service_type: '',
        amount: '',
        status: 'pending',
        notes: '',
      })
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('Failed to create quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Customer</Label>
        <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-300">Service Type</Label>
        <Input
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          placeholder="e.g., Tree Removal, Trimming"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the work to be done"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-24"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Amount ($)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-300">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes about this quote"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-24"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {loading ? 'Creating...' : 'Create Quote'}
      </Button>
    </form>
  )
}
