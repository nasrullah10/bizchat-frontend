'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageCircle,
  Users,
  ShoppingBag,
  Banknote,
  TrendingUp,
  TrendingDown,
  Plus,
  Megaphone,
  FileText,
  Package,
  Eye,
  Reply,
  Phone,
  Calendar,
  ArrowRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: {
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12', iconColor)}>
            <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs sm:text-sm',
            changeType === 'positive' && 'text-primary',
            changeType === 'negative' && 'text-destructive',
            changeType === 'neutral' && 'text-muted-foreground'
          )}>
            {changeType === 'positive' && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />}
            {changeType === 'negative' && <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
            {change}
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <p className="text-2xl font-bold sm:text-3xl">{value}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Actions Bar
function QuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <Button asChild className="gap-2">
        <Link href="/dashboard/templates/new">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Naya Message</span>
          <span className="sm:hidden">Message</span>
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2">
        <Link href="/dashboard/broadcast/new">
          <Megaphone className="h-4 w-4" />
          <span className="hidden sm:inline">Broadcast Banayein</span>
          <span className="sm:hidden">Broadcast</span>
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2">
        <Link href="/dashboard/templates">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Template Jodein</span>
          <span className="sm:hidden">Template</span>
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2">
        <Link href="/dashboard/orders/new">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Order Dalein</span>
          <span className="sm:hidden">Order</span>
        </Link>
      </Button>
    </div>
  )
}

// Recent Conversations Table
function RecentConversations() {
  const { conversations } = useAppStore()
  const [filter, setFilter] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">New</Badge>
      case 'replied':
        return <Badge className="bg-primary">Replied</Badge>
      case 'order':
        return <Badge className="bg-info text-info-foreground">Order</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>
      default:
        return null
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Recent Conversations</CardTitle>
          <CardDescription>Latest customer messages</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[100px] sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Aaj</SelectItem>
              <SelectItem value="yesterday">Kal</SelectItem>
              <SelectItem value="week">Is Hafte</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/dashboard/messages" className="hidden text-sm text-primary hover:underline sm:inline">
            Sab Dekhein
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {conversations.slice(0, 5).map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:px-6 sm:py-4',
                conversation.isUnread && 'border-l-4 border-l-primary bg-primary/5'
              )}
            >
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {conversation.customerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', conversation.isUnread && 'font-semibold')}>
                    {conversation.customerName}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {conversation.customerPhone}
                  </span>
                </div>
                <p className={cn(
                  'truncate text-sm',
                  conversation.isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                  {conversation.lastMessage}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatTime(conversation.lastMessageTime)}
                </span>
                <div className="hidden sm:block">
                  {getStatusBadge(conversation.status)}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile: View All Link */}
        <div className="border-t border-border p-3 sm:hidden">
          <Link href="/dashboard/messages" className="block text-center text-sm text-primary">
            Sab Conversations Dekhein
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// WhatsApp Status Card
function WhatsAppStatusCard() {
  const { whatsappConnected, whatsappNumber, disconnectWhatsApp } = useAppStore()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="h-4 w-4" />
          WhatsApp Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {whatsappConnected ? (
          <>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Wifi className="h-5 w-5 text-primary" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-primary" />
              </div>
              <span className="font-medium text-primary">Online</span>
            </div>
            <p className="text-sm text-muted-foreground">{whatsappNumber}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1">
                <RefreshCw className="h-3 w-3" />
                Reconnect
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={disconnectWhatsApp}
              >
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Disconnected</span>
            </div>
            <p className="text-sm text-muted-foreground">WhatsApp connect nahi hai</p>
            <Button size="sm" className="w-full">
              QR Scan Karein
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Today's Performance Chart (Simplified)
function PerformanceCard() {
  const hours = ['9AM', '12PM', '3PM', '6PM', '9PM']
  const data = [30, 65, 100, 80, 45] // Percentage values
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          {"Aaj ka Performance"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hours.map((hour, i) => (
            <div key={hour} className="flex items-center gap-3">
              <span className="w-12 text-xs text-muted-foreground">{hour}</span>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${data[i]}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{data[i]}%</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sab se zyada busy: <span className="font-medium text-foreground">2 PM - 4 PM</span>
        </p>
      </CardContent>
    </Card>
  )
}

// Top Products Card
function TopProductsCard() {
  const products = [
    { name: 'Lawn Suit 3pc', percentage: 45 },
    { name: 'Kurta Shalwar', percentage: 30 },
    { name: 'Formal Shirt', percentage: 20 },
    { name: 'Other', percentage: 15 },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="h-4 w-4" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{product.name}</span>
              <span className="text-muted-foreground">{product.percentage}%</span>
            </div>
            <Progress value={product.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Quick Broadcast Card
function QuickBroadcastCard() {
  const [message, setMessage] = useState('')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4" />
          Quick Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Eid Mubarak! 20% off on all items..."
          className="min-h-[80px] resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex gap-2">
          <Button className="flex-1 gap-2" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
            Abhi Bhejein
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/broadcast/new">Schedule</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { orders, customers, conversations } = useAppStore()
  
  // Calculate stats
  const todayMessages = 1247 // Mock data
  const activeConversations = conversations.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aaj ke Messages"
          value={todayMessages.toLocaleString()}
          change="+12% kal se"
          changeType="positive"
          icon={MessageCircle}
          iconColor="bg-primary"
        />
        <StatCard
          title="Active Baatcheet"
          value={activeConversations}
          change={`+${Math.floor(activeConversations * 0.1)} new`}
          changeType="positive"
          icon={Users}
          iconColor="bg-info"
        />
        <StatCard
          title="Orders"
          value={orders.length}
          change={`Pending: ${pendingOrders}, Confirmed: ${confirmedOrders}`}
          changeType="neutral"
          icon={ShoppingBag}
          iconColor="bg-warning"
        />
        <StatCard
          title="Revenue (PKR)"
          value={`Rs. ${(totalRevenue / 1000).toFixed(0)}K`}
          change="+23% is hafte"
          changeType="positive"
          icon={Banknote}
          iconColor="bg-primary"
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Conversations */}
        <div className="lg:col-span-2">
          <RecentConversations />
        </div>

        {/* Right Column - Sidebar Cards */}
        <div className="space-y-6">
          <WhatsAppStatusCard />
          <PerformanceCard />
          <TopProductsCard />
          <QuickBroadcastCard />
        </div>
      </div>
    </div>
  )
}
