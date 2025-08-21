import type { Metadata } from 'next'
import './globals.css'
import { LocationProvider } from '@/contexts/LocationContext'
import { PostsProvider } from '@/contexts/PostsContext'
import Navigation from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'SayDone - Student Services Platform',
  description: 'Connect with student services - jobs, rides, accommodation, and marketplace. Built for UK university students.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LocationProvider defaultRadius={20}>
          <PostsProvider>
            <Navigation />
            {children}
            <Toaster />
          </PostsProvider>
        </LocationProvider>
      </body>
    </html>
  )
}
