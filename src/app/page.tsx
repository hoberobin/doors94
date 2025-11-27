'use client'

import { useState, useEffect } from 'react'
import Desktop from '@/components/Desktop'
import Taskbar from '@/components/Taskbar'
import Win95Window from '@/components/Win95Window'
import AgentChatWindow from '@/components/AgentChatWindow'
import SetupWizard95 from '@/components/SetupWizard95'
import ControlPanelWindow from '@/components/ControlPanelWindow'
import { getAgentById } from '@/lib/agents'
import { getUserContext } from '@/lib/userContext'

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
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupWizardPosition, setSetupWizardPosition] = useState({ x: 150, y: 100 })
  const [setupWizardSize, setSetupWizardSize] = useState({ width: 500, height: 400 })

  // Check for user context on mount
  useEffect(() => {
    const userContext = getUserContext()
    if (!userContext) {
      setShowSetupWizard(true)
      setActiveWindowId('setup-wizard')
    }
  }, [])

  const handleOpenWindow = (windowId: string, appId: string, title: string, agentId?: string) => {
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
    const defaultWidth = appId === 'control_panel' ? 600 : 500
    const defaultHeight = appId === 'control_panel' ? 500 : 400
    
    const newWindow: Window = {
      id: windowId,
      title,
      appId,
      agentId,
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

  const handleSetupWizardFinish = () => {
    setShowSetupWizard(false)
    if (activeWindowId === 'setup-wizard') {
      setActiveWindowId(null)
    }
  }

  const handleSetupWizardClose = () => {
    // Don't allow closing the wizard if no user context exists
    const userContext = getUserContext()
    if (!userContext) {
      return // Prevent closing
    }
    setShowSetupWizard(false)
    if (activeWindowId === 'setup-wizard') {
      setActiveWindowId(null)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Desktop onOpenWindow={handleOpenWindow} />
      
      {windows.map((window) => {
        if (window.minimized) return null

        const agent = window.agentId ? getAgentById(window.agentId) : null

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

      {showSetupWizard && (
        <SetupWizard95
          isActive={activeWindowId === 'setup-wizard'}
          onClose={handleSetupWizardClose}
          onMinimize={() => {
            // Minimize wizard
            if (activeWindowId === 'setup-wizard') {
              setActiveWindowId(null)
            }
          }}
          onClick={() => setActiveWindowId('setup-wizard')}
          onFinish={handleSetupWizardFinish}
          onMove={(x, y) => {
            setSetupWizardPosition({ x, y })
          }}
          onResize={(width, height) => {
            setSetupWizardSize({ width, height })
          }}
          style={{
            left: `${setupWizardPosition.x}px`,
            top: `${setupWizardPosition.y}px`,
            width: `${setupWizardSize.width}px`,
            height: `${setupWizardSize.height}px`,
          }}
        />
      )}

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={handleSelectWindow}
      />
    </div>
  )
}
