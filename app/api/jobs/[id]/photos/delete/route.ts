import { del } from '@vercel/blob'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const { photoId, photoUrl } = await request.json()

    if (!photoId || !photoUrl) {
      return NextResponse.json({ error: 'Missing photoId or photoUrl' }, { status: 400 })
    }

    // Delete from Blob storage
    await del(photoUrl)

    // Delete from database
    const supabase = await createClient()
    const { error } = await supabase
      .from('job_photos')
      .delete()
      .eq('id', photoId)
      .eq('job_id', jobId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
