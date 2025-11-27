'use client'

import React, { useState } from 'react'
import Win95Window from './Win95Window'
import { UserContext, saveUserContext } from '@/lib/userContext'

interface SetupWizard95Props {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onFinish: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

type WizardStep = 1 | 2 | 3 | 4

export default function SetupWizard95({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onFinish,
  onMove,
  onResize,
  style,
}: SetupWizard95Props) {
  const [step, setStep] = useState<WizardStep>(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [projects, setProjects] = useState('')
  const [tone, setTone] = useState<'friendly' | 'blunt' | 'concise' | 'playful'>('friendly')

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as WizardStep)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep)
    }
  }

  const handleFinish = () => {
    const userContext: UserContext = {
      name: name.trim(),
      role: role.trim(),
      projects: projects.trim(),
      tone,
    }

    saveUserContext(userContext)
    onFinish()
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return true // Intro step, always can proceed
      case 2:
        return name.trim().length > 0 && role.trim().length > 0
      case 3:
        return projects.trim().length > 0
      case 4:
        return true // Tone is always selected (has default)
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                Welcome to Doors94
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '12px', color: '#000000' }}>
                This wizard will help you set up your personalized agent experience.
              </p>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '12px', color: '#000000' }}>
                We'll collect some information about you and your preferences so your agents can
                provide more relevant and personalized assistance.
              </p>
              <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#000000' }}>
                Click <strong>Next</strong> to continue.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                About You
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Tell us a bit about yourself so your agents can address you properly.
              </p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Your Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                }}
                placeholder="Enter your name"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Your Role:
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                }}
                placeholder="e.g., Product Manager, Designer, Developer"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                What are you working on?
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Share your current projects, goals, or areas of focus. This helps your agents
                provide more relevant assistance.
              </p>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Projects / Goals:
              </label>
              <textarea
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                  resize: 'vertical',
                }}
                placeholder="Describe your current projects, goals, or what you're working on..."
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                How should your agents talk to you?
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Choose the communication style you prefer when interacting with your agents.
              </p>
            </div>
            <div>
              {(['friendly', 'blunt', 'concise', 'playful'] as const).map((toneOption) => (
                <label
                  key={toneOption}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={toneOption}
                    checked={tone === toneOption}
                    onChange={() => setTone(toneOption)}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ textTransform: 'capitalize', fontWeight: tone === toneOption ? 'bold' : 'normal', color: '#000000' }}>
                    {toneOption}
                  </span>
                  {tone === toneOption && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', color: '#808080' }}>
                      {toneOption === 'friendly' && '(Warm and approachable)'}
                      {toneOption === 'blunt' && '(Direct and straightforward)'}
                      {toneOption === 'concise' && '(Brief and to the point)'}
                      {toneOption === 'playful' && '(Light and engaging)'}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Win95Window
      title="Doors94 Setup Wizard"
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
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '350px',
        }}
      >
        <div style={{ flex: 1, overflow: 'auto' }}>{renderStep()}</div>
        <div
          style={{
            borderTop: '2px solid var(--win95-border-dark)',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#c0c0c0',
          }}
        >
          <div style={{ fontSize: '11px', color: '#808080' }}>
            Step {step} of 4
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {step > 1 && (
              <button
                className="win95-button"
                onClick={handleBack}
                style={{ minWidth: '70px' }}
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                className="win95-button"
                onClick={handleNext}
                disabled={!canProceed()}
                style={{
                  minWidth: '70px',
                  opacity: canProceed() ? 1 : 0.5,
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                }}
              >
                Next
              </button>
            ) : (
              <button
                className="win95-button"
                onClick={handleFinish}
                style={{ minWidth: '70px' }}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </Win95Window>
  )
}

