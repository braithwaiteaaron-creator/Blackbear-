'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface JobPhotoUploadProps {
  jobId: string
  onPhotosChange?: (photos: File[]) => void
}

interface UploadedPhoto {
  id: string
  file: File
  preview: string
  uploading: boolean
  error?: string
}

export function JobPhotoUpload({ jobId, onPhotosChange }: JobPhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB')
        continue
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const newPhoto: UploadedPhoto = {
          id: Math.random().toString(36).slice(2),
          file,
          preview: event.target?.result as string,
          uploading: false,
        }

        setPhotos((prev) => {
          const updated = [...prev, newPhoto]
          onPhotosChange?.(updated.map((p) => p.file))
          return updated
        })

        toast.success(`${file.name} added`)
      }
      reader.readAsDataURL(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      onPhotosChange?.(updated.map((p) => p.file))
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Job Photos</h3>
        <span className="text-xs text-muted-foreground">{photos.length} photo(s)</span>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-secondary/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Drop photos or click to upload</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB each</p>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                <img
                  src={photo.preview}
                  alt="Job photo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Status */}
              {photo.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}

              {photo.error && (
                <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
                  <span className="text-xs text-white">Error</span>
                </div>
              )}

              {!photo.uploading && !photo.error && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePhoto(photo.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File Name Tooltip */}
              <p className="text-xs text-muted-foreground mt-1 truncate">{photo.file.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Info */}
      {photos.length > 0 && (
        <div className="bg-secondary/50 p-3 rounded-lg text-xs text-muted-foreground">
          <p>Photos are stored locally until you save this job.</p>
          <p>After saving, they'll be uploaded to the cloud and linked to this job.</p>
        </div>
      )}
    </div>
  )
}
