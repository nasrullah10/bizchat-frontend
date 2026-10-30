import { create } from 'zustand'

// Language Types and Translations
export type Language = 'en' | 'ur'

export const translations = {
  en: {
    // Common
    dashboard: 'Dashboard',
    customers: 'Customers',
    orders: 'Orders',
    templates: 'Templates',
    broadcast: 'Broadcast',
    analytics: 'Analytics',
    settings: 'Settings',
    team: 'Team',
    whatsappSetup: 'WhatsApp Setup',
    autoReplies: 'Auto-Replies',
    help: 'Help & Support',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    all: 'All',
    new: 'New',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    noData: 'No data found',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    
    // Dashboard
    welcomeBack: 'Welcome Back',
    todayStats: "Today's Stats",
    totalMessages: 'Total Messages',
    newCustomers: 'New Customers',
    totalOrders: 'Total Orders',
    revenue: 'Revenue',
    recentConversations: 'Recent Conversations',
    quickActions: 'Quick Actions',
    viewAll: 'View All',
    pendingOrders: 'Pending Orders',
    
    // Customers
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    customerDetails: 'Customer Details',
    customerName: 'Customer Name',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    tags: 'Tags',
    notes: 'Notes',
    totalSpent: 'Total Spent',
    lastActive: 'Last Active',
    deleteCustomer: 'Delete Customer',
    confirmDeleteCustomer: 'Are you sure you want to delete this customer?',
    customerAdded: 'Customer added successfully',
    customerUpdated: 'Customer updated successfully',
    customerDeleted: 'Customer deleted successfully',
    searchCustomers: 'Search customers...',
    
    // Orders
    addOrder: 'Add Order',
    editOrder: 'Edit Order',
    orderDetails: 'Order Details',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    items: 'Items',
    subtotal: 'Subtotal',
    deliveryCharges: 'Delivery Charges',
    discount: 'Discount',
    total: 'Total',
    paymentMethod: 'Payment Method',
    paymentStatus: 'Payment Status',
    orderStatus: 'Order Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    unpaid: 'Unpaid',
    advance: 'Advance',
    cod: 'Cash on Delivery',
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
    bank: 'Bank Transfer',
    searchOrders: 'Search orders...',
    
    // Templates
    addTemplate: 'Add Template',
    editTemplate: 'Edit Template',
    templateName: 'Template Name',
    templateDescription: 'Description',
    triggers: 'Trigger Keywords',
    message: 'Message',
    messageType: 'Message Type',
    textOnly: 'Text Only',
    textWithImage: 'Text with Image',
    textWithButtons: 'Text with Buttons',
    listMessage: 'List Message',
    conditions: 'Conditions',
    priority: 'Priority',
    usageCount: 'Usage Count',
    lastUsed: 'Last Used',
    
    // Broadcast
    createBroadcast: 'Create Broadcast',
    broadcastName: 'Broadcast Name',
    audience: 'Audience',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed',
    replied: 'Replied',
    draft: 'Draft',
    scheduled: 'Scheduled',
    sending: 'Sending',
    sent: 'Sent',
    scheduledAt: 'Scheduled At',
    sentAt: 'Sent At',
    
    // Analytics
    messageAnalytics: 'Message Analytics',
    customerGrowth: 'Customer Growth',
    orderTrends: 'Order Trends',
    responseRate: 'Response Rate',
    avgResponseTime: 'Avg Response Time',
    topTemplates: 'Top Templates',
    
    // Settings
    profile: 'Profile',
    businessInfo: 'Business Information',
    businessName: 'Business Name',
    businessType: 'Business Type',
    notifications: 'Notifications',
    security: 'Security',
    billing: 'Billing',
    language: 'Language',
    english: 'English',
    romanUrdu: 'Roman Urdu',
    businessHours: 'Business Hours',
    openTime: 'Open Time',
    closeTime: 'Close Time',
    workingDays: 'Working Days',
    
    // WhatsApp
    connectWhatsApp: 'Connect WhatsApp',
    disconnectWhatsApp: 'Disconnect WhatsApp',
    whatsappConnected: 'WhatsApp Connected',
    whatsappDisconnected: 'WhatsApp Disconnected',
    scanQrCode: 'Scan QR Code',
    connectionStatus: 'Connection Status',
    connectedNumber: 'Connected Number',
    
    // Team
    addTeamMember: 'Add Team Member',
    editTeamMember: 'Edit Team Member',
    memberName: 'Name',
    memberEmail: 'Email',
    memberRole: 'Role',
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    support: 'Support',
    lastActiveAt: 'Last Active',
    
    // Plans
    currentPlan: 'Current Plan',
    planExpiry: 'Plan Expiry',
    upgrade: 'Upgrade',
    starterPlan: 'Starter Plan',
    businessPlan: 'Business Plan',
    enterprisePlan: 'Enterprise Plan',
  },
  ur: {
    // Common
    dashboard: 'Dashboard',
    customers: 'Customers',
    orders: 'Orders',
    templates: 'Templates',
    broadcast: 'Broadcast',
    analytics: 'Analytics',
    settings: 'Settings',
    team: 'Team',
    whatsappSetup: 'WhatsApp Setup',
    autoReplies: 'Auto-Replies',
    help: 'Madad',
    logout: 'Logout',
    save: 'Save Karein',
    cancel: 'Cancel',
    delete: 'Delete Karein',
    edit: 'Edit Karein',
    add: 'Add Karein',
    search: 'Talash Karein',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    all: 'Sab',
    new: 'Naya',
    view: 'Dekhein',
    close: 'Band Karein',
    confirm: 'Confirm',
    loading: 'Load ho raha hai...',
    noData: 'Koi data nahi mila',
    success: 'Kamyab',
    error: 'Error',
    warning: 'Warning',
    
    // Auth
    login: 'Login Karein',
    signup: 'Account Banayein',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Password Dobara Likhein',
    forgotPassword: 'Password Bhool Gaye?',
    rememberMe: 'Mujhe Yaad Rakhein',
    dontHaveAccount: 'Account nahi hai?',
    alreadyHaveAccount: 'Pehle se account hai?',
    createAccount: 'Account Banayein',
    resetPassword: 'Password Reset Karein',
    sendResetLink: 'Reset Link Bhejein',
    backToLogin: 'Login pe Wapis Jayein',
    
    // Dashboard
    welcomeBack: 'Wapis Khush Aamdeed',
    todayStats: 'Aaj Ki Stats',
    totalMessages: 'Total Messages',
    newCustomers: 'Naye Customers',
    totalOrders: 'Total Orders',
    revenue: 'Kamai',
    recentConversations: 'Recent Conversations',
    quickActions: 'Quick Actions',
    viewAll: 'Sab Dekhein',
    pendingOrders: 'Pending Orders',
    
    // Customers
    addCustomer: 'Customer Add Karein',
    editCustomer: 'Customer Edit Karein',
    customerDetails: 'Customer Ki Details',
    customerName: 'Customer Ka Naam',
    phone: 'Phone Number',
    address: 'Pata',
    city: 'Shehar',
    tags: 'Tags',
    notes: 'Notes',
    totalSpent: 'Total Kharcha',
    lastActive: 'Aakhri Active',
    deleteCustomer: 'Customer Delete Karein',
    confirmDeleteCustomer: 'Kya aap yaqeen se is customer ko delete karna chahte hain?',
    customerAdded: 'Customer add ho gaya',
    customerUpdated: 'Customer update ho gaya',
    customerDeleted: 'Customer delete ho gaya',
    searchCustomers: 'Customer dhoondhein...',
    
    // Orders
    addOrder: 'Order Add Karein',
    editOrder: 'Order Edit Karein',
    orderDetails: 'Order Ki Details',
    orderNumber: 'Order Number',
    orderDate: 'Order Ki Tarikh',
    items: 'Items',
    subtotal: 'Sub Total',
    deliveryCharges: 'Delivery Charges',
    discount: 'Discount',
    total: 'Total',
    paymentMethod: 'Payment Ka Tareeqa',
    paymentStatus: 'Payment Status',
    orderStatus: 'Order Status',
    pending: 'Pending',
    confirmed: 'Confirm',
    processing: 'Processing',
    shipped: 'Ship Ho Gaya',
    delivered: 'Deliver Ho Gaya',
    cancelled: 'Cancel',
    paid: 'Paid',
    unpaid: 'Unpaid',
    advance: 'Advance',
    cod: 'Cash on Delivery',
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
    bank: 'Bank Transfer',
    searchOrders: 'Order dhoondhein...',
    
    // Templates
    addTemplate: 'Template Add Karein',
    editTemplate: 'Template Edit Karein',
    templateName: 'Template Ka Naam',
    templateDescription: 'Description',
    triggers: 'Trigger Keywords',
    message: 'Message',
    messageType: 'Message Type',
    textOnly: 'Sirf Text',
    textWithImage: 'Text + Image',
    textWithButtons: 'Text + Buttons',
    listMessage: 'List Message',
    conditions: 'Conditions',
    priority: 'Priority',
    usageCount: 'Kitni Baar Use Hua',
    lastUsed: 'Aakhri Baar Use',
    
    // Broadcast
    createBroadcast: 'Broadcast Banayein',
    broadcastName: 'Broadcast Ka Naam',
    audience: 'Audience',
    delivered: 'Deliver Hua',
    read: 'Parha Gaya',
    failed: 'Fail',
    replied: 'Jawab Diya',
    draft: 'Draft',
    scheduled: 'Schedule',
    sending: 'Bhej rahe hain',
    sent: 'Bhej diya',
    scheduledAt: 'Schedule Time',
    sentAt: 'Bheja Gaya',
    
    // Analytics
    messageAnalytics: 'Message Analytics',
    customerGrowth: 'Customer Growth',
    orderTrends: 'Order Trends',
    responseRate: 'Response Rate',
    avgResponseTime: 'Average Response Time',
    topTemplates: 'Top Templates',
    
    // Settings
    profile: 'Profile',
    businessInfo: 'Business Ki Info',
    businessName: 'Business Ka Naam',
    businessType: 'Business Type',
    notifications: 'Notifications',
    security: 'Security',
    billing: 'Billing',
    language: 'Zabaan',
    english: 'English',
    romanUrdu: 'Roman Urdu',
    businessHours: 'Business Hours',
    openTime: 'Kholne Ka Waqt',
    closeTime: 'Band Hone Ka Waqt',
    workingDays: 'Kaam Ke Din',
    
    // WhatsApp
    connectWhatsApp: 'WhatsApp Connect Karein',
    disconnectWhatsApp: 'WhatsApp Disconnect Karein',
    whatsappConnected: 'WhatsApp Connect Hai',
    whatsappDisconnected: 'WhatsApp Disconnect Hai',
    scanQrCode: 'QR Code Scan Karein',
    connectionStatus: 'Connection Status',
    connectedNumber: 'Connected Number',
    
    // Team
    addTeamMember: 'Team Member Add Karein',
    editTeamMember: 'Team Member Edit Karein',
    memberName: 'Naam',
    memberEmail: 'Email',
    memberRole: 'Role',
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    support: 'Support',
    lastActiveAt: 'Aakhri Active',
    
    // Plans
    currentPlan: 'Current Plan',
    planExpiry: 'Plan Khatam Hone Ki Tarikh',
    upgrade: 'Upgrade',
    starterPlan: 'Starter Plan',
    businessPlan: 'Business Plan',
    enterprisePlan: 'Enterprise Plan',
  },
}

// Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  businessType: string
  avatar?: string
  plan: 'free-trial' | 'business' | 'enterprise'
  planExpiry: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  tags: string[]
  totalOrders: number
  totalSpent: number
  lastActive: string
  status: 'active' | 'inactive'
  notes?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  deliveryCharges: number
  discount: number
  total: number
  paymentMethod: 'jazzcash' | 'easypaisa' | 'cod' | 'bank'
  paymentStatus: 'paid' | 'unpaid' | 'advance'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  address: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  description?: string
  triggers: string[]
  message: string
  messageType: 'text' | 'text-image' | 'text-buttons' | 'list'
  buttons?: { label: string; action: string }[]
  listItems?: { title: string; description: string }[]
  conditions?: {
    time: 'business-hours' | 'after-hours' | 'anytime'
    customerType: 'new' | 'returning' | 'vip' | 'all'
  }
  priority: number
  isActive: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
}

export interface Broadcast {
  id: string
  name: string
  message: string
  audience: number
  delivered: number
  read: number
  failed: number
  replied: number
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduledAt?: string
  sentAt?: string
  createdAt: string
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  lastMessage: string
  lastMessageTime: string
  status: 'new' | 'replied' | 'order' | 'pending'
  isUnread: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'support'
  status: 'active' | 'inactive'
  lastActive: string
}

interface AppState {
  // Language
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.en) => string
  
  // Auth
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (data: Partial<User> & { password: string }) => boolean
  
  // WhatsApp
  whatsappConnected: boolean
  whatsappNumber: string | null
  connectWhatsApp: (number: string) => void
  disconnectWhatsApp: () => void
  
  // Customers
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'lastActive' | 'status'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  // Orders
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void
  updateOrder: (id: string, data: Partial<Order>) => void
  deleteOrder: (id: string) => void
  
  // Templates
  templates: Template[]
  addTemplate: (template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>) => void
  updateTemplate: (id: string, data: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  
  // Broadcasts
  broadcasts: Broadcast[]
  addBroadcast: (broadcast: Omit<Broadcast, 'id' | 'createdAt' | 'delivered' | 'read' | 'failed' | 'replied'>) => void
  updateBroadcast: (id: string, data: Partial<Broadcast>) => void
  deleteBroadcast: (id: string) => void
  
  // Conversations
  conversations: Conversation[]
  
  // Team
  teamMembers: TeamMember[]
  addTeamMember: (member: Omit<TeamMember, 'id' | 'lastActive' | 'status'>) => void
  updateTeamMember: (id: string, data: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  
  // Settings
  businessHours: { open: string; close: string; days: string[] }
  updateBusinessHours: (hours: { open: string; close: string; days: string[] }) => void
}

// Mock data generators
const generateId = () => Math.random().toString(36).substr(2, 9)
const generateOrderNumber = () => `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`

// Initial mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ayesha Khan',
    phone: '+92 300 1234567',
    email: 'ayesha@example.com',
    address: 'House 45, Street 12, DHA Phase 5',
    city: 'Karachi',
    tags: ['VIP', 'Regular'],
    totalOrders: 15,
    totalSpent: 125000,
    lastActive: new Date().toISOString(),
    status: 'active',
    notes: 'Ye customer hamesha cash on delivery mangti hai',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ahmed Ali',
    phone: '+92 301 9876543',
    email: 'ahmed@example.com',
    address: 'Flat 203, Gulberg Towers',
    city: 'Lahore',
    tags: ['Wholesaler'],
    totalOrders: 45,
    totalSpent: 450000,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Fatima Bibi',
    phone: '+92 333 5556667',
    address: 'Shop 23, Saddar Market',
    city: 'Islamabad',
    tags: ['New'],
    totalOrders: 2,
    totalSpent: 8500,
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Hassan Malik',
    phone: '+92 321 7778889',
    email: 'hassan.m@example.com',
    address: 'House 78, Model Town',
    city: 'Multan',
    tags: ['Regular'],
    totalOrders: 8,
    totalSpent: 67000,
    lastActive: new Date(Date.now() - 172800000).toISOString(),
    status: 'active',
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: '5',
    name: 'Sana Tariq',
    phone: '+92 345 1112223',
    city: 'Faisalabad',
    tags: ['VIP'],
    totalOrders: 22,
    totalSpent: 198000,
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
  },
]

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-240415-001',
    customerId: '1',
    customerName: 'Ayesha Khan',
    customerPhone: '+92 300 1234567',
    items: [
      { name: 'Lawn Suit 3pc', quantity: 2, price: 4500 },
      { name: 'Kurta Shalwar', quantity: 1, price: 3200 },
    ],
    subtotal: 12200,
    deliveryCharges: 200,
    discount: 500,
    total: 11900,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status: 'shipped',
    address: 'House 45, Street 12, DHA Phase 5, Karachi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-240415-002',
    customerId: '2',
    customerName: 'Ahmed Ali',
    customerPhone: '+92 301 9876543',
    items: [
      { name: 'Formal Shirt', quantity: 5, price: 2800 },
    ],
    subtotal: 14000,
    deliveryCharges: 300,
    discount: 1000,
    total: 13300,
    paymentMethod: 'jazzcash',
    paymentStatus: 'paid',
    status: 'delivered',
    address: 'Flat 203, Gulberg Towers, Lahore',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'ORD-240415-003',
    customerId: '3',
    customerName: 'Fatima Bibi',
    customerPhone: '+92 333 5556667',
    items: [
      { name: 'Cotton Dupatta', quantity: 3, price: 1200 },
    ],
    subtotal: 3600,
    deliveryCharges: 150,
    discount: 0,
    total: 3750,
    paymentMethod: 'easypaisa',
    paymentStatus: 'advance',
    status: 'pending',
    address: 'Shop 23, Saddar Market, Islamabad',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    orderNumber: 'ORD-240415-004',
    customerId: '5',
    customerName: 'Sana Tariq',
    customerPhone: '+92 345 1112223',
    items: [
      { name: 'Bridal Lehenga', quantity: 1, price: 45000 },
      { name: 'Matching Jewelry Set', quantity: 1, price: 12000 },
    ],
    subtotal: 57000,
    deliveryCharges: 500,
    discount: 2500,
    total: 55000,
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    status: 'confirmed',
    address: 'Faisalabad',
    notes: 'Rush order - wedding on 25th',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome Message',
    description: 'New customer greeting',
    triggers: ['hi', 'hello', 'assalam', 'aoa'],
    message: 'Assalam-o-Alaikum! {{business_name}} mein khush aamdeed! Main aapki kya madad kar sakta hoon? Hamaray products dekhne ke liye "products" likhein.',
    messageType: 'text',
    conditions: { time: 'anytime', customerType: 'all' },
    priority: 10,
    isActive: true,
    usageCount: 1240,
    lastUsed: new Date(Date.now() - 120000).toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Price Inquiry',
    description: 'Auto reply for price questions',
    triggers: ['price', 'rate', 'kitnay', 'kitne'],
    message: 'Hamaray prices:\n\n1. Lawn Suit 3pc - Rs. 4,500\n2. Kurta Shalwar - Rs. 3,200\n3. Formal Shirt - Rs. 2,800\n\nOrder ke liye "order" likhein ya apna address share karein.',
    messageType: 'text',
    conditions: { time: 'business-hours', customerType: 'all' },
    priority: 8,
    isActive: true,
    usageCount: 856,
    lastUsed: new Date(Date.now() - 300000).toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'After Hours',
    description: 'Reply when shop is closed',
    triggers: [],
    message: 'Shukriya aapke message ka! Hamaray office hours 9 AM - 9 PM hain. Hum kal subah aapko reply karenge. Urgent order ke liye 0300-1234567 pe call karein.',
    messageType: 'text',
    conditions: { time: 'after-hours', customerType: 'all' },
    priority: 1,
    isActive: true,
    usageCount: 234,
    lastUsed: new Date(Date.now() - 43200000).toISOString(),
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Order Confirmation',
    description: 'Confirm order placement',
    triggers: ['order', 'book', 'confirm'],
    message: 'Shukriya! Aapka order receive ho gaya hai. Order Number: {{order_id}}\n\nHum jaldi confirm karenge. Payment ke liye: JazzCash 0300-1234567',
    messageType: 'text-buttons',
    buttons: [
      { label: 'Track Order', action: 'track' },
      { label: 'Cancel Order', action: 'cancel' },
    ],
    conditions: { time: 'anytime', customerType: 'all' },
    priority: 9,
    isActive: true,
    usageCount: 445,
    createdAt: '2024-01-20T00:00:00Z',
  },
]

const mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    name: 'Eid Sale Announcement',
    message: 'Eid Mubarak! 🌙 Is Eid pe sab items pe 20% OFF! Code: EID2024. Sirf 3 din ke liye. Abhi order karein!',
    audience: 450,
    delivered: 445,
    read: 380,
    failed: 5,
    replied: 45,
    status: 'sent',
    sentAt: new Date(Date.now() - 604800000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: '2',
    name: 'New Collection Launch',
    message: 'Naya Summer Collection aa gaya! Fresh designs, affordable prices. WhatsApp pe "NEW" likhein aur catalog paayein.',
    audience: 500,
    delivered: 0,
    read: 0,
    failed: 0,
    replied: 0,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
]

const mockConversations: Conversation[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Ayesha Khan',
    customerPhone: '+92 300 1234567',
    lastMessage: 'Mera order kab tak aayega?',
    lastMessageTime: new Date(Date.now() - 120000).toISOString(),
    status: 'pending',
    isUnread: true,
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Ahmed Ali',
    customerPhone: '+92 301 9876543',
    lastMessage: 'Order delivered, shukriya!',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'replied',
    isUnread: false,
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Fatima Bibi',
    customerPhone: '+92 333 5556667',
    lastMessage: 'Lawn suit ki price?',
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
    status: 'new',
    isUnread: true,
  },
  {
    id: '4',
    customerId: '5',
    customerName: 'Sana Tariq',
    customerPhone: '+92 345 1112223',
    lastMessage: 'Payment kar di hai JazzCash se',
    lastMessageTime: new Date(Date.now() - 14400000).toISOString(),
    status: 'order',
    isUnread: false,
  },
]

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ali Hassan',
    email: 'ali@bizchatpro.com',
    role: 'owner',
    status: 'active',
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sara Ahmed',
    email: 'sara@bizchatpro.com',
    role: 'admin',
    status: 'active',
    lastActive: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    name: 'Usman Raza',
    email: 'usman@bizchatpro.com',
    role: 'support',
    status: 'active',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  t: (key) => {
    const lang = get().language
    return translations[lang][key] || translations.en[key] || key
  },
  
  // Auth
  isAuthenticated: false,
  user: null,
  login: (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    if (email && password.length >= 6) {
      set({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Ali Hassan',
          email: email,
          phone: '+92 300 1234567',
          businessName: 'Karachi Cloth House',
          businessType: 'Clothing',
          plan: 'business',
          planExpiry: '2024-12-31',
        },
      })
      return true
    }
    return false
  },
  logout: () => set({ isAuthenticated: false, user: null }),
  register: (data) => {
    set({
      isAuthenticated: true,
      user: {
        id: generateId(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        businessName: data.businessName || '',
        businessType: data.businessType || '',
        plan: 'starter',
        planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    })
    return true
  },
  
  // WhatsApp
  whatsappConnected: true,
  whatsappNumber: '+92 300 1234567',
  connectWhatsApp: (number) => set({ whatsappConnected: true, whatsappNumber: number }),
  disconnectWhatsApp: () => set({ whatsappConnected: false, whatsappNumber: null }),
  
  // Customers
  customers: mockCustomers,
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, {
      ...customer,
      id: generateId(),
      totalOrders: 0,
      totalSpent: 0,
      lastActive: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    }],
  })),
  updateCustomer: (id, data) => set((state) => ({
    customers: state.customers.map((c) => c.id === id ? { ...c, ...data } : c),
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter((c) => c.id !== id),
  })),
  
  // Orders
  orders: mockOrders,
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, {
      ...order,
      id: generateId(),
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }],
  })),
  updateOrder: (id, data) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o),
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
  })),
  
  // Templates
  templates: mockTemplates,
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, {
      ...template,
      id: generateId(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }],
  })),
  updateTemplate: (id, data) => set((state) => ({
    templates: state.templates.map((t) => t.id === id ? { ...t, ...data } : t),
  })),
  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id),
  })),
  
  // Broadcasts
  broadcasts: mockBroadcasts,
  addBroadcast: (broadcast) => set((state) => ({
    broadcasts: [...state.broadcasts, {
      ...broadcast,
      id: generateId(),
      delivered: 0,
      read: 0,
      failed: 0,
      replied: 0,
      createdAt: new Date().toISOString(),
    }],
  })),
  updateBroadcast: (id, data) => set((state) => ({
    broadcasts: state.broadcasts.map((b) => b.id === id ? { ...b, ...data } : b),
  })),
  deleteBroadcast: (id) => set((state) => ({
    broadcasts: state.broadcasts.filter((b) => b.id !== id),
  })),
  
  // Conversations
  conversations: mockConversations,
  
  // Team
  teamMembers: mockTeamMembers,
  addTeamMember: (member) => set((state) => ({
    teamMembers: [...state.teamMembers, {
      ...member,
      id: generateId(),
      status: 'active',
      lastActive: new Date().toISOString(),
    }],
  })),
  updateTeamMember: (id, data) => set((state) => ({
    teamMembers: state.teamMembers.map((m) => m.id === id ? { ...m, ...data } : m),
  })),
  deleteTeamMember: (id) => set((state) => ({
    teamMembers: state.teamMembers.filter((m) => m.id !== id),
  })),
  
  // Settings
  businessHours: { open: '09:00', close: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  updateBusinessHours: (hours) => set({ businessHours: hours }),
}))
