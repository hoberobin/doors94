'use client'

import React, { useState, useEffect } from 'react'
import Win95Window from './Win95Window'
import { AgentManifest } from '@/lib/agentManifest'
import { getAllAgents } from '@/lib/agentStorage'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface PlaygroundWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

export default function PlaygroundWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
}: PlaygroundWindowProps) {
  const [agents, setAgents] = useState<AgentManifest[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [input, setInput] = useState('')
  const [rawResponse, setRawResponse] = useState<string>('')
  const [agentResponse, setAgentResponse] = useState<string>('')
  const [rawLoading, setRawLoading] = useState(false)
  const [agentLoading, setAgentLoading] = useState(false)
  const [rawError, setRawError] = useState<string | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)

  // Load agents on mount
  useEffect(() => {
    const allAgents = getAllAgents()
    setAgents(allAgents.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      purpose: a.purpose,
      rules: a.rules,
      tone: a.tone,
      outputStyle: a.outputStyle,
    })))
    
    // Select first agent by default
    if (allAgents.length > 0) {
      setSelectedAgentId(allAgents[0].id)
    }
  }, [])

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  const handleCompare = async () => {
    if (!input.trim() || !selectedAgent) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    const messages = [userMessage]

    // Reset states
    setRawResponse('')
    setAgentResponse('')
    setRawError(null)
    setAgentError(null)

    // Call raw GPT
    setRawLoading(true)
    try {
      const rawResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          mode: 'raw',
        }),
      })

      if (!rawResponse.ok) {
        const errorData = await rawResponse.json()
        throw new Error(errorData.error || 'Failed to get raw response')
      }

      const rawData = await rawResponse.json()
      setRawResponse(rawData.content)
    } catch (error) {
      setRawError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setRawLoading(false)
    }

    // Call agent
    setAgentLoading(true)
    try {
      const agentResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentManifest: selectedAgent,
          messages,
          mode: 'agent',
        }),
      })

      if (!agentResponse.ok) {
        const errorData = await agentResponse.json()
        throw new Error(errorData.error || 'Failed to get agent response')
      }

      const agentData = await agentResponse.json()
      setAgentResponse(agentData.content)
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setAgentLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCompare()
    }
  }

  return (
    <Win95Window
      title="Playground"
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
          minHeight: '500px',
        }}
      >
        {/* Control Panel */}
        <div
          style={{
            padding: '12px',
            borderBottom: '2px solid var(--win95-border-dark)',
            backgroundColor: '#c0c0c0',
          }}
        >
          <div style={{ fontSize: '10px', color: '#000000', marginBottom: '8px', fontStyle: 'italic' }}>
            Compare: Select an agent and enter the same message to see how prompts shape behavior
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
              Agent to compare:
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: '11px',
                fontFamily: 'inherit',
                border: '2px inset',
                borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                backgroundColor: '#ffffff',
              }}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Cmd/Ctrl+Enter to compare)"
              style={{
                flex: 1,
                minHeight: '60px',
                maxHeight: '100px',
                padding: '4px',
                fontSize: '11px',
                fontFamily: 'inherit',
                border: '2px inset',
                borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                backgroundColor: '#ffffff',
                resize: 'vertical',
              }}
            />
            <button
              onClick={handleCompare}
              disabled={!input.trim() || !selectedAgent || rawLoading || agentLoading}
              className="win95-button"
              style={{
                minWidth: '80px',
                height: '60px',
                opacity: (!input.trim() || !selectedAgent || rawLoading || agentLoading) ? 0.5 : 1,
                cursor: (!input.trim() || !selectedAgent || rawLoading || agentLoading) ? 'not-allowed' : 'pointer',
              }}
            >
              Compare
            </button>
          </div>
        </div>

        {/* Split View */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: '8px',
            padding: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Raw GPT Pane */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '2px inset',
              borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                padding: '6px 8px',
                backgroundColor: '#e0e0e0',
                borderBottom: '1px solid var(--win95-border-dark)',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              Left: Raw GPT (No System Prompt)
            </div>
            <div
              style={{
                flex: 1,
                padding: '8px',
                overflowY: 'auto',
                fontSize: '11px',
                color: '#000000',
              }}
            >
              {rawLoading && (
                <div style={{ color: '#808080', fontStyle: 'italic' }}>Thinking...</div>
              )}
              {rawError && (
                <div style={{ color: '#ff0000' }}>Error: {rawError}</div>
              )}
              {!rawLoading && !rawError && !rawResponse && (
                <div style={{ color: '#808080', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Enter a message and click Compare to see the raw GPT response
                </div>
              )}
              {!rawLoading && !rawError && rawResponse && (
                <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{rawResponse}</div>
              )}
            </div>
          </div>

          {/* Agent Pane */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '2px inset',
              borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
              backgroundColor: '#f0f0f0',
            }}
          >
            <div
              style={{
                padding: '6px 8px',
                backgroundColor: '#e0e0e0',
                borderBottom: '1px solid var(--win95-border-dark)',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              Right: {selectedAgent ? `${selectedAgent.icon} ${selectedAgent.name} (With System Prompt)` : 'No Agent Selected'}
            </div>
            <div
              style={{
                flex: 1,
                padding: '8px',
                overflowY: 'auto',
                fontSize: '11px',
                color: '#000000',
              }}
            >
              {agentLoading && (
                <div style={{ color: '#808080', fontStyle: 'italic' }}>Thinking...</div>
              )}
              {agentError && (
                <div style={{ color: '#ff0000' }}>Error: {agentError}</div>
              )}
              {!agentLoading && !agentError && !agentResponse && (
                <div style={{ color: '#808080', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Enter a message and click Compare to see the agent's response
                </div>
              )}
              {!agentLoading && !agentError && agentResponse && (
                <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{agentResponse}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Win95Window>
  )
}

