'use client'

import React, { useState } from 'react'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { useAgents } from '@/contexts/AgentContext'
import { APPS } from '@/lib/apps'

interface DesktopProps {
  onOpenApp: (appId: string) => void
  onOpenAgent: (agent: AgentManifestWithSource) => void
}

function DesktopIcon({
  id,
  icon,
  label,
  hint,
  selected,
  onSelect,
  onOpen,
}: {
  id: string
  icon: string
  label: string
  hint?: string
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className={`win95-desktop-icon${selected ? ' selected' : ''}`}
      title={hint || `Double-click to open ${label}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      onFocus={() => onSelect(id)}
    >
      <span className="win95-desktop-icon-image" aria-hidden="true">
        {icon}
      </span>
      <span className="win95-desktop-icon-label">{label}</span>
    </button>
  )
}

export default function Desktop({ onOpenApp, onOpenAgent }: DesktopProps) {
  const { agents } = useAgents()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div
      className="win95-desktop"
      onClick={() => setSelectedId(null)}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      <div className="win95-desktop-column" style={{ top: '12px', left: '12px', bottom: '48px' }}>
        {agents.map((agent) => (
          <DesktopIcon
            key={`${agent.source}_${agent.id}`}
            id={`agent_${agent.id}`}
            icon={agent.icon}
            label={agent.name}
            hint={agent.description}
            selected={selectedId === `agent_${agent.id}`}
            onSelect={setSelectedId}
            onOpen={() => onOpenAgent(agent)}
          />
        ))}
      </div>

      <div className="win95-desktop-column" style={{ bottom: '48px', right: '12px' }}>
        {APPS.filter((app) => app.id !== 'welcome').map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            icon={app.icon}
            label={app.label}
            hint={app.hint}
            selected={selectedId === app.id}
            onSelect={setSelectedId}
            onOpen={() => onOpenApp(app.id)}
          />
        ))}
      </div>
    </div>
  )
}
