import type { Metadata } from 'next'
import './globals.css'
import { LocationProvider } from '@/contexts/LocationContext'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
  title: 'SayDone - Student Services Platform',
  description: 'Connect with student services - jobs, rides, accommodation, and marketplace. Built for UK university students.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
          <Navigation />
          {children}
        </LocationProvider>
      </body>
    </html>
  )
}
