'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import {
  Users, Search, Building2, Phone, Mail, Calendar,
  CheckCircle, XCircle, AlertCircle, Loader2, Eye,
  TrendingUp, CreditCard, UserPlus,
} from 'lucide-react'

interface BusinessOwner {
  id: number
  name: string
  business_name: string
  email: string
  phone: string
  status: string
  plan?: { name: string; is_free: boolean }
  subscription?: { ends_at: string; status: string }
  teamMembersCount: number
  customersCount: number
  created_at: string
  last_login_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BusinessOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filter, search])

  const fetchUsers = async () => {
    try {
      let url = '/admin/users?'
      if (search) url += `search=${encodeURIComponent(search)}&`
      if (filter !== 'all') url += `status=${filter}&`

      const result = await apiGet(url)
      if (result.success) {
        setUsers(result.data.data || [])
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const viewUser = async (userId: number) => {
    try {
      const result = await apiGet(`/admin/users/${userId}`)
      if (result.success) {
        setSelectedUser(result.data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      toast.error('Failed to load user details')
    }
  }

  const updateStatus = async (userId: number, status: string) => {
    try {
      await apiPost(`/admin/users/${userId}/status`, { status })
      toast.success(`User status updated to ${status}`)
      fetchUsers()
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status })
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100'
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
          <h1 className="text-2xl font-bold">Business Owners</h1>
          <p className="text-muted-foreground">Manage all registered businesses</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, business, email..."
              className="pl-10 w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Paid Plans</p>
                <p className="text-xl font-bold">{users.filter(u => !u.plan?.is_free).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">With Team</p>
                <p className="text-xl font-bold">{users.filter(u => (u.teamMembersCount || 0) > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'inactive', 'suspended'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium">Business</th>
              <th className="p-3 text-left font-medium">Contact</th>
              <th className="p-3 text-left font-medium">Plan</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Team</th>
              <th className="p-3 text-left font-medium">Joined</th>
              <th className="p-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/50">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{user.business_name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3" /> {user.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" /> {user.phone}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <Badge variant={user.plan?.is_free ? 'secondary' : 'default'} className="text-xs">
                      {user.plan?.name || 'Free'}
                    </Badge>
                    {user.subscription && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Exp: {new Date(user.subscription.ends_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{user.team_members_count || 0}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Button size="sm" variant="ghost" onClick={() => viewUser(user.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedUser.business_name || selectedUser.name}</DialogTitle>
                <DialogDescription>Business Owner Details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Basic Info */}
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Business Type</p>
                        <p className="font-medium">{selectedUser.business_type || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Plan Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Plan</p>
                        <p className="font-medium">{selectedUser.plan?.name || 'Free'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={getStatusBadge(selectedUser.status)}>{selectedUser.status}</Badge>
                      </div>
                      {selectedUser.subscription && (
                        <>
                          <div>
                            <p className="text-xs text-muted-foreground">Trial</p>
                            <p className="font-medium">{selectedUser.subscription.is_trial ? 'Yes' : 'No'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className="font-medium">{new Date(selectedUser.subscription.ends_at).toLocaleDateString()}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <p className="text-2xl font-bold">{selectedUser.team_members?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Team Members</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
                      <p className="text-2xl font-bold">{selectedUser.customers?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Customers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                      <p className="text-2xl font-bold">{selectedUser.orders?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => updateStatus(selectedUser.id, 'active')}
                    disabled={selectedUser.status === 'active'}
                  >
                    <CheckCircle className="h-4 w-4" /> Activate
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => updateStatus(selectedUser.id, 'inactive')}
                    disabled={selectedUser.status === 'inactive'}
                  >
                    <XCircle className="h-4 w-4" /> Deactivate
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => updateStatus(selectedUser.id, 'suspended')}
                    disabled={selectedUser.status === 'suspended'}
                  >
                    <AlertCircle className="h-4 w-4" /> Suspend
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}