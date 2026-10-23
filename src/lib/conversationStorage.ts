export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Conversation {
  id: string
  agentId: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY_PREFIX = 'DOORS94_CONVERSATION_'
const MAX_CONVERSATIONS_PER_AGENT = 20

function storageKey(agentId: string): string {
  return `${STORAGE_KEY_PREFIX}${agentId}`
}

function write(agentId: string, conversations: Conversation[]): void {
  try {
    localStorage.setItem(storageKey(agentId), JSON.stringify(conversations))
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Clearing old conversations.')
      const reduced = conversations.slice(0, Math.floor(MAX_CONVERSATIONS_PER_AGENT / 2))
      localStorage.setItem(storageKey(agentId), JSON.stringify(reduced))
    }
  }
}

/**
 * Saves a conversation. Pass the id returned by an earlier call to update
 * that conversation in place; omit it to start a new one. Returns the id.
 */
export function saveConversation(agentId: string, messages: Message[], conversationId?: string): string {
  if (typeof window === 'undefined') {
    return conversationId ?? ''
  }

  const now = Date.now()
  const conversations = loadConversations(agentId)
  const existing = conversationId ? conversations.find((c) => c.id === conversationId) : undefined

  if (existing) {
    existing.messages = messages
    existing.updatedAt = now
  } else {
    conversations.push({
      id: conversationId ?? `conv_${now}_${Math.random().toString(36).slice(2, 11)}`,
      agentId,
      messages,
      createdAt: now,
      updatedAt: now,
    })
  }

  const trimmed = conversations.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CONVERSATIONS_PER_AGENT)
  write(agentId, trimmed)
  return existing ? existing.id : trimmed[0].id
}

/** All conversations for an agent, newest first. */
export function loadConversations(agentId: string): Conversation[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(storageKey(agentId))
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Error loading conversations:', error)
    return []
  }
}

export function loadLatestConversation(agentId: string): Conversation | undefined {
  return loadConversations(agentId)[0]
}

export function deleteConversation(agentId: string, conversationId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  write(agentId, loadConversations(agentId).filter((c) => c.id !== conversationId))
}

export function clearConversations(agentId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(storageKey(agentId))
  } catch (error) {
    console.error('Error clearing conversations:', error)
  }
}
