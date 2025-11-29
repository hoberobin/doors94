'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AgentManifestWithSource } from '@/lib/agentManifest'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentChatWindowProps {
  agent: AgentManifestWithSource
}

export default function AgentChatWindow({ agent }: AgentChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Send full manifest to API (Option A from plan)
      const requestBody = {
        agentManifest: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          icon: agent.icon,
          purpose: agent.purpose,
          rules: agent.rules,
          tone: agent.tone,
          outputStyle: agent.outputStyle,
        },
        messages: updatedMessages,
        mode: 'agent' as const,
      };

      console.log('Sending request to /api/chat with:', {
        agentId: requestBody.agentManifest.id,
        agentName: requestBody.agentManifest.name,
        messageCount: requestBody.messages.length,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response received, status:', response.status);

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
      }

      setMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`,
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '300px',
      }}
    >
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          backgroundColor: '#ffffff',
          border: '2px inset',
          borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
          marginBottom: '8px',
          minHeight: '200px',
          maxHeight: '400px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              color: '#808080',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            Start a conversation with {agent.name}...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '6px 10px',
                  backgroundColor: message.role === 'user' ? '#c0c0c0' : '#e0e0e0',
                  border: '1px solid',
                  borderColor: message.role === 'user' 
                    ? 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)'
                    : 'var(--win95-border-light) var(--win95-border-dark) var(--win95-border-dark) var(--win95-border-light)',
                  borderRadius: '2px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    fontSize: '10px',
                    color: '#000080',
                  }}
                >
                  {message.role === 'user' ? 'You' : agent.name}
                </div>
                <div style={{ color: '#000000' }}>{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '6px 10px',
                backgroundColor: '#e0e0e0',
                border: '1px solid',
                borderColor: 'var(--win95-border-light) var(--win95-border-dark) var(--win95-border-dark) var(--win95-border-light)',
                borderRadius: '2px',
                fontSize: '11px',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  fontSize: '10px',
                  color: '#000080',
                }}
              >
                {agent.name}
              </div>
              <div style={{ color: '#000000' }}>Thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: '60px',
              maxHeight: '120px',
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
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="win95-button"
            style={{
              minWidth: '60px',
              height: '60px',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
