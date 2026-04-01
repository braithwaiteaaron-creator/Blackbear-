'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function QuotesList({ quotes, customers, onRefresh }) {
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const supabase = createClient()

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-500'
      case 'sent': return 'bg-purple-500'
      case 'approved': return 'bg-green-500'
      case 'declined': return 'bg-red-500'
      case 'expired': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      await supabase.from('quotes').delete().eq('id', id)
      onRefresh()
    }
  }

  const customerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || 'Unknown'
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-700/50 rounded-lg border border-slate-600">
        <p className="text-slate-400 mb-4">No quotes yet. Create your first quote!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => (
        <Card key={quote.id} className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">
                    {quote.quote_number || 'New Quote'}
                  </h3>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-2">{customerName(quote.customer_id)}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Service: <span className="text-slate-200">{quote.service_type}</span></span>
                  <span>Amount: <span className="text-slate-200">${parseFloat(quote.amount || 0).toFixed(2)}</span></span>
                </div>
                {quote.description && (
                  <p className="text-sm text-slate-400 mt-2">Description: {quote.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog open={showDetails && selectedQuote?.id === quote.id} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Quote Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-slate-300">
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Quote Number</label>
                        <p className="text-white">{quote.quote_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Customer</label>
                        <p className="text-white">{customerName(quote.customer_id)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Service Type</label>
                        <p className="text-white">{quote.service_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Description</label>
                        <p className="text-white">{quote.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Amount</label>
                        <p className="text-white">${parseFloat(quote.amount || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Status</label>
                        <p className="text-white">{quote.status}</p>
                      </div>
                      {quote.valid_until && <div><label className="text-sm font-semibold text-slate-400">Valid Until</label><p className="text-white">{new Date(quote.valid_until).toLocaleDateString()}</p></div>}
                      {quote.notes && <div><label className="text-sm font-semibold text-slate-400">Notes</label><p className="text-white">{quote.notes}</p></div>}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900"
                  onClick={() => handleDelete(quote.id)}
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
