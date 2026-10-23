'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Desktop from '@/components/Desktop'
import Taskbar from '@/components/Taskbar'
import Win95Window from '@/components/Win95Window'
import AgentChatWindow from '@/components/AgentChatWindow'
import ManageAgentsWindow from '@/components/ManageAgentsWindow'
import ReadMeWindow from '@/components/ReadMeWindow'
import AgentCreatorWindow from '@/components/AgentCreatorWindow'
import PlaygroundWindow from '@/components/PlaygroundWindow'
import WelcomeWindow from '@/components/WelcomeWindow'
import BootScreen from '@/components/BootScreen'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import {
  saveWindowStates,
  loadWindowStates,
  clearWindowStates,
  consumeFirstRun,
  consumeBootScreen,
  WindowState,
} from '@/lib/windowStorage'
import { useAgents } from '@/contexts/AgentContext'
import { getUserAgent } from '@/lib/agentStorage'
import { TUTORIAL_AGENT_ID } from '@/lib/builtinAgents'
import { getApp } from '@/lib/apps'

const TASKBAR_HEIGHT = 32
const WINDOW_Z_BASE = 100

export default function AppDesktop() {
  const { agents, refreshAgents } = useAgents()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [zOrder, setZOrder] = useState<string[]>([])
  const [booting, setBooting] = useState(false)
  const loaded = useRef(false)
  const openCount = useRef(0)

  const activeWindowId =
    [...zOrder].reverse().find((id) => windows.some((w) => w.id === id && !w.minimized)) ?? null

  const focusWindow = useCallback((windowId: string) => {
    setZOrder((prev) => [...prev.filter((id) => id !== windowId), windowId])
  }, [])

  const openWindow = useCallback(
    (next: Omit<WindowState, 'minimized' | 'x' | 'y' | 'width' | 'height'> & { width: number; height: number }) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === next.id)
        if (existing) {
          return prev.map((w) => (w.id === next.id ? { ...w, minimized: false } : w))
        }

        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight - TASKBAR_HEIGHT
        const width = Math.min(next.width, viewportWidth - 24)
        const height = Math.min(next.height, viewportHeight - 24)
        const slot = openCount.current++ % 6
        const x = Math.max(0, Math.min(90 + slot * 28, viewportWidth - width))
        const y = Math.max(0, Math.min(40 + slot * 28, viewportHeight - height))

        return [...prev, { ...next, minimized: false, x, y, width, height }]
      })
      focusWindow(next.id)
    },
    [focusWindow]
  )

  const openApp = useCallback(
    (appId: string) => {
      const app = getApp(appId)
      if (!app) return
      openWindow({ id: app.id, appId: app.id, title: app.label, width: app.width, height: app.height })
    },
    [openWindow]
  )

  const openAgent = useCallback(
    (agent: Pick<AgentManifestWithSource, 'id' | 'name'>) => {
      openWindow({ id: `agent_${agent.id}`, appId: agent.id, title: agent.name, agentId: agent.id, width: 520, height: 440 })
    },
    [openWindow]
  )

  const openTutorial = useCallback(() => {
    const tutorial = agents.find((a) => a.id === TUTORIAL_AGENT_ID)
    if (tutorial) openAgent(tutorial)
  }, [agents, openAgent])

  useEffect(() => {
    if (consumeBootScreen()) setBooting(true)

    const saved = loadWindowStates()
    if (saved.length > 0) {
      setWindows(saved)
      setZOrder(saved.map((w) => w.id))
    } else if (consumeFirstRun()) {
      openApp('welcome')
    }
    loaded.current = true
  }, [openApp])

  useEffect(() => {
    if (loaded.current) saveWindowStates(windows)
  }, [windows])

  const closeWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
    setZOrder((prev) => prev.filter((id) => id !== windowId))
  }

  const minimizeWindow = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, minimized: true } : w)))
  }

  const toggleMaximize = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, maximized: !w.maximized } : w)))
    focusWindow(windowId)
  }

  const selectFromTaskbar = (windowId: string) => {
    const target = windows.find((w) => w.id === windowId)
    if (!target) return
    if (!target.minimized && activeWindowId === windowId) {
      minimizeWindow(windowId)
      return
    }
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, minimized: false } : w)))
    focusWindow(windowId)
  }

  const moveWindow = (windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w
        const maxX = window.innerWidth - w.width
        const maxY = window.innerHeight - TASKBAR_HEIGHT - 22
        return { ...w, x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) }
      })
    )
  }

  const resizeWindow = (windowId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w
        const maxWidth = window.innerWidth - w.x
        const maxHeight = window.innerHeight - w.y - TASKBAR_HEIGHT
        return { ...w, width: Math.min(Math.max(200, width), maxWidth), height: Math.min(Math.max(150, height), maxHeight) }
      })
    )
  }

  const resetLayout = () => {
    clearWindowStates()
    setWindows([])
    setZOrder([])
  }

  const handleAgentCreated = (agentId: string) => {
    refreshAgents()
    const created = getUserAgent(agentId)
    if (created) openAgent(created)
  }

  const frameProps = (w: WindowState) => ({
    isActive: activeWindowId === w.id,
    isMaximized: !!w.maximized,
    onClose: () => closeWindow(w.id),
    onMinimize: () => minimizeWindow(w.id),
    onMaximize: () => toggleMaximize(w.id),
    onClick: () => focusWindow(w.id),
    onMove: (x: number, y: number) => moveWindow(w.id, x, y),
    onResize: (width: number, height: number) => resizeWindow(w.id, width, height),
    style: w.maximized
      ? { left: 0, top: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_HEIGHT}px)`, zIndex: WINDOW_Z_BASE + zOrder.indexOf(w.id) }
      : { left: `${w.x}px`, top: `${w.y}px`, width: `${w.width}px`, height: `${w.height}px`, zIndex: WINDOW_Z_BASE + zOrder.indexOf(w.id) },
  })

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {booting && <BootScreen onDone={() => setBooting(false)} />}

      <Desktop onOpenApp={openApp} onOpenAgent={openAgent} />

      {windows.map((w) => {
        if (w.minimized) return null

        switch (w.appId) {
          case 'manage_agents':
            return <ManageAgentsWindow key={w.id} {...frameProps(w)} onAgentUpdated={refreshAgents} />
          case 'readme':
            return <ReadMeWindow key={w.id} {...frameProps(w)} />
          case 'welcome':
            return <WelcomeWindow key={w.id} {...frameProps(w)} onOpenApp={openApp} onOpenTutorial={openTutorial} />
          case 'agent_lab':
            return (
              <AgentCreatorWindow
                key={w.id}
                {...frameProps(w)}
                agentId={w.agentId}
                onAgentCreated={handleAgentCreated}
              />
            )
          case 'playground':
            return <PlaygroundWindow key={w.id} {...frameProps(w)} />
        }

        const agent = w.agentId ? agents.find((a) => a.id === w.agentId) : undefined
        return (
          <Win95Window key={w.id} title={agent ? `${agent.icon} ${agent.name}` : w.title} {...frameProps(w)}>
            {agent ? (
              <AgentChatWindow agent={agent} />
            ) : (
              <div style={{ color: '#000000', padding: '12px' }}>
                <p>This agent no longer exists. It may have been deleted.</p>
              </div>
            )}
          </Win95Window>
        )
      })}

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={selectFromTaskbar}
        onOpenApp={openApp}
        onOpenAgent={openAgent}
        onResetLayout={resetLayout}
      />
    </div>
  )
}
