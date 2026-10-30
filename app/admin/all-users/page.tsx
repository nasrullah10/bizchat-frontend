'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { apiGet } from '@/lib/api'
import {
  Users, Search, Shield, UserCheck, UserCog, Eye,
  Loader2, Crown, Briefcase, Headphones, Glasses,
} from 'lucide-react'

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <Crown className="h-4 w-4 text-purple-500" />,
  business_owner: <Briefcase className="h-4 w-4 text-blue-500" />,
  admin: <Shield className="h-4 w-4 text-green-500" />,
  manager: <UserCog className="h-4 w-4 text-orange-500" />,
  support: <Headphones className="h-4 w-4 text-yellow-500" />,
  viewer: <Glasses className="h-4 w-4 text-gray-500" />,
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  business_owner: 'bg-blue-100 text-blue-800',
  admin: 'bg-green-100 text-green-800',
  manager: 'bg-orange-100 text-orange-800',
  support: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800',
}

export default function AdminAllUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, search])

  const fetchUsers = async () => {
    try {
      let url = '/admin/all-users?'
      if (search) url += `search=${encodeURIComponent(search)}&`
      if (roleFilter !== 'all') url += `role=${roleFilter}&`

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
          <h1 className="text-2xl font-bold">All Users</h1>
          <p className="text-muted-foreground">Everyone on the platform</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {['super_admin', 'business_owner', 'admin', 'manager', 'support', 'viewer'].map((role) => (
          <Card key={role} className="cursor-pointer hover:shadow-md" onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {roleIcons[role]}
                <div>
                  <p className="text-xs text-muted-foreground capitalize">{role.replace('_', ' ')}</p>
                  <p className="text-xl font-bold">{users.filter(u => u.role === role).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium">User</th>
              <th className="p-3 text-left font-medium">Role</th>
              <th className="p-3 text-left font-medium">Business</th>
              <th className="p-3 text-left font-medium">Parent</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/50">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {roleIcons[user.role]}
                    <Badge className={roleColors[user.role] || 'bg-gray-100'}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </td>
                <td className="p-3">{user.business_name || '-'}</td>
                <td className="p-3">
                  {user.parent_user ? (
                    <span className="text-sm">{user.parent_user.name}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3">
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}