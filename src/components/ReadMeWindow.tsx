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
      title="Read Me - doors94"
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
          Welcome to doors94
        </h1>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          doors94 is a retro Windows-95–style sandbox where you learn how to design AI agents by creating,
          tweaking, testing, and comparing small, single-purpose agents.
        </p>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          This is a learning playground disguised as a fake OS. Experiment with prompts, see how they shape
          agent behavior, and understand the fundamentals of AI agent design through hands-on play.
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Getting Started
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          When you first visit doors94, you’ll see a landing page. Click <strong>“Launch doors94”</strong> to boot into
          the Windows 95-style desktop at <code>/app</code>.
        </p>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          Your desktop includes <strong>Tutorial</strong> — a built-in agent that teaches you how to use doors94.
          You can open it by clicking the <strong>Start</strong> button on the taskbar or by double-clicking the
          <strong>“Tutorial”</strong> icon on the desktop. Ask it questions about features, workflows, or how things
          work; it’s your personal guide to the sandbox!
        </p>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          After exploring Tutorial, you'll be ready to create your own agents in Agent Creator.
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Creating Your Own Agent
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          Double-click <strong>Agent Creator</strong> to open the agent creation wizard:
        </p>
        <ol style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li><strong>Basic Info:</strong> Name your agent, add a description, and choose an icon</li>
          <li><strong>Purpose:</strong> Define what your agent does in 1-2 sentences</li>
          <li><strong>Rules:</strong> Add "always" or "never" statements to constrain behavior</li>
          <li><strong>Tone & Style:</strong> Choose how the agent communicates (serious, friendly, playful, blunt)</li>
          <li><strong>Preview:</strong> See how your fields compile into a system prompt</li>
        </ol>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          After saving, your agent appears as an icon on the desktop. Double-click it to start chatting!
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Understanding Agent Manifests
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          Each agent is defined by a <strong>manifest</strong> - a structured description that gets compiled
          into a system prompt. The manifest fields map to different parts of the prompt:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li><strong>Purpose</strong> → Mission statement</li>
          <li><strong>Rules</strong> → Behavior constraints and boundaries</li>
          <li><strong>Tone</strong> → Communication style instructions</li>
          <li><strong>Output Style</strong> → Formatting and length guidelines</li>
        </ul>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          In Agent Creator, the Preview step shows you exactly how these fields compile into a complete prompt.
          This teaches you how prompt engineering works!
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Playground
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          Use <strong>Playground</strong> to compare responses side-by-side:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Left pane: Raw GPT (no system prompt)</li>
          <li>Right pane: Your selected agent (with system prompt)</li>
        </ul>

        <p style={{ marginBottom: '16px', color: '#000000' }}>
          Enter the same message and compare outputs to see how prompts shape behavior. This is the core
          learning mechanism of doors94!
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Quick Start Workflow
        </h2>

        <ol style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>Chat with <strong>Tutorial</strong> to learn about doors94</li>
          <li>Open <strong>Agent Creator</strong> to create your first agent</li>
          <li>Test your agent in a chat window</li>
          <li>Use <strong>Playground</strong> to compare it against raw GPT</li>
          <li>Refine your agent in <strong>Control Panel</strong> → Edit</li>
          <li>Repeat and experiment!</li>
        </ol>

        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', color: '#000000' }}>
          Tips for Good Agent Design
        </h2>

        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li><strong>Clear Purpose:</strong> A single, focused purpose works better than trying to do everything</li>
          <li><strong>Specific Rules:</strong> Use "always" and "never" statements to create predictable behavior</li>
          <li><strong>Match Tone:</strong> Choose a tone that fits the agent's purpose (serious for PM, playful for creative)</li>
          <li><strong>Test & Iterate:</strong> Create an agent, test it in Playground, refine the manifest, repeat</li>
        </ul>

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
          What You'll Learn
        </h2>

        <p style={{ marginBottom: '12px', color: '#000000' }}>
          By using doors94, you'll understand:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '16px', color: '#000000' }}>
          <li>How system prompts shape AI behavior</li>
          <li>The relationship between structured descriptions and prompt engineering</li>
          <li>How different prompt components (purpose, rules, tone) affect responses</li>
          <li>Best practices for designing single-purpose, predictable agents</li>
        </ul>

        <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#808080' }}>
          Have fun experimenting with agent design!
        </p>
      </div>
    </Win95Window>
  )
}
