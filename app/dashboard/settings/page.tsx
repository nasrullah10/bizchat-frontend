'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import {
  User, Building, Bell, Shield, CreditCard, Globe,
  Clock, Save, Camera, Check, Loader2, ArrowLeft,
} from 'lucide-react'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const businessTypes = [
  { value: 'clothing', label: 'Clothing / Kapray' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food / Khana' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
]

interface PlanData {
  id: number
  name: string
  slug: string
  price: number
  features: string[]
  is_free: boolean
}

interface SubscriptionData {
  ends_at: string
  is_trial: boolean
  status: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTab, setSavedTab] = useState<string | null>(null)

  // User data from API
  const [userData, setUserData] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })

  // Business state
  const [business, setBusiness] = useState({ name: '', type: '' })

  // Password state
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  // Hours state
  const [hours, setHours] = useState({
    open: '09:00',
    close: '18:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[],
  })

  // Notifications state
  const [notifications, setNotifications] = useState({
    new_message: true,
    new_order: true,
    order_update: true,
    broadcast: true,
    email: false,
    sms: false,
  })

  // Language state
  const [language, setLanguage] = useState('en')

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const result = await apiGet('/settings')

      if (result.success && result.data) {
        const data = result.data
        setUserData(data)
        setCurrentPlan(data.plan)
        setSubscription(data.subscription)

        // Set profile
        setProfile({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
        })

        // Set business
        setBusiness({
          name: data.profile.business_name || '',
          type: data.profile.business_type || '',
        })

        // Set notifications
        if (data.notifications) {
          setNotifications(data.notifications)
        }

        // Set business hours
        if (data.business_hours) {
          setHours(data.business_hours)
        }

        // Set language
        setLanguage(data.language || 'en')
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error)
      toast.error('Settings load nahi ho sake')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (tab: string, apiEndpoint: string, data: any) => {
    setIsSaving(true)
    try {
      const result = await apiPost(apiEndpoint, data)
      if (result.success) {
        toast.success(result.message || 'Saved successfully')
        setSavedTab(tab)
        setTimeout(() => setSavedTab(null), 2000)

        // Update localStorage user data
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...data }))
        }
      }
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.response?.message || 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileSave = () => {
    handleSave('profile', '/settings/profile', profile)
  }

  const handleBusinessSave = () => {
    handleSave('business', '/settings/business', {
      business_name: business.name,
      business_type: business.type,
    })
  }

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast.error('Passwords match nahi kar rahe')
      return
    }
    if (password.new.length < 6) {
      toast.error('Password kam az kam 6 characters ka hona chahiye')
      return
    }

    setIsSaving(true)
    try {
      const result = await apiPost('/settings/password', {
        current_password: password.current,
        new_password: password.new,
        new_password_confirmation: password.confirm,
      })
      if (result.success) {
        toast.success('Password changed successfully')
        setPassword({ current: '', new: '', confirm: '' })
      }
    } catch (error: any) {
      toast.error(error.response?.message || 'Password change failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotificationsSave = () => {
    handleSave('notifications', '/settings/notifications', notifications)
  }

  const handleHoursSave = () => {
    handleSave('hours', '/settings/business-hours', hours)
  }

  const handleLanguageSave = () => {
    handleSave('language', '/settings/language', { language })
  }

  const handleDayToggle = (day: string) => {
    if (hours.days.includes(day)) {
      setHours({ ...hours, days: hours.days.filter((d) => d !== day) })
    } else {
      setHours({ ...hours, days: [...hours.days, day] })
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Apni app settings yahan manage karein
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="profile" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 rounded-lg border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Apni profile information update karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Photo Change Karein
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isSaving} className="gap-2">
                {savedTab === 'profile' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : savedTab === 'profile' ? 'Saved!' : 'Save Profile'}
              </Button>

              {/* Password Change Section */}
              <div className="rounded-lg bg-muted p-4 mt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Change Password</span>
                </div>
                <div className="grid gap-4 mt-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handlePasswordChange} disabled={isSaving} variant="outline" size="sm" className="mt-4">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Info</CardTitle>
              <CardDescription>Apni business ki details update karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={business.type} onValueChange={(value) => setBusiness({ ...business, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleBusinessSave} disabled={isSaving} className="gap-2">
                {savedTab === 'business' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : savedTab === 'business' ? 'Saved!' : 'Save Business Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Notification preferences set karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">WhatsApp Notifications</h4>
                {[
                  { key: 'new_message', label: 'New Message', desc: 'Naya message aane par notification' },
                  { key: 'new_order', label: 'New Order', desc: 'Naya order aane par notification' },
                  { key: 'order_update', label: 'Order Updates', desc: 'Order status change par notification' },
                  { key: 'broadcast', label: 'Broadcast Complete', desc: 'Broadcast complete hone par' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Other Notifications</h4>
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Email par bhi notifications bhejein' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'SMS par bhi notifications bhejein' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleNotificationsSave} disabled={isSaving} className="gap-2">
                {savedTab === 'notifications' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : savedTab === 'notifications' ? 'Saved!' : 'Save Notifications'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>App ki language select karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { code: 'en', flag: '🇬🇧', name: 'English', desc: 'English Language' },
                  { code: 'ur', flag: '🇵🇰', name: 'Roman Urdu', desc: 'Roman Urdu Mein' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                      language === lang.code ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                      {lang.flag}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{lang.name}</p>
                      <p className="text-sm text-muted-foreground">{lang.desc}</p>
                    </div>
                    {language === lang.code && <Check className="ml-auto h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
              <Button onClick={handleLanguageSave} disabled={isSaving} className="gap-2">
                {savedTab === 'language' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : savedTab === 'language' ? 'Saved!' : 'Save Language'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Apni shop ke timing set karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Open Time</Label>
                  <Input type="time" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Close Time</Label>
                  <Input type="time" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        hours.days.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleHoursSave} disabled={isSaving} className="gap-2">
                {savedTab === 'hours' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : savedTab === 'hours' ? 'Saved!' : 'Save Hours'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Apna plan aur payment manage karein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge className="mb-2 bg-primary text-primary-foreground">Current Plan</Badge>
                    <h3 className="text-2xl font-bold">{currentPlan?.name || 'Free'} Plan</h3>
                    <p className="text-muted-foreground">
                      Rs. {currentPlan?.price || 0}/month
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Plan Expiry</p>
                    <p className="font-semibold">
                      {subscription?.ends_at
                        ? new Date(subscription.ends_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentPlan?.features?.map((feature: string, idx: number) => (
                    <Badge key={idx} variant="outline">{feature}</Badge>
                  )) || (
                    <>
                      <Badge variant="outline">100 Messages/day</Badge>
                      <Badge variant="outline">2 Templates</Badge>
                      <Badge variant="outline">Basic Analytics</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Update Plan Button */}
              <div className="flex justify-end">
                <Button onClick={() => router.push('/dashboard/plans')}>
                  Update Plan
                </Button>
              </div>

              {/* Payment History (placeholder) */}
              <div>
                <h4 className="mb-4 font-semibold">Payment History</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="font-medium">{currentPlan?.name || 'Free'} Plan</p>
                      <p className="text-sm text-muted-foreground">Auto-renewal</p>
                    </div>
                    <p className="font-semibold">Rs. {currentPlan?.price || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}