'use client'

import React, { useState, useEffect, useRef } from 'react'
import Win95Window from './Win95Window'
import Markdown from './Markdown'
import { AgentManifest, buildSystemPrompt } from '@/lib/agentManifest'
import { useAgents } from '@/contexts/AgentContext'
import { saveConversation, Message } from '@/lib/conversationStorage'
import { streamChat, toManifest } from '@/lib/chatClient'
import { TUTORIAL_AGENT_ID } from '@/lib/builtinAgents'

interface PlaygroundWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  onMaximize?: () => void
  isMaximized?: boolean
  style?: React.CSSProperties
}

const SAMPLE_PROMPTS = [
  'Why is the sky blue?',
  'Explain how a car engine works.',
  'What should I name my new puppy?',
  'Review this: function add(a, b) { return a - b }',
]

interface PaneState {
  text: string
  loading: boolean
  error: string | null
}

const IDLE: PaneState = { text: '', loading: false, error: null }

function ResultPane({
  title,
  state,
  placeholder,
  background,
  extra,
}: {
  title: React.ReactNode
  state: PaneState
  placeholder: string
  background: string
  extra?: React.ReactNode
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        border: '2px inset',
        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
        backgroundColor: background,
      }}
    >
      <div
        style={{
          padding: '6px 8px',
          backgroundColor: '#e0e0e0',
          borderBottom: '1px solid var(--win95-border-dark)',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {extra}
      </div>
      <div style={{ flex: 1, padding: '8px', overflowY: 'auto', fontSize: '13px', lineHeight: 1.45, color: '#000000' }}>
        {state.error && <div style={{ color: '#800000' }}>Error: {state.error}</div>}
        {!state.error && !state.text && state.loading && (
          <span className="win95-loading" style={{ color: '#404040', fontStyle: 'italic' }}>
            Thinking<span className="win95-loading-dots" />
          </span>
        )}
        {!state.error && !state.text && !state.loading && (
          <div style={{ color: '#808080', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>{placeholder}</div>
        )}
        {!state.error && state.text && (
          <div className={state.loading ? 'win95-cursor' : undefined}>
            <Markdown text={state.text} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlaygroundWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  onMaximize,
  isMaximized,
  style,
}: PlaygroundWindowProps) {
  const { agents: allAgents } = useAgents()
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [input, setInput] = useState('')
  const [raw, setRaw] = useState<PaneState>(IDLE)
  const [agentPane, setAgentPane] = useState<PaneState>(IDLE)
  const [showPrompt, setShowPrompt] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const agents: AgentManifest[] = allAgents.filter((a) => a.id !== TUTORIAL_AGENT_ID).map(toManifest)

  useEffect(() => {
    if (agents.length > 0 && !agents.some((a) => a.id === selectedAgentId)) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  useEffect(() => () => abortRef.current?.abort(), [])

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)
  const busy = raw.loading || agentPane.loading
  const canCompare = !!input.trim() && !!selectedAgent && !busy

  const handleCompare = async () => {
    if (!canCompare || !selectedAgent) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const messages = [userMessage]
    const controller = new AbortController()
    abortRef.current = controller

    setRaw({ text: '', loading: true, error: null })
    setAgentPane({ text: '', loading: true, error: null })

    const run = async (mode: 'raw' | 'agent', set: React.Dispatch<React.SetStateAction<PaneState>>) => {
      try {
        const text = await streamChat(
          { messages, mode, agentManifest: mode === 'agent' ? selectedAgent : undefined },
          (textSoFar) => set({ text: textSoFar, loading: true, error: null }),
          controller.signal
        )
        set({ text, loading: false, error: null })
        return text
      } catch (error) {
        if (controller.signal.aborted) {
          set((prev) => ({ ...prev, loading: false }))
          return null
        }
        set({ text: '', loading: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' })
        return null
      }
    }

    const [rawText, agentText] = await Promise.all([run('raw', setRaw), run('agent', setAgentPane)])

    if (rawText !== null && agentText !== null) {
      saveConversation(`playground_${selectedAgent.id}`, [
        userMessage,
        { role: 'assistant', content: `Raw GPT: ${rawText}\n\nAgent Response: ${agentText}` },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCompare()
    }
  }

  const compiledPrompt = selectedAgent ? buildSystemPrompt(selectedAgent) : ''

  return (
    <Win95Window
      title="Playground"
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '420px' }}>
        <div style={{ padding: '10px 12px', borderBottom: '2px solid var(--win95-border-dark)', backgroundColor: '#c0c0c0' }}>
          <div style={{ fontSize: '12px', color: '#000000', marginBottom: '8px' }}>
            Same message, two answers: raw GPT on the left, your agent's system prompt on the right.
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="playground-agent" style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
              Agent to compare:
            </label>
            <select
              id="playground-agent"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={busy}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: '13px',
                fontFamily: 'inherit',
                border: '2px inset',
                borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                backgroundColor: '#ffffff',
              }}
            >
              {agents.length === 0 && <option value="">No agents yet. Create one in Agent Creator.</option>}
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message for both sides..."
              aria-label="Message to compare"
              style={{
                flex: 1,
                minHeight: '56px',
                maxHeight: '120px',
                padding: '4px 6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                border: '2px inset',
                borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                backgroundColor: '#ffffff',
                resize: 'vertical',
              }}
            />
            <button
              onClick={busy ? () => abortRef.current?.abort() : handleCompare}
              disabled={!busy && !canCompare}
              className="win95-button"
              style={{ minWidth: '88px' }}
              title={busy ? 'Stop both responses' : 'Cmd/Ctrl+Enter'}
            >
              {busy ? 'Stop' : 'Compare'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: '#404040' }}>
            <span>Try:</span>
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="win95-button win95-chip"
                onClick={() => {
                  setInput(prompt)
                  inputRef.current?.focus()
                }}
                disabled={busy}
                title="Fill the message box"
              >
                {prompt}
              </button>
            ))}
            <span style={{ marginLeft: 'auto' }}>Cmd/Ctrl+Enter to compare</span>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '8px', padding: '8px' }}>
          <ResultPane
            title="Raw GPT (no system prompt)"
            state={raw}
            placeholder="The plain model, with no instructions at all."
            background="#ffffff"
          />
          <ResultPane
            title={selectedAgent ? `${selectedAgent.icon} ${selectedAgent.name} (with system prompt)` : 'No agent selected'}
            state={agentPane}
            placeholder={selectedAgent ? `${selectedAgent.name} answers the same message under its manifest.` : 'Pick an agent above.'}
            background="#f4f4f4"
            extra={
              selectedAgent && (
                <button
                  type="button"
                  className="win95-button win95-chip"
                  onClick={() => setShowPrompt((v) => !v)}
                  aria-expanded={showPrompt}
                  title="See the exact system prompt the manifest compiles to"
                >
                  {showPrompt ? 'Hide prompt' : 'Show prompt'}
                </button>
              )
            }
          />
        </div>

        {showPrompt && selectedAgent && (
          <div style={{ padding: '0 8px 8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
              System prompt sent for {selectedAgent.name} ({compiledPrompt.length} characters)
            </div>
            <textarea
              readOnly
              value={compiledPrompt}
              aria-label="Compiled system prompt"
              style={{
                width: '100%',
                height: '120px',
                padding: '6px',
                fontSize: '12px',
                fontFamily: "'Courier New', Courier, monospace",
                border: '2px inset',
                borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                backgroundColor: '#ffffff',
                resize: 'vertical',
                whiteSpace: 'pre-wrap',
              }}
            />
          </div>
        )}
      </div>
    </Win95Window>
  )
}
