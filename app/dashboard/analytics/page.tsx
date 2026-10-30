'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import {
  MessageSquare,
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCheck,
  Send,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data for charts
const messageData = [
  { day: 'Mon', sent: 120, received: 89 },
  { day: 'Tue', sent: 145, received: 112 },
  { day: 'Wed', sent: 167, received: 134 },
  { day: 'Thu', sent: 189, received: 156 },
  { day: 'Fri', sent: 234, received: 198 },
  { day: 'Sat', sent: 278, received: 223 },
  { day: 'Sun', sent: 156, received: 98 },
]

const customerGrowthData = [
  { month: 'Jan', customers: 120 },
  { month: 'Feb', customers: 145 },
  { month: 'Mar', customers: 178 },
  { month: 'Apr', customers: 234 },
  { month: 'May', customers: 289 },
  { month: 'Jun', customers: 345 },
]

const orderData = [
  { month: 'Jan', orders: 45, revenue: 125000 },
  { month: 'Feb', orders: 52, revenue: 145000 },
  { month: 'Mar', orders: 67, revenue: 189000 },
  { month: 'Apr', orders: 78, revenue: 234000 },
  { month: 'May', orders: 89, revenue: 278000 },
  { month: 'Jun', orders: 98, revenue: 312000 },
]

const responseTimeData = [
  { name: '<1 min', value: 45, color: '#22c55e' },
  { name: '1-5 min', value: 30, color: '#3b82f6' },
  { name: '5-15 min', value: 15, color: '#f59e0b' },
  { name: '>15 min', value: 10, color: '#ef4444' },
]

export default function AnalyticsPage() {
  const { templates, orders, customers, broadcasts, t } = useAppStore()
  const [timeRange, setTimeRange] = useState('7d')

  // Calculate stats
  const totalMessages = 1289
  const totalCustomers = customers.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const avgResponseTime = '2.5 min'
  const responseRate = 94

  // Top templates
  const topTemplates = [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('analytics')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Apni business performance track karein
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalMessages')}</p>
                <p className="text-2xl font-bold">{totalMessages.toLocaleString()}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12% vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('newCustomers')}</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+8% vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+15% vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('revenue')}</p>
                <p className="text-2xl font-bold">Rs. {(totalRevenue / 1000).toFixed(0)}K</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+22% vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Message Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('messageAnalytics')}</CardTitle>
            <CardDescription>Sent vs Received messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span>Received</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>{t('customerGrowth')}</CardTitle>
            <CardDescription>Monthly customer acquisition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Response Time */}
        <Card>
          <CardHeader>
            <CardTitle>{t('responseRate')}</CardTitle>
            <CardDescription>Response time distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={responseTimeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {responseTimeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {responseTimeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">{t('avgResponseTime')}</p>
              <p className="text-2xl font-bold text-primary">{avgResponseTime}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('orderTrends')}</CardTitle>
            <CardDescription>Orders and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders',
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span>Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Templates */}
      <Card>
        <CardHeader>
          <CardTitle>{t('topTemplates')}</CardTitle>
          <CardDescription>Sab se zyada use hone wale templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTemplates.map((template, index) => (
              <div key={template.id} className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{template.usageCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">uses</p>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(template.usageCount / topTemplates[0].usageCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCheck className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-2 text-2xl font-bold text-green-700">{responseRate}%</p>
            <p className="text-sm text-green-600">Response Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <Send className="mx-auto h-8 w-8 text-blue-600" />
            <p className="mt-2 text-2xl font-bold text-blue-700">{broadcasts.reduce((sum, b) => sum + b.delivered, 0)}</p>
            <p className="text-sm text-blue-600">Broadcasts Delivered</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-purple-600" />
            <p className="mt-2 text-2xl font-bold text-purple-700">{templates.length}</p>
            <p className="text-sm text-purple-600">Active Templates</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto h-8 w-8 text-orange-600" />
            <p className="mt-2 text-2xl font-bold text-orange-700">{avgResponseTime}</p>
            <p className="text-sm text-orange-600">Avg Response</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
