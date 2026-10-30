// app/dashboard/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useOrders, Order, OrderItem } from '@/hooks/useOrders'
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
import { toast } from 'sonner'
import {
  Search, Plus, MoreVertical, Eye, Edit, Trash2, ShoppingBag,
  Package, CreditCard, CheckCircle, MapPin, Phone, X, Loader2
} from 'lucide-react'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-600',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-blue-100 text-blue-800',
  refunded: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const { orders, stats, loading, fetchOrders, createOrder, updateOrder, deleteOrder } = useOrders()
  const { customers } = useCustomers()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    delivery_charges: 200,
    discount: 0,
    tax: 0,
    payment_method: 'cod' as string,
    payment_status: 'pending' as string,
    status: 'pending' as string,
    delivery_address: '',
    delivery_city: '',
    delivery_phone: '',
    notes: '',
  })

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    return subtotal + formData.delivery_charges + formData.tax - formData.discount
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }],
    }))
  }

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      toast.error('Customer select karein')
      return
    }
    if (formData.items.some(i => !i.name)) {
      toast.error('Sab items ka name likhein')
      return
    }

    setSubmitting(true)
    const result = await createOrder({
      customer_id: parseInt(formData.customer_id),
      items: formData.items,
      delivery_charges: formData.delivery_charges,
      discount: formData.discount,
      tax: formData.tax,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      status: formData.status,
      delivery_address: formData.delivery_address,
      delivery_city: formData.delivery_city,
      delivery_phone: formData.delivery_phone,
      notes: formData.notes,
    })
    setSubmitting(false)

    if (result.success) {
      toast.success('Order created successfully!')
      setIsAddDialogOpen(false)
      resetForm()
    } else {
      const errors = result.errors
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(Array.isArray(err) ? err[0] : err)
        })
      } else {
        toast.error('Failed to create order')
      }
    }
  }

  const handleUpdate = async () => {
    if (!selectedOrder) return

    setSubmitting(true)
    const result = await updateOrder(selectedOrder.id, {
      items: formData.items,
      delivery_charges: formData.delivery_charges,
      discount: formData.discount,
      tax: formData.tax,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      status: formData.status,
      delivery_address: formData.delivery_address,
      notes: formData.notes,
    })
    setSubmitting(false)

    if (result.success) {
      toast.success('Order updated!')
      setIsEditDialogOpen(false)
      setSelectedOrder(null)
      resetForm()
    } else {
      toast.error(result.error || 'Update failed')
    }
  }

  const handleDelete = async () => {
    if (!selectedOrder) return
    const result = await deleteOrder(selectedOrder.id)
    if (result.success) {
      toast.success('Order deleted!')
      setIsDeleteDialogOpen(false)
      setSelectedOrder(null)
    } else {
      toast.error('Delete failed')
    }
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      items: [{ name: '', quantity: 1, price: 0 }],
      delivery_charges: 200,
      discount: 0,
      tax: 0,
      payment_method: 'cod',
      payment_status: 'pending',
      status: 'pending',
      delivery_address: '',
      delivery_city: '',
      delivery_phone: '',
      notes: '',
    })
  }

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order)
    setFormData({
      customer_id: String(order.customer_id),
      items: order.items?.map(i => ({
        name: i.product_name || i.name || '',
        quantity: i.quantity,
        price: i.unit_price || i.price || 0,
      })) || [{ name: '', quantity: 1, price: 0 }],
      delivery_charges: order.delivery_charges,
      discount: order.discount,
      tax: order.tax,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      status: order.status,
      delivery_address: order.delivery_address || '',
      delivery_city: order.delivery_city || '',
      delivery_phone: order.delivery_phone || '',
      notes: order.notes || '',
    })
    setIsEditDialogOpen(true)
  }

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders({ search: searchQuery, status: statusFilter })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter])

  if (loading && orders.length === 0) {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
          <p className="text-muted-foreground">Apne sab orders yahan manage karein</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{stats?.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats?.pending_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">Rs. {Number(stats?.total_revenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-xl font-bold">{stats?.delivered_orders || 0}</p>
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
                placeholder="Order number ya customer dhoondhein..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="py-12 text-center border-dashed">
            <CardContent>
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Koi order nahi</h3>
              <p className="text-sm text-muted-foreground">Apna pehla order create karein</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {order.order_number}
                      </span>
                      <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                      <Badge className={paymentStatusColors[order.payment_status] || ''}>
                        {order.payment_status}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-4">
                      <span className="font-medium">{order.customer?.name}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {order.customer?.phone}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {order.items?.map((item, i) => (
                        <span key={i}>
                          {(item as any).product_name || (item as any).name} x{(item as any).quantity}
                          {i < (order.items?.length || 0) - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{order.delivery_address}</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Rs. {Number(order.total).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground uppercase">{order.payment_method}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsViewDialogOpen(true) }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { setSelectedOrder(order); setIsDeleteDialogOpen(true) }}
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

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
            <DialogDescription>Naya order add karein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value)
                  setFormData(prev => ({
                    ...prev,
                    customer_id: value,
                    delivery_address: customer?.address || '',
                    delivery_phone: customer?.phone || '',
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Customer select karein" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>Items *</Label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  {formData.items.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Item Add Karein
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Delivery Charges</Label>
                <Input
                  type="number"
                  value={formData.delivery_charges}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_charges: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery Address</Label>
              <Textarea
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                placeholder="Delivery address"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Order ke baray mein notes"
              />
            </div>

            {/* Total */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Rs. {formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery:</span>
                <span>Rs. {formData.delivery_charges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>Rs. {formData.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-Rs. {formData.discount.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedOrder.status] || ''}>{selectedOrder.status}</Badge>
                <Badge className={paymentStatusColors[selectedOrder.payment_status] || ''}>{selectedOrder.payment_status}</Badge>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold">Customer</h4>
                <p>{selectedOrder.customer?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer?.phone}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{(item as any).product_name || (item as any).name} x{(item as any).quantity}</span>
                      <span>Rs. {((item as any).total_price || (item as any).price * (item as any).quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm"><span>Subtotal:</span><span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery:</span><span>Rs. {Number(selectedOrder.delivery_charges).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Tax:</span><span>Rs. {Number(selectedOrder.tax).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Discount:</span><span>-Rs. {Number(selectedOrder.discount).toLocaleString()}</span></div>
                <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">Rs. {Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>{selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>Items</Label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="flex-1" placeholder="Item name" />
                  <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} className="w-20" />
                  <Input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)} className="w-24" />
                  {formData.items.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" />Item Add Karein</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Delivery Charges</Label>
                <Input type="number" value={formData.delivery_charges} onChange={(e) => setFormData(prev => ({ ...prev, delivery_charges: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input type="number" value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Address</Label>
              <Textarea value={formData.delivery_address} onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order?</DialogTitle>
            <DialogDescription>Kya aap yaqeen se ye order delete karna chahte hain?</DialogDescription>
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