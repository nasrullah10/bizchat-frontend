'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Smartphone, Wallet, CreditCard } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface Payment {
  id: number
  gateway: string
  order_id: string
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  plan: {
    name: string
  }
}

const getGatewayIcon = (gateway: string) => {
  switch (gateway) {
    case 'easypaisa': return <Smartphone className="h-4 w-4 text-green-600" />
    case 'jazzcash': return <Wallet className="h-4 w-4 text-red-600" />
    case 'payfast': return <CreditCard className="h-4 w-4 text-blue-600" />
    default: return <CreditCard className="h-4 w-4" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge className="bg-green-100 text-green-700">Paid</Badge>
    case 'pending': return <Badge variant="secondary">Pending</Badge>
    case 'failed': return <Badge variant="destructive">Failed</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export default function PaymentHistoryPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      const result = await apiGet('/payments/history')
      if (result.success) {
        setPayments(result.data.data)
      }
    } catch (error) {
      toast.error('Payment history load nahi ho saki')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payment History</h1>
            <p className="text-muted-foreground">Aapke sab payments</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Koi payment history nahi</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/plans')}>
                Plan Upgrade Karein
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getGatewayIcon(payment.gateway)}
                      </div>
                      <div>
                        <p className="font-medium">{payment.plan.name} Plan</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.gateway.toUpperCase()} • {payment.order_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rs. {payment.amount}</p>
                      <div className="mt-1">{getStatusBadge(payment.status)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}