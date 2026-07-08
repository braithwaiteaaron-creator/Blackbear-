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
  const [hourlyRate, setHourlyRate] = useState(35)
  const [hoursWorked, setHoursWorked] = useState(2)
  const [flatLaborAmount, setFlatLaborAmount] = useState(400) // Fixed labor cost

  // Fixed expense amounts (per job)
  const [dumpFees, setDumpFees] = useState(200) // Fixed dump fee
  const [truckFund, setTruckFund] = useState(100) // Fixed truck fund
  const [insurance, setInsurance] = useState(50) // Fixed insurance per job
  const [gas, setGas] = useState(0) // Variable
  const [equipment, setEquipment] = useState(0) // Variable

  // Calculate labor amount based on type
  const laborAmount = laborType === 'hourly' ? hourlyRate * hoursWorked : flatLaborAmount
  const laborPct = (laborAmount / jobAmount) * 100

  // Calculate percentages for display
  const dumpFeesPct = (dumpFees / jobAmount) * 100
  const gasPct = (gas / jobAmount) * 100
  const equipmentPct = (equipment / jobAmount) * 100
  const truckFundPct = (truckFund / jobAmount) * 100
  const insurancePct = (insurance / jobAmount) * 100

  // Total expenses
  const totalExpenseAmount = laborAmount + dumpFees + gas + equipment + truckFund + insurance
  const totalExpensePct = (totalExpenseAmount / jobAmount) * 100
  const profit = jobAmount - totalExpenseAmount
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
          dump_fees: dumpFees,
          gas,
          equipment,
          truck_fund: truckFund,
          insurance,
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
        <div className="space-y-4">
          <h3 className="font-semibold text-amber-400">Operating Expenses</h3>

          {/* Fixed amounts */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border">
            <h4 className="text-xs font-semibold text-muted-foreground">Fixed Per Job</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm">Dump Fees</label>
                <span className="text-sm font-semibold text-amber-400">
                  ${dumpFees.toFixed(2)} ({dumpFeesPct.toFixed(1)}%)
                </span>
              </div>
              <Input
                type="number"
                value={dumpFees}
                onChange={(e) => setDumpFees(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm">Truck Fund</label>
                <span className="text-sm font-semibold text-red-400">
                  ${truckFund.toFixed(2)} ({truckFundPct.toFixed(1)}%)
                </span>
              </div>
              <Input
                type="number"
                value={truckFund}
                onChange={(e) => setTruckFund(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm">Insurance</label>
                <span className="text-sm font-semibold text-pink-400">
                  ${insurance.toFixed(2)} ({insurancePct.toFixed(1)}%)
                </span>
              </div>
              <Input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(Number(e.target.value))}
                className="h-10"
              />
            </div>
          </div>

          {/* Variable expenses */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border">
            <h4 className="text-xs font-semibold text-muted-foreground">Variable Expenses (Optional)</h4>
            
            {[
              { label: 'Gas', value: gas, setValue: setGas, color: 'text-yellow-400' },
              { label: 'Equipment (chains, oil, bars)', value: equipment, setValue: setEquipment, color: 'text-orange-400' },
            ].map(({ label, value, setValue, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm">{label}</label>
                  <span className={`text-sm font-semibold ${color}`}>
                    ${value.toFixed(2)} ({((value / jobAmount) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="h-10"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job Amount</span>
            <span className="font-semibold">${jobAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Labor</span>
            <span>${laborAmount.toFixed(2)} ({laborPct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dump Fees</span>
            <span>${dumpFees.toFixed(2)} ({dumpFeesPct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Truck Fund</span>
            <span>${truckFund.toFixed(2)} ({truckFundPct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Insurance</span>
            <span>${insurance.toFixed(2)} ({insurancePct.toFixed(1)}%)</span>
          </div>
          {gas > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gas</span><span>${gas.toFixed(2)}</span></div>}
          {equipment > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipment</span><span>${equipment.toFixed(2)}</span></div>}
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground">Total Expenses & Labor</span>
            <span className="font-semibold">${totalExpenseAmount.toFixed(2)} ({totalExpensePct.toFixed(1)}%)</span>
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
