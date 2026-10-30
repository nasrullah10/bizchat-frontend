'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, X } from 'lucide-react'

interface TrialInfo {
  trial: {
    ends_at: string
    expired: boolean
    days_left: number | null
  }
  is_blocked: boolean
  current_plan: {
    is_free: boolean
  }
}

export function TrialBanner() {
  const router = useRouter()
  const [info, setInfo] = useState<TrialInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem('trialInfo')
      if (stored) {
        try {
          setInfo(JSON.parse(stored))
        } catch (e) {
          console.error('Parse error', e)
        }
      }
    }
    
    window.addEventListener('trialUpdate', load)
    load()
    
    return () => window.removeEventListener('trialUpdate', load)
  }, [])

  if (!info || dismissed) return null
  if (!info.current_plan?.is_free) return null
  if (info.is_blocked) return null // Guard handles blocked

  const daysLeft = info.trial?.days_left !== null 
    ? Math.ceil(info.trial.days_left) 
    : null

  // EXPIRED (shouldn't reach here, but just in case)
  if (info.trial?.expired) return null

  // WARNING - 3 days or less
  if (daysLeft !== null && daysLeft <= 3 && daysLeft > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {daysLeft === 1 ? 'Kal trial khatam!' : `${daysLeft} din mein trial khatam`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/dashboard/plans')}
              className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
            >
              Upgrade
            </button>
            <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // NORMAL - more than 3 days
  if (daysLeft !== null && daysLeft > 3) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-50 border-b border-green-200 px-4 py-1.5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-700">
              {daysLeft} din baad trial khatam
            </span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-green-600 hover:text-green-800">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }

  return null
}