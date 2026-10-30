'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, Loader2, ArrowLeft, Crown, Smartphone, Wallet, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGet, apiPost } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Plan {
  id: number
  slug: string
  name: string
  price: number
  price_formatted: string
  features: string[]
  is_popular: boolean
  is_free: boolean
  messages_per_day: number
  templates: number
  team_members: number
}

interface UserData {
  plan_id: number
  plan: Plan
  subscription: {
    ends_at: string
    is_trial: boolean
    status: string
  }
}

type PaymentGateway = 'easypaisa' | 'jazzcash' | 'payfast'

interface GatewayOption {
  id: PaymentGateway
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const gateways: GatewayOption[] = [
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'EasyPaisa wallet se pay karein',
    color: 'border-green-500 text-green-600',
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: <Wallet className="h-5 w-5" />,
    description: 'JazzCash wallet se pay karein',
    color: 'border-red-500 text-red-600',
  },
  {
    id: 'payfast',
    name: 'PayFast',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Card, wallet ya bank se pay karein',
    color: 'border-blue-500 text-blue-600',
  },
]

export default function UpdatePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<UserData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('easypaisa')
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const status = searchParams.get('status')
    const order = searchParams.get('order')
    if (status === 'success' && order) {
      verifyPayment(order)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [plansResult, userResult] = await Promise.all([
        apiGet('/plans'),
        apiGet('/my-plan'),
      ])
      if (plansResult.success) setPlans(plansResult.data)
      if (userResult.success) setCurrentPlan(userResult.data)
    } catch (error) {
      toast.error('Plans load nahi ho sake')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = (plan: Plan) => {
    if (plan.slug === currentPlan?.plan?.slug) {
      toast.info('Ye plan already active hai')
      return
    }
    setSelectedPlan(plan)
    setShowPaymentDialog(true)
    setPaymentStatus('idle')
  }

  const handlePayment = async () => {
    if (!selectedPlan) return
    setIsPaying(true)
    setPaymentStatus('processing')

    try {
      const result = await apiPost('/payment/initiate', {
        plan_id: selectedPlan.id,
        gateway: selectedGateway,
      })

      if (result.success) {
        switch (selectedGateway) {
          case 'easypaisa':
          case 'payfast':
            if (result.data.payment_url) {
              window.location.href = result.data.payment_url
            }
            break
          case 'jazzcash':
            submitJazzCashForm(result.data.form_data)
            break
        }
      } else {
        toast.error(result.message || 'Payment initiate failed')
        setPaymentStatus('failed')
      }
    } catch (error: any) {
      toast.error(error.response?.message || 'Kuch galat ho gaya')
      setPaymentStatus('failed')
    } finally {
      setIsPaying(false)
    }
  }

  const submitJazzCashForm = (formData: any) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = formData.payment_url || 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/'
    Object.keys(formData).forEach(key => {
      if (key === 'payment_url') return
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = formData[key]
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  const verifyPayment = async (orderId: string) => {
    try {
      setIsPaying(true)
      const result = await apiPost('/payment/verify', { order_id: orderId })
      if (result.success) {
        toast.success('Payment successful! Plan activated.')
        localStorage.setItem('user', JSON.stringify(result.data.user))
        setPaymentStatus('success')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        toast.error('Payment verification failed')
        setPaymentStatus('failed')
      }
    } catch (error) {
      toast.error('Payment verify nahi ho saka')
      setPaymentStatus('failed')
    } finally {
      setIsPaying(false)
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Plan Upgrade Karein</h1>
            <p className="text-muted-foreground">Apne business ke liye best plan aur payment method chunein</p>
          </div>
        </div>

        {currentPlan?.plan && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold">{currentPlan.plan.name} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {currentPlan.subscription?.ends_at 
                      ? new Date(currentPlan.subscription.ends_at).toLocaleDateString('en-GB')
                      : 'N/A'
                    }
                  </p>
                </div>
                <Badge variant={currentPlan.plan.is_free ? 'secondary' : 'default'}>
                  {currentPlan.plan.is_free ? 'Free' : 'Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.plan?.slug === plan.slug
            const isSelected = selectedPlan?.id === plan.id

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative cursor-pointer transition-all',
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50',
                  isCurrentPlan && 'border-green-500/50'
                )}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.is_popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-2 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Current</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">Rs. {plan.price_formatted || plan.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-2">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="h-4 w-4 mr-2" /> Active Plan
                    </Button>
                  ) : (
                    <Button className="w-full" variant={isSelected ? 'default' : 'outline'}>
                      {isSelected ? 'Selected' : 'Select & Pay'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Karein</DialogTitle>
              <DialogDescription>
                {selectedPlan && (
                  <span>
                    <strong>{selectedPlan.name}</strong> plan ke liye <strong>Rs. {selectedPlan.price}</strong> pay karein
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Payment Method Chunein</Label>
                <RadioGroup
                  value={selectedGateway}
                  onValueChange={(val) => setSelectedGateway(val as PaymentGateway)}
                  className="grid gap-3"
                >
                  {gateways.map((gateway) => (
                    <label
                      key={gateway.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedGateway === gateway.id ? gateway.color + ' bg-opacity-5' : 'border-border hover:border-muted-foreground'
                      )}
                    >
                      <RadioGroupItem value={gateway.id} id={gateway.id} />
                      <div className={cn('p-2 rounded-full bg-opacity-10', gateway.color)}>
                        {gateway.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{gateway.name}</p>
                        <p className="text-xs text-muted-foreground">{gateway.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {(selectedGateway === 'easypaisa' || selectedGateway === 'jazzcash') && (
                <div>
                  <Label htmlFor="phone">{selectedGateway === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Number</Label>
                  <Input
                    id="phone"
                    placeholder="03XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Is number pe OTP ayega</p>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Payment process ho raha hai...
                </div>
              )}
              {paymentStatus === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                  ✅ Payment successful! Redirecting...
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                  ❌ Payment failed. Dobara try karein.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowPaymentDialog(false)} disabled={isPaying}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handlePayment} disabled={isPaying || !selectedPlan}>
                  {isPaying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : `Pay Rs. ${selectedPlan?.price || 0}`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}