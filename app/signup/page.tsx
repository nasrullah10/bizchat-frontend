'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, EyeOff, User, Building2, Phone, Mail, Lock, MessageCircle, Loader2, Check, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiPost, fetchPlans } from '@/lib/api'

// ============================================
// TYPES
// ============================================

interface Plan {
  id: number
  slug: string
  name: string
  price: string
  price_raw: number
  features: string[]
  is_popular: boolean
  currency: string
}

type Step = 1 | 2 | 3 | 4

interface FormData {
  businessName: string
  ownerName: string
  businessType: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
  selectedPlan: string
}

interface ApiErrors {
  businessName?: string
  ownerName?: string
  businessType?: string
  phone?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeTerms?: string
  selectedPlan?: string
  general?: string
}

// ============================================
// COMPONENTS
// ============================================

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-secondary" />
      </div>
      <span className="text-xl font-bold text-foreground">BizChat Pro</span>
    </Link>
  )
}

const businessTypes = [
  { value: 'clothing', label: 'Clothing / Kapray' },
  { value: 'food', label: 'Food / Khana' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'clinic', label: 'Clinic / Medical' },
  { value: 'education', label: 'Education / Tution' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'other', label: 'Other' },
]

export default function SignupPage() {
  const router = useRouter()
  
  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    ownerName: '',
    businessType: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    selectedPlan: 'business',
  })
  
  const [errors, setErrors] = useState<ApiErrors>({})

  // ============================================
  // LOAD PLANS FROM API
  // ============================================

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setPlansLoading(true)
      const result = await fetchPlans()
      
      if (result.success && result.data) {
        setPlans(result.data)
        
        const popularPlan = result.data.find((p: Plan) => p.is_popular)
        const defaultPlan = popularPlan || result.data[0]
        if (defaultPlan) {
          setFormData(prev => ({ ...prev, selectedPlan: defaultPlan.slug }))
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
      toast.error('Plans load nahi ho sake. Default use kar rahe hain.')
      
      // Fallback static plans
      setPlans([
        {
          id: 1,
          slug: 'free-trial',
          name: 'FreeTrial',
          price: '2,999',
          price_raw: 2999,
          features: ['500 messages/day', '5 templates', 'Basic analytics'],
          is_popular: false,
          currency: 'Rs.',
        },
        {
          id: 2,
          slug: 'business',
          name: 'Business',
          price: '7,999',
          price_raw: 7999,
          features: ['Unlimited messages', 'Unlimited templates', '3 team members'],
          is_popular: true,
          currency: 'Rs.',
        },
        {
          id: 3,
          slug: 'enterprise',
          name: 'Enterprise',
          price: '19,999',
          price_raw: 19999,
          features: ['Everything unlimited', 'API access', 'Priority support'],
          is_popular: false,
          currency: 'Rs.',
        },
      ])
    } finally {
      setPlansLoading(false)
    }
  }

  // ============================================
  // FORM HELPERS
  // ============================================

  const updateFormData = (key: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-destructive' }
    if (password.length < 8) return { strength: 2, label: 'Medium', color: 'bg-warning' }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Strong', color: 'bg-primary' }
    }
    return { strength: 2, label: 'Medium', color: 'bg-warning' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  // ============================================
  // VALIDATION
  // ============================================

  const validateStep1 = () => {
    const newErrors: ApiErrors = {}
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name zaruri hai'
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name zaruri hai'
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Business type select karein'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number zaruri hai'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Valid phone number dalein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: ApiErrors = {}
    
    if (!formData.password) {
      newErrors.password = 'Password zaruri hai'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kam az kam 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords match nahi kar rahe'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Terms accept karein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============================================
  // ERROR HANDLER
  // ============================================

  const handleApiError = (error: any) => {
    console.error('API Error:', error)
    
    const response = error.response
    const status = error.status

    if (status === 422 && response?.errors) {
      const apiErrors: ApiErrors = {}
      
      const errorMap: Record<string, keyof ApiErrors> = {
        'business_name': 'businessName',
        'owner_name': 'ownerName',
        'business_type': 'businessType',
        'phone': 'phone',
        'email': 'email',
        'password': 'password',
        'password_confirmation': 'confirmPassword',
        'agree_terms': 'agreeTerms',
        'selected_plan': 'selectedPlan',
      }

      Object.keys(response.errors).forEach((key) => {
        const mappedKey = errorMap[key]
        if (mappedKey) {
          apiErrors[mappedKey] = response.errors[key][0]
        }
      })

      setErrors(apiErrors)
      
      const step1Fields: (keyof ApiErrors)[] = ['businessName', 'ownerName', 'businessType', 'phone', 'email']
      const hasStep1Errors = step1Fields.some(field => apiErrors[field])
      if (hasStep1Errors && step !== 1) {
        setStep(1)
      }
      
      toast.error('Kuch fields theek nahi hain. Please check karein.')
      return
    }

    if (response?.error_code === 'STEP_1_REQUIRED') {
      toast.error('Pehle Step 1 complete karein')
      setStep(1)
      return
    }
    
    if (response?.error_code === 'PREVIOUS_STEPS_REQUIRED') {
      toast.error('Pehle previous steps complete karein')
      return
    }

    toast.error(error.message || 'Kuch galat ho gaya. Dobara try karein.')
  }

  // ============================================
  // STEP HANDLERS
  // ============================================

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return
      
      setIsLoading(true)
      try {
        const result = await apiPost('/signup/step-1', {
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          business_type: formData.businessType,
          phone: formData.phone,
          email: formData.email || null,
        })

        setSessionId(result.data.session_id)
        toast.success('Business info saved!')
        setStep(2)
        
      } catch (error: any) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (step === 2) {
      if (!validateStep2()) return
      
      if (!sessionId) {
        toast.error('Session expired. Please start again.')
        setStep(1)
        return
      }

      setIsLoading(true)
      try {
        await apiPost('/signup/step-2', {
          session_id: sessionId,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          agree_terms: formData.agreeTerms,
        })

        toast.success('Account setup saved!')
        setStep(3)
        
      } catch (error: any) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (step === 3) {
      if (!sessionId) {
        toast.error('Session expired. Please start again.')
        setStep(1)
        return
      }

      setIsLoading(true)
      try {
        await apiPost('/signup/step-3', {
          session_id: sessionId,
          selected_plan: formData.selectedPlan,
        })

        const result = await apiPost('/signup/complete', {
          session_id: sessionId,
        })

        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        toast.success('Account successfully ban gaya! 🎉')
        setStep(4)
        
      } catch (error: any) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left Side - Progress */}
      <div className="hidden flex-1 items-center justify-center bg-primary/5 p-8 lg:flex">
        <div className="max-w-md">
          <Logo />
          <h2 className="mt-8 text-3xl font-bold text-foreground">
            Free mein Shuru Karein
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sirf 2 minute mein account banayein aur apna WhatsApp business automate karein.
          </p>
          
          {/* Progress Steps */}
          <div className="mt-12 space-y-6">
            {[
              { num: 1, title: 'Business Info', desc: 'Apne business ki details' },
              { num: 2, title: 'Account Setup', desc: 'Password set karein' },
              { num: 3, title: 'Plan Select', desc: 'Apna plan chunein' },
              { num: 4, title: 'Complete!', desc: 'Dashboard pe jayein' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                    step > s.num
                      ? 'bg-primary text-primary-foreground'
                      : step === s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <div>
                  <div className={cn(
                    'font-medium',
                    step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {s.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo & Progress */}
          <div className="mb-8 lg:hidden">
            <Logo />
            <div className="mt-6 flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                      step > s
                        ? 'bg-primary text-primary-foreground'
                        : step === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={cn(
                      'h-0.5 w-8 sm:w-12',
                      step > s ? 'bg-primary' : 'bg-muted'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Card className="border-none shadow-lg lg:border lg:shadow-none">
            {/* Step 1: Business Info */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Business Information</CardTitle>
                  <CardDescription>
                    Apne business ki basic details dalein
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="businessName"
                        placeholder="e.g. Karachi Cloth House"
                        className={cn('pl-10', errors.businessName && 'border-destructive')}
                        value={formData.businessName}
                        onChange={(e) => updateFormData('businessName', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-sm text-destructive">{errors.businessName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="ownerName"
                        placeholder="Aapka naam"
                        className={cn('pl-10', errors.ownerName && 'border-destructive')}
                        value={formData.ownerName}
                        onChange={(e) => updateFormData('ownerName', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.ownerName && (
                      <p className="text-sm text-destructive">{errors.ownerName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => updateFormData('businessType', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessType && (
                      <p className="text-sm text-destructive">{errors.businessType}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+92 300 1234567"
                        className={cn('pl-10', errors.phone && 'border-destructive')}
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </CardContent>
              </>
            )}
            
            {/* Step 2: Account Setup */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Account Setup</CardTitle>
                  <CardDescription>
                    Apna password set karein
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Kam az kam 6 characters"
                        className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-1.5 flex-1 rounded-full',
                                i <= passwordStrength.strength ? passwordStrength.color : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Password Strength: {passwordStrength.label}
                        </p>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Dobara password dalein"
                        className={cn('pl-10', errors.confirmPassword && 'border-destructive')}
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateFormData('agreeTerms', checked as boolean)}
                      disabled={isLoading}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                        Main{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>{' '}
                        aur{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>{' '}
                        se agree karta/karti hoon
                      </Label>
                      {errors.agreeTerms && (
                        <p className="text-sm text-destructive">{errors.agreeTerms}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {/* Step 3: Plan Selection - DYNAMIC FROM API */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Plan Select Karein</CardTitle>
                  <CardDescription>
                    Apne business ke hisaab se plan chunein
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plansLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Koi plan available nahi hai</p>
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                          formData.selectedPlan === plan.slug
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => !isLoading && updateFormData('selectedPlan', plan.slug)}
                      >
                        {plan.is_popular && (
                          <div className="absolute -top-2.5 right-4 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-2xl font-bold">
                              {plan.currency} {plan.price}
                              <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full border-2',
                              formData.selectedPlan === plan.slug
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground'
                            )}
                          >
                            {formData.selectedPlan === plan.slug && <Check className="h-4 w-4" />}
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                  
                  <p className="text-center text-sm text-muted-foreground">
                    Baad mein change kar sakte hain. 7 din free trial.
                  </p>
                </CardContent>
              </>
            )}
            
            {/* Step 4: Welcome */}
            {step === 4 && (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Welcome to BizChat Pro!</CardTitle>
                  <CardDescription className="text-base">
                    Aapka account tayar hai, {formData.ownerName}!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-2xl font-bold text-foreground">0</div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-2xl font-bold text-foreground">0</div>
                      <div className="text-xs text-muted-foreground">Customers</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-2xl font-bold text-foreground">0</div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            <CardFooter className="flex flex-col gap-4">
              {step < 4 ? (
                <div className="flex w-full gap-3">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handleBack} 
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {step === 3 ? 'Creating Account...' : 'Saving...'}
                      </>
                    ) : step === 3 ? (
                      <>
                        Account Banayein
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button className="w-full gap-2" onClick={goToDashboard}>
                  Dashboard Pe Jayein
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              
              {step === 1 && (
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Login Karein
                  </Link>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}