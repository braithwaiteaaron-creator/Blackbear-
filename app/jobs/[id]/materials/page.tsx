import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Package, Trash2 } from 'lucide-react'

export default async function JobMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: job } = await supabase
    .from('jobs')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const { data: materials } = await supabase
    .from('job_materials')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const totalCost = materials?.reduce((sum, m) => sum + (m.quantity * m.unit_cost), 0) || 0

  async function addMaterial(formData: FormData) {
    'use server'
    const supabase = await createClient()
    
    await supabase.from('job_materials').insert({
      job_id: id,
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit_cost: Number(formData.get('unit_cost')),
      notes: formData.get('notes') as string || null,
    })

    redirect(`/jobs/${id}/materials`)
  }

  async function deleteMaterial(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const materialId = formData.get('material_id') as string
    
    await supabase.from('job_materials').delete().eq('id', materialId)
    redirect(`/jobs/${id}/materials`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href={`/jobs/${id}`} className="p-2 hover:bg-primary-foreground/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Materials</h1>
            <p className="text-sm text-primary-foreground/70">{job.job_number}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Total Cost */}
        <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
          <p className="text-sm text-muted-foreground">Total Material Cost</p>
          <p className="text-3xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
        </div>

        {/* Add Material Form */}
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plus className="size-4" /> Add Material
          </h2>
          <form action={addMaterial} className="space-y-3">
            <input
              type="text"
              name="name"
              required
              placeholder="Material name"
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="quantity"
                required
                min="1"
                placeholder="Qty"
                className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                name="unit_cost"
                required
                min="0"
                step="0.01"
                placeholder="Unit cost ($)"
                className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              name="notes"
              placeholder="Notes (optional)"
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Add Material
            </button>
          </form>
        </div>

        {/* Materials List */}
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Materials Used</h2>
          {!materials || materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="size-10 mx-auto mb-2 opacity-50" />
              <p>No materials logged yet</p>
            </div>
          ) : (
            materials.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{material.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {material.quantity} x ${material.unit_cost.toFixed(2)}
                    {material.notes && ` - ${material.notes}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-bold text-foreground">${(material.quantity * material.unit_cost).toFixed(2)}</p>
                  <form action={deleteMaterial}>
                    <input type="hidden" name="material_id" value={material.id} />
                    <button type="submit" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
