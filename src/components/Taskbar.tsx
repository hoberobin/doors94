'use client'

import React from 'react'

interface Window {
  id: string
  title: string
  appId: string
  minimized: boolean
}

interface TaskbarProps {
  windows: Window[]
  activeWindowId: string | null
  onSelectWindow: (windowId: string) => void
}

export default function Taskbar({
  windows,
  activeWindowId,
  onSelectWindow,
}: TaskbarProps) {
  const visibleWindows = windows.filter((w) => !w.minimized)

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
        justifyContent: 'space-between',
        zIndex: 10000,
      }}
    >
      <button className="win95-taskbar-start">Start</button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flex: 1,
          justifyContent: 'flex-end',
          paddingRight: '4px',
        }}
      >
        {visibleWindows.map((window) => (
          <div
            key={window.id}
            className={`win95-taskbar-item ${activeWindowId === window.id ? 'active' : ''}`}
            onClick={() => onSelectWindow(window.id)}
            style={{
              backgroundColor:
                activeWindowId === window.id
                  ? 'var(--win95-window-bg)'
                  : 'var(--win95-button-bg)',
              borderColor:
                activeWindowId === window.id
                  ? 'var(--win95-border-darker) var(--win95-border-light) var(--win95-border-light) var(--win95-border-darker)'
                  : 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
              boxShadow:
                activeWindowId === window.id
                  ? 'inset 1px 1px 0 0 var(--win95-shadow-dark), inset -1px -1px 0 0 var(--win95-shadow-light)'
                  : '1px 1px 0 0 var(--win95-shadow-dark), -1px -1px 0 0 var(--win95-shadow-light), 1px 1px 0 1px var(--win95-shadow-darker), -1px -1px 0 1px var(--win95-shadow-light)',
            }}
          >
            {window.title}
          </div>
        ))}
      </div>
    </div>
  )
}

