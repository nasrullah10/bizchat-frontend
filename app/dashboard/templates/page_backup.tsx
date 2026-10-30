// app/dashboard/templates/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTemplates } from '@/hooks/useTemplates'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  BarChart3,
  Clock,
  X,
  MessageSquare,
  Phone,
  Bold,
  Italic,
  Smile,
  ChevronDown,
  Bot,
  Loader2
} from 'lucide-react'

const messageVariables = [
  { key: '{{customer_name}}', label: 'Customer ka naam' },
  { key: '{{business_name}}', label: 'Aapka business' },
  { key: '{{product_list}}', label: 'Products ki list' },
  { key: '{{order_status}}', label: 'Order ka status' },
  { key: '{{payment_link}}', label: 'Payment link' },
]

const messageTypes = [
  { value: 'text', label: 'Text Only' },
  { value: 'text-image', label: 'Text + Image' },
  { value: 'text-buttons', label: 'Text + Buttons' },
  { value: 'list', label: 'List Menu' },
]

const matchTypes = [
  { value: 'contains', label: 'Contains' },
  { value: 'exact', label: 'Exact Match' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'regex', label: 'Regex' },
]

const timeConditions = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'business-hours', label: 'Business Hours' },
  { value: 'after-hours', label: 'After Hours' },
]

const customerConditions = [
  { value: 'all', label: 'Sab Customers' },
  { value: 'new', label: 'New Customers' },
  { value: 'returning', label: 'Returning Customers' },
  { value: 'vip', label: 'VIP Customers' },
]

const defaultFormData = {
  name: '',
  description: '',
  triggers: [] as string[],
  content: '',
  message_type: 'text',
  match_type: 'contains',
  buttons: [] as any[],
  conditions: {
    time: 'anytime' as string,
    customerType: 'all' as string,
  },
  priority: 5,
  is_active: true,
}

export default function TemplatesPage() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, toggleTemplate } = useTemplates()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [triggerInput, setTriggerInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.triggers.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && template.is_active) ||
      (filterStatus === 'inactive' && !template.is_active)
    return matchesSearch && matchesStatus
  })

  const openCreateModal = () => {
    setFormData(defaultFormData)
    setEditingTemplate(null)
    setShowModal(true)
  }

  const openEditModal = (template: any) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      triggers: template.triggers || [],
      content: template.content,
      message_type: template.message_type || 'text',
      match_type: template.match_type || 'contains',
      buttons: template.buttons || [],
      conditions: template.conditions || { time: 'anytime', customerType: 'all' },
      priority: template.priority,
      is_active: template.is_active,
    })
    setEditingTemplate(template)
    setShowModal(true)
  }

  const handleDuplicate = async (template: any) => {
    const result = await createTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      triggers: template.triggers,
      content: template.content,
      message_type: template.message_type,
      match_type: template.match_type,
      buttons: template.buttons,
      conditions: template.conditions,
      priority: template.priority,
      is_active: false,
    })
    
    if (result.success) {
      toast.success('Template duplicated!')
    } else {
      toast.error('Duplicate failed')
    }
  }

  const handleDelete = async (id: number) => {
    const result = await deleteTemplate(id)
    if (result.success) {
      setDeleteConfirm(null)
      toast.success('Template deleted!')
    } else {
      toast.error('Delete failed')
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const result = await toggleTemplate(id)
    if (result.success) {
      toast.success(currentStatus ? 'Template deactivated!' : 'Template activated!')
    } else {
      toast.error('Toggle failed')
    }
  }

  const addTrigger = () => {
    if (triggerInput.trim() && !formData.triggers.includes(triggerInput.trim().toLowerCase())) {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, triggerInput.trim().toLowerCase()],
      })
      setTriggerInput('')
    }
  }

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.filter((t) => t !== trigger),
    })
  }

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      content: formData.content + variable,
    })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name zaruri hai')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Message zaruri hai')
      return
    }
    if (formData.triggers.length === 0) {
      toast.error('At least 1 trigger zaruri hai')
      return
    }

    setSubmitting(true)
    
    const payload = {
      ...formData,
      content: formData.content,
      message_type: formData.message_type,
      match_type: formData.match_type,
    }

    let result
    if (editingTemplate) {
      result = await updateTemplate(editingTemplate.id, payload)
    } else {
      result = await createTemplate(payload)
    }

    setSubmitting(false)

    if (result.success) {
      toast.success(editingTemplate ? 'Template updated!' : 'Template created!')
      setShowModal(false)
    } else {
      const errors = result.errors
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(Array.isArray(err) ? err[0] : err)
        })
      } else {
        toast.error('Something went wrong')
      }
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  if (loading && templates.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Auto-Replies</h1>
          <p className="text-muted-foreground">Customer ke messages ka automatic jawab</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Naya Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Template dhoondhein..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sab</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className={cn(!template.is_active && 'opacity-60')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => handleToggleActive(template.id, template.is_active)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="outline" className="text-xs capitalize">
                  {template.match_type}
                </Badge>

                {template.triggers?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {template.triggers.map((trigger: string) => (
                      <Badge
                        key={trigger}
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {template.content}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last used: {formatTime(template.last_used_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{(template.usage_count || 0).toLocaleString()} uses</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-3">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditModal(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  Priority: {template.priority}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Koi template nahi hai</h3>
            <p className="mb-6 text-muted-foreground">
              {searchQuery ? 'Koi template nahi mila. Search change karein.' : 'Apna pehla auto-reply template banayein.'}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Pehla Template Banayein
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Template Edit Karein' : 'Naya Auto-Reply'}
            </DialogTitle>
            <DialogDescription>
              Customer ke messages ka automatic jawab set karein
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Welcome Message"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Short description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select
                value={formData.match_type}
                onValueChange={(value) => setFormData({ ...formData, match_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matchTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Keyword type karein + Enter"
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                />
                <Button type="button" onClick={addTrigger} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.triggers.map((trigger) => (
                    <Badge
                      key={trigger}
                      variant="secondary"
                      className="gap-1 bg-primary/10 text-primary"
                    >
                      {trigger}
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Examples: hi, hello, assalam, price, order
              </p>
            </div>

            <div className="space-y-2">
              <Label>Message Content *</Label>
              <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/50 p-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-border" />
                <Select onValueChange={insertVariable}>
                  <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent shadow-none">
                    <span className="text-xs">Variables</span>
                    <ChevronDown className="h-3 w-3" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageVariables.map((v) => (
                      <SelectItem key={v.key} value={v.key}>
                        <span className="font-mono text-xs">{v.key}</span>
                        <span className="ml-2 text-muted-foreground">- {v.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Assalam-o-Alaikum! Hamaray prices..."
                className="min-h-[120px] rounded-t-none"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formData.content.length}/4096 characters</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select
                value={formData.message_type}
                onValueChange={(value) => setFormData({ ...formData, message_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {messageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Time Condition</Label>
                <Select
                  value={formData.conditions.time}
                  onValueChange={(value) => setFormData({ ...formData, conditions: { ...formData.conditions, time: value } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeConditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select
                  value={formData.conditions.customerType}
                  onValueChange={(value) => setFormData({ ...formData, conditions: { ...formData.conditions, customerType: value } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customerConditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                />
                <p className="text-xs text-muted-foreground">Higher = checked first</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Template chalu hai?</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1 rounded-lg bg-card p-3 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm">
                      {formData.content || 'Your message preview will appear here...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingTemplate ? (
                'Update'
              ) : (
                'Activate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Template Delete Karein?</AlertDialogTitle>
            <AlertDialogDescription>
              Ye action undo nahi ho sakta. Template permanently delete ho jayega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}