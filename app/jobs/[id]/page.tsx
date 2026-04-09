'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JobTimeTracker } from '@/components/job-time-tracker'
import { JobNotesEditor } from '@/components/job-notes-editor'
import { JobPhotoLibrary } from '@/components/job-photo-library'
import { JobMaterialsLog } from '@/components/job-materials-log'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  updateJobTimeAction,
  updateJobNotesAction,
  addJobMaterialAction,
  removeJobMaterialAction,
  addJobPhotoAction,
  removeJobPhotoAction,
} from '@/app/actions'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

interface Job {
  id: string
  job_number: string
  customer_id: string
  description: string
  service_type: string
  status: string
  estimated_amount: number
  actual_amount?: number
  scheduled_date?: string
  completed_date?: string
  time_started_at?: string
  time_ended_at?: string
  duration_minutes?: number
  job_notes?: string
  paid: boolean
  customer?: { name: string; phone?: string; address?: string }
}

interface Material {
  id: string
  description: string
  quantity: number
  unit: string
  cost: number
}

interface Photo {
  id: string
  photo_url: string
  photo_type: 'before' | 'after' | 'general'
  description?: string
  created_at: string
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const resolveParams = async () => {
    const { id } = await params
    loadJob(id)
  }

  const loadJob = async (jobId: string) => {
    const supabase = await createClient()
    
    // Load job
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*, customer:customers(name, phone, address)')
      .eq('id', jobId)
      .single()

    // Load materials
    const { data: materialsData } = await supabase
      .from('job_materials')
      .select('*')
      .eq('job_id', jobId)

    // Load photos
    const { data: photosData } = await supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId)

    setJob(jobData)
    setMaterials(materialsData || [])
    setPhotos(photosData || [])
    setLoading(false)
  }

  useEffect(() => {
    resolveParams()
  }, [])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!job) {
    return <div className="p-4">Job not found</div>
  }

  const formatAmount = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00'
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{job.job_number}</h1>
            <p className="text-muted-foreground">{job.service_type}</p>
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-semibold text-sm">{job.customer?.name}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-semibold text-sm capitalize">{job.status}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-semibold text-sm">{formatAmount(job.actual_amount || job.estimated_amount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold text-sm">{formatDuration(job.duration_minutes)}</p>
          </div>
        </div>

        {/* Time Tracker */}
        <JobTimeTracker
          jobId={job.id}
          initialStartTime={job.time_started_at}
          initialEndTime={job.time_ended_at}
          onTimeUpdate={(startTime, endTime) => {
            updateJobTimeAction(job.id, startTime, endTime)
          }}
        />

        {/* Job Notes */}
        <JobNotesEditor
          jobId={job.id}
          initialNotes={job.job_notes}
          onSave={(notes) => {
            updateJobNotesAction(job.id, notes)
          }}
        />

        {/* Photo Library */}
        <JobPhotoLibrary
          jobId={job.id}
          photos={photos}
          onPhotoUpload={async (file, type, description) => {
            // TODO: Upload to Vercel Blob or similar
            const photoUrl = URL.createObjectURL(file)
            await addJobPhotoAction(job.id, photoUrl, type, description)
          }}
          onPhotoDelete={async (photoId) => {
            await removeJobPhotoAction(photoId)
          }}
        />

        {/* Materials Log */}
        <JobMaterialsLog
          jobId={job.id}
          materials={materials}
          onAddMaterial={async (material) => {
            await addJobMaterialAction(
              job.id,
              material.description,
              material.quantity,
              material.unit,
              material.cost
            )
          }}
          onRemoveMaterial={async (materialId) => {
            await removeJobMaterialAction(materialId)
          }}
        />
      </div>
    </div>
  )
}
