import { AgentManifest } from './agentManifest'
import { Message } from './conversationStorage'

export interface ChatRequest {
  messages: Message[]
  mode: 'raw' | 'agent'
  agentManifest?: AgentManifest
}

/**
 * Calls /api/chat and streams the reply. `onChunk` receives the text so far
 * (not the delta) each time more arrives. Resolves with the complete reply.
 */
export async function streamChat(
  request: ChatRequest,
  onChunk: (textSoFar: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
    onChunk(text)
  }
  text += decoder.decode()
  onChunk(text)
  return text
}

export function toManifest(agent: AgentManifest): AgentManifest {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    icon: agent.icon,
    purpose: agent.purpose,
    rules: agent.rules,
    tone: agent.tone,
    outputStyle: agent.outputStyle,
  }
}
