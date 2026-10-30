'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation' // 👈 usePathname add karo
import { Loader2 } from 'lucide-react'
import { apiGet } from '@/lib/api'

// 👇 Ye routes block hone ke baad bhi accessible rahenge
const ALLOWED_WHEN_BLOCKED = ['/dashboard/plans']

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() // 👈
  const [isLoading, setIsLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const result = await apiGet('/my-plan')
      
      if (result.success && result.data) {
        localStorage.setItem('trialInfo', JSON.stringify({
          trial: result.data.trial,
          subscription_status: result.data.subscription_status,
          is_blocked: result.data.is_blocked,
          current_plan: result.data.current_plan,
        }))
        
        window.dispatchEvent(new Event('trialUpdate'))
        setIsBlocked(result.data.is_blocked === true)
      }
    } catch (error: any) {
      console.log('Trial check error:', error)
      if (error.status === 403 && error.response?.expired === true) {
        setIsBlocked(true)
        localStorage.removeItem('trialInfo')
      }
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

  // ✅ Agar blocked hai AUR current path allowed nahi hai, tabhi block screen dikhayo
  if (isBlocked && !ALLOWED_WHEN_BLOCKED.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-red-600">Trial Khatam Ho Gaya!</h2>
            <p className="text-muted-foreground mt-2">
              Aapka free trial expire ho gaya hai. Apne business ko chalane ke liye paid plan upgrade karein.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard/plans')}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Plans Dekhein
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('trialInfo')
                window.location.href = '/login'
              }}
              className="w-full py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Agar blocked hai lekin path allowed hai (e.g. /dashboard/plans), ya blocked nahi hai
  return <>{children}</>
}