import { put } from '@vercel/blob'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const photoType = formData.get('photoType') as string
    const caption = formData.get('caption') as string

    if (!file || !photoType) {
      return NextResponse.json({ error: 'Missing file or photoType' }, { status: 400 })
    }

    if (!['before', 'after'].includes(photoType)) {
      return NextResponse.json({ error: 'Invalid photoType' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `jobs/${jobId}/${photoType}-${timestamp}-${file.name}`
    
    const blob = await put(filename, file, {
      access: 'private',
    })

    // Save photo record to database
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('job_photos')
      .insert({
        job_id: jobId,
        photo_url: blob.pathname,
        photo_type: photoType,
        caption: caption || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
