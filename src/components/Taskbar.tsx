'use client'

import React, { useEffect, useRef, useState } from 'react'
import StartMenu, { StartMenuProps } from './StartMenu'

interface TaskbarWindow {
  id: string
  title: string
  appId: string
  minimized: boolean
}

interface TaskbarProps extends Omit<StartMenuProps, 'onClose'> {
  windows: TaskbarWindow[]
  activeWindowId: string | null
  onSelectWindow: (windowId: string) => void
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function Taskbar({
  windows,
  activeWindowId,
  onSelectWindow,
  ...startMenuProps
}: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false)
  const [clock, setClock] = useState('')
  const startRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()))
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!startOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStartOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [startOpen])

  return (
    <div
      className="win95-taskbar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10000,
      }}
    >
      <div ref={startRef} style={{ position: 'relative' }}>
        <button
          className={`win95-taskbar-start${startOpen ? ' active' : ''}`}
          onClick={() => setStartOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={startOpen}
          aria-label="Start menu"
        >
          <span aria-hidden="true" style={{ marginRight: '4px' }}>🪟</span>Start
        </button>
        {startOpen && <StartMenu {...startMenuProps} onClose={() => setStartOpen(false)} />}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flex: 1,
          minWidth: 0,
          paddingLeft: '6px',
          paddingRight: '4px',
          overflow: 'hidden',
        }}
      >
        {windows.map((w) => {
          const pressed = activeWindowId === w.id && !w.minimized
          return (
            <button
              key={w.id}
              className={`win95-taskbar-item${pressed ? ' active' : ''}`}
              onClick={() => onSelectWindow(w.id)}
              aria-pressed={pressed}
              title={w.minimized ? `Restore ${w.title}` : w.title}
              style={{
                fontWeight: pressed ? 'bold' : 'normal',
                fontStyle: w.minimized ? 'italic' : 'normal',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {w.title}
            </button>
          )
        })}
      </div>

      <div className="win95-taskbar-tray" aria-live="off" title={new Date().toDateString()}>
        {clock}
      </div>
    </div>
  )
}
