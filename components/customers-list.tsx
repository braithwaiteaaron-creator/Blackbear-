'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function CustomersList({ customers, onRefresh }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const supabase = createClient()

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await supabase.from('customers').delete().eq('id', id)
      onRefresh()
    }
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-700/50 rounded-lg border border-slate-600">
        <p className="text-slate-400 mb-4">No customers yet. Create your first customer!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <Card key={customer.id} className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">{customer.name}</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  {customer.email && <p>Email: <span className="text-slate-200">{customer.email}</span></p>}
                  {customer.phone && <p>Phone: <span className="text-slate-200">{customer.phone}</span></p>}
                  {customer.address && <p>Address: <span className="text-slate-200">{customer.address}</span></p>}
                  {customer.total_jobs && <p>Total Jobs: <span className="text-slate-200">{customer.total_jobs}</span></p>}
                  {customer.total_spent && <p>Total Spent: <span className="text-slate-200">${parseFloat(customer.total_spent || 0).toFixed(2)}</span></p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={showDetails && selectedCustomer?.id === customer.id} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Customer Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-slate-300">
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Name</label>
                        <p className="text-white">{customer.name}</p>
                      </div>
                      {customer.email && <div><label className="text-sm font-semibold text-slate-400">Email</label><p className="text-white">{customer.email}</p></div>}
                      {customer.phone && <div><label className="text-sm font-semibold text-slate-400">Phone</label><p className="text-white">{customer.phone}</p></div>}
                      {customer.address && <div><label className="text-sm font-semibold text-slate-400">Address</label><p className="text-white">{customer.address}</p></div>}
                      {customer.notes && <div><label className="text-sm font-semibold text-slate-400">Notes</label><p className="text-white">{customer.notes}</p></div>}
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Total Jobs</label>
                        <p className="text-white">{customer.total_jobs || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Total Spent</label>
                        <p className="text-white">${parseFloat(customer.total_spent || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
