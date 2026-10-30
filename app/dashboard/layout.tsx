'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TrialGuard } from '@/components/TrialGuard'
import { TrialBanner } from '@/components/TrialBanner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { apiPost, apiGet } from '@/lib/api'
import {
  Home, MessageSquare, Users, ShoppingBag, Megaphone,
  BarChart3, UserPlus, Settings, HelpCircle, Phone, Bell,
  Search, Menu, LogOut, ChevronUp, MessageCircle, X, Plus,
  Package,
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface UserData {
  id: number
  name: string
  business_name: string
  business_type: string
  phone: string
  email: string | null
  plan_id: number
  trial_ends_at: string | null
  phone_verified_at: string
  plan?: PlanData
  subscription?: SubscriptionData
  role?: string
  permissions?: {
    can_send_messages: boolean
    can_manage_orders: boolean
    can_manage_customers: boolean
    can_broadcast: boolean
    can_view_analytics: boolean
  }
}

interface PlanData {
  id: number
  slug: string
  name: string
  price: number
  is_free: boolean
  is_popular: boolean
}

interface SubscriptionData {
  id: number
  plan_id: number
  starts_at: string
  ends_at: string
  is_trial: boolean
  status: string
}

// ============================================
// NAVIGATION with roles & permissions
// ============================================

const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['super_admin', 'business_owner', 'admin', 'manager', 'support', 'viewer'] },
  { name: 'WhatsApp Setup', href: '/dashboard/whatsapp', icon: Phone, roles: ['super_admin', 'business_owner', 'admin', 'manager'] },
  { name: 'Auto-Replies', href: '/dashboard/templates', icon: MessageSquare, roles: ['super_admin', 'business_owner', 'admin', 'manager'] },
  { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['super_admin', 'business_owner', 'admin', 'manager', 'support'], perm: 'can_manage_customers' },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag, roles: ['super_admin', 'business_owner', 'admin', 'manager'], perm: 'can_manage_orders' },
  { name: 'Broadcast', href: '/dashboard/broadcast', icon: Megaphone, roles: ['super_admin', 'business_owner', 'admin', 'manager'], perm: 'can_broadcast' },
  { name: 'Products', href: '/dashboard/products', icon: Package, roles: ['super_admin', 'business_owner', 'admin', 'manager'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['super_admin', 'business_owner', 'admin', 'manager', 'viewer'], perm: 'can_view_analytics' },
  { name: 'Team', href: '/dashboard/team', icon: UserPlus, roles: ['super_admin', 'business_owner', 'admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['super_admin', 'business_owner'] },
]

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-secondary" />
      </div>
      {!collapsed && (
        <span className="text-xl font-bold text-foreground">BizChat Pro</span>
      )}
    </Link>
  )
}

// ============================================
// SIDEBAR
// ============================================

function Sidebar({ collapsed, onCollapse, user }: { 
  collapsed: boolean; 
  onCollapse: (val: boolean) => void;
  user: UserData | null;
}) {
  const pathname = usePathname()

  const navigation = allNavigation.filter(item => {
    const userRole = (user?.role || 'business_owner').toLowerCase()
    const itemRoles = item.roles.map(r => r.toLowerCase())
    
    if (!itemRoles.includes(userRole)) {
      return false
    }
    
    if (item.perm && user?.permissions) {
      const permKey = item.perm as keyof typeof user.permissions
      const hasPerm = user.permissions[permKey] ?? false
      if (!hasPerm) {
        return false
      }
    }
    
    return true
  })

  const isFreePlan = user?.plan?.is_free || false

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-border px-4', collapsed && 'justify-center')}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-4 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn('border-t border-border p-4', collapsed && 'flex flex-col items-center')}>
        {!collapsed && user && (
          <div className="mb-4 rounded-lg bg-primary/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {user?.plan?.name || 'Free'} Plan
              </span>
              <Badge variant={isFreePlan ? 'secondary' : 'default'} className="text-xs">
                {isFreePlan ? 'Free Trial' : 'Active'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Expires:{' '}
              <span className="font-medium text-foreground">
                {user?.subscription?.ends_at 
                  ? new Date(user.subscription.ends_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })
                  : 'N/A'
                }
              </span>
            </p>
            <Link href="/dashboard/plans">
              <Button size="sm" variant="outline" className="mt-2 w-full text-xs">
                {isFreePlan ? 'Upgrade Plan' : 'Update Plan'}
              </Button>
            </Link>
          </div>
        )}
        <Link href="/dashboard/support" className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}>
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </Link>
        <button onClick={() => onCollapse(!collapsed)} className={cn(
          'mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}>
          <ChevronUp className={cn('h-5 w-5 shrink-0 transition-transform', collapsed ? 'rotate-90' : '-rotate-90')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

// ============================================
// MOBILE SIDEBAR
// ============================================

function MobileSidebar({ user }: { user: UserData | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = allNavigation.filter(item => {
    const userRole = user?.role || 'business_owner'
    if (!item.roles.includes(userRole)) return false
    if (item.perm && user?.permissions) {
      const permKey = item.perm as keyof typeof user.permissions
      if (!user.permissions[permKey]) return false
    }
    return true
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'border-l-4 border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

// ============================================
// HEADER
// ============================================

function Header({ sidebarCollapsed, user }: { 
  sidebarCollapsed: boolean;
  user: UserData | null;
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const getBreadcrumb = () => {
    const path = pathname.split('/').filter(Boolean)
    return path.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await apiPost('/logout', {})
      toast.success('Logout successful')
    } catch (error: any) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('trialInfo')
      setIsLoggingOut(false)
      router.push('/login')
    }
  }

  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getPlanBadge = () => {
    if (!user?.plan) return null
    if (user.plan.is_free) return 'Free'
    if (user.subscription?.is_trial) return 'Trial'
    return user.plan.name
  }

  return (
    <header className={cn(
      'sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur transition-all duration-300 sm:px-6',
      sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
    )}>
      <MobileSidebar user={user} />
      <div className="hidden text-sm text-muted-foreground lg:block">{getBreadcrumb()}</div>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Customer dhoondhein..." className="pl-10 pr-4" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative"><Bell className="h-5 w-5" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium truncate max-w-[120px]">{user?.business_name || 'Business'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="truncate max-w-[80px]">{user?.name || 'User'}</span>
                  {getPlanBadge() && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{getPlanBadge()}</Badge>}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-3 py-2">
              <p className="font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.business_name}</p>
              {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
              <p className="text-xs text-muted-foreground">{user?.phone}</p>
              {user?.role && <Badge variant="outline" className="mt-1 text-[10px] capitalize">{user.role.replace('_', ' ')}</Badge>}
            </div>
            {user?.plan && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Plan</span>
                    <Badge variant={user.plan.is_free ? 'secondary' : 'default'} className="text-[10px]">{user.plan.name}</Badge>
                  </div>
                  {user.subscription && <p className="text-xs text-muted-foreground mt-1">Expires: {new Date(user.subscription.ends_at).toLocaleDateString()}</p>}
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/support"><HelpCircle className="mr-2 h-4 w-4" />Help & Support</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />{isLoggingOut ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// ============================================
// MOBILE BOTTOM NAV
// ============================================

function MobileBottomNav({ user }: { user: UserData | null }) {
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)

  const mobileNav = allNavigation.filter(item => {
    const userRole = user?.role || 'business_owner'
    if (!item.roles.includes(userRole)) return false
    if (item.perm && user?.permissions) {
      const permKey = item.perm as keyof typeof user.permissions
      if (!user.permissions[permKey]) return false
    }
    return ['Dashboard', 'Customers', 'Orders', 'Broadcast'].includes(item.name)
  })

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 lg:hidden">
        {showQuickActions && (
          <div className="mb-3 flex flex-col gap-2">
            <Link href="/dashboard/templates/new">
              <Button size="sm" variant="secondary" className="gap-2 shadow-lg">
                <MessageSquare className="h-4 w-4" />Template
              </Button>
            </Link>
          </div>
        )}
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={() => setShowQuickActions(!showQuickActions)}>
          {showQuickActions ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {mobileNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className={cn(
                'flex flex-col items-center gap-1 px-3 py-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                <item.icon className="h-5 w-5" /><span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
          <Link href="/dashboard/settings" className={cn(
            'flex flex-col items-center gap-1 px-3 py-2',
            pathname === '/dashboard/settings' ? 'text-primary' : 'text-muted-foreground'
          )}>
            <Settings className="h-5 w-5" /><span className="text-xs">More</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

// ============================================
// MAIN LAYOUT
// ============================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
      } catch (e) {
        console.error('Failed to parse user data', e)
      }
    }

    fetchUserData()
  }, [router])

 // In your layout.tsx, modify fetchUserData:
const fetchUserData = async () => {
  try {
    const result = await apiGet('/me')
    
    if (result.success && result.data) {
      const apiData = result.data
      const apiUser = apiData.user || {}
      
      const mergedUser = {
        ...apiUser,
        role: apiData.role || apiUser.role || 'business_owner',
        is_team_member: apiData.is_team_member ?? ['admin', 'manager', 'support', 'viewer'].includes((apiData.role || apiUser.role || '').toLowerCase()),
        permissions: apiData.permissions || apiUser.permissions || {
          can_send_messages: true,
          can_manage_orders: false,
          can_manage_customers: false,
          can_broadcast: false,
          can_view_analytics: false,
        },
        business_owner: apiData.business_owner || apiUser.business_owner || null,
      }
      
      setUser(mergedUser)
      localStorage.setItem('user', JSON.stringify(mergedUser))
    }
  } catch (error: any) {
    console.error('Failed to fetch user data:', error)
    
    // ✅ Don't redirect here - let TrialGuard handle it
    // Only redirect on 401 (unauthorized)
    if (error.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('trialInfo')
      router.push('/login')
    }
  } finally {
    setIsLoading(false)
  }
}

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

   return (
    <TrialGuard>
      <div className="min-h-screen bg-background">
        <TrialBanner />
        
        {/* 👇 pt-8 add karo taake banner ke neeche sidebar start ho */}
        <div className="hidden lg:block pt-8">
          <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} user={user} />
        </div>
        
        {/* 👇 pt-8 add karo taake content bhi banner ke neeche ho */}
        <div className={cn(
          'flex min-h-screen flex-col pt-8 transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}>
          <Header sidebarCollapsed={sidebarCollapsed} user={user} />
          <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
        </div>
        
        <MobileBottomNav user={user} />
      </div>
    </TrialGuard>
  )
}