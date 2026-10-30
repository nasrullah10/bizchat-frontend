'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiGet } from '@/lib/api'
import { toast } from 'sonner'
import {
  Users, Ticket, CreditCard, TrendingUp,
  AlertCircle, CheckCircle, Clock, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ticketsRes, usersRes] = await Promise.all([
        apiGet('/admin/stats'),
        apiGet('/admin/support/tickets?status=open&limit=5'),
        apiGet('/admin/users?limit=5'),
      ])

      if (statsRes.success) setStats(statsRes.data)
      if (ticketsRes.success) setRecentTickets(ticketsRes.data.data || [])
      if (usersRes.success) setRecentUsers(usersRes.data.data || [])
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Business Owners</p>
                <p className="text-3xl font-bold">{stats?.totalBusinessOwners || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Team Members</p>
                <p className="text-3xl font-bold">{stats?.totalTeamMembers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-3xl font-bold">{stats?.openTickets || 0}</p>
              </div>
              <Ticket className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold">PKR {stats?.monthlyRevenue?.toLocaleString() || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets & Users */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Support Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Recent Support Tickets
            </CardTitle>
            <Link href="/admin/support">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No open tickets</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</span>
                        <Badge className={
                          ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }>{ticket.priority}</Badge>
                      </div>
                      <p className="text-sm font-medium mt-1">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user?.business_name}</p>
                    </div>
                    <Badge className={
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>{ticket.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Recent Business Owners
            </CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{user.business_name || user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email} | {user.phone}</p>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/support">
            <Button variant="outline" className="gap-2">
              <Ticket className="h-4 w-4" />
              Manage Tickets
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/plans">
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Manage Plans
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}