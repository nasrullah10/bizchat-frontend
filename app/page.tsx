'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Clock,
  ShoppingBag,
  Megaphone,
  Users,
  CreditCard,
  UserPlus,
  Check,
  X,
  ArrowRight,
  Play,
  Shield,
  Headphones,
  Menu,
  ChevronRight,
  Star,
  Zap,
  BarChart3,
  Phone,
  Globe,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'

// Logo Component
function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-secondary" />
      </div>
      <span className="text-xl font-bold text-foreground">BizChat Pro</span>
    </div>
  )
}

// Navigation
function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useAppStore()
  
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#how-it-works', label: 'How it Works' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        
        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-primary/10' : ''}>
                <span className="mr-2">🇬🇧</span>
                English
                {language === 'en' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ur')} className={language === 'ur' ? 'bg-primary/10' : ''}>
                <span className="mr-2">🇵🇰</span>
                Roman Urdu
                {language === 'ur' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-6 pt-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit gap-2 bg-secondary/10 text-secondary-foreground">
              <Zap className="h-3 w-3" />
              500+ Pakistani Businesses Trust Us
            </Badge>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              WhatsApp ko Apni{' '}
              <span className="text-primary">Sales Team</span>{' '}
              Banayein
            </h1>
            
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              Automatic replies, order management, aur customer tracking - sab aik jagah. 
              Apna business smart banayein.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Free Trial Shuru Karein
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Demo Dekhein
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>500+ Active Users</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded bg-foreground/20" />
                      <div className="h-2 w-16 rounded bg-foreground/10" />
                    </div>
                  </div>
                  <Badge variant="default" className="bg-primary">Online</Badge>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Messages', value: '1,247', change: '+12%', icon: MessageCircle },
                    { label: 'Orders', value: '34', change: '+8%', icon: ShoppingBag },
                    { label: 'Customers', value: '89', change: '+5', icon: Users },
                    { label: 'Revenue', value: 'Rs. 85K', change: '+23%', icon: CreditCard },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <stat.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary">{stat.change}</span>
                      </div>
                      <div className="mt-2 text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Recent Messages */}
                <div className="rounded-lg border border-border p-3">
                  <div className="mb-3 text-sm font-medium">Recent Messages</div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 border-t border-border py-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10" />
                      <div className="flex-1">
                        <div className="h-2.5 w-20 rounded bg-foreground/20" />
                        <div className="mt-1 h-2 w-32 rounded bg-foreground/10" />
                      </div>
                      <div className="h-2 w-12 rounded bg-foreground/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-4 -right-4 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: 'Auto-Reply Bot',
      description: 'Raat ke 2 bhi customer ka jawab dein. 24/7 automatic replies.',
    },
    {
      icon: ShoppingBag,
      title: 'Order Management',
      description: 'WhatsApp se order seedha system mein. Tracking aur updates.',
    },
    {
      icon: Megaphone,
      title: 'Broadcast Marketing',
      description: 'Eid offers sab customers ko aik click mein bhejein.',
    },
    {
      icon: Users,
      title: 'Customer CRM',
      description: 'Har customer ki history yaad rakhein. Tags aur notes.',
    },
    {
      icon: CreditCard,
      title: 'Payment Links',
      description: 'JazzCash/Easypaisa direct payment links generate karein.',
    },
    {
      icon: UserPlus,
      title: 'Team Collaboration',
      description: 'Staff ko alag alag access dein. Multiple agents.',
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Sab kuch jo aapko chahiye
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            WhatsApp business ko automate karein aur sales barhayein
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={i} className="group transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// How it Works Section
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Connect Karein',
      description: 'WhatsApp QR scan karein aur connect ho jayein',
      icon: Phone,
    },
    {
      step: '02',
      title: 'Template Banayein',
      description: 'Apne messages aur auto-replies set karein',
      icon: MessageCircle,
    },
    {
      step: '03',
      title: 'Auto-Reply Chalein',
      description: 'Bot automatically customers ko reply karega',
      icon: Zap,
    },
    {
      step: '04',
      title: 'Sales Barhein',
      description: 'Analytics dekhein aur business grow karein',
      icon: BarChart3,
    },
  ]

  return (
    <section id="how-it-works" className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">How it Works</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Sirf 4 Steps mein Shuru Karein
          </h2>
        </div>
        
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
              )}
              
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="h-8 w-8" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {step.step}
                </span>
              </div>
              
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '2,999',
      description: 'Chhote business ke liye perfect',
      features: [
        { included: true, text: 'Single WhatsApp number' },
        { included: true, text: '500 messages/day' },
        { included: true, text: '5 auto-reply templates' },
        { included: true, text: 'Basic analytics' },
        { included: false, text: 'Team members' },
        { included: false, text: 'API access' },
      ],
      popular: false,
    },
    {
      name: 'Business',
      price: '7,999',
      description: 'Growing businesses ke liye',
      features: [
        { included: true, text: '2 WhatsApp numbers' },
        { included: true, text: 'Unlimited messages' },
        { included: true, text: 'Unlimited templates' },
        { included: true, text: 'Advanced analytics' },
        { included: true, text: '3 team members' },
        { included: false, text: 'API access' },
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '19,999',
      description: 'Large scale operations ke liye',
      features: [
        { included: true, text: '5 WhatsApp numbers' },
        { included: true, text: 'Unlimited everything' },
        { included: true, text: 'Unlimited templates' },
        { included: true, text: 'Full analytics suite' },
        { included: true, text: 'Unlimited team' },
        { included: true, text: 'API access' },
      ],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Apne business ke hisaab se plan chunein
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">Rs. {plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/signup">
                    Abhi Shuru Karein
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'Pehle din mein 50 messages handle karta tha, ab 500 bhi easy hain. Time bachta hai aur customers bhi khush.',
      author: 'Ali Hassan',
      business: 'Karachi Cloth House',
      rating: 5,
    },
    {
      quote: 'Eid pe broadcast se sales 3x barh gayi. Sab customers ko offer pohanchana ab mushkil nahi raha.',
      author: 'Sara Bibi',
      business: 'Home Bakers Lahore',
      rating: 5,
    },
    {
      quote: 'Order management ab organized hai. Pehle WhatsApp mein dhoondna parta tha, ab sab track hota hai.',
      author: 'Ahmed Malik',
      business: 'Islamabad Electronics',
      rating: 5,
    },
  ]

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Hamare Customers Kya Kehte Hain
          </h2>
        </div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
              Apna Business Aaj Hi Smart Banayein
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              7 din ka free trial. Credit card ki zaroorat nahi.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link href="/signup">
                  Free Trial Shuru Karein
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Contact Sales
              </Button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Apna Business, Smart Business. Pakistan se, Pakistan ke liye.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">Integrations</a></li>
              <li><a href="#" className="hover:text-foreground">API</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About Us</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 BizChat Pro. Pakistan se, Pakistan ke liye.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>JazzCash</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Easypaisa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
