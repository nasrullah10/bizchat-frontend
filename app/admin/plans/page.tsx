'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api'
import {
  CreditCard, Plus, Loader2, Check, X, Star, DollarSign,
  Users, TrendingUp, Package,
} from 'lucide-react'

interface Plan {
  id: number
  name: string
  slug: string
  price: number
  description: string
  features: string[]
  is_free: boolean
  is_popular: boolean
  status: string
  created_at: string
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    features: '',
    is_free: false,
    is_popular: false,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const result = await apiGet('/admin/plans')
      if (result.success) {
        setPlans(result.data)
      }
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const result = await apiPost('/admin/plans', {
        ...formData,
        price: parseFloat(formData.price) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      })
      if (result.success) {
        toast.success('Plan created!')
        setIsCreateOpen(false)
        resetForm()
        fetchPlans()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan')
    }
  }

  const handleUpdate = async () => {
    if (!editingPlan) return
    try {
      const result = await apiPost(`/admin/plans/${editingPlan.id}`, {
        ...formData,
        price: parseFloat(formData.price) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      })
      if (result.success) {
        toast.success('Plan updated!')
        setEditingPlan(null)
        fetchPlans()
      }
    } catch (error) {
      toast.error('Failed to update plan')
    }
  }

  const editPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price.toString(),
      description: plan.description || '',
      features: plan.features?.join(', ') || '',
      is_free: plan.is_free,
      is_popular: plan.is_popular,
    })
  }

  const resetForm = () => {
    setFormData({
      name: '', slug: '', price: '', description: '',
      features: '', is_free: false, is_popular: false,
    })
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
          <h1 className="text-2xl font-bold">Plans & Billing</h1>
          <p className="text-muted-foreground">Manage subscription plans</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.is_popular ? 'border-primary border-2' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.is_popular && <Badge><Star className="h-3 w-3 mr-1" /> Popular</Badge>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">PKR {plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              
              <div className="space-y-2">
                {plan.features?.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {plan.is_free ? 'Free' : 'Paid'}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  Active users
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => editPlan(plan)}>
                Edit Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingPlan} onOpenChange={(v) => {
        if (!v) { setIsCreateOpen(false); setEditingPlan(null); }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>Configure plan details and pricing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Pro" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g., pro" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (PKR)</label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Plan description" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Features (comma separated)</label>
              <Input value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="WhatsApp API, Auto-replies, Analytics" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_free} onCheckedChange={(v) => setFormData({ ...formData, is_free: v })} />
                <label className="text-sm">Free Plan</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_popular} onCheckedChange={(v) => setFormData({ ...formData, is_popular: v })} />
                <label className="text-sm">Popular</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingPlan(null); }}>Cancel</Button>
            <Button onClick={editingPlan ? handleUpdate : handleCreate}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}