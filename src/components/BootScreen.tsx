'use client'

import React, { useEffect } from 'react'

interface BootScreenProps {
  onDone: () => void
}

export const BOOT_DURATION_MS = 1800

export default function BootScreen({ onDone }: BootScreenProps) {
  useEffect(() => {
    const id = window.setTimeout(onDone, BOOT_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [onDone])

  return (
    <div className="win95-boot" onClick={onDone} role="status" aria-label="Starting doors94">
      <div className="win95-boot-logo">
        <span aria-hidden="true">🪟</span> doors94
      </div>
      <div className="win95-boot-tagline">A sandbox for learning agent design</div>
      <div className="win95-boot-bar" aria-hidden="true">
        <div className="win95-boot-bar-fill" />
      </div>
      <div className="win95-boot-hint">Starting doors94... (click to skip)</div>
    </div>
  )
}
