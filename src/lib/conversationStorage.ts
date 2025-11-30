import { AgentManifest } from './agentManifest'

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
const MAX_CONVERSATIONS_PER_AGENT = 50

/**
 * Saves a conversation for an agent
 */
export function saveConversation(agentId: string, messages: Message[]): void {
  if (typeof window === 'undefined') {
    return
  }

  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const conversations = loadConversations(agentId)
  conversations.push(conversation)

  // Keep only the most recent conversations
  const sorted = conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  const trimmed = sorted.slice(0, MAX_CONVERSATIONS_PER_AGENT)

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify(trimmed))
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Clearing old conversations.')
      // Clear oldest conversations
      const reduced = trimmed.slice(0, Math.floor(MAX_CONVERSATIONS_PER_AGENT / 2))
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify(reduced))
    }
  }
}

/**
 * Loads all conversations for an agent
 */
export function loadConversations(agentId: string): Conversation[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${agentId}`)
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

/**
 * Deletes a conversation
 */
export function deleteConversation(agentId: string, conversationId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const conversations = loadConversations(agentId)
  const filtered = conversations.filter((c) => c.id !== conversationId)

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting conversation:', error)
  }
}

/**
 * Clears all conversations for an agent
 */
export function clearConversations(agentId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${agentId}`)
  } catch (error) {
    console.error('Error clearing conversations:', error)
  }
}



