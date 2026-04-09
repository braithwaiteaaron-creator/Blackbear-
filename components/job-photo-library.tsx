'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'

interface JobPhoto {
  id: string
  photo_url: string
  photo_type: 'before' | 'after' | 'general'
  description?: string
  created_at: string
}

interface JobPhotoLibraryProps {
  jobId: string
  photos: JobPhoto[]
  onPhotoUpload: (file: File, type: 'before' | 'after' | 'general', description?: string) => void
  onPhotoDelete: (photoId: string) => void
}

export function JobPhotoLibrary({
  jobId,
  photos,
  onPhotoUpload,
  onPhotoDelete,
}: JobPhotoLibraryProps) {
  const [selectedType, setSelectedType] = useState<'before' | 'after' | 'general'>('general')
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      onPhotoUpload(file, selectedType)
      setUploading(false)
    }
  }

  const beforePhotos = photos.filter(p => p.photo_type === 'before')
  const afterPhotos = photos.filter(p => p.photo_type === 'after')
  const generalPhotos = photos.filter(p => p.photo_type === 'general')

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-secondary border border-border">
        <h3 className="font-semibold text-sm mb-3">Add Photos</h3>
        
        <div className="flex gap-2 mb-3">
          {(['before', 'after', 'general'] as const).map(type => (
            <Button
              key={type}
              onClick={() => setSelectedType(type)}
              size="sm"
              variant={selectedType === type ? 'default' : 'outline'}
              className="capitalize"
            >
              {type === 'before' && 'Before'}
              {type === 'after' && 'After'}
              {type === 'general' && 'General'}
            </Button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <Button
            size="sm"
            disabled={uploading}
            className="gap-2"
            variant="outline"
            asChild
          >
            <span>
              <Camera className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Capture Photo'}
            </span>
          </Button>
        </label>
      </div>

      {/* Before Photos */}
      {beforePhotos.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="font-semibold text-sm mb-3">Before</h4>
          <div className="grid grid-cols-2 gap-3">
            {beforePhotos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="relative w-full aspect-square rounded overflow-hidden bg-muted">
                  <Image
                    src={photo.photo_url}
                    alt="Before photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  onClick={() => onPhotoDelete(photo.id)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {photo.description && (
                  <p className="text-xs text-muted-foreground mt-1">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* After Photos */}
      {afterPhotos.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="font-semibold text-sm mb-3">After</h4>
          <div className="grid grid-cols-2 gap-3">
            {afterPhotos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="relative w-full aspect-square rounded overflow-hidden bg-muted">
                  <Image
                    src={photo.photo_url}
                    alt="After photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  onClick={() => onPhotoDelete(photo.id)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {photo.description && (
                  <p className="text-xs text-muted-foreground mt-1">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Photos */}
      {generalPhotos.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="font-semibold text-sm mb-3">Other Photos</h4>
          <div className="grid grid-cols-2 gap-3">
            {generalPhotos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="relative w-full aspect-square rounded overflow-hidden bg-muted">
                  <Image
                    src={photo.photo_url}
                    alt="Job photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  onClick={() => onPhotoDelete(photo.id)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {photo.description && (
                  <p className="text-xs text-muted-foreground mt-1">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
