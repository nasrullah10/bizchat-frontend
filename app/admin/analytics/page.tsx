'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiGet } from '@/lib/api'
import {
  TrendingUp, Users, CreditCard, Activity,
  Calendar, ArrowUpRight, ArrowDownRight,
  Loader2,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      const result = await apiGet(`/admin/analytics?days=${days}`)
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform performance overview</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90, 365].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d === 365 ? '1 Year' : `${d} Days`}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{data?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">{data?.activeUsers || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">PKR {data?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Revenue/User</p>
                <p className="text-3xl font-bold">
                  PKR {data?.totalUsers ? Math.round((data.totalRevenue || 0) / data.totalUsers).toLocaleString() : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder - You can add recharts here */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              New Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.signups?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
            ) : (
              <div className="space-y-2">
                {data?.signups?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.count} users</Badge>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.revenue?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
            ) : (
              <div className="space-y-2">
                {data?.revenue?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">PKR {item.total}</Badge>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Support Tickets by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {data?.ticketsByStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                <div className={`h-3 w-3 rounded-full ${
                  item.status === 'open' ? 'bg-yellow-500' :
                  item.status === 'resolved' ? 'bg-green-500' :
                  item.status === 'closed' ? 'bg-gray-500' :
                  'bg-blue-500'
                }`} />
                <span className="text-sm font-medium capitalize">{item.status.replace('_', ' ')}</span>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}