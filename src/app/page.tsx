'use client'

import { useState, useEffect } from 'react'
import Desktop from '@/components/Desktop'
import Taskbar from '@/components/Taskbar'
import Win95Window from '@/components/Win95Window'
import AgentChatWindow from '@/components/AgentChatWindow'
import ControlPanelWindow from '@/components/ControlPanelWindow'
import ReadMeWindow from '@/components/ReadMeWindow'
import AgentLabWindow from '@/components/AgentLabWindow'
import PlaygroundWindow from '@/components/PlaygroundWindow'
import { getAllAgents } from '@/lib/agentStorage'
import { AgentManifestWithSource } from '@/lib/agentManifest'

interface Window {
  id: string
  title: string
  appId: string
  agentId?: string
  minimized: boolean
  x: number
  y: number
  width: number
  height: number
}

export default function Home() {
  const [windows, setWindows] = useState<Window[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [windowCounter, setWindowCounter] = useState(0)
  // Setup wizard removed - no personal info collection needed for sandbox

  const handleOpenWindow = (windowId: string, appId: string, title: string, agentId?: string, source?: 'builtin' | 'user', editAgentId?: string) => {
    // Check if window already exists
    const existingWindow = windows.find((w) => w.id === windowId)
    if (existingWindow) {
      // If it exists and is minimized, restore it
      if (existingWindow.minimized) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === windowId ? { ...w, minimized: false } : w
          )
        )
        setActiveWindowId(windowId)
      } else {
        // If it exists and is open, just focus it
        setActiveWindowId(windowId)
      }
      return
    }

    // Create new window with offset positioning
    const defaultWidth = appId === 'control_panel' ? 600 : appId === 'readme' ? 550 : appId === 'agent_lab' ? 600 : appId === 'playground' ? 800 : 500
    const defaultHeight = appId === 'control_panel' ? 500 : appId === 'readme' ? 500 : appId === 'agent_lab' ? 500 : appId === 'playground' ? 600 : 400
    
    // For Agent Lab edit mode, use editAgentId if provided
    const finalAgentId = appId === 'agent_lab' && editAgentId ? editAgentId : agentId
    
    const newWindow: Window = {
      id: windowId,
      title,
      appId,
      agentId: finalAgentId,
      minimized: false,
      x: 100 + (windowCounter % 5) * 30,
      y: 50 + (windowCounter % 5) * 30,
      width: defaultWidth,
      height: defaultHeight,
    }

    setWindows((prev) => [...prev, newWindow])
    setActiveWindowId(windowId)
    setWindowCounter((prev) => prev + 1)
  }

  const handleCloseWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
    if (activeWindowId === windowId) {
      const remainingWindows = windows.filter((w) => w.id !== windowId)
      setActiveWindowId(
        remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null
      )
    }
  }

  const handleMinimizeWindow = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, minimized: true } : w))
    )
    if (activeWindowId === windowId) {
      const remainingVisible = windows
        .filter((w) => w.id !== windowId && !w.minimized)
      setActiveWindowId(
        remainingVisible.length > 0 ? remainingVisible[remainingVisible.length - 1].id : null
      )
    }
  }

  const handleSelectWindow = (windowId: string) => {
    // If window is minimized, restore it
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, minimized: false } : w
      )
    )
    setActiveWindowId(windowId)
  }

  const handleWindowClick = (windowId: string) => {
    setActiveWindowId(windowId)
  }

  const handleWindowMove = (windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, x, y } : w))
    )
  }

  const handleWindowResize = (windowId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, width, height } : w))
    )
  }


  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Desktop onOpenWindow={handleOpenWindow} />
      
      {windows.map((window) => {
        if (window.minimized) return null

        // Get agent manifest if agentId is present
        let agent: AgentManifestWithSource | null = null
        if (window.agentId) {
          // Try to find agent from all agents
          const allAgents = getAllAgents()
          agent = allAgents.find(a => a.id === window.agentId) || null
        }

        // Render Control Panel window
        if (window.appId === 'control_panel') {
          return (
            <ControlPanelWindow
              key={window.id}
              isActive={activeWindowId === window.id}
              onClose={() => handleCloseWindow(window.id)}
              onMinimize={() => handleMinimizeWindow(window.id)}
              onClick={() => handleWindowClick(window.id)}
              onMove={(x, y) => handleWindowMove(window.id, x, y)}
              onResize={(width, height) => handleWindowResize(window.id, width, height)}
              onAgentUpdated={() => {
                // Refresh desktop to show updated agent icons
                if (typeof location !== 'undefined') {
                  location.reload()
                }
              }}
              style={{
                left: `${window.x}px`,
                top: `${window.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
              }}
            />
          )
        }

        // Render Read Me window
        if (window.appId === 'readme') {
          return (
            <ReadMeWindow
              key={window.id}
              isActive={activeWindowId === window.id}
              onClose={() => handleCloseWindow(window.id)}
              onMinimize={() => handleMinimizeWindow(window.id)}
              onClick={() => handleWindowClick(window.id)}
              onMove={(x, y) => handleWindowMove(window.id, x, y)}
              onResize={(width, height) => handleWindowResize(window.id, width, height)}
              style={{
                left: `${window.x}px`,
                top: `${window.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
              }}
            />
          )
        }

        // Render Agent Lab window
        if (window.appId === 'agent_lab') {
          const windowId = window.id
          return (
            <AgentLabWindow
              key={windowId}
              isActive={activeWindowId === windowId}
              onClose={() => handleCloseWindow(windowId)}
              onMinimize={() => handleMinimizeWindow(windowId)}
              onClick={() => handleWindowClick(windowId)}
              onMove={(x, y) => handleWindowMove(windowId, x, y)}
              onResize={(width, height) => handleWindowResize(windowId, width, height)}
              agentId={window.agentId} // Pass agentId for edit mode
              onAgentCreated={(agentId) => {
                // Agent created - could trigger desktop refresh here if needed
                // For now, just close the window
                handleCloseWindow(windowId)
                // Trigger a page refresh to show new agent icon (simple approach for v1)
                if (typeof location !== 'undefined') {
                  location.reload()
                }
              }}
              style={{
                left: `${window.x}px`,
                top: `${window.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
              }}
            />
          )
        }

        // Render Playground window
        if (window.appId === 'playground') {
          return (
            <PlaygroundWindow
              key={window.id}
              isActive={activeWindowId === window.id}
              onClose={() => handleCloseWindow(window.id)}
              onMinimize={() => handleMinimizeWindow(window.id)}
              onClick={() => handleWindowClick(window.id)}
              onMove={(x, y) => handleWindowMove(window.id, x, y)}
              onResize={(width, height) => handleWindowResize(window.id, width, height)}
              style={{
                left: `${window.x}px`,
                top: `${window.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
              }}
            />
          )
        }

        return (
          <Win95Window
            key={window.id}
            title={window.title}
            isActive={activeWindowId === window.id}
            onClose={() => handleCloseWindow(window.id)}
            onMinimize={() => handleMinimizeWindow(window.id)}
            onClick={() => handleWindowClick(window.id)}
            onMove={(x, y) => handleWindowMove(window.id, x, y)}
            onResize={(width, height) => handleWindowResize(window.id, width, height)}
            style={{
              left: `${window.x}px`,
              top: `${window.y}px`,
              width: `${window.width}px`,
              height: `${window.height}px`,
            }}
          >
            {agent ? (
              <AgentChatWindow agent={agent} />
            ) : (
              <div style={{ color: '#000000' }}>
                <p>This is the {window.title} window.</p>
                <p>App ID: {window.appId}</p>
                {window.agentId && <p>Agent ID: {window.agentId}</p>}
                <p>Window content goes here...</p>
              </div>
            )}
          </Win95Window>
        )
      })}

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={handleSelectWindow}
      />
    </div>
  )
}
