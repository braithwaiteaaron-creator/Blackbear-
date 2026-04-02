"use client"

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TreePine, QrCode, Download, Copy, Check, Users, Percent, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReferralsPage() {
  const [partnerName, setPartnerName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [discount, setDiscount] = useState('10')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  const generateCode = () => {
    // Generate a unique referral code based on company name
    const prefix = companyName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 8) || 'REF'
    const suffix = discount
    const code = `${prefix}${suffix}`
    setGeneratedCode(code)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bear-hub-pro.vercel.app'
  const referralUrl = `${baseUrl}/refer/${generatedCode}`

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 400, 400)
        ctx.drawImage(img, 0, 0, 400, 400)
      }
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${generatedCode}-qr-code.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Bear Hub Pro</h1>
                <p className="text-xs text-emerald-400">Referral Manager</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
              <QrCode className="w-3 h-3 mr-1" />
              Referral System
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">Create Referral QR Codes</h1>
            <p className="text-slate-400">Generate custom QR codes for your referral partners</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Partner Details
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your referral partner&apos;s information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerName" className="text-slate-300">Partner Name</Label>
                  <Input
                    id="partnerName"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g., John Smith"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-300">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Smith Realty"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-slate-300">Discount Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount"
                      type="number"
                      min="5"
                      max="25"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white w-24"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@email.com"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button 
                  onClick={generateCode}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                  disabled={!companyName}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {/* QR Code Preview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-emerald-500" />
                  QR Code Preview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your partner&apos;s custom referral QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <div className="space-y-4">
                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                      <QRCodeSVG
                        id="qr-code"
                        value={referralUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: '',
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                    </div>

                    {/* Code Display */}
                    <div className="bg-slate-700 rounded-lg p-4 text-center">
                      <p className="text-slate-400 text-sm mb-2">Referral Code</p>
                      <p className="text-2xl font-mono font-bold text-emerald-400">{generatedCode}</p>
                    </div>

                    {/* URL */}
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Referral URL</p>
                      <p className="text-sm text-slate-300 break-all">{referralUrl}</p>
                    </div>

                    {/* Partner Info Summary */}
                    {partnerName && (
                      <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
                        <p className="text-emerald-400 text-sm font-medium mb-1">Partner: {partnerName}</p>
                        {companyName && <p className="text-slate-400 text-sm">{companyName}</p>}
                        <p className="text-emerald-300 text-sm mt-1">{discount}% discount for clients</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => copyToClipboard(referralUrl)}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy URL'}
                      </Button>
                      <Button
                        onClick={downloadQR}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 bg-slate-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-slate-500" />
                    </div>
                    <p className="text-slate-400">Enter partner details and click generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="bg-slate-800/50 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Create Code</h4>
                  <p className="text-slate-400 text-sm">Enter partner info and generate their unique QR code</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-400 font-bold">2</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Share QR</h4>
                  <p className="text-slate-400 text-sm">Give your partner the QR to share with their clients</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-400 font-bold">3</span>
                  </div>
                  <h4 className="text-white font-medium mb-1">Track Referrals</h4>
                  <p className="text-slate-400 text-sm">Clients scan, see the discount, and mention the code when booking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
