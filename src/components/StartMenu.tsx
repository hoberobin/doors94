'use client'

import React from 'react'
import Link from 'next/link'
import { useAgents } from '@/contexts/AgentContext'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { APPS } from '@/lib/apps'

export interface StartMenuProps {
  onOpenApp: (appId: string) => void
  onOpenAgent: (agent: AgentManifestWithSource) => void
  onResetLayout: () => void
  onClose: () => void
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: string
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button type="button" role="menuitem" className="win95-start-menu-item" onClick={onClick} title={hint}>
      <span className="win95-start-menu-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

export default function StartMenu({ onOpenApp, onOpenAgent, onResetLayout, onClose }: StartMenuProps) {
  const { agents } = useAgents()

  const pick = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <div className="win95-start-menu" role="menu" aria-label="Start menu">
      <div className="win95-start-menu-band" aria-hidden="true">
        <span>doors94</span>
      </div>
      <div className="win95-start-menu-items">
        {APPS.map((app) => (
          <MenuItem key={app.id} icon={app.icon} label={app.label} hint={app.hint} onClick={pick(() => onOpenApp(app.id))} />
        ))}
        <div className="win95-start-menu-separator" role="separator" />
        <div className="win95-start-menu-heading">Agents</div>
        <div className="win95-start-menu-scroll">
          {agents.map((agent) => (
            <MenuItem
              key={`${agent.source}_${agent.id}`}
              icon={agent.icon}
              label={agent.name}
              hint={agent.description}
              onClick={pick(() => onOpenAgent(agent))}
            />
          ))}
        </div>
        <div className="win95-start-menu-separator" role="separator" />
        <MenuItem icon="🧹" label="Reset window layout" hint="Close everything and forget saved window positions" onClick={pick(onResetLayout)} />
        <Link href="/" role="menuitem" className="win95-start-menu-item" onClick={onClose}>
          <span className="win95-start-menu-icon" aria-hidden="true">
            🚪
          </span>
          <span>Shut down to landing page</span>
        </Link>
      </div>
    </div>
  )
}
