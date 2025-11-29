'use client'

import React, { useState, useEffect } from 'react'
import Win95Window from './Win95Window'
import { AgentManifest, buildSystemPrompt, validateAgentManifest, generateAgentId } from '@/lib/agentManifest'
import { saveUserAgent, getUserAgent } from '@/lib/agentStorage'
import { useDebounce } from '@/hooks/useDebounce'

interface AgentCreatorWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
  agentId?: string // If provided, edit mode
  onAgentCreated?: (agentId: string) => void // Callback when agent is saved
}

type WizardStep = 1 | 2 | 3 | 4 | 5

export default function AgentCreatorWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
  agentId,
  onAgentCreated,
}: AgentCreatorWindowProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [isEditMode] = useState(!!agentId)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🤖')
  const [purpose, setPurpose] = useState('')
  const [rules, setRules] = useState<string[]>([''])
  const [tone, setTone] = useState<'serious' | 'friendly' | 'playful' | 'blunt'>('friendly')
  const [outputStyle, setOutputStyle] = useState('')
  
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showExampleConfirm, setShowExampleConfirm] = useState(false)

  /**
   * Loads existing agent data when in edit mode.
   * Populates form fields with the agent's current values.
   */
  useEffect(() => {
    if (agentId && isEditMode) {
      const existing = getUserAgent(agentId)
      if (existing) {
        setName(existing.name)
        setDescription(existing.description)
        setIcon(existing.icon)
        setPurpose(existing.purpose)
        setRules(existing.rules.length > 0 ? existing.rules : [''])
        setTone(existing.tone)
        setOutputStyle(existing.outputStyle)
      }
    }
  }, [agentId, isEditMode])

  // Debounce validation to reduce computation
  const debouncedName = useDebounce(name, 300)
  const debouncedPurpose = useDebounce(purpose, 300)
  const debouncedDescription = useDebounce(description, 300)
  const debouncedRules = useDebounce(rules, 300)
  const debouncedOutputStyle = useDebounce(outputStyle, 300)

  /**
   * Validates the agent manifest in real-time as the user fills out the form.
   * Updates validation errors whenever form fields change (debounced).
   */
  useEffect(() => {
    const manifest: Partial<AgentManifest> = {
      id: agentId || generateAgentId(debouncedName || 'untitled_agent'),
      name: debouncedName.trim(),
      description: debouncedDescription.trim(),
      icon: icon.trim() || '🤖',
      purpose: debouncedPurpose.trim(),
      rules: debouncedRules.filter(r => r.trim().length > 0),
      tone,
      outputStyle: debouncedOutputStyle.trim(),
    }
    const validation = validateAgentManifest(manifest)
    setValidationErrors(validation.errors)
  }, [debouncedName, debouncedPurpose, tone, debouncedDescription, debouncedRules, debouncedOutputStyle, icon, agentId])

  /**
   * Builds a partial AgentManifest from the current form state.
   * Used for validation and saving.
   */
  const buildManifest = (): Partial<AgentManifest> => {
    return {
      id: agentId || generateAgentId(name || 'untitled_agent'),
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '🤖',
      purpose: purpose.trim(),
      rules: rules.filter(r => r.trim().length > 0),
      tone,
      outputStyle: outputStyle.trim(),
    }
  }

  const handleNext = () => {
    if (step < 5) {
      setStep((step + 1) as WizardStep)
      setSaveError(null)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep)
      setSaveError(null)
    }
  }

  const handleAddRule = () => {
    setRules([...rules, ''])
  }

  const handleRemoveRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index))
    } else {
      setRules([''])
    }
  }

  const handleRuleChange = (index: number, value: string) => {
    const updated = [...rules]
    updated[index] = value
    setRules(updated)
  }

  const handleLoadExample = () => {
    setShowExampleConfirm(true)
  }

  const applyExampleTemplate = () => {
    setName('PirateMatey.exe')
    setDescription('A boisterous pirate who answers questions in full pirate speak while still being helpful.')
    setIcon('🏴‍☠️')
    setPurpose(
      'Help users with their questions while always speaking and acting like a classic pirate. ' +
        'Use nautical metaphors, pirate slang, and playful bravado while still giving accurate, useful answers.'
    )
    setRules([
      "Always speak in a pirate's voice using words like \"arrr\", \"matey\", \"captain\", and \"ship\".",
      'Always sprinkle in nautical metaphors when explaining concepts.',
      'Never drop the pirate persona, even for technical topics.',
      'Never use modern internet slang or emojis.',
      'Always stay friendly, light-hearted, and a bit dramatic.',
    ])
    setTone('playful')
    setOutputStyle(
      'Use short paragraphs and colorful pirate expressions. ' +
        'Start most replies with a pirate-flavored greeting (like \"Ahoy matey\"), and end with a playful pirate sign-off.'
    )
    setShowExampleConfirm(false)
  }

  const handleSave = () => {
    const manifest = buildManifest()
    const validation = validateAgentManifest(manifest)
    
    if (!validation.valid) {
      setSaveError(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    try {
      saveUserAgent(manifest as AgentManifest)
      if (onAgentCreated) {
        onAgentCreated(manifest.id!)
      }
      onClose()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save agent')
    }
  }

  /**
   * Determines if the user can proceed to the next step.
   * Each step has different validation requirements.
   */
  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0
      case 2:
        return purpose.trim().length > 0
      case 3:
        return true // Rules are optional
      case 4:
        return true // Tone is always selected (has default)
      case 5:
        return validationErrors.length === 0
      default:
        return false
    }
  }

  /**
   * Renders the appropriate step content based on the current wizard step.
   * Each step collects different parts of the agent manifest.
   */
  const renderStep = () => {
    const manifest = buildManifest()
    const compiledPrompt = validationErrors.length === 0 && manifest.name && manifest.purpose
      ? buildSystemPrompt(manifest as AgentManifest)
      : ''

    switch (step) {
      case 1:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                  Basic Information
                </h2>
                <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '8px', color: '#000000' }}>
                  Give your agent a name, description, and icon. The name will appear on the desktop as an icon.
                </p>
              </div>
              {!isEditMode && (
                <button
                  className="win95-button"
                  onClick={handleLoadExample}
                  style={{ fontSize: '10px', padding: '4px 8px', marginLeft: '16px' }}
                >
                  Load Example
                </button>
              )}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', color: '#000000' }}>
                Agent Name: <span style={{ color: '#ff0000' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., NameBot.exe"
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                }}
              />
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                {name.trim().length}/100 characters
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', color: '#000000' }}>
                Description:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this agent does"
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                }}
              />
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                {description.trim().length}/200 characters
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', color: '#000000' }}>
                Icon (Emoji):
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🤖"
                maxLength={2}
                style={{
                  width: '60px',
                  padding: '4px',
                  fontSize: '20px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                }}
              />
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                Enter an emoji or icon character
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                Purpose
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Define what this agent does in 1-2 sentences. This becomes the core mission statement in the agent's prompt.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', color: '#000000' }}>
                Purpose: <span style={{ color: '#ff0000' }}>*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Help users write clear, concise documentation for their projects."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                  resize: 'vertical',
                }}
              />
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                {purpose.trim().length}/500 characters
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                Rules
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Define behavior rules using "always" or "never" statements. These help constrain the agent's behavior.
              </p>
            </div>
            <div>
              {rules.map((rule, index) => (
                <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder="e.g., Always provide code examples when explaining concepts"
                    style={{
                      flex: 1,
                      padding: '4px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      border: '2px inset',
                      borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  {rules.length > 1 && (
                    <button
                      className="win95-button"
                      onClick={() => handleRemoveRule(index)}
                      style={{ fontSize: '10px', padding: '2px 8px', minWidth: '50px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                className="win95-button"
                onClick={handleAddRule}
                style={{ fontSize: '10px', padding: '2px 8px', marginTop: '8px' }}
              >
                + Add Rule
              </button>
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '8px' }}>
                Maximum 20 rules, {rules.filter(r => r.trim().length > 0).length} added
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                Tone & Output Style
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Choose how the agent should communicate and format its responses.
              </p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold', color: '#000000' }}>
                Tone: <span style={{ color: '#ff0000' }}>*</span>
              </label>
              {(['serious', 'friendly', 'playful', 'blunt'] as const).map((toneOption) => (
                <label
                  key={toneOption}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '6px',
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
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ textTransform: 'capitalize', color: '#000000' }}>{toneOption}</span>
                </label>
              ))}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', color: '#000000' }}>
                Output Style:
              </label>
              <textarea
                value={outputStyle}
                onChange={(e) => setOutputStyle(e.target.value)}
                placeholder="e.g., Use bullet points and short paragraphs. Include code examples when relevant."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  border: '2px inset',
                  borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                  backgroundColor: '#ffffff',
                  resize: 'vertical',
                }}
              />
              <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                {outputStyle.trim().length}/300 characters
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div style={{ padding: '20px', color: '#000000' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
                Preview & Save
              </h2>
              <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '16px', color: '#000000' }}>
                Review the compiled system prompt. This is what will be sent to the AI model.
              </p>
            </div>
            
            {validationErrors.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '8px',
                backgroundColor: '#ffcccc',
                border: '1px solid #ff0000',
                fontSize: '11px',
              }}>
                <strong>Validation Errors:</strong>
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {saveError && (
              <div style={{
                marginBottom: '16px',
                padding: '8px',
                backgroundColor: '#ffcccc',
                border: '1px solid #ff0000',
                fontSize: '11px',
              }}>
                <strong>Error:</strong> {saveError}
              </div>
            )}

            {compiledPrompt && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                  Compiled System Prompt:
                </div>
                <textarea
                  readOnly
                  value={compiledPrompt}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '8px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    border: '2px inset',
                    borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                    backgroundColor: '#ffffff',
                    resize: 'vertical',
                    whiteSpace: 'pre-wrap',
                  }}
                />
                <div style={{ fontSize: '10px', color: '#808080', marginTop: '4px' }}>
                  {compiledPrompt.length} characters
                </div>
              </div>
            )}

            <div style={{ fontSize: '11px', color: '#000000', marginTop: '16px' }}>
              <strong>Agent Summary:</strong>
              <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                <li>Name: {name || '(not set)'}</li>
                <li>Purpose: {purpose || '(not set)'}</li>
                <li>Tone: {tone}</li>
                <li>Rules: {rules.filter(r => r.trim().length > 0).length}</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Win95Window
        title={isEditMode ? `Agent Editor - ${name || agentId}` : "Agent Creator"}
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
            minHeight: '400px',
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
              Step {step} of 5
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
              {step < 5 ? (
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
                  onClick={handleSave}
                  disabled={!canProceed()}
                  style={{
                    minWidth: '70px',
                    opacity: canProceed() ? 1 : 0.5,
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isEditMode ? 'Save Changes' : 'Create Agent'}
                </button>
              )}
              <button
                className="win95-button"
                onClick={onClose}
                style={{ minWidth: '70px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Win95Window>

      {showExampleConfirm && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            backgroundColor: '#c0c0c0',
            border: '2px solid',
            borderColor:
              'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow:
              '2px 2px 0 0 var(--win95-shadow-dark), -2px -2px 0 0 var(--win95-shadow-light)',
            padding: '16px',
            minWidth: '280px',
            maxWidth: '420px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            Load example agent?
          </div>
          <div
            style={{
              fontSize: '11px',
              marginBottom: '16px',
              color: '#000000',
              lineHeight: '1.4',
            }}
          >
            This will replace your current fields with a pre-filled pirate themed example. You can
            always tweak it afterwards, but any unsaved text here will be lost.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              className="win95-button"
              onClick={() => setShowExampleConfirm(false)}
              style={{ minWidth: '80px' }}
            >
              Keep my changes
            </button>
            <button
              className="win95-button"
              onClick={applyExampleTemplate}
              style={{ minWidth: '110px' }}
            >
              Load example
            </button>
          </div>
        </div>
      )}
    </>
  )
}

