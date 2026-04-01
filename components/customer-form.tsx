'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export default function CustomerForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('customers').insert([formData])
      if (error) throw error
      onSuccess()
      setFormData({ name: '', email: '', phone: '', address: '', notes: '' })
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Customer name"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      <div>
        <Label className="text-slate-300">Phone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      <div>
        <Label className="text-slate-300">Address</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Street address"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      <div>
        <Label className="text-slate-300">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes about this customer"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-24"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {loading ? 'Creating...' : 'Create Customer'}
      </Button>
    </form>
  )
}
