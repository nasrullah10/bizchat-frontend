// app/dashboard/support/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Ticket {
  id: number
  ticket_number: string
  subject: string
  category: string
  priority: string
  status: string
  created_at: string
  last_reply?: {
    message: string
    created_at: string
    is_admin_reply: boolean
  }
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const result = await apiGet('/support/tickets')
      if (result.success) {
        setTickets(result.data)
      }
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Subject and description required')
      return
    }

    try {
      const result = await apiPost('/support/tickets', formData)
      if (result.success) {
        toast.success('Ticket created!')
        setIsCreateOpen(false)
        setFormData({ subject: '', description: '', category: 'technical', priority: 'medium' })
        fetchTickets()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket')
    }
  }

  const openTicket = async (ticket: Ticket) => {
    try {
      const result = await apiGet(`/support/tickets/${ticket.id}`)
      if (result.success) {
        setSelectedTicket(result.data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      toast.error('Failed to load ticket')
    }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return

    try {
      const result = await apiPost(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyText,
      })
      if (result.success) {
        toast.success('Reply sent!')
        setReplyText('')
        // Refresh ticket
        const refreshed = await apiGet(`/support/tickets/${selectedTicket.id}`)
        setSelectedTicket(refreshed.data)
      }
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority] || 'bg-gray-100'
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Help & Support</h1>
          <p className="text-muted-foreground">Apni complaints ya queries submit karein</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Koi ticket nahi</h3>
            <p className="text-sm text-muted-foreground">Apni pehli support ticket create karein</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicket(ticket)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{ticket.ticket_number}</span>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{ticket.category.replace('_', ' ')}</p>
                    {ticket.last_reply && (
                      <p className="text-xs text-muted-foreground">
                        Last reply: {ticket.last_reply.is_admin_reply ? 'Admin' : 'You'} - {new Date(ticket.last_reply.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
            <DialogDescription>Apni problem describe karein</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., WhatsApp not connecting"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Apni problem detail mein bataein..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Submit Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                <DialogDescription>
                  {selectedTicket.ticket_number} | {selectedTicket.category.replace('_', ' ')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                </div>

                {/* Replies */}
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {selectedTicket.replies?.map((reply: any) => (
                    <div key={reply.id} className={`flex gap-3 ${reply.is_admin_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`rounded-lg p-3 max-w-[80%] ${
                        reply.is_admin_reply 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm font-medium mb-1">
                          {reply.is_admin_reply ? 'Support Team' : 'You'}
                        </p>
                        <p className="text-sm">{reply.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                {selectedTicket.status !== 'closed' && (
                  <div className="flex gap-2">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Apna message likhein..."
                      onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    />
                    <Button onClick={sendReply}>Send</Button>
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