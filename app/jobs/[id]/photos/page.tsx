import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Trash2, Image as ImageIcon } from 'lucide-react'

export default async function JobPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: job } = await supabase
    .from('jobs')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const beforePhotos = photos?.filter(p => p.photo_type === 'before') || []
  const afterPhotos = photos?.filter(p => p.photo_type === 'after') || []

  async function addPhoto(formData: FormData) {
    'use server'
    const supabase = await createClient()
    
    await supabase.from('job_photos').insert({
      job_id: id,
      photo_url: formData.get('photo_url') as string,
      photo_type: formData.get('photo_type') as string,
      caption: formData.get('caption') as string || null,
    })

    redirect(`/jobs/${id}/photos`)
  }

  async function deletePhoto(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const photoId = formData.get('photo_id') as string
    
    await supabase.from('job_photos').delete().eq('id', photoId)
    redirect(`/jobs/${id}/photos`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href={`/jobs/${id}`} className="p-2 hover:bg-primary-foreground/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Photos</h1>
            <p className="text-sm text-primary-foreground/70">{job.job_number}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Add Photo Form */}
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Camera className="size-4" /> Add Photo
          </h2>
          <form action={addPhoto} className="space-y-3">
            <input
              type="url"
              name="photo_url"
              required
              placeholder="Photo URL"
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
            />
            <select
              name="photo_type"
              required
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
            >
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="progress">In Progress</option>
              <option value="damage">Damage</option>
            </select>
            <input
              type="text"
              name="caption"
              placeholder="Caption (optional)"
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Add Photo
            </button>
          </form>
        </div>

        {/* Before Photos */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Before ({beforePhotos.length})</h2>
          {beforePhotos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground bg-card rounded-xl border border-border/50">
              <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No before photos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.photo_url} 
                    alt={photo.caption || 'Before photo'}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <form action={deletePhoto} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button type="submit" className="p-1.5 bg-red-500 text-white rounded-lg">
                      <Trash2 className="size-3" />
                    </button>
                  </form>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* After Photos */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">After ({afterPhotos.length})</h2>
          {afterPhotos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground bg-card rounded-xl border border-border/50">
              <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No after photos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.photo_url} 
                    alt={photo.caption || 'After photo'}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <form action={deletePhoto} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button type="submit" className="p-1.5 bg-red-500 text-white rounded-lg">
                      <Trash2 className="size-3" />
                    </button>
                  </form>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
