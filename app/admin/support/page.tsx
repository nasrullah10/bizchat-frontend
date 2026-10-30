'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import {
  Loader2, Ticket, AlertTriangle, UserCheck, MessageSquare,
  CheckCircle, XCircle, Clock, Send,
} from 'lucide-react'

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyStatus, setReplyStatus] = useState('')

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [filter])

  const fetchTickets = async () => {
    try {
      const url = filter === 'all' 
        ? '/admin/support/tickets' 
        : `/admin/support/tickets?status=${filter}`
      const result = await apiGet(url)
      if (result.success) {
        setTickets(result.data.data || result.data)
      }
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await apiGet('/admin/support/stats')
      if (result.success) setStats(result.data)
    } catch (error) {
      console.error(error)
    }
  }

  const openTicket = async (ticket: any) => {
    try {
      const result = await apiGet(`/admin/support/tickets/${ticket.id}`)
      if (result.success) {
        setSelectedTicket(result.data)
        setReplyStatus(result.data.status)
        setIsDetailOpen(true)
      }
    } catch (error) {
      toast.error('Failed to load ticket')
    }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return

    try {
      const result = await apiPost(`/admin/support/tickets/${selectedTicket.id}/reply`, {
        message: replyText,
        status: replyStatus !== selectedTicket.status ? replyStatus : undefined,
      })
      if (result.success) {
        toast.success('Reply sent!')
        setReplyText('')
        // Refresh
        const refreshed = await apiGet(`/admin/support/tickets/${selectedTicket.id}`)
        setSelectedTicket(refreshed.data)
        fetchStats()
      }
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const assignToMe = async (ticketId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await apiPost(`/admin/support/tickets/${ticketId}/assign`, {
        assigned_to: user.id,
      })
      toast.success('Assigned to you!')
      fetchTickets()
    } catch (error) {
      toast.error('Failed to assign')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Ticket className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer complaints and queries</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-yellow-600">Open</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-blue-600">In Progress</p>
              <p className="text-2xl font-bold">{stats.in_progress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-green-600">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-red-600">Urgent</p>
              <p className="text-2xl font-bold">{stats.urgent}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'open', 'in_progress', 'resolved', 'closed', 'unassigned'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'unassigned' ? 'Unassigned' : f.replace('_', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium">Ticket #</th>
              <th className="p-3 text-left font-medium">Business</th>
              <th className="p-3 text-left font-medium">Subject</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-left font-medium">Priority</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Assigned</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => openTicket(ticket)}
              >
                <td className="p-3 font-mono text-xs">{ticket.ticket_number}</td>
                <td className="p-3">
                  <div>
                    <p className="font-medium">{ticket.user?.business_name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{ticket.user?.name}</p>
                  </div>
                </td>
                <td className="p-3 max-w-xs">
                  <p className="truncate font-medium">{ticket.subject}</p>
                </td>
                <td className="p-3 capitalize">{ticket.category.replace('_', ' ')}</td>
                <td className="p-3">
                  <Badge className={
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>{ticket.priority}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(ticket.status)}
                    <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="p-3">
                  {ticket.assigned_admin ? (
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-green-500" />
                      <span>{ticket.assigned_admin.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Unassigned</span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {!ticket.assigned_to && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => assignToMe(ticket.id, e)}
                    >
                      Assign
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  {selectedTicket.subject}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Ticket Info */}
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedTicket.ticket_number}</Badge>
                    <Badge className={
                      selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }>{selectedTicket.priority}</Badge>
                    <Badge className={
                      selectedTicket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }>{selectedTicket.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm"><span className="font-medium">Business:</span> {selectedTicket.user?.business_name}</p>
                  <p className="text-sm"><span className="font-medium">User:</span> {selectedTicket.user?.name} ({selectedTicket.user?.email})</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedTicket.user?.phone}</p>
                  <p className="text-sm"><span className="font-medium">Category:</span> {selectedTicket.category.replace('_', ' ')}</p>
                </div>

                {/* Conversation */}
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Conversation</h3>
                  {selectedTicket.replies?.map((reply: any) => (
                    <div key={reply.id} className={`flex gap-3 ${reply.is_admin_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`rounded-lg p-3 max-w-[80%] ${
                        reply.is_admin_reply 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {reply.is_admin_reply ? 'Support Team (You)' : reply.user?.name}
                        </p>
                        <p className="text-sm">{reply.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <div className="space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                    />
                    <div className="flex items-center gap-3">
                      <Select value={replyStatus} onValueChange={setReplyStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={sendReply} className="gap-2">
                        <Send className="h-4 w-4" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}