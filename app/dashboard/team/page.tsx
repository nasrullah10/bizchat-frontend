// app/dashboard/team/page.tsx
'use client'

import { useState } from 'react'
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Plus, MoreVertical, Edit, Trash2, UserPlus, Shield, Users, Mail,
  Clock, Loader2, Power, PowerOff, Eye, EyeOff
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const roleColors: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  support: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800',
}

const roleDescriptions: Record<string, string> = {
  admin: 'Full access to everything',
  manager: 'Manage customers, orders, and templates',
  support: 'View and reply to messages only',
  viewer: 'View-only access to dashboard',
}

export default function TeamPage() {
  const { members, stats, loading, createMember, updateMember, toggleMemberStatus, deleteMember } = useTeamMembers()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'support' as string,
    password: '',
    can_send_messages: true,
    can_manage_orders: false,
    can_manage_customers: false,
    can_broadcast: false,
    can_view_analytics: false,
  })

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Name, email, and password zaruri hain')
      return
    }

    setSubmitting(true)
    const result = await createMember({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      password: formData.password,
      can_send_messages: formData.can_send_messages,
      can_manage_orders: formData.can_manage_orders,
      can_manage_customers: formData.can_manage_customers,
      can_broadcast: formData.can_broadcast,
      can_view_analytics: formData.can_view_analytics,
    })
    setSubmitting(false)

    if (result.success) {
      toast.success('Team member added!')
      setIsAddDialogOpen(false)
      resetForm()
    } else {
      const errors = result.errors
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(Array.isArray(err) ? err[0] : err)
        })
      } else {
        toast.error('Failed to add member')
      }
    }
  }

  const handleUpdate = async () => {
    if (!selectedMember) return

    setSubmitting(true)
    const result = await updateMember(selectedMember.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      can_send_messages: formData.can_send_messages,
      can_manage_orders: formData.can_manage_orders,
      can_manage_customers: formData.can_manage_customers,
      can_broadcast: formData.can_broadcast,
      can_view_analytics: formData.can_view_analytics,
    })
    setSubmitting(false)

    if (result.success) {
      toast.success('Member updated!')
      setIsEditDialogOpen(false)
      setSelectedMember(null)
      resetForm()
    } else {
      toast.error(result.error || 'Update failed')
    }
  }

  const handleToggleStatus = async (member: TeamMember) => {
    const result = await toggleMemberStatus(member.id)
    if (result.success) {
      toast.success(`Member ${result.data.status === 'active' ? 'activated' : 'deactivated'}!`)
    } else {
      toast.error(result.error || 'Status toggle failed')
    }
  }

  const handleDelete = async () => {
    if (!selectedMember) return
    const result = await deleteMember(selectedMember.id)
    if (result.success) {
      toast.success('Member removed!')
      setIsDeleteDialogOpen(false)
      setSelectedMember(null)
    } else {
      toast.error('Delete failed')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'support',
      password: '',
      can_send_messages: true,
      can_manage_orders: false,
      can_manage_customers: false,
      can_broadcast: false,
      can_view_analytics: false,
    })
  }

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      password: '',
      can_send_messages: member.can_send_messages,
      can_manage_orders: member.can_manage_orders,
      can_manage_customers: member.can_manage_customers,
      can_broadcast: member.can_broadcast,
      can_view_analytics: member.can_view_analytics,
    })
    setIsEditDialogOpen(true)
  }

  if (loading && members.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Team</h1>
          <p className="text-muted-foreground">Apni team manage karein</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-xl font-bold">{stats?.total_members || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Power className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{stats?.active_members || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">{stats?.admin_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-xl font-bold">{stats?.manager_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Sab team members ki list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Koi member nahi</h3>
                <p className="text-sm text-muted-foreground">Apna pehla team member add karein</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{member.name}</h3>
                        <Badge className={roleColors[member.role] || ''}>{member.role}</Badge>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                        {member.last_login_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Active {formatDistanceToNow(new Date(member.last_login_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {/* Permissions Tags */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.can_send_messages && <Badge variant="outline" className="text-xs">Messages</Badge>}
                        {member.can_manage_orders && <Badge variant="outline" className="text-xs">Orders</Badge>}
                        {member.can_manage_customers && <Badge variant="outline" className="text-xs">Customers</Badge>}
                        {member.can_broadcast && <Badge variant="outline" className="text-xs">Broadcast</Badge>}
                        {member.can_view_analytics && <Badge variant="outline" className="text-xs">Analytics</Badge>}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                        {member.status === 'active' ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4 text-green-500" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(member)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roles Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Har role ke permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="rounded-lg border p-4">
                <Badge className={roleColors[role] || ''}>{role}</Badge>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Naya team member add karein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Member ka naam"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{roleDescriptions[formData.role]}</p>
            </div>

            {/* Permissions */}
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="font-semibold">Permissions</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Send Messages</span>
                <Switch
                  checked={formData.can_send_messages}
                  onCheckedChange={(v) => setFormData({ ...formData, can_send_messages: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manage Orders</span>
                <Switch
                  checked={formData.can_manage_orders}
                  onCheckedChange={(v) => setFormData({ ...formData, can_manage_orders: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manage Customers</span>
                <Switch
                  checked={formData.can_manage_customers}
                  onCheckedChange={(v) => setFormData({ ...formData, can_manage_customers: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Broadcast</span>
                <Switch
                  checked={formData.can_broadcast}
                  onCheckedChange={(v) => setFormData({ ...formData, can_broadcast: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">View Analytics</span>
                <Switch
                  checked={formData.can_view_analytics}
                  onCheckedChange={(v) => setFormData({ ...formData, can_view_analytics: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Member ki details update karein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="font-semibold">Permissions</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Send Messages</span>
                <Switch
                  checked={formData.can_send_messages}
                  onCheckedChange={(v) => setFormData({ ...formData, can_send_messages: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manage Orders</span>
                <Switch
                  checked={formData.can_manage_orders}
                  onCheckedChange={(v) => setFormData({ ...formData, can_manage_orders: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manage Customers</span>
                <Switch
                  checked={formData.can_manage_customers}
                  onCheckedChange={(v) => setFormData({ ...formData, can_manage_customers: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Broadcast</span>
                <Switch
                  checked={formData.can_broadcast}
                  onCheckedChange={(v) => setFormData({ ...formData, can_broadcast: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">View Analytics</span>
                <Switch
                  checked={formData.can_view_analytics}
                  onCheckedChange={(v) => setFormData({ ...formData, can_view_analytics: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member?</DialogTitle>
            <DialogDescription>
              Kya aap yaqeen se <strong>{selectedMember?.name}</strong> ko remove karna chahte hain?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}