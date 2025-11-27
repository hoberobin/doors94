'use client'

import React, { useState, useEffect } from 'react'
import Win95Window from './Win95Window'
import { getUserContext, saveUserContext, UserContext } from '@/lib/userContext'
import { AGENTS, AgentId } from '@/lib/agents'
import { getAgentOverrides, saveAgentOverrides, AgentOverrides } from '@/lib/userContext'

interface ControlPanelWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

type Tab = 'context' | 'agents'

export default function ControlPanelWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
}: ControlPanelWindowProps) {
  const [activeTab, setActiveTab] = useState<Tab>('context')
  const [showSavedDialog, setShowSavedDialog] = useState(false)
  
  // Context tab state
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [projects, setProjects] = useState('')
  const [tone, setTone] = useState<'friendly' | 'blunt' | 'concise' | 'playful'>('friendly')
  
  // Agents tab state
  const [agentOverrides, setAgentOverrides] = useState<AgentOverrides>({})

  // Load data on mount
  useEffect(() => {
    const userContext = getUserContext()
    if (userContext) {
      setName(userContext.name)
      setRole(userContext.role)
      setProjects(userContext.projects)
      setTone(userContext.tone)
    }
    
    const overrides = getAgentOverrides()
    setAgentOverrides(overrides)
  }, [])

  const handleSaveContext = () => {
    const userContext: UserContext = {
      name: name.trim(),
      role: role.trim(),
      projects: projects.trim(),
      tone,
    }
    
    saveUserContext(userContext)
    setShowSavedDialog(true)
    setTimeout(() => setShowSavedDialog(false), 2000)
  }

  const handleSaveAgents = () => {
    saveAgentOverrides(agentOverrides)
    setShowSavedDialog(true)
    setTimeout(() => setShowSavedDialog(false), 2000)
  }

  const handleAgentOverrideChange = (agentId: AgentId, value: string) => {
    setAgentOverrides((prev) => ({
      ...prev,
      [agentId]: value,
    }))
  }

  return (
    <>
      <Win95Window
        title="Control Panel"
        isActive={isActive}
        onClose={onClose}
        onMinimize={onMinimize}
        onClick={onClick}
        onMove={onMove}
        onResize={onResize}
        style={style}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '400px',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid var(--win95-border-dark)',
              backgroundColor: '#c0c0c0',
            }}
          >
            <button
              onClick={() => setActiveTab('context')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                borderRight: '1px solid var(--win95-border-dark)',
                backgroundColor: activeTab === 'context' ? '#c0c0c0' : '#d4d0c8',
                color: '#000000',
                cursor: 'pointer',
                borderBottom: activeTab === 'context' ? '2px solid #c0c0c0' : 'none',
                marginBottom: activeTab === 'context' ? '-2px' : '0',
              }}
            >
              Context
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                backgroundColor: activeTab === 'agents' ? '#c0c0c0' : '#d4d0c8',
                color: '#000000',
                cursor: 'pointer',
                borderBottom: activeTab === 'agents' ? '2px solid #c0c0c0' : 'none',
                marginBottom: activeTab === 'agents' ? '-2px' : '0',
              }}
            >
              Agents
            </button>
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              backgroundColor: '#c0c0c0',
            }}
          >
            {activeTab === 'context' ? (
              <div style={{ color: '#000000' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                  User Context
                </h2>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      marginBottom: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      border: '2px inset',
                      borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      marginBottom: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    Role:
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      border: '2px inset',
                      borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      marginBottom: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    Projects / Goals:
                  </label>
                  <textarea
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '4px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      border: '2px inset',
                      borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    Communication Tone:
                  </label>
                  {(['friendly', 'blunt', 'concise', 'playful'] as const).map((toneOption) => (
                    <label
                      key={toneOption}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={toneOption}
                        checked={tone === toneOption}
                        onChange={() => setTone(toneOption)}
                        style={{
                          marginRight: '8px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{toneOption}</span>
                    </label>
                  ))}
                </div>
                <button
                  className="win95-button"
                  onClick={handleSaveContext}
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ color: '#000000' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Agent Customization
                </h2>
                <p style={{ fontSize: '11px', marginBottom: '16px', color: '#000000' }}>
                  Add extra instructions for each agent. These will be appended to the agent's base system prompt.
                </p>
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      marginBottom: '20px',
                      padding: '12px',
                      border: '1px solid var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                        {agent.description}
                      </div>
                    </div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        marginBottom: '4px',
                        fontWeight: 'bold',
                        color: '#000000',
                      }}
                    >
                      Extra Instructions:
                    </label>
                    <textarea
                      value={agentOverrides[agent.id] || ''}
                      onChange={(e) => handleAgentOverrideChange(agent.id, e.target.value)}
                      placeholder="Add custom instructions for this agent..."
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                ))}
                <button
                  className="win95-button"
                  onClick={handleSaveAgents}
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </Win95Window>

      {/* Saved Dialog */}
      {showSavedDialog && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            backgroundColor: '#c0c0c0',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '2px 2px 0 0 var(--win95-shadow-dark), -2px -2px 0 0 var(--win95-shadow-light)',
            padding: '16px',
            minWidth: '200px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
            Context Saved
          </div>
          <div style={{ fontSize: '11px', marginBottom: '12px', color: '#000000' }}>
            Your preferences have been saved.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="win95-button"
              onClick={() => setShowSavedDialog(false)}
              style={{ minWidth: '60px' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}

