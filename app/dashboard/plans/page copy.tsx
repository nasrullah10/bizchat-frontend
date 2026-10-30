'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, Loader2, ArrowLeft, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGet, apiPost } from '@/lib/api'

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

export default function UpdatePlanPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<UserData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Fetch all plans
      const plansResult = await apiGet('/plans')
      if (plansResult.success) {
        setPlans(plansResult.data)
      }

      // Fetch current user plan
      const userResult = await apiGet('/my-plan')
      if (userResult.success) {
        setCurrentPlan(userResult.data)
        setSelectedPlan(userResult.data.current_plan?.slug || '')
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
      toast.error('Plans load nahi ho sake')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan')
      return
    }

    if (selectedPlan === currentPlan?.plan?.slug) {
      toast.info('Ye plan already active hai')
      return
    }

    setIsUpdating(true)

    try {
      const result = await apiPost('/update-plan', {
        plan_slug: selectedPlan,
      })

      if (result.success) {
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(result.data.user))

        toast.success('Plan updated successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Plan update failed')
      }
    } catch (error: any) {
      console.error('Update plan error:', error)
      toast.error(error.response?.message || 'Kuch galat ho gaya')
    } finally {
      setIsUpdating(false)
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Plan Update Karein</h1>
            <p className="text-muted-foreground">Apne business ke liye best plan chunein</p>
          </div>
        </div>

        {/* Current Plan Info */}
        {currentPlan?.plan && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold">{currentPlan.plan.name} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {currentPlan.subscription?.ends_at 
                      ? new Date(currentPlan.subscription.ends_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
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

        {/* Plans Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.plan?.slug === plan.slug
            const isSelected = selectedPlan === plan.slug

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50',
                  isCurrentPlan && 'border-green-500/50'
                )}
                onClick={() => !isCurrentPlan && setSelectedPlan(plan.slug)}
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
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">
                      Rs. {plan.price_formatted || plan.price}
                    </span>
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
                      <Check className="h-4 w-4 mr-2" />
                      Active Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={isSelected ? 'default' : 'outline'}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePlan} 
            disabled={isUpdating || !selectedPlan || selectedPlan === currentPlan?.plan?.slug}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Plan'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}