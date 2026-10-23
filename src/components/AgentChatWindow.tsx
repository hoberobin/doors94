'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { saveConversation, loadLatestConversation, Message } from '@/lib/conversationStorage'
import { streamChat, toManifest } from '@/lib/chatClient'
import { CHAT_MODEL } from '@/lib/constants'
import Markdown from './Markdown'

interface AgentChatWindowProps {
  agent: AgentManifestWithSource
}

const INPUT_STYLE: React.CSSProperties = {
  flex: 1,
  minHeight: '56px',
  maxHeight: '140px',
  padding: '4px 6px',
  fontSize: '13px',
  fontFamily: 'inherit',
  border: '2px inset',
  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
  backgroundColor: '#ffffff',
  resize: 'vertical',
}

export default function AgentChatWindow({ agent }: AgentChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useRef<string | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const latest = loadLatestConversation(agent.id)
    if (latest) {
      conversationId.current = latest.id
      setMessages(latest.messages)
    }
    inputRef.current?.focus()
    return () => abortRef.current?.abort()
  }, [agent.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const persist = (next: Message[]) => {
    conversationId.current = saveConversation(agent.id, next, conversationId.current)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const history = [...messages, { role: 'user' as const, content: input.trim() }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)
    persist(history)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const reply = await streamChat(
        { agentManifest: toManifest(agent), messages: history, mode: 'agent' },
        (textSoFar) => setMessages([...history, { role: 'assistant', content: textSoFar }]),
        controller.signal
      )
      const finalMessages: Message[] = [...history, { role: 'assistant', content: reply }]
      setMessages(finalMessages)
      persist(finalMessages)
    } catch (error) {
      if (controller.signal.aborted) return
      const finalMessages: Message[] = [
        ...history,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}` },
      ]
      setMessages(finalMessages)
      persist(finalMessages)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleNewChat = () => {
    abortRef.current?.abort()
    setIsLoading(false)
    conversationId.current = undefined
    setMessages([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const lastIndex = messages.length - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '260px', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#000000' }}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={agent.description}>
          {agent.description || agent.purpose}
        </span>
        <button className="win95-button win95-chip" onClick={handleNewChat} disabled={messages.length === 0} title="Start over with an empty conversation">
          New chat
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '8px',
          backgroundColor: '#ffffff',
          border: '2px inset',
          borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: '#808080', fontStyle: 'italic', textAlign: 'center', padding: '24px 12px', lineHeight: 1.5 }}>
            Say hello to {agent.name}.
            <br />
            Enter sends, Shift+Enter adds a line.
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === 'user'
            const isError = !isUser && message.content.startsWith('Error:')
            const streaming = isLoading && index === lastIndex && !isUser
            return (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '6px 10px',
                    backgroundColor: isUser ? '#c0c0c0' : isError ? '#ffe6e6' : '#e8e8e8',
                    border: '1px solid',
                    borderColor: isUser
                      ? 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)'
                      : 'var(--win95-border-light) var(--win95-border-dark) var(--win95-border-dark) var(--win95-border-light)',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    color: isError ? '#800000' : '#000000',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '12px', color: '#000080' }}>
                    {isUser ? 'You' : `${agent.icon} ${agent.name}`}
                  </div>
                  {isUser || isError ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  ) : message.content ? (
                    <div className={streaming ? 'win95-cursor' : undefined}>
                      <Markdown text={message.content} />
                    </div>
                  ) : (
                    <span className="win95-loading" style={{ color: '#404040' }}>
                      Thinking<span className="win95-loading-dots" />
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agent.name}...`}
          aria-label="Message input"
          aria-describedby="chat-input-help"
          style={INPUT_STYLE}
        />
        <span id="chat-input-help" className="sr-only">Press Enter to send, Shift+Enter for new line</span>
        <button
          onClick={isLoading ? handleNewChat : handleSend}
          disabled={!isLoading && !input.trim()}
          className="win95-button"
          aria-label={isLoading ? 'Stop generating' : 'Send message'}
          style={{ minWidth: '64px' }}
        >
          {isLoading ? 'Stop' : 'Send'}
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#404040', display: 'flex', justifyContent: 'space-between' }}>
        <span>{CHAT_MODEL} · {agent.tone} tone · {agent.rules.length} rule{agent.rules.length === 1 ? '' : 's'}</span>
        <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}
