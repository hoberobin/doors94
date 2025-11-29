import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'doors94 - a Windows 95 style Custom AI Agents Creator Sandbox',
  description: 'doors94 - a Windows 95 style Custom AI Agents Creator Sandbox',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

