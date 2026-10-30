'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomers, Customer } from '@/hooks/useCustomers'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Pencil,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Calendar,
  Users,
  MoreHorizontal,
  Trash2,
  Loader2,
  X,
  UserPlus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const customerTags = ['VIP', 'Regular', 'New', 'Wholesaler']

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  city: string
  tags: string[]
  notes: string
  status: string
}

const defaultFormData: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  tags: [],
  notes: '',
  status: 'active',
}

export default function CustomersPage() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('lastActive')
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      const matchesTag = filterTag === 'all' || (customer.tags || []).includes(filterTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      if (sortBy === 'lastActive') {
        return new Date(b.last_active_at || 0).getTime() - new Date(a.last_active_at || 0).getTime()
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'orders') {
        return (b.total_orders || 0) - (a.total_orders || 0)
      }
      if (sortBy === 'spent') {
        return parseFloat(b.total_spent || '0') - parseFloat(a.total_spent || '0')
      }
      return 0
    })

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id))
    }
  }

  const toggleSelectCustomer = (id: number) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter((c) => c !== id))
    } else {
      setSelectedCustomers([...selectedCustomers, id])
    }
  }

  const openCreateModal = () => {
    setFormData(defaultFormData)
    setEditingCustomer(null)
    setShowModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      tags: customer.tags || [],
      notes: customer.notes || '',
      status: customer.status,
    })
    setEditingCustomer(customer)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name zaruri hai')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number zaruri hai')
      return
    }

    setSubmitting(true)

    let result
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, formData)
    } else {
      result = await createCustomer(formData)
    }

    setSubmitting(false)

    if (result.success) {
      toast.success(editingCustomer ? 'Customer updated!' : 'Customer added!')
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
    const result = await deleteCustomer(id)
    if (result.success) {
      setDeleteConfirm(null)
      setViewingCustomer(null)
      toast.success('Customer deleted!')
    } else {
      toast.error('Delete failed')
    }
  }

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
    } else {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch {
      return '-'
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Wholesaler':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'New':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading && customers.length === 0) {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Customers</h1>
          <p className="text-muted-foreground">Apne sab customers ki management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.status === 'active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((acc, c) => acc + (c.total_orders || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Phone className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.source === 'whatsapp').length}
                </p>
                <p className="text-xs text-muted-foreground">From WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Name ya phone se dhoondhein..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {customerTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastActive">Last Active</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="orders">Total Orders</SelectItem>
                <SelectItem value="spent">Total Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">
              {selectedCustomers.length} customers selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message All
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      {filteredCustomers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Tags</TableHead>
                    <TableHead className="hidden sm:table-cell">Orders</TableHead>
                    <TableHead className="hidden lg:table-cell">Spent</TableHead>
                    <TableHead className="hidden xl:table-cell">Last Active</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setViewingCustomer(customer)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => toggleSelectCustomer(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(customer.tags || []).map((tag) => (
                            <Badge key={tag} variant="outline" className={cn('text-xs', getTagColor(tag))}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm font-medium">{customer.total_orders || 0}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">Rs. {parseFloat(customer.total_spent || '0').toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">{formatTime(customer.last_active_at)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={cn('text-xs capitalize', getStatusColor(customer.status))}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingCustomer(customer)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(customer)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirm(customer.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="py-16 text-center border-dashed">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Koi customer nahi mila</h3>
            <p className="mb-6 text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? 'Search change karein ya filters clear karein.' : 'Apna pehla customer add karein aur apna business grow karein.'}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateModal} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Pehla Customer Add Karein
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Customer Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {/* 🔥 CLOSE BUTTON */}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl">
              {editingCustomer ? '✏️ Edit Customer' : '➕ Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Customer ki details update karein' : 'Naye customer ki details dalein'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Ahmad Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 0300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Karachi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🟢 Active</SelectItem>
                    <SelectItem value="inactive">🟡 Inactive</SelectItem>
                    <SelectItem value="blocked">🔴 Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {customerTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105',
                      formData.tags.includes(tag) && getTagColor(tag)
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Complete address..."
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special notes about this customer..."
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
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingCustomer ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Update Customer
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Save Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Sheet */}
      <Sheet open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {/* 🔥 CLOSE BUTTON */}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>

          {viewingCustomer && (
            <>
              <SheetHeader className="pb-4 pr-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-2xl text-primary-foreground font-bold">
                      {getInitials(viewingCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl">{viewingCustomer.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {viewingCustomer.phone}
                    </SheetDescription>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(viewingCustomer.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className={cn('text-xs', getTagColor(tag))}>
                          {tag}
                        </Badge>
                      ))}
                      <Badge variant="outline" className={cn('text-xs capitalize', getStatusColor(viewingCustomer.status))}>
                        {viewingCustomer.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex gap-2 py-4">
                <Button className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" size="icon" onClick={() => {
                  setViewingCustomer(null)
                  openEditModal(viewingCustomer)
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">👤 Profile</TabsTrigger>
                  <TabsTrigger value="activity">📊 Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 pt-4">
                  <div className="space-y-3">
                    {viewingCustomer.email && (
                      <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{viewingCustomer.email}</span>
                      </div>
                    )}
                    {(viewingCustomer.address || viewingCustomer.city) && (
                      <div className="flex items-start gap-3 text-sm p-2 rounded-lg bg-muted/50">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                        <span>
                          {viewingCustomer.address}
                          {viewingCustomer.address && viewingCustomer.city ? ', ' : ''}
                          {viewingCustomer.city}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined: {formatDate(viewingCustomer.first_contact_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span>Source: <span className="capitalize">{viewingCustomer.source}</span></span>
                    </div>
                  </div>

                  {viewingCustomer.notes && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">📝 Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 pb-4">
                        <p className="text-sm text-muted-foreground">{viewingCustomer.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">📈 Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 py-0 pb-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{(viewingCustomer.total_orders || 0)}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-green-600">
                          Rs. {parseFloat(viewingCustomer.total_spent || '0').toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">First Contact</p>
                        <p className="text-xs text-muted-foreground">{formatDate(viewingCustomer.first_contact_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Active</p>
                        <p className="text-xs text-muted-foreground">{formatTime(viewingCustomer.last_active_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Order</p>
                        <p className="text-xs text-muted-foreground">No orders yet</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  onClick={() => setDeleteConfirm(viewingCustomer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Customer
                </Button>
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
              Customer Delete Karein?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ye action <strong>undo nahi ho sakta</strong>. Customer <strong>#{deleteConfirm}</strong> aur uski sab details permanently delete ho jayengi.
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