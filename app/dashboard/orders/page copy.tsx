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
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  ShoppingBag,
  Phone,
  MapPin,
  CreditCard,
  Package,
  X,
  Minus,
} from 'lucide-react'
import { format } from 'date-fns'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  advance: 'bg-blue-100 text-blue-800',
}

export default function OrdersPage() {
  const { orders, customers, addOrder, updateOrder, deleteOrder, t } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null)
  
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    deliveryCharges: 200,
    discount: 0,
    paymentMethod: 'cod' as 'cod' | 'jazzcash' | 'easypaisa' | 'bank',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid' | 'advance',
    status: 'pending' as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    address: '',
    notes: '',
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    return subtotal + formData.deliveryCharges - formData.discount
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = () => {
    const customer = customers.find((c) => c.id === formData.customerId)
    if (!customer) return

    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    
    addOrder({
      customerId: formData.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: formData.items,
      subtotal,
      deliveryCharges: formData.deliveryCharges,
      discount: formData.discount,
      total: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      status: formData.status,
      address: formData.address || customer.address || '',
      notes: formData.notes,
    })
    
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleUpdate = () => {
    if (!selectedOrder) return
    
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    
    updateOrder(selectedOrder.id, {
      items: formData.items,
      subtotal,
      deliveryCharges: formData.deliveryCharges,
      discount: formData.discount,
      total: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      status: formData.status,
      address: formData.address,
      notes: formData.notes,
    })
    
    setIsEditDialogOpen(false)
    setSelectedOrder(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!selectedOrder) return
    deleteOrder(selectedOrder.id)
    setIsDeleteDialogOpen(false)
    setSelectedOrder(null)
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      items: [{ name: '', quantity: 1, price: 0 }],
      deliveryCharges: 200,
      discount: 0,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      status: 'pending',
      address: '',
      notes: '',
    })
  }

  const openEditDialog = (order: typeof orders[0]) => {
    setSelectedOrder(order)
    setFormData({
      customerId: order.customerId,
      items: order.items,
      deliveryCharges: order.deliveryCharges,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      address: order.address,
      notes: order.notes || '',
    })
    setIsEditDialogOpen(true)
  }

  // Stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('orders')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Apne sab orders yahan manage karein
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('addOrder')}</span>
          <span className="sm:hidden">Add</span>
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
                <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
                <p className="text-xl font-bold">{totalOrders}</p>
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
                <p className="text-sm text-muted-foreground">{t('pending')}</p>
                <p className="text-xl font-bold">{pendingOrders}</p>
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
                <p className="text-sm text-muted-foreground">{t('revenue')}</p>
                <p className="text-xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('delivered')}</p>
                <p className="text-xl font-bold">{deliveredOrders}</p>
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
                placeholder={t('searchOrders')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="confirmed">{t('confirmed')}</SelectItem>
                  <SelectItem value="processing">{t('processing')}</SelectItem>
                  <SelectItem value="shipped">{t('shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('noData')}</h3>
              <p className="text-sm text-muted-foreground">Koi order nahi mila</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {order.orderNumber}
                      </span>
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      <Badge className={paymentStatusColors[order.paymentStatus]}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-4">
                      <span className="font-medium">{order.customerName}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {order.customerPhone}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="text-sm text-muted-foreground">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {item.name} x{item.quantity}
                          {i < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{order.address}</span>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground uppercase">{order.paymentMethod}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedOrder(order)
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

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addOrder')}</DialogTitle>
            <DialogDescription>Naya order add karein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value)
                  setFormData({
                    ...formData,
                    customerId: value,
                    address: customer?.address || '',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Customer select karein" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>{t('items')}</Label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('deliveryCharges')}</Label>
                <Input
                  type="number"
                  value={formData.deliveryCharges}
                  onChange={(e) => setFormData({ ...formData, deliveryCharges: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('discount')}</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('paymentMethod')}</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: typeof formData.paymentMethod) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">{t('cod')}</SelectItem>
                    <SelectItem value="jazzcash">{t('jazzcash')}</SelectItem>
                    <SelectItem value="easypaisa">{t('easypaisa')}</SelectItem>
                    <SelectItem value="bank">{t('bank')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('paymentStatus')}</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: typeof formData.paymentStatus) =>
                    setFormData({ ...formData, paymentStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
                    <SelectItem value="paid">{t('paid')}</SelectItem>
                    <SelectItem value="advance">{t('advance')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('address')}</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Delivery address"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Order ke baray mein notes"
              />
            </div>

            {/* Total */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')}:</span>
                <span>Rs. {formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('deliveryCharges')}:</span>
                <span>Rs. {formData.deliveryCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('discount')}:</span>
                <span>-Rs. {formData.discount.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                <span>{t('total')}:</span>
                <span className="text-primary">Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.customerId || formData.items.every((i) => !i.name)}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('orderDetails')}</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                <Badge className={paymentStatusColors[selectedOrder.paymentStatus]}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold">Customer</h4>
                <p>{selectedOrder.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.address}</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">{t('items')}</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')}:</span>
                  <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('deliveryCharges')}:</span>
                  <span>Rs. {selectedOrder.deliveryCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('discount')}:</span>
                  <span>-Rs. {selectedOrder.discount.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                  <span>{t('total')}:</span>
                  <span className="text-primary">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Payment: {selectedOrder.paymentMethod.toUpperCase()}</p>
                <p>Created: {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                {selectedOrder.notes && <p>Notes: {selectedOrder.notes}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editOrder')}</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>{t('orderStatus')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: typeof formData.status) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="confirmed">{t('confirmed')}</SelectItem>
                  <SelectItem value="processing">{t('processing')}</SelectItem>
                  <SelectItem value="shipped">{t('shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>{t('items')}</Label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('deliveryCharges')}</Label>
                <Input
                  type="number"
                  value={formData.deliveryCharges}
                  onChange={(e) => setFormData({ ...formData, deliveryCharges: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('discount')}</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('paymentMethod')}</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: typeof formData.paymentMethod) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">{t('cod')}</SelectItem>
                    <SelectItem value="jazzcash">{t('jazzcash')}</SelectItem>
                    <SelectItem value="easypaisa">{t('easypaisa')}</SelectItem>
                    <SelectItem value="bank">{t('bank')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('paymentStatus')}</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: typeof formData.paymentStatus) =>
                    setFormData({ ...formData, paymentStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
                    <SelectItem value="paid">{t('paid')}</SelectItem>
                    <SelectItem value="advance">{t('advance')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('address')}</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Total */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}:</span>
                <span className="text-primary">Rs. {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleUpdate}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete')} Order?</DialogTitle>
            <DialogDescription>
              Kya aap yaqeen se ye order delete karna chahte hain? Ye action undo nahi ho sakta.
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
