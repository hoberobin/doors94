'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { getAllAgents } from '@/lib/agentStorage'

interface AgentContextType {
  agents: AgentManifestWithSource[]
  refreshAgents: () => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<AgentManifestWithSource[]>([])

  const refreshAgents = useCallback(() => {
    const allAgents = getAllAgents()
    setAgents(allAgents)
  }, [])

  useEffect(() => {
    refreshAgents()
  }, [refreshAgents])

  return (
    <AgentContext.Provider value={{ agents, refreshAgents }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgents() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider')
  }
  return context
}


