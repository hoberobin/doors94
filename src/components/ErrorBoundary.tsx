'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            backgroundColor: '#c0c0c0',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '2px 2px 0 0 var(--win95-shadow-dark), -2px -2px 0 0 var(--win95-shadow-light)',
            padding: '20px',
            minWidth: '300px',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#000000',
            }}
          >
            Error
          </div>
          <div
            style={{
              fontSize: '11px',
              marginBottom: '16px',
              color: '#000000',
              lineHeight: '1.4',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              className="win95-button"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
              style={{ minWidth: '60px' }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


