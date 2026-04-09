'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, X } from 'lucide-react'

interface JobNotesEditorProps {
  jobId: string
  initialNotes?: string
  onSave: (notes: string) => void
}

export function JobNotesEditor({ jobId, initialNotes = '', onSave }: JobNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onSave(notes)
    setIsEditing(false)
  }

  if (!isEditing && notes) {
    return (
      <div className="p-4 rounded-lg bg-secondary border border-border">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm">Job Notes</h3>
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="ghost"
          >
            Edit
          </Button>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-secondary border border-border space-y-3">
      <h3 className="font-semibold text-sm">Job Notes</h3>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this job - tree condition, special handling, customer instructions, etc."
        className="min-h-24 bg-background border-border"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          size="sm"
          className="gap-2"
          variant="default"
        >
          <Save className="w-4 h-4" />
          Save Notes
        </Button>
        {initialNotes && (
          <Button
            onClick={() => {
              setNotes(initialNotes)
              setIsEditing(false)
            }}
            size="sm"
            variant="ghost"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
