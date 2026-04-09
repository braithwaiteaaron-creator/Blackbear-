'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

interface Material {
  id: string
  description: string
  quantity: number
  unit: string
  cost: number
}

interface JobMaterialsLogProps {
  jobId: string
  materials: Material[]
  onAddMaterial: (material: Omit<Material, 'id'>) => void
  onRemoveMaterial: (materialId: string) => void
}

export function JobMaterialsLog({
  jobId,
  materials,
  onAddMaterial,
  onRemoveMaterial,
}: JobMaterialsLogProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('ea')
  const [cost, setCost] = useState('')

  const handleAdd = () => {
    if (!description || !cost) return

    onAddMaterial({
      description,
      quantity: parseFloat(quantity) || 1,
      unit,
      cost: parseFloat(cost) || 0,
    })

    setDescription('')
    setQuantity('1')
    setUnit('ea')
    setCost('')
    setIsAdding(false)
  }

  const totalCost = materials.reduce((sum, m) => sum + m.cost, 0)

  return (
    <div className="p-4 rounded-lg bg-secondary border border-border space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Materials Used</h3>
        {totalCost > 0 && (
          <div className="text-sm font-semibold text-primary">
            Total: ${totalCost.toFixed(2)}
          </div>
        )}
      </div>

      {isAdding ? (
        <div className="space-y-3 p-3 bg-background rounded border border-border">
          <div className="grid gap-3">
            <Input
              placeholder="Material description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-secondary border-border"
              />
              <Input
                placeholder="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-secondary border-border"
              />
              <Input
                type="number"
                placeholder="Cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setDescription('')
                setQuantity('1')
                setCost('')
              }}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          variant="outline"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </Button>
      )}

      {materials.length > 0 && (
        <div className="space-y-2">
          {materials.map(material => (
            <div
              key={material.id}
              className="flex justify-between items-center p-2 bg-background rounded border border-border"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{material.description}</p>
                <p className="text-xs text-muted-foreground">
                  {material.quantity} {material.unit} @ ${material.cost.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={() => onRemoveMaterial(material.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
