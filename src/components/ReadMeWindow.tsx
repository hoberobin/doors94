'use client'

import React from 'react'
import Win95Window from './Win95Window'

interface ReadMeWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

export default function ReadMeWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
}: ReadMeWindowProps) {
  return (
    <Win95Window
      title="Read Me - Doors94"
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      onClick={onClick}
      onMove={onMove}
      onResize={onResize}
      style={style}
    >
      <div
        style={{
          padding: '16px',
          color: '#000000',
          fontSize: '11px',
          lineHeight: '1.6',
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
          Welcome to Doors94
        </h1>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          Doors94 is a Windows 95-style interface for managing AI agents. Each agent is specialized
          for different tasks, and they all use your personal context to provide more relevant assistance.
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Getting Started
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          When you first launch Doors94, you'll be guided through a setup wizard that collects:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Your name and role</li>
          <li>Your current projects and goals</li>
          <li>Your preferred communication tone</li>
        </ul>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          This information helps all your agents provide personalized, context-aware responses.
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Your Agents
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          Double-click any agent icon on the desktop to open a chat window with that agent:
        </p>

        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>
            <strong>PM95.sys</strong> - Helps you define what to build, reduce ambiguity, and make product decisions.
            Focuses on clarity, scope, and outcomes.
          </li>
          <li>
            <strong>Fixit.bat</strong> - A debugging and troubleshooting specialist. Helps diagnose and fix technical
            problems with step-by-step guidance.
          </li>
          <li>
            <strong>Tinkerer.dll</strong> - A creative technologist who generates playful, experimental coding ideas.
            Perfect for discovering fun projects worth building.
          </li>
          <li>
            <strong>Builder.exe</strong> - A pragmatic software builder focused on turning ideas into working products.
            Provides concrete technical steps and realistic architectures.
          </li>
        </ul>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Control Panel
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          The Control Panel (⚙️ icon) lets you:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Edit your user context (name, role, projects, tone)</li>
          <li>Add custom instructions for each agent</li>
        </ul>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          Changes are saved automatically and will be used in all future conversations.
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Window Management
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          All windows support:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li><strong>Moving:</strong> Click and drag the title bar</li>
          <li><strong>Resizing:</strong> Drag the bottom-right corner</li>
          <li><strong>Minimizing:</strong> Click the "_" button</li>
          <li><strong>Closing:</strong> Click the "×" button</li>
        </ul>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Tips
        </h2>

        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Each agent has a specific focus - use the right agent for the right task</li>
          <li>Agents can suggest switching to another agent if your question is outside their scope</li>
          <li>Your context is shared across all agents, so they all know about your projects and preferences</li>
          <li>You can customize each agent's behavior in the Control Panel</li>
        </ul>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Need Help?
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          If you're stuck or have questions:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Ask <strong>PM95.sys</strong> for help defining your goals</li>
          <li>Ask <strong>Fixit.bat</strong> for debugging help</li>
          <li>Ask <strong>Tinkerer.dll</strong> for creative project ideas</li>
          <li>Ask <strong>Builder.exe</strong> for implementation guidance</li>
        </ul>

        <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#808080' }}>
          Enjoy exploring Doors94!
        </p>
      </div>
    </Win95Window>
  )
}

