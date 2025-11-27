'use client'

import React from 'react'
import { AGENTS, AgentConfig } from '@/lib/agents'

interface DesktopProps {
  onOpenWindow: (windowId: string, appId: string, title: string, agentId?: string) => void
}

export default function Desktop({ onOpenWindow }: DesktopProps) {
  const handleDoubleClick = (agent: AgentConfig) => {
    onOpenWindow(agent.id, agent.id, agent.defaultWindowTitle, agent.id)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '24px',
        paddingTop: '16px',
        paddingLeft: '16px',
      }}
    >
      {/* Read Me Icon */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '4px',
          userSelect: 'none',
        }}
        onDoubleClick={() => onOpenWindow('readme', 'readme', 'Read Me')}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--win95-window-bg)',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '1px 1px 0 0 var(--win95-shadow-dark), -1px -1px 0 0 var(--win95-shadow-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          📄
        </div>
        <span
          style={{
            fontSize: '11px',
            color: '#000000',
            textShadow: '1px 1px 0 rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: '64px',
          }}
        >
          Read Me
        </span>
      </div>

      {/* Control Panel Icon */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '4px',
          userSelect: 'none',
        }}
        onDoubleClick={() => onOpenWindow('control_panel', 'control_panel', 'Control Panel')}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--win95-window-bg)',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '1px 1px 0 0 var(--win95-shadow-dark), -1px -1px 0 0 var(--win95-shadow-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ⚙️
        </div>
        <span
          style={{
            fontSize: '11px',
            color: '#000000',
            textShadow: '1px 1px 0 rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: '64px',
          }}
        >
          Control Panel
        </span>
      </div>

      {AGENTS.map((agent) => (
        <div
          key={agent.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px',
            userSelect: 'none',
          }}
          onDoubleClick={() => handleDoubleClick(agent)}
          onClick={(e) => {
            // Single click to select (optional - could add selection state)
            e.stopPropagation()
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--win95-window-bg)',
              border: '2px solid',
              borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
              boxShadow: '1px 1px 0 0 var(--win95-shadow-dark), -1px -1px 0 0 var(--win95-shadow-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            {agent.icon}
          </div>
          <span
            style={{
              fontSize: '11px',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '64px',
            }}
          >
            {agent.name}
          </span>
        </div>
      ))}
    </div>
  )
}

