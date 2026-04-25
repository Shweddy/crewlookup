import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrewLink — Cabin Crew Contact Lookup',
  description: 'Find and connect with cabin crew members via LINE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
