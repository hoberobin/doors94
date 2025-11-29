'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Win95WindowProps {
  title: string
  children: React.ReactNode
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

export default function Win95Window({
  title,
  children,
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
}: Win95WindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return // Don't drag if clicking buttons
    if (!onMove || !windowRef.current) return
    
    const rect = windowRef.current.getBoundingClientRect()
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    })
    onClick() // Focus window
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onResize || !windowRef.current) return
    
    const rect = windowRef.current.getBoundingClientRect()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    })
    onClick() // Focus window
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onMove) {
        const newX = e.clientX - dragStart.offsetX
        const newY = e.clientY - dragStart.offsetY
        onMove(Math.max(0, newX), Math.max(0, newY))
      }
      
      if (isResizing && onResize) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        const newWidth = Math.max(300, resizeStart.width + deltaX)
        const newHeight = Math.max(200, resizeStart.height + deltaY)
        onResize(newWidth, newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onMove, onResize])

  return (
    <div
      ref={windowRef}
      className="win95-window"
      role="dialog"
      aria-label={title}
      aria-modal="false"
      style={{
        position: 'absolute',
        zIndex: isActive ? 1000 : 100,
        ...style,
        cursor: isDragging ? 'move' : 'default',
      }}
      onClick={onClick}
    >
      <div
        className="win95-window-titlebar"
        onMouseDown={handleTitleBarMouseDown}
        role="button"
        aria-label={`Window title bar for ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick()
          }
        }}
        style={{
          cursor: 'move',
          userSelect: 'none',
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            className="win95-button"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            aria-label={`Minimize ${title}`}
            style={{
              padding: '0 4px',
              minWidth: '20px',
              minHeight: '18px',
              fontSize: '11px',
            }}
            title="Minimize"
          >
            _
          </button>
          <button
            className="win95-button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label={`Close ${title}`}
            style={{
              padding: '0 4px',
              minWidth: '20px',
              minHeight: '18px',
              fontSize: '11px',
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      <div className="win95-window-body" style={{ position: 'relative', height: 'calc(100% - 22px)', overflow: 'auto' }}>
        {children}
      </div>
      {/* Resize handle */}
      {onResize && (
        <div
          onMouseDown={handleResizeMouseDown}
          role="button"
          aria-label={`Resize ${title}`}
          tabIndex={0}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            background: 'linear-gradient(135deg, transparent 0%, transparent 40%, #808080 40%, #808080 45%, transparent 45%, transparent 55%, #808080 55%, #808080 60%, transparent 60%, transparent 100%)',
            backgroundSize: '20px 20px',
            zIndex: 1,
          }}
        />
      )}
    </div>
  )
}

