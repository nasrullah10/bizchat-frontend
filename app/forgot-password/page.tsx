'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Lock, MessageCircle, Loader2, ArrowLeft, Eye, EyeOff, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

type Step = 1 | 2 | 3 | 4

export default function ForgotPasswordPage() {
  const router = useRouter()
  
  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [resendTimer, setResendTimer] = useState(0)
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const validateStep1 = () => {
    if (!emailOrPhone.trim()) {
      setErrors({ emailOrPhone: 'Email ya phone number zaruri hai' })
      return false
    }
    if (!emailOrPhone.includes('@') && !/^\+?[\d\s-]{10,}$/.test(emailOrPhone.replace(/\s/g, ''))) {
      setErrors({ emailOrPhone: 'Valid email ya phone number dalein' })
      return false
    }
    setErrors({})
    return true
  }

  const validateStep2 = () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Complete 6-digit OTP dalein' })
      return false
    }
    setErrors({})
    return true
  }

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!newPassword) {
      newErrors.newPassword = 'Password zaruri hai'
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Kam az kam 6 characters'
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords match nahi kar rahe'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async () => {
    if (!validateStep1()) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.success('OTP sent successfully!')
    setStep(2)
    setResendTimer(60)
    setIsLoading(false)
  }

  const handleVerifyOTP = async () => {
    if (!validateStep2()) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // For demo, any 6 digit OTP works
    toast.success('OTP verified!')
    setStep(3)
    setIsLoading(false)
  }

  const handleResetPassword = async () => {
    if (!validateStep3()) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.success('Password updated successfully!')
    setStep(4)
    setIsLoading(false)
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    toast.success('OTP resent!')
    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    setIsLoading(false)
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

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo />
        </div>
        
        <Card className="shadow-lg">
          {/* Step 1: Enter Email/Phone */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Password Bhool Gaye?</CardTitle>
                <CardDescription>
                  Apna email ya phone number dalein. Hum aapko OTP bhejenge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Email ya Phone Number</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emailOrPhone"
                      type="text"
                      placeholder="email@example.com ya +92 300 1234567"
                      className={cn('pl-10', errors.emailOrPhone && 'border-destructive')}
                      value={emailOrPhone}
                      onChange={(e) => {
                        setEmailOrPhone(e.target.value)
                        setErrors({})
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.emailOrPhone && (
                    <p className="text-sm text-destructive">{errors.emailOrPhone}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      OTP Bhejein
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </CardFooter>
            </>
          )}
          
          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">OTP Verify Karein</CardTitle>
                <CardDescription>
                  6-digit code jo {emailOrPhone} pe bheja gaya hai dalein
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {otpRefs.current[index] = el}}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={cn(
                          'h-12 w-12 text-center text-lg font-semibold',
                          errors.otp && 'border-destructive'
                        )}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-sm text-destructive">{errors.otp}</p>
                  )}
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || isLoading}
                    className={cn(
                      'text-sm',
                      resendTimer > 0
                        ? 'text-muted-foreground'
                        : 'text-primary hover:underline'
                    )}
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'OTP Dobara Bhejein'}
                  </button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full gap-2" 
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Karein
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change email/phone
                </button>
              </CardFooter>
            </>
          )}
          
          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Naya Password Set Karein</CardTitle>
                <CardDescription>
                  Apna naya password dalein
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Kam az kam 6 characters"
                      className={cn('pl-10 pr-10', errors.newPassword && 'border-destructive')}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setErrors((prev) => ({ ...prev, newPassword: '' }))
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && (
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
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Dobara password dalein"
                      className={cn('pl-10', errors.confirmPassword && 'border-destructive')}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Password Update Karein
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </>
          )}
          
          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Password Update Ho Gaya!</CardTitle>
                <CardDescription className="text-base">
                  Aap ab apne naye password se login kar sakte hain.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/login')}
                >
                  Login Karein
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
