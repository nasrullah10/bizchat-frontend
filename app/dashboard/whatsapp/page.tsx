'use client'

import { useState, useEffect } from 'react'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Phone,
  Smartphone,
  QrCode,
  CheckCircle2,
  Wifi,
  WifiOff,
  MessageCircle,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

type ActivityData = {
  last_activity: string
  messages_today: number
  uptime: number
  total_messages: number
}

export default function WhatsAppPage() {
  const [businessId, setBusinessId] = useState('1')
  
  useEffect(() => {
    const id = localStorage.getItem('business_id') || '1'
    setBusinessId(String(id))
  }, [])

  const {
    status,
    qrCode,
    loading,
    error,
    connect,
    disconnect,
  } = useWhatsApp(businessId)

  // ✅ LINE 57 FIX: << ko < kiya
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)

  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false)
  const [step, setStep] = useState(1)

  const isConnected = status?.status === 'connected'
  const hasQR = !!qrCode

  // Auto open/close dialog
  useEffect(() => {
    if (hasQR && !isConnected) {
      setIsConnectDialogOpen(true)
      setStep(1)
    } else if (isConnected) {
      setIsConnectDialogOpen(false)
      setStep(1)
    }
  }, [hasQR, isConnected])

  // Fetch activity
  useEffect(() => {
    if (!isConnected || !businessId) return
    fetchActivity()
    const interval = setInterval(fetchActivity, 10000)
    return () => clearInterval(interval)
  }, [isConnected, businessId])

  const fetchActivity = async () => {
    setActivityLoading(true)
    try {
      const token = localStorage.getItem('token') || ''
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const res = await fetch(`${API_URL}/whatsapp/activity/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) setActivity(data.data)
      }
    } catch (err) {
      console.error('Activity fetch error:', err)
    } finally {
      setActivityLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnectDialogOpen(true)
    await connect()
  }

  const handleVerify = () => setStep(2)

  const handleDisconnect = () => {
    disconnect()
    setIsDisconnectDialogOpen(false)
    setActivity(null)
  }

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const formatExactTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">WhatsApp Setup</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Apna WhatsApp Business number connect karein
        </p>
      </div>

      <Card className={isConnected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isConnected ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {isConnected ? <Wifi className="h-8 w-8 text-green-600" /> : <WifiOff className="h-8 w-8 text-yellow-600" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{isConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}</h2>
                  <Badge className={isConnected ? 'bg-green-600' : 'bg-yellow-600'}>{isConnected ? 'Connected' : 'Not Connected'}</Badge>
                </div>
                {(isConnected || status?.phone_number) && status?.phone_number && (
                  <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />{status.phone_number}
                  </p>
                )}
              </div>
            </div>
            {isConnected ? (
              <Button variant="destructive" onClick={() => setIsDisconnectDialogOpen(true)}>Disconnect WhatsApp</Button>
            ) : (
              <Button onClick={handleConnect} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                {loading ? 'Connecting...' : 'Connect WhatsApp'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MessageCircle className="h-6 w-6 text-primary" /></div><div><h3 className="font-semibold">Auto-Replies</h3><p className="mt-1 text-sm text-muted-foreground">Automatically customers ke messages ka jawab dein based on keywords</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10"><Zap className="h-6 w-6 text-secondary" /></div><div><h3 className="font-semibold">Instant Broadcast</h3><p className="mt-1 text-sm text-muted-foreground">Ek click mein sab customers ko message bhejein</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100"><Shield className="h-6 w-6 text-green-600" /></div><div><h3 className="font-semibold">Secure Connection</h3><p className="mt-1 text-sm text-muted-foreground">End-to-end encrypted aur 100% safe connection</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>WhatsApp Kaise Connect Karein?</CardTitle><CardDescription>Simple steps follow karein</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">1</div><div><h4 className="font-medium">Connect Button Dabayein</h4><p className="text-sm text-muted-foreground">Upar "Connect WhatsApp" button par click karein, QR code automatically generate hoga</p></div></div>
            <div className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">2</div><div><h4 className="font-medium">QR Code Scan Karein</h4><p className="text-sm text-muted-foreground">WhatsApp app kholein aur Settings {">"} Linked Devices {">"} Link a Device se QR code scan karein</p></div></div>
            <div className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">3</div><div><h4 className="font-medium">Connection Verify Karein</h4><p className="text-sm text-muted-foreground">QR scan hone ke baad apna connection verify karein aur auto-replies enable karein</p></div></div>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader><CardTitle>Connection Status</CardTitle></CardHeader>
          <CardContent>
            {activityLoading && !activity ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : activity ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted p-4 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-green-600" /><p className="mt-2 font-medium">Connected</p><p className="text-sm text-muted-foreground">Status</p></div>
                <div className="rounded-lg bg-muted p-4 text-center"><Clock className="mx-auto h-8 w-8 text-blue-600" /><p className="mt-2 font-medium">{formatTimeAgo(activity.last_activity)}</p><p className="text-sm text-muted-foreground">Last Activity</p><p className="text-xs text-slate-400 mt-1">{formatExactTime(activity.last_activity)}</p></div>
                <div className="rounded-lg bg-muted p-4 text-center"><MessageCircle className="mx-auto h-8 w-8 text-primary" /><p className="mt-2 font-medium">{activity.messages_today.toLocaleString()}</p><p className="text-sm text-muted-foreground">Messages Today</p></div>
                <div className="rounded-lg bg-muted p-4 text-center"><Zap className="mx-auto h-8 w-8 text-yellow-600" /><p className="mt-2 font-medium">{activity.uptime}%</p><p className="text-sm text-muted-foreground">Uptime</p></div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><p>Activity data load nahi ho raha</p></div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div><p className="font-semibold">Connection Error</p><p className="text-sm">{error}</p></div>
        </div>
      )}

      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Connect WhatsApp</DialogTitle><DialogDescription>{step === 1 ? 'QR Code scan karein' : 'Connection verify ho rahi hai...'}</DialogDescription></DialogHeader>
          {step === 1 ? (
            <div className="space-y-4 py-4">
              {hasQR ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-inner">
                      <img src={qrCode} alt="WhatsApp QR" className="w-64 h-64 object-contain" />
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">WhatsApp app mein jaake yeh QR code scan karein</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Instructions:</p>
                    <ol className="mt-1 list-inside list-decimal text-muted-foreground"><li>WhatsApp kholein</li><li>Settings {">"} Linked Devices</li><li>Link a Device tap karein</li><li>QR code scan karein</li></ol>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-sm justify-center"><Clock className="w-4 h-4 animate-pulse" />QR expires in 60 seconds</div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-sm text-muted-foreground">QR code generate ho raha hai...</p></div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-4"><Loader2 className="h-12 w-12 animate-spin text-green-600" /><p className="font-medium">Verifying connection...</p><p className="text-sm text-muted-foreground">Phone par QR scan kiye hue? Verification ho rahi hai...</p></div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsConnectDialogOpen(false); setStep(1) }} disabled={step === 2}>Cancel</Button>
            {step === 1 && hasQR && <Button onClick={handleVerify}>I Have Scanned</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Disconnect WhatsApp?</DialogTitle><DialogDescription>Kya aap yaqeen se WhatsApp disconnect karna chahte hain? Auto-replies aur broadcasts band ho jayenge.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}