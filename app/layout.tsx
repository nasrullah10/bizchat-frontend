import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BizChat Pro - Apna Business, Smart Business',
  description: 'WhatsApp Automation SaaS Platform for Pakistani Small Businesses. Auto-replies, order management, customer tracking - sab aik jagah.',
  keywords: ['WhatsApp', 'Business', 'Pakistan', 'Automation', 'CRM', 'Orders', 'Marketing'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#059669',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      className="bg-background"
      suppressHydrationWarning
    >
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}