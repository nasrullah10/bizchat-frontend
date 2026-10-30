'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  Users,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  Megaphone,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
}

export default function BroadcastPage() {
  const { broadcasts, customers, addBroadcast, updateBroadcast, deleteBroadcast, t } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<typeof broadcasts[0] | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    audienceType: 'all' as 'all' | 'vip' | 'new' | 'custom',
    selectedCustomers: [] as string[],
    scheduleType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
  })

  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || broadcast.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getAudienceCount = () => {
    switch (formData.audienceType) {
      case 'all':
        return customers.length
      case 'vip':
        return customers.filter((c) => c.tags.includes('VIP')).length
      case 'new':
        return customers.filter((c) => c.tags.includes('New')).length
      case 'custom':
        return formData.selectedCustomers.length
      default:
        return 0
    }
  }

  const handleSubmit = () => {
    const audience = getAudienceCount()
    
    addBroadcast({
      name: formData.name,
      message: formData.message,
      audience,
      status: formData.scheduleType === 'now' ? 'sending' : 'scheduled',
      scheduledAt:
        formData.scheduleType === 'scheduled' && formData.scheduledDate && formData.scheduledTime
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
          : undefined,
    })
    
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleDelete = () => {
    if (!selectedBroadcast) return
    deleteBroadcast(selectedBroadcast.id)
    setIsDeleteDialogOpen(false)
    setSelectedBroadcast(null)
  }

  const handleSendNow = (broadcast: typeof broadcasts[0]) => {
    updateBroadcast(broadcast.id, {
      status: 'sending',
      sentAt: new Date().toISOString(),
    })
    // Simulate sending completion
    setTimeout(() => {
      updateBroadcast(broadcast.id, {
        status: 'sent',
        delivered: broadcast.audience - Math.floor(Math.random() * 5),
        read: Math.floor(broadcast.audience * 0.7),
        failed: Math.floor(Math.random() * 5),
        replied: Math.floor(broadcast.audience * 0.1),
      })
    }, 2000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      message: '',
      audienceType: 'all',
      selectedCustomers: [],
      scheduleType: 'now',
      scheduledDate: '',
      scheduledTime: '',
    })
  }

  // Stats
  const totalBroadcasts = broadcasts.length
  const totalDelivered = broadcasts.reduce((sum, b) => sum + b.delivered, 0)
  const totalRead = broadcasts.reduce((sum, b) => sum + b.read, 0)
  const totalReplied = broadcasts.reduce((sum, b) => sum + b.replied, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('broadcast')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Customers ko bulk messages bhejein
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('createBroadcast')}</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Broadcasts</p>
                <p className="text-xl font-bold">{totalBroadcasts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('delivered')}</p>
                <p className="text-xl font-bold">{totalDelivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('read')}</p>
                <p className="text-xl font-bold">{totalRead}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('replied')}</p>
                <p className="text-xl font-bold">{totalReplied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Broadcast dhoondhein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="scheduled">{t('scheduled')}</SelectItem>
                <SelectItem value="sending">{t('sending')}</SelectItem>
                <SelectItem value="sent">{t('sent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts List */}
      <div className="grid gap-4">
        {filteredBroadcasts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('noData')}</h3>
              <p className="text-sm text-muted-foreground">Koi broadcast nahi mila</p>
            </CardContent>
          </Card>
        ) : (
          filteredBroadcasts.map((broadcast) => (
            <Card key={broadcast.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{broadcast.name}</h3>
                      <Badge className={statusColors[broadcast.status]}>{broadcast.status}</Badge>
                    </div>

                    {/* Message Preview */}
                    <p className="line-clamp-2 text-sm text-muted-foreground">{broadcast.message}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{broadcast.audience} audience</span>
                      </span>
                      {broadcast.status === 'sent' && (
                        <>
                          <span className="flex items-center gap-1 text-green-600">
                            <Send className="h-4 w-4" />
                            <span>{broadcast.delivered}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <CheckCheck className="h-4 w-4" />
                            <span>{broadcast.read}</span>
                          </span>
                          <span className="flex items-center gap-1 text-purple-600">
                            <MessageSquare className="h-4 w-4" />
                            <span>{broadcast.replied}</span>
                          </span>
                          {broadcast.failed > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>{broadcast.failed}</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {broadcast.status === 'scheduled' && broadcast.scheduledAt ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Scheduled: {format(new Date(broadcast.scheduledAt), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      ) : broadcast.sentAt ? (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>Sent: {format(new Date(broadcast.sentAt), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>Created: {format(new Date(broadcast.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(broadcast.status === 'draft' || broadcast.status === 'scheduled') && (
                      <Button size="sm" onClick={() => handleSendNow(broadcast)} className="gap-1">
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Send Now</span>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBroadcast(broadcast)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedBroadcast(broadcast)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Broadcast Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('createBroadcast')}</DialogTitle>
            <DialogDescription>Customers ko bulk message bhejein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('broadcastName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Eid Sale Announcement"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('message')}</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Apna message yahan likhein..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">{formData.message.length}/1000 characters</p>
            </div>

            <div className="space-y-2">
              <Label>{t('audience')}</Label>
              <Select
                value={formData.audienceType}
                onValueChange={(value: typeof formData.audienceType) =>
                  setFormData({ ...formData, audienceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sab Customers ({customers.length})</SelectItem>
                  <SelectItem value="vip">VIP Customers ({customers.filter((c) => c.tags.includes('VIP')).length})</SelectItem>
                  <SelectItem value="new">New Customers ({customers.filter((c) => c.tags.includes('New')).length})</SelectItem>
                  <SelectItem value="custom">Custom Select</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getAudienceCount()} customers ko message jayega
              </p>
            </div>

            {formData.audienceType === 'custom' && (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center gap-2">
                    <Checkbox
                      id={customer.id}
                      checked={formData.selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            selectedCustomers: [...formData.selectedCustomers, customer.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            selectedCustomers: formData.selectedCustomers.filter((id) => id !== customer.id),
                          })
                        }
                      }}
                    />
                    <label htmlFor={customer.id} className="text-sm">
                      {customer.name} - {customer.phone}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Kab bhejein?</Label>
              <Select
                value={formData.scheduleType}
                onValueChange={(value: typeof formData.scheduleType) =>
                  setFormData({ ...formData, scheduleType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Abhi Bhejein</SelectItem>
                  <SelectItem value="scheduled">Schedule Karein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scheduleType === 'scheduled' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.message || getAudienceCount() === 0}
              className="gap-2"
            >
              {formData.scheduleType === 'now' ? (
                <>
                  <Send className="h-4 w-4" />
                  Send Now
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Broadcast Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBroadcast?.name}</DialogTitle>
            <DialogDescription>Broadcast Details</DialogDescription>
          </DialogHeader>
          {selectedBroadcast && (
            <div className="space-y-4">
              <Badge className={statusColors[selectedBroadcast.status]}>{selectedBroadcast.status}</Badge>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{selectedBroadcast.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-lg font-bold">{selectedBroadcast.audience}</p>
                  <p className="text-xs text-muted-foreground">Audience</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Send className="mx-auto h-5 w-5 text-green-600" />
                  <p className="mt-1 text-lg font-bold">{selectedBroadcast.delivered}</p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <CheckCheck className="mx-auto h-5 w-5 text-blue-600" />
                  <p className="mt-1 text-lg font-bold">{selectedBroadcast.read}</p>
                  <p className="text-xs text-muted-foreground">Read</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <MessageSquare className="mx-auto h-5 w-5 text-purple-600" />
                  <p className="mt-1 text-lg font-bold">{selectedBroadcast.replied}</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
              </div>

              {selectedBroadcast.failed > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{selectedBroadcast.failed} messages failed</span>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {selectedBroadcast.sentAt && (
                  <p>Sent: {format(new Date(selectedBroadcast.sentAt), 'dd MMM yyyy, hh:mm a')}</p>
                )}
                {selectedBroadcast.scheduledAt && (
                  <p>Scheduled: {format(new Date(selectedBroadcast.scheduledAt), 'dd MMM yyyy, hh:mm a')}</p>
                )}
                <p>Created: {format(new Date(selectedBroadcast.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete')} Broadcast?</DialogTitle>
            <DialogDescription>
              Kya aap yaqeen se ye broadcast delete karna chahte hain?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
