'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, MessageCircle, Loader2 } from 'lucide-react'
import { apiPost } from '@/lib/api'

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

export default function LoginPage() {
  const router = useRouter()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { login?: string; password?: string } = {}

    if (!login.trim()) {
      newErrors.login = 'Email ya phone number zaruri hai'
    }

    if (!password) {
      newErrors.password = 'Password zaruri hai'
    } else if (password.length < 6) {
      newErrors.password = 'Password kam az kam 6 characters ka hona chahiye'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await apiPost('/login', {
        login: login.trim(),
        password: password,
      })

      if (result.success && result.data) {
        // ✅ Save token
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        toast.success('Login successful! Welcome back.')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)

      // Handle API errors
      if (error.response?.message) {
        toast.error(error.response.message)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Kuch galat ho gaya. Dobara try karein.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left Side - Illustration */}
      <div className="hidden flex-1 items-center justify-center bg-primary/5 p-8 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome Back!</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Apne WhatsApp business ko manage karein aur sales barhayein. 
            Sab kuch aik jagah.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Businesses</div>
            </div>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo />
          </div>

          <Card className="border-none shadow-lg lg:border lg:shadow-none">
            <CardHeader className="space-y-1">
              <div className="mb-4 hidden lg:block">
                <Logo />
              </div>
              <CardTitle className="text-2xl">Login Karein</CardTitle>
              <CardDescription>
                Apne account mein sign in karein
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Email ya Phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login"
                      type="text"
                      placeholder="email@example.com ya +92 300 1234567"
                      className={`pl-10 ${errors.login ? 'border-destructive' : ''}`}
                      value={login}
                      onChange={(e) => {
                        setLogin(e.target.value)
                        setErrors(prev => ({ ...prev, login: undefined }))
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.login && (
                    <p className="text-sm text-destructive">{errors.login}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors(prev => ({ ...prev, password: undefined }))
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
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Yaad Rakhein
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Password bhool gaye?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ya</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full gap-2" disabled={isLoading}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google se Login
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Account nahi hai?{' '}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                    Free Sign Up Karein
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}