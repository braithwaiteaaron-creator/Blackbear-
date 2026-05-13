'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JobPhoto {
  id: string
  photo_url: string
  photo_type: 'before' | 'after'
  caption?: string
  created_at: string
}

interface PhotoUploadProps {
  jobId: string
  photos: JobPhoto[]
  onPhotosChange?: () => void
}

export function PhotoUpload({ jobId, photos, onPhotosChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const beforePhotos = photos.filter((p) => p.photo_type === 'before')
  const afterPhotos = photos.filter((p) => p.photo_type === 'after')

  const handleUpload = async (type: 'before' | 'after', file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('photoType', type)

      const res = await fetch(`/api/jobs/${jobId}/photos/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      
      toast.success(`${type === 'before' ? 'Before' : 'After'} photo uploaded`)
      onPhotosChange?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string, photoUrl: string) => {
    setDeleting(photoId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/photos/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ photoId, photoUrl }),
      })

      if (!res.ok) throw new Error('Delete failed')
      
      toast.success('Photo deleted')
      onPhotosChange?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Before Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Before Photos</h3>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0]
                  if (file) handleUpload('before', file)
                }}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={(e) => {
                  e.currentTarget.parentElement?.querySelector('input')?.click()
                }}
              >
                <Upload className="size-4" />
                Upload
              </Button>
            </label>
          </div>

          {beforePhotos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <ImageIcon className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No before photos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {beforePhotos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={`/api/file?pathname=${encodeURIComponent(photo.photo_url)}`}
                    alt="Before"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => handleDelete(photo.id, photo.photo_url)}
                    disabled={deleting === photo.id}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* After Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">After Photos</h3>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0]
                  if (file) handleUpload('after', file)
                }}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={(e) => {
                  e.currentTarget.parentElement?.querySelector('input')?.click()
                }}
              >
                <Upload className="size-4" />
                Upload
              </Button>
            </label>
          </div>

          {afterPhotos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <ImageIcon className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No after photos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {afterPhotos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={`/api/file?pathname=${encodeURIComponent(photo.photo_url)}`}
                    alt="After"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => handleDelete(photo.id, photo.photo_url)}
                    disabled={deleting === photo.id}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
