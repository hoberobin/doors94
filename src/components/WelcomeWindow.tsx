'use client'

import React from 'react'
import Win95Window from './Win95Window'
import { EXAMPLE_AGENTS } from '@/lib/builtinAgents'

interface WelcomeWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  onMaximize?: () => void
  isMaximized?: boolean
  style?: React.CSSProperties
  onOpenApp: (appId: string) => void
  onOpenTutorial: () => void
}

const ACTION_STYLE: React.CSSProperties = {
  justifyContent: 'flex-start',
  gap: '10px',
  padding: '8px 12px',
  textAlign: 'left',
  width: '100%',
}

export default function WelcomeWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  onMaximize,
  isMaximized,
  style,
  onOpenApp,
  onOpenTutorial,
}: WelcomeWindowProps) {
  const go = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <Win95Window
      title="Welcome to doors94"
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      onClick={onClick}
      onMove={onMove}
      onResize={onResize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={style}
    >
      <div style={{ padding: '12px 16px', color: '#000000', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
        <p style={{ lineHeight: 1.5 }}>
          This desktop is a sandbox for learning how AI agents are designed. Every agent is a small
          manifest (purpose, rules, tone) that compiles into a system prompt. Build one, chat with it,
          then compare it against raw GPT.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button className="win95-button" style={ACTION_STYLE} onClick={go(() => onOpenApp('playground'))}>
            <span style={{ fontSize: '18px' }}>🛝</span>
            <span>
              <strong>Try the Playground</strong>
              <span style={{ display: 'block', fontSize: '12px', color: '#404040' }}>
                See how {EXAMPLE_AGENTS[0].name} answers next to raw GPT. One click.
              </span>
            </span>
          </button>
          <button className="win95-button" style={ACTION_STYLE} onClick={go(() => onOpenApp('agent_lab'))}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <span>
              <strong>Create your first agent</strong>
              <span style={{ display: 'block', fontSize: '12px', color: '#404040' }}>
                Five quick steps. Load an example if you want a head start.
              </span>
            </span>
          </button>
          <button className="win95-button" style={ACTION_STYLE} onClick={go(onOpenTutorial)}>
            <span style={{ fontSize: '18px' }}>📚</span>
            <span>
              <strong>Ask the Tutorial agent</strong>
              <span style={{ display: 'block', fontSize: '12px', color: '#404040' }}>
                A built-in guide that only talks about doors94.
              </span>
            </span>
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#404040', marginTop: 'auto' }}>
          Tip: double-click any icon to open it. The Start menu lists everything, and built-in agents
          can be remixed into your own from Manage Agents.
        </p>
      </div>
    </Win95Window>
  )
}
