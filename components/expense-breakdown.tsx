'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

interface ExpenseBreakdownProps {
  jobId: string
  jobAmount: number
  onSave?: () => void
}

export function ExpenseBreakdown({ jobId, jobAmount, onSave }: ExpenseBreakdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [laborType, setLaborType] = useState<'hourly' | 'flat'>('flat')
  const [hourlyRate, setHourlyRate] = useState(50)
  const [hoursWorked, setHoursWorked] = useState(2)
  const [flatLaborAmount, setFlatLaborAmount] = useState(100)

  // Expense percentages (add up to ≤100%)
  const [dumpFeesPct, setDumpFeesPct] = useState(10)
  const [gasPct, setGasPct] = useState(5)
  const [equipmentPct, setEquipmentPct] = useState(8)
  const [truckFundPct, setTruckFundPct] = useState(7)
  const [insurancePct, setInsurancePct] = useState(5)

  // Calculate labor amount based on type
  const laborAmount = laborType === 'hourly' ? hourlyRate * hoursWorked : flatLaborAmount
  const laborPct = (laborAmount / jobAmount) * 100

  // Calculate expense amounts
  const dumpFeesAmount = (jobAmount * dumpFeesPct) / 100
  const gasAmount = (jobAmount * gasPct) / 100
  const equipmentAmount = (jobAmount * equipmentPct) / 100
  const truckFundAmount = (jobAmount * truckFundPct) / 100
  const insuranceAmount = (jobAmount * insurancePct) / 100

  // Total expenses
  const totalExpensePct = dumpFeesPct + gasPct + equipmentPct + truckFundPct + insurancePct + laborPct
  const profit = jobAmount - laborAmount - dumpFeesAmount - gasAmount - equipmentAmount - truckFundAmount - insuranceAmount
  const profitPct = (profit / jobAmount) * 100

  const handleSave = async () => {
    if (laborAmount <= 0) {
      toast.error('Labor amount must be greater than 0')
      return
    }

    if (totalExpensePct > 100) {
      toast.error(`Total expenses exceed 100% (${totalExpensePct.toFixed(1)}%)`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labor_type: laborType,
          hourly_rate: hourlyRate,
          hours_worked: hoursWorked,
          flat_labor_amount: flatLaborAmount,
          dump_fees: dumpFeesAmount,
          gas: gasAmount,
          equipment: equipmentAmount,
          truck_fund: truckFundAmount,
          insurance: insuranceAmount,
        }),
      })

      if (!response.ok) throw new Error('Failed to save expenses')

      toast.success('Expenses saved!')
      onSave?.()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error saving expenses'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Job Expenses & Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labor Section */}
        <div className="space-y-3 border-b border-border pb-4">
          <h3 className="font-semibold text-blue-400">Labor</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="flat"
                checked={laborType === 'flat'}
                onChange={(e) => setLaborType(e.target.value as 'flat')}
                className="w-4 h-4"
              />
              <span className="text-sm">Flat Amount</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="hourly"
                checked={laborType === 'hourly'}
                onChange={(e) => setLaborType(e.target.value as 'hourly')}
                className="w-4 h-4"
              />
              <span className="text-sm">Hourly Rate</span>
            </label>
          </div>

          {laborType === 'flat' ? (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Amount ($)</label>
                <Input
                  type="number"
                  value={flatLaborAmount}
                  onChange={(e) => setFlatLaborAmount(Number(e.target.value))}
                  className="h-10"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Hourly Rate ($)</label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Hours Worked</label>
                <Input
                  type="number"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(Number(e.target.value))}
                  className="h-10"
                />
              </div>
            </div>
          )}
          <div className="text-sm">
            <span className="text-muted-foreground">Labor Amount: </span>
            <span className="font-bold text-blue-400">${laborAmount.toFixed(2)} ({laborPct.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="space-y-3">
          <h3 className="font-semibold text-amber-400">Operating Expenses (% of Job)</h3>

          {[
            { label: 'Dump Fees', pct: dumpFeesPct, setPct: setDumpFeesPct, color: 'text-amber-400' },
            { label: 'Gas', pct: gasPct, setPct: setGasPct, color: 'text-yellow-400' },
            { label: 'Equipment (chains, oil, bars)', pct: equipmentPct, setPct: setEquipmentPct, color: 'text-orange-400' },
            { label: 'Truck Fund', pct: truckFundPct, setPct: setTruckFundPct, color: 'text-red-400' },
            { label: 'Insurance', pct: insurancePct, setPct: setInsurancePct, color: 'text-pink-400' },
          ].map(({ label, pct, setPct, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm">{label}</label>
                <span className={`text-sm font-semibold ${color}`}>
                  {pct}% (${((jobAmount * pct) / 100).toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job Amount</span>
            <span className="font-semibold">${jobAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Expenses & Labor</span>
            <span className="font-semibold">${(laborAmount + dumpFeesAmount + gasAmount + equipmentAmount + truckFundAmount + insuranceAmount).toFixed(2)} ({totalExpensePct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-semibold text-emerald-400">Profit</span>
            <span className="font-bold text-emerald-400">${profit.toFixed(2)} ({profitPct.toFixed(1)}%)</span>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Expenses'}
        </Button>
      </CardContent>
    </Card>
  )
}
