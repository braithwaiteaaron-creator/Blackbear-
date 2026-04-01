'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export default function JobForm({ customers, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    address: '',
    customer_name: '',
    job_type: '',
    status: 'quote',
    value: '',
    notes: '',
    permit_required: false,
    clearance_required: false,
    climbing_required: false,
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('jobs').insert([formData])
      if (error) throw error
      onSuccess()
      setFormData({
        customer_id: '',
        address: '',
        customer_name: '',
        job_type: '',
        status: 'quote',
        value: '',
        notes: '',
        permit_required: false,
        clearance_required: false,
        climbing_required: false,
      })
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Customer</Label>
        <Select value={formData.customer_id} onValueChange={(value) => {
          const customer = customers.find(c => c.id === value)
          setFormData({
            ...formData,
            customer_id: value,
            customer_name: customer?.name || ''
          })
        }}>
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
        <Label className="text-slate-300">Address</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Job address"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Job Type</Label>
        <Input
          value={formData.job_type}
          onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
          placeholder="e.g., Tree Removal, Trimming, Stump Grinding"
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
            <SelectItem value="quote">Quote</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-300">Value ($)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="0.00"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={formData.permit_required}
            onChange={(e) => setFormData({ ...formData, permit_required: e.target.checked })}
            className="w-4 h-4"
          />
          Permit Required
        </label>
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={formData.clearance_required}
            onChange={(e) => setFormData({ ...formData, clearance_required: e.target.checked })}
            className="w-4 h-4"
          />
          Clearance Required
        </label>
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={formData.climbing_required}
            onChange={(e) => setFormData({ ...formData, climbing_required: e.target.checked })}
            className="w-4 h-4"
          />
          Climbing Required
        </label>
      </div>

      <div>
        <Label className="text-slate-300">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes about this job"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-24"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {loading ? 'Creating...' : 'Create Job'}
      </Button>
    </form>
  )
}
