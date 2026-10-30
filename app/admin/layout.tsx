'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { apiPost, apiGet } from '@/lib/api'
import {
  LayoutDashboard, Users, MessageSquare, CreditCard,
  BarChart3, Settings, LogOut, Shield, Ticket,
  Building2, TrendingUp, AlertCircle,
} from 'lucide-react'

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
}

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Support Tickets', href: '/admin/support', icon: Ticket },
  { name: 'Business Owners', href: '/admin/users', icon: Building2 },
  { name: 'All Users', href: '/admin/all-users', icon: Users },
  { name: 'Plans & Billing', href: '/admin/plans', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

function AdminLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
        <Shield className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <span className="text-lg font-bold text-foreground">BizChat Pro</span>
        <span className="block text-[10px] text-muted-foreground -mt-1">Admin Panel</span>
      </div>
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTickets: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    checkAdmin()
    fetchStats()
  }, [])

  const checkAdmin = async () => {
    try {
      const result = await apiGet('/me')
      if (result.success) {
        const userData = result.data.user || result.data
        if (userData.role !== 'super_admin') {
          toast.error('Access denied! Admin only.')
          router.push('/dashboard')
          return
        }
        setUser(userData)
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await apiGet('/admin/stats')
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Stats error:', error)
    }
  }

  const handleLogout = async () => {
    await apiPost('/logout', {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-4">
          <AdminLogo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
                {item.name === 'Support Tickets' && stats.activeTickets > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {stats.activeTickets}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-col pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
          <h1 className="text-lg font-semibold">
            {adminNavigation.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total Users: <span className="font-semibold text-foreground">{stats.totalUsers}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Revenue: <span className="font-semibold text-foreground">PKR {stats.totalRevenue?.toLocaleString()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}