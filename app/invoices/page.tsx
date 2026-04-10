"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ArrowLeft, FileText, Plus, Send, Download, DollarSign, 
  Clock, CheckCircle, AlertCircle, Printer, Mail, CreditCard
} from 'lucide-react'

// Demo invoices
const demoInvoices = [
  { id: 'INV-2026-001', customer: 'Johnson Property Management', email: 'johnson@propmanage.com', amount: 2500, status: 'paid', date: '2026-04-01', dueDate: '2026-04-15', paidDate: '2026-04-10', items: [{ desc: 'Oak tree removal - 50ft', qty: 1, price: 1800 }, { desc: 'Stump grinding', qty: 1, price: 400 }, { desc: 'Debris hauling', qty: 1, price: 300 }] },
  { id: 'INV-2026-002', customer: 'Smith Realty Group', email: 'smith@realty.com', amount: 1200, status: 'pending', date: '2026-04-03', dueDate: '2026-04-17', paidDate: null, items: [{ desc: 'Tree trimming - 3 trees', qty: 3, price: 350 }, { desc: 'Cleanup', qty: 1, price: 150 }] },
  { id: 'INV-2026-003', customer: 'Oak Hills HOA', email: 'hoa@oakhills.org', amount: 4800, status: 'overdue', date: '2026-03-15', dueDate: '2026-03-29', paidDate: null, items: [{ desc: 'Emergency storm damage', qty: 1, price: 3500 }, { desc: 'Multiple tree removal', qty: 2, price: 650 }] },
  { id: 'INV-2026-004', customer: 'Green Valley Landscaping', email: 'info@greenvalley.com', amount: 850, status: 'draft', date: '2026-04-07', dueDate: '2026-04-21', paidDate: null, items: [{ desc: 'Consultation', qty: 1, price: 150 }, { desc: 'Tree health assessment', qty: 4, price: 175 }] },
  { id: 'INV-2026-005', customer: 'Riverside Apartments', email: 'manager@riverside.com', amount: 3200, status: 'sent', date: '2026-04-05', dueDate: '2026-04-19', paidDate: null, items: [{ desc: 'Large pine removal', qty: 1, price: 2800 }, { desc: 'Hauling', qty: 1, price: 400 }] },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(demoInvoices)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<typeof demoInvoices[0] | null>(null)
  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    email: '',
    items: [{ desc: '', qty: 1, price: 0 }]
  })

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Paid</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>
      case 'sent':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Sent</Badge>
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Overdue</Badge>
      case 'draft':
        return <Badge className="bg-secondary text-muted-foreground">Draft</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const addLineItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { desc: '', qty: 1, price: 0 }]
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Invoices & Payments</h1>
                  <p className="text-sm text-muted-foreground">Create and track invoices</p>
                </div>
              </div>
            </div>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>Fill in the details to generate a professional invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Customer Name</Label>
                      <Input 
                        placeholder="Enter customer name"
                        className="bg-secondary/50 border-border"
                        value={newInvoice.customer}
                        onChange={e => setNewInvoice({...newInvoice, customer: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Customer Email</Label>
                      <Input 
                        type="email"
                        placeholder="customer@email.com"
                        className="bg-secondary/50 border-border"
                        value={newInvoice.email}
                        onChange={e => setNewInvoice({...newInvoice, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Line Items</Label>
                    <div className="space-y-2 mt-2">
                      {newInvoice.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2">
                          <Input 
                            placeholder="Description"
                            className="col-span-6 bg-secondary/50 border-border"
                            value={item.desc}
                            onChange={e => {
                              const items = [...newInvoice.items]
                              items[i].desc = e.target.value
                              setNewInvoice({...newInvoice, items})
                            }}
                          />
                          <Input 
                            type="number"
                            placeholder="Qty"
                            className="col-span-2 bg-secondary/50 border-border"
                            value={item.qty}
                            onChange={e => {
                              const items = [...newInvoice.items]
                              items[i].qty = parseInt(e.target.value) || 0
                              setNewInvoice({...newInvoice, items})
                            }}
                          />
                          <Input 
                            type="number"
                            placeholder="Price"
                            className="col-span-3 bg-secondary/50 border-border"
                            value={item.price}
                            onChange={e => {
                              const items = [...newInvoice.items]
                              items[i].price = parseFloat(e.target.value) || 0
                              setNewInvoice({...newInvoice, items})
                            }}
                          />
                          <div className="col-span-1 text-right text-sm text-muted-foreground pt-2">
                            ${(item.qty * item.price).toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                      <Plus className="size-3 mr-1" /> Add Line
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="text-lg font-semibold">
                      Total: ${newInvoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowCreate(false)}>Save as Draft</Button>
                      <Button>
                        <Send className="size-4 mr-2" />
                        Send Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-500">${totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-500">${totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-500">${totalOverdue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">${(totalPending + totalOverdue).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Click an invoice to view details and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map(invoice => (
                <div 
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 cursor-pointer transition-all border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedInvoice.id}</DialogTitle>
                    <DialogDescription>{selectedInvoice.customer}</DialogDescription>
                  </div>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Invoice Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedInvoice.email}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/50 text-sm font-medium">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 border-t border-border text-sm">
                      <div className="col-span-6">{item.desc}</div>
                      <div className="col-span-2 text-center">{item.qty}</div>
                      <div className="col-span-2 text-right">${item.price}</div>
                      <div className="col-span-2 text-right font-medium">${item.qty * item.price}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 gap-4 p-3 border-t border-border bg-secondary/30">
                    <div className="col-span-10 text-right font-semibold">Total</div>
                    <div className="col-span-2 text-right font-bold text-lg text-primary">
                      ${selectedInvoice.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Printer className="size-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="size-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedInvoice.status !== 'paid' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Mail className="size-4 mr-2" />
                          Send Reminder
                        </Button>
                        <Button size="sm">
                          <CreditCard className="size-4 mr-2" />
                          Record Payment
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
