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

  // Icon component to reduce duplication
  const Icon = ({ 
    icon, 
    label, 
    onDoubleClick, 
    textColor = '#ffffff' 
  }: { 
    icon: string | React.ReactNode
    label: string
    onDoubleClick: () => void
    textColor?: string
  }) => (
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
      onDoubleClick={onDoubleClick}
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
        {icon}
      </div>
      <span
        style={{
          fontSize: '11px',
          color: textColor,
          textShadow: textColor === '#ffffff' ? 'none' : '1px 1px 0 rgba(255,255,255,0.8)',
          textAlign: 'center',
          maxWidth: '64px',
        }}
      >
        {label}
      </span>
    </div>
  )

  return (
    <>
      {/* Top Left: AI Agents */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {AGENTS.map((agent) => (
          <Icon
            key={agent.id}
            icon={agent.icon}
            label={agent.name}
            onDoubleClick={() => handleDoubleClick(agent)}
            textColor="#ffffff"
          />
        ))}
      </div>

      {/* Bottom Right: Read Me and Control Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px', // Above the taskbar
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <Icon
          icon="📄"
          label="Read Me"
          onDoubleClick={() => onOpenWindow('readme', 'readme', 'Read Me')}
          textColor="#000000"
        />
        <Icon
          icon="⚙️"
          label="Control Panel"
          onDoubleClick={() => onOpenWindow('control_panel', 'control_panel', 'Control Panel')}
          textColor="#000000"
        />
      </div>
    </>
  )
}

