'use client'

import { useState, useEffect } from 'react'
import Desktop from '@/components/Desktop'
import Taskbar from '@/components/Taskbar'
import Win95Window from '@/components/Win95Window'
import AgentChatWindow from '@/components/AgentChatWindow'
import ManageAgentsWindow from '@/components/ManageAgentsWindow'
import ReadMeWindow from '@/components/ReadMeWindow'
import AgentCreatorWindow from '@/components/AgentCreatorWindow'
import PlaygroundWindow from '@/components/PlaygroundWindow'
import { AgentManifestWithSource } from '@/lib/agentManifest'
import { saveWindowStates, loadWindowStates, WindowState as SavedWindowState } from '@/lib/windowStorage'
import { useAgents } from '@/contexts/AgentContext'

interface WindowState {
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

export default function AppDesktop() {
  const { agents, refreshAgents } = useAgents()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [windowCounter, setWindowCounter] = useState(0)
  
  // Load saved window states on mount
  useEffect(() => {
    const saved = loadWindowStates()
    if (saved.length > 0) {
      // Filter out old 'control_panel' windows and map to WindowState
      const restoredWindows: WindowState[] = saved
        .filter((w) => w.appId !== 'control_panel') // Remove old control panel windows
        .map((w) => ({
          id: w.id,
          title: w.title,
          appId: w.appId,
          agentId: w.agentId,
          minimized: w.minimized,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        }))
      
      // If we filtered out any windows, update localStorage to remove them
      if (restoredWindows.length !== saved.length) {
        const statesToSave: SavedWindowState[] = restoredWindows.map((w) => ({
          id: w.id,
          title: w.title,
          appId: w.appId,
          agentId: w.agentId,
          minimized: w.minimized,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        }))
        saveWindowStates(statesToSave)
      }
      
      setWindows(restoredWindows)
      // Restore active window if any
      if (restoredWindows.length > 0 && !restoredWindows[0].minimized) {
        setActiveWindowId(restoredWindows[0].id)
      }
    }
  }, [])

  // Save window states whenever they change
  useEffect(() => {
    if (windows.length > 0) {
      // Filter out any old 'control_panel' windows before saving
      const statesToSave: SavedWindowState[] = windows
        .filter((w) => w.appId !== 'control_panel') // Prevent saving old control panel windows
        .map((w) => ({
          id: w.id,
          title: w.title,
          appId: w.appId,
          agentId: w.agentId,
          minimized: w.minimized,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        }))
      saveWindowStates(statesToSave)
    }
  }, [windows])

  const handleOpenWindow = (
    windowId: string,
    appId: string,
    title: string,
    agentId?: string,
    source?: 'builtin' | 'user',
    editAgentId?: string
  ) => {
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
    const defaultWidth =
      appId === 'manage_agents'
        ? 600
        : appId === 'readme'
        ? 550
        : appId === 'agent_lab'
        ? 600
        : appId === 'playground'
        ? 800
        : 500
    const defaultHeight =
      appId === 'manage_agents'
        ? 500
        : appId === 'readme'
        ? 500
        : appId === 'agent_lab'
        ? 500
        : appId === 'playground'
        ? 600
        : 400
    
    // Ensure window fits on screen
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 40 : defaultWidth
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : defaultHeight
    const constrainedWidth = Math.min(defaultWidth, maxWidth)
    const constrainedHeight = Math.min(defaultHeight, maxHeight)
    
    // For Agent Lab edit mode, use editAgentId if provided
    const finalAgentId = appId === 'agent_lab' && editAgentId ? editAgentId : agentId
    
    // Calculate position, ensuring it doesn't go off-screen
    const offsetX = 100 + (windowCounter % 5) * 30
    const offsetY = 50 + (windowCounter % 5) * 30
    const maxX = typeof window !== 'undefined' ? window.innerWidth - constrainedWidth : offsetX
    const maxY = typeof window !== 'undefined' ? window.innerHeight - constrainedHeight - 50 : offsetY
    const finalX = Math.max(0, Math.min(offsetX, maxX))
    const finalY = Math.max(0, Math.min(offsetY, maxY))
    
    const newWindow: WindowState = {
      id: windowId,
      title,
      appId,
      agentId: finalAgentId,
      minimized: false,
      x: finalX,
      y: finalY,
      width: constrainedWidth,
      height: constrainedHeight,
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
      prev.map((w) => {
        if (w.id === windowId) {
          // Constrain window to viewport
          const maxX = window.innerWidth - w.width
          const maxY = window.innerHeight - 50 // Account for taskbar
          const constrainedX = Math.max(0, Math.min(x, maxX))
          const constrainedY = Math.max(0, Math.min(y, maxY))
          return { ...w, x: constrainedX, y: constrainedY }
        }
        return w
      })
    )
  }

  const handleWindowResize = (windowId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === windowId) {
          // Minimum window sizes
          const minWidth = 200
          const minHeight = 150
          const constrainedWidth = Math.max(minWidth, width)
          const constrainedHeight = Math.max(minHeight, height)
          
          // Ensure window doesn't go off-screen
          const maxWidth = window.innerWidth - w.x
          const maxHeight = window.innerHeight - w.y - 50 // Account for taskbar
          const finalWidth = Math.min(constrainedWidth, maxWidth)
          const finalHeight = Math.min(constrainedHeight, maxHeight)
          
          return { ...w, width: finalWidth, height: finalHeight }
        }
        return w
      })
    )
  }

  const handleStartClick = () => {
    const tutorialAgent = agents.find(a => a.id === 'tutorial')
    if (!tutorialAgent) {
      return
    }

    handleOpenWindow(
      `agent_${tutorialAgent.id}`,
      tutorialAgent.id,
      tutorialAgent.name,
      tutorialAgent.id,
      tutorialAgent.source
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
          agent = agents.find(a => a.id === window.agentId) || null
        }

        // Render Manage Agents window
        if (window.appId === 'manage_agents') {
          return (
            <ManageAgentsWindow
              key={window.id}
              isActive={activeWindowId === window.id}
              onClose={() => handleCloseWindow(window.id)}
              onMinimize={() => handleMinimizeWindow(window.id)}
              onClick={() => handleWindowClick(window.id)}
              onMove={(x, y) => handleWindowMove(window.id, x, y)}
              onResize={(width, height) => handleWindowResize(window.id, width, height)}
              onAgentUpdated={() => {
                // Refresh agents list
                refreshAgents()
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
            <AgentCreatorWindow
              key={windowId}
              isActive={activeWindowId === windowId}
              onClose={() => handleCloseWindow(windowId)}
              onMinimize={() => handleMinimizeWindow(windowId)}
              onClick={() => handleWindowClick(windowId)}
              onMove={(x, y) => handleWindowMove(windowId, x, y)}
              onResize={(width, height) => handleWindowResize(windowId, width, height)}
              agentId={window.agentId} // Pass agentId for edit mode
              onAgentCreated={(agentId) => {
                // Agent created - refresh agents list and close window
                refreshAgents()
                handleCloseWindow(windowId)
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
        onStartClick={handleStartClick}
      />
    </div>
  )
}


