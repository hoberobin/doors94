import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Doors 94 - a Windows 95 style AI Custom Agents Creator Sandbox',
  description: 'Doors 94 - a Windows 95 style AI Custom Agents Creator Sandbox',
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

