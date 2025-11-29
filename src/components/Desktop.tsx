'use client'

import React from 'react'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { useAgents } from '@/contexts/AgentContext'

interface DesktopProps {
  onOpenWindow: (windowId: string, appId: string, title: string, agentId?: string, source?: 'builtin' | 'user') => void
}

export default function Desktop({ onOpenWindow }: DesktopProps) {
  const { agents } = useAgents()

  const handleDoubleClick = (agent: AgentManifestWithSource) => {
    onOpenWindow(`agent_${agent.id}`, agent.id, agent.name, agent.id, agent.source)
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
          fontSize: '12px',
          color: textColor,
          textShadow: 'none',
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
        {agents.map((agent) => (
          <Icon
            key={`${agent.source}_${agent.id}`}
            icon={agent.icon}
            label={agent.name}
            onDoubleClick={() => handleDoubleClick(agent)}
          />
        ))}
      </div>

      {/* Bottom Right: Read Me, Agent Lab, and Control Panel */}
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
        />
        <Icon
          icon="🤖"
          label="Agent Creator"
          onDoubleClick={() => onOpenWindow('agent_lab', 'agent_lab', 'Agent Creator')}
        />
        <Icon
          icon="🛝"
          label="Playground"
          onDoubleClick={() => onOpenWindow('playground', 'playground', 'Playground')}
        />
        <Icon
          icon="⚙️"
          label="Control Panel"
          onDoubleClick={() => onOpenWindow('control_panel', 'control_panel', 'Control Panel')}
        />
      </div>
    </>
  )
}
