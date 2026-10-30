// app/dashboard/products/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui/sheet'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useProducts, Product } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Plus, Search, Package, DollarSign, AlertTriangle, Archive,
  Pencil, Trash2, Eye, X, Loader2, Image as ImageIcon, Tag,
  TrendingUp, Box, ShoppingCart
} from 'lucide-react'

const productUnits = ['piece', 'kg', 'dozen', 'box', 'pack', 'meter', 'liter']
const productStatuses = ['active', 'inactive', 'out_of_stock']

interface ProductFormData {
  name: string
  sku: string
  description: string
  price: string
  cost_price: string
  stock_quantity: string
  unit: string
  category: string
  status: string
  tags: string[]
  notes: string
}

const defaultFormData: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  price: '',
  cost_price: '',
  stock_quantity: '0',
  unit: 'piece',
  category: '',
  status: 'active',
  tags: [],
  notes: '',
}

export default function ProductsPage() {
  const { products, categories, stats, loading, createProduct, updateProduct, deleteProduct, fetchProducts } = useProducts()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const openCreateModal = () => {
    setFormData(defaultFormData)
    setEditingProduct(null)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: String(product.price),
      cost_price: product.cost_price ? String(product.cost_price) : '',
      stock_quantity: String(product.stock_quantity),
      unit: product.unit,
      category: product.category || '',
      status: product.status,
      tags: product.tags || [],
      notes: product.notes || '',
    })
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Product name zaruri hai')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price zaruri hai')
      return
    }

    setSubmitting(true)

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
    }

    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, payload)
    } else {
      result = await createProduct(payload)
    }

    setSubmitting(false)

    if (result.success) {
      toast.success(editingProduct ? 'Product updated!' : 'Product added!')
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

  const handleDelete = async (id: number) => {
    const result = await deleteProduct(id)
    if (result.success) {
      setDeleteConfirm(null)
      setViewingProduct(null)
      toast.success('Product deleted!')
    } else {
      toast.error('Delete failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockBadge = (quantity: number) => {
    if (quantity <= 0) return <Badge variant="outline" className="bg-red-100 text-red-800">Out of Stock</Badge>
    if (quantity <= 5) return <Badge variant="outline" className="bg-orange-100 text-orange-800">Low: {quantity}</Badge>
    return <Badge variant="outline" className="bg-green-100 text-green-800">In Stock: {quantity}</Badge>
  }

  if (loading && products.length === 0) {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
          <p className="text-muted-foreground">Apne sab products ki management</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Box className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lowStock}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Archive className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.outOfStock}</p>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. {stats.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Inventory Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Product name, SKU ya description se dhoondhein..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewingProduct(product)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Rs. {product.price.toLocaleString()}</p>
                          {product.cost_price && (
                            <p className="text-xs text-muted-foreground">
                              Cost: Rs. {product.cost_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStockBadge(product.stock_quantity)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.category && (
                          <Badge variant="outline">{product.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs capitalize', getStatusColor(product.status))}>
                          {product.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-16 text-center border-dashed">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Koi product nahi mila</h3>
            <p className="mb-6 text-muted-foreground">
              {searchQuery ? 'Search change karein ya filters clear karein.' : 'Apna pehla product add karein.'}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Pehla Product Add Karein
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </DialogClose>
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Product ki details update karein' : 'Naye product ki details dalein'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. iPhone 15 Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Auto-generated if empty"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs.) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  placeholder="0.00"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Qty</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {productUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🟢 Active</SelectItem>
                    <SelectItem value="inactive">🟡 Inactive</SelectItem>
                    <SelectItem value="out_of_stock">🔴 Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Mobile Accessories"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any notes..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Sheet */}
      <Sheet open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </SheetClose>
          {viewingProduct && (
            <>
              <SheetHeader className="pb-4 pr-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    {viewingProduct.images && viewingProduct.images.length > 0 ? (
                      <img src={viewingProduct.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{viewingProduct.name}</SheetTitle>
                    <SheetDescription className="font-mono text-xs">{viewingProduct.sku}</SheetDescription>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className={cn(getStatusColor(viewingProduct.status))}>
                        {viewingProduct.status.replace('_', ' ')}
                      </Badge>
                      {viewingProduct.category && <Badge variant="outline">{viewingProduct.category}</Badge>}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">Rs. {viewingProduct.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Selling Price</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{viewingProduct.stock_quantity}</p>
                      <p className="text-xs text-muted-foreground">In Stock ({viewingProduct.unit})</p>
                    </CardContent>
                  </Card>
                </div>

                {viewingProduct.description && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">📝 Description</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                      <p className="text-sm text-muted-foreground">{viewingProduct.description}</p>
                    </CardContent>
                  </Card>
                )}

                {viewingProduct.cost_price && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Profit Margin: <strong>{viewingProduct.profit_margin}%</strong>
                      (Cost: Rs. {viewingProduct.cost_price.toLocaleString()})
                    </span>
                  </div>
                )}

                {viewingProduct.notes && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">📌 Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                      <p className="text-sm text-muted-foreground">{viewingProduct.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 gap-2" onClick={() => {
                    setViewingProduct(null)
                    openEditModal(viewingProduct)
                  }}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" className="gap-2" onClick={() => setDeleteConfirm(viewingProduct.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Product Delete Karein?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ye action <strong>undo nahi ho sakta</strong>. Product permanently delete ho jayega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}