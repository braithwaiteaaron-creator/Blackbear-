'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Edit2, Trash2, Eye } from 'lucide-react'

export default function JobsList({ jobs, customers, onRefresh }) {
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const supabase = createClient()

  const getStatusColor = (status) => {
    switch (status) {
      case 'quote': return 'bg-blue-500'
      case 'scheduled': return 'bg-yellow-500'
      case 'in_progress': return 'bg-orange-500'
      case 'completed': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getJobTypeColor = (type) => {
    if (!type) return 'bg-gray-700 text-gray-300'
    return 'bg-slate-700 text-slate-100'
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await supabase.from('jobs').delete().eq('id', id)
      onRefresh()
    }
  }

  const customerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || 'Unknown'
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-700/50 rounded-lg border border-slate-600">
        <p className="text-slate-400 mb-4">No jobs yet. Create your first job to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id} className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">
                    {job.customer_name || customerName(job.customer_id)}
                  </h3>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-2">{job.address}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Type: <span className="text-slate-200">{job.job_type}</span></span>
                  <span>Value: <span className="text-slate-200">${parseFloat(job.value || 0).toFixed(2)}</span></span>
                </div>
                {job.notes && (
                  <p className="text-sm text-slate-400 mt-2">Notes: {job.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog open={showDetails && selectedJob?.id === job.id} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      onClick={() => setSelectedJob(job)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Job Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-slate-300">
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Customer</label>
                        <p className="text-white">{job.customer_name || customerName(job.customer_id)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Address</label>
                        <p className="text-white">{job.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Type</label>
                        <p className="text-white">{job.job_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Status</label>
                        <p className="text-white">{job.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Value</label>
                        <p className="text-white">${parseFloat(job.value || 0).toFixed(2)}</p>
                      </div>
                      {job.permit_required && <p className="text-yellow-400 text-sm">⚠️ Permit Required</p>}
                      {job.clearance_required && <p className="text-yellow-400 text-sm">⚠️ Clearance Required</p>}
                      {job.climbing_required && <p className="text-yellow-400 text-sm">⚠️ Climbing Required</p>}
                      {job.trees && <div><label className="text-sm font-semibold text-slate-400">Trees</label><p className="text-white">{job.trees.join(', ')}</p></div>}
                      {job.notes && <div><label className="text-sm font-semibold text-slate-400">Notes</label><p className="text-white">{job.notes}</p></div>}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900"
                  onClick={() => handleDelete(job.id)}
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
