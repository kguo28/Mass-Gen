import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BAN Living Field Guide — Site Onboarding',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
