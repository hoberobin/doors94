import type { Metadata } from 'next'
import '../styles/globals.css'
import { AgentProvider } from '@/contexts/AgentContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'doors94 - A Windows 95-style sandbox for learning AI agent design through hands-on experimentation.',
  description: 'doors94 - A Windows 95-style sandbox for learning AI agent design through hands-on experimentation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AgentProvider>
            {children}
          </AgentProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

