// app/dashboard/broadcasts/page.tsx
'use client'

import { useState } from 'react'
import { useBroadcasts } from '@/hooks/useBroadcasts'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Search, Plus, MoreVertical, Eye, Trash2, Send, Clock, Users,
  CheckCheck, MessageSquare, AlertCircle, Megaphone, Calendar, Loader2, X
} from 'lucide-react'
import { format } from 'date-fns'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function BroadcastPage() {
  const { campaigns, loading, createCampaign, sendCampaign, cancelCampaign, deleteCampaign } = useBroadcasts()
  const { customers } = useCustomers()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    audienceType: 'all' as 'all' | 'vip' | 'new' | 'custom',
    selectedCustomers: [] as string[],
    scheduleType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
  })

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getAudienceCount = () => {
    switch (formData.audienceType) {
      case 'all': return customers.length
      case 'vip': return customers.filter(c => c.tags?.includes('VIP')).length
      case 'new': return customers.filter(c => c.tags?.includes('New')).length
      case 'custom': return formData.selectedCustomers.length
      default: return 0
    }
  }

  const buildFilters = () => {
    const filters: any = {}
    if (formData.audienceType === 'vip') filters.tags = ['VIP']
    if (formData.audienceType === 'new') filters.tags = ['New']
    if (formData.audienceType === 'custom') {
      // For custom, we'll handle separately in backend
    }
    return filters
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Campaign name zaruri hai')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Message zaruri hai')
      return
    }

    setSubmitting(true)

    let scheduledAt = undefined
    if (formData.scheduleType === 'scheduled' && formData.scheduledDate && formData.scheduledTime) {
      scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
    }

    const result = await createCampaign({
      name: formData.name,
      content: formData.content,
      filters: buildFilters(),
      scheduled_at: scheduledAt
    })

    setSubmitting(false)

    if (result.success) {
      toast.success(scheduledAt ? 'Campaign scheduled!' : 'Campaign created and sending!')
      setIsAddDialogOpen(false)
      resetForm()
    } else {
      const errors = result.errors
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(Array.isArray(err) ? err[0] : err)
        })
      } else {
        toast.error('Failed to create campaign')
      }
    }
  }

  const handleSendNow = async (campaign: any) => {
    const result = await sendCampaign(campaign.id)
    if (result.success) {
      toast.success('Campaign sending started!')
    } else {
      toast.error(result.error || 'Failed to send')
    }
  }

  const handleCancel = async (campaign: any) => {
    const result = await cancelCampaign(campaign.id)
    if (result.success) {
      toast.success('Campaign cancelled!')
    } else {
      toast.error(result.error || 'Failed to cancel')
    }
  }

  const handleDelete = async () => {
    if (!selectedCampaign) return
    const result = await deleteCampaign(selectedCampaign.id)
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setSelectedCampaign(null)
      toast.success('Campaign deleted!')
    } else {
      toast.error('Delete failed')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      audienceType: 'all',
      selectedCustomers: [],
      scheduleType: 'now',
      scheduledDate: '',
      scheduledTime: '',
    })
  }

  // Stats
  const totalCampaigns = campaigns.length
  const totalDelivered = campaigns.reduce((sum, b) => sum + (b.delivered_count || 0), 0)
  const totalRead = campaigns.reduce((sum, b) => sum + (b.read_count || 0), 0)
  const totalReplied = campaigns.reduce((sum, b) => sum + (b.replied_count || 0), 0)

  if (loading && campaigns.length === 0) {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Broadcasts</h1>
          <p className="text-muted-foreground">Customers ko bulk messages bhejein</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Broadcast
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
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-xl font-bold">{totalCampaigns}</p>
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
                <p className="text-sm text-muted-foreground">Delivered</p>
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
                <p className="text-sm text-muted-foreground">Read</p>
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
                <p className="text-sm text-muted-foreground">Replied</p>
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
                placeholder="Campaign dhoondhein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid gap-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="py-12 text-center border-dashed">
            <CardContent>
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Koi campaign nahi</h3>
              <p className="text-sm text-muted-foreground">Apna pehla broadcast create karein</p>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.content}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.total_recipients} audience</span>
                      </span>
                      {campaign.status === 'sent' && (
                        <>
                          <span className="flex items-center gap-1 text-green-600">
                            <Send className="h-4 w-4" />
                            <span>{campaign.sent_count}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <CheckCheck className="h-4 w-4" />
                            <span>{campaign.read_count}</span>
                          </span>
                          <span className="flex items-center gap-1 text-purple-600">
                            <MessageSquare className="h-4 w-4" />
                            <span>{campaign.replied_count}</span>
                          </span>
                          {campaign.failed_count > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>{campaign.failed_count}</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {campaign.scheduled_at ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Scheduled: {format(new Date(campaign.scheduled_at), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      ) : campaign.started_at ? (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>Started: {format(new Date(campaign.started_at), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>Created: {format(new Date(campaign.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleSendNow(campaign)} className="gap-1">
                        <Send className="h-4 w-4" />
                        Send Now
                      </Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => handleCancel(campaign)} className="gap-1">
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedCampaign(campaign); setIsViewDialogOpen(true) }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { setSelectedCampaign(campaign); setIsDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Create Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Broadcast Campaign</DialogTitle>
            <DialogDescription>Customers ko bulk message bhejein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Eid Sale Announcement"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Apna message yahan likhein..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">{formData.content.length}/4096 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={formData.audienceType}
                onValueChange={(value: any) => setFormData({ ...formData, audienceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sab Customers ({customers.length})</SelectItem>
                  <SelectItem value="vip">VIP Customers ({customers.filter(c => c.tags?.includes('VIP')).length})</SelectItem>
                  <SelectItem value="new">New Customers ({customers.filter(c => c.tags?.includes('New')).length})</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{getAudienceCount()} customers ko message jayega</p>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={formData.scheduleType}
                onValueChange={(value: any) => setFormData({ ...formData, scheduleType: value })}
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.content || getAudienceCount() === 0}
              className="gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {formData.scheduleType === 'now' ? 'Send Now' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            <DialogDescription>Campaign Details</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <Badge className={statusColors[selectedCampaign.status]}>{selectedCampaign.status}</Badge>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{selectedCampaign.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-lg font-bold">{selectedCampaign.total_recipients}</p>
                  <p className="text-xs text-muted-foreground">Audience</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Send className="mx-auto h-5 w-5 text-green-600" />
                  <p className="mt-1 text-lg font-bold">{selectedCampaign.sent_count}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <CheckCheck className="mx-auto h-5 w-5 text-blue-600" />
                  <p className="mt-1 text-lg font-bold">{selectedCampaign.read_count}</p>
                  <p className="text-xs text-muted-foreground">Read</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <MessageSquare className="mx-auto h-5 w-5 text-purple-600" />
                  <p className="mt-1 text-lg font-bold">{selectedCampaign.replied_count}</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
              </div>
              {selectedCampaign.failed_count > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{selectedCampaign.failed_count} messages failed</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
            <DialogDescription>Kya aap yaqeen se ye campaign delete karna chahte hain?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}