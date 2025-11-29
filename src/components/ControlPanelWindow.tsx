'use client'

import React, { useState, useEffect } from 'react'
import Win95Window from './Win95Window'
import { AgentManifestWithSource, AgentManifest, buildSystemPrompt, validateAgentManifest, generateAgentId } from '@/lib/agentManifest'
import { getAllAgents, deleteUserAgent, duplicateUserAgent, saveUserAgent, getUserAgent } from '@/lib/agentStorage'

interface ControlPanelWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
  onAgentUpdated?: () => void // Callback when agent is saved (to refresh desktop)
}

export default function ControlPanelWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
  onAgentUpdated,
}: ControlPanelWindowProps) {
  const [agents, setAgents] = useState<AgentManifestWithSource[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentManifestWithSource | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIcon, setEditIcon] = useState('🤖')
  const [editPurpose, setEditPurpose] = useState('')
  const [editRules, setEditRules] = useState<string[]>([''])
  const [editTone, setEditTone] = useState<'serious' | 'friendly' | 'playful' | 'blunt'>('friendly')
  const [editOutputStyle, setEditOutputStyle] = useState('')
  const [editValidationErrors, setEditValidationErrors] = useState<string[]>([])
  const [editSaveError, setEditSaveError] = useState<string | null>(null)

  /**
   * Loads agents when the window becomes active.
   * Ensures the agent list is up-to-date when the user switches to this window.
   */
  useEffect(() => {
    if (isActive) {
      loadAgents()
    }
  }, [isActive])

  /**
   * Loads all agents (built-in and user-created) and updates the state.
   * If an agent is currently selected, refreshes its data.
   */
  const loadAgents = () => {
    const loadedAgents = getAllAgents()
    setAgents(loadedAgents)
    // If selected agent exists, refresh it
    if (selectedAgent) {
      const updated = loadedAgents.find(a => a.id === selectedAgent.id && a.source === selectedAgent.source)
      if (updated) {
        setSelectedAgent(updated)
      }
    }
  }

  /**
   * Handles agent selection from the list.
   * If in edit mode, prompts the user before switching agents.
   */
  const handleSelectAgent = (agent: AgentManifestWithSource) => {
    if (isEditMode) {
      // Confirm leaving edit mode
      if (!confirm('You have unsaved changes. Leave edit mode?')) {
        return
      }
      cancelEdit()
    }
    setSelectedAgent(agent)
    setIsEditMode(false)
  }

  /**
   * Enters edit mode for the selected user agent.
   * Loads the agent's data into the edit form fields.
   * Built-in agents cannot be edited.
   */
  const handleStartEdit = () => {
    if (!selectedAgent || selectedAgent.source === 'builtin') return
    
    const agent = getUserAgent(selectedAgent.id)
    if (agent) {
      setEditName(agent.name)
      setEditDescription(agent.description)
      setEditIcon(agent.icon)
      setEditPurpose(agent.purpose)
      setEditRules(agent.rules.length > 0 ? agent.rules : [''])
      setEditTone(agent.tone)
      setEditOutputStyle(agent.outputStyle)
      setEditValidationErrors([])
      setEditSaveError(null)
      setIsEditMode(true)
    }
  }

  /**
   * Cancels edit mode and clears edit form state.
   */
  const cancelEdit = () => {
    setIsEditMode(false)
    setEditValidationErrors([])
    setEditSaveError(null)
  }

  /**
   * Saves the edited agent manifest.
   * Validates the manifest before saving and shows success/error feedback.
   */
  const handleSaveEdit = () => {
    const manifest: Partial<AgentManifest> = {
      id: selectedAgent?.id || generateAgentId(editName || 'untitled_agent'),
      name: editName.trim(),
      description: editDescription.trim(),
      icon: editIcon.trim() || '🤖',
      purpose: editPurpose.trim(),
      rules: editRules.filter(r => r.trim().length > 0),
      tone: editTone,
      outputStyle: editOutputStyle.trim(),
    }

    const validation = validateAgentManifest(manifest)
    if (!validation.valid) {
      setEditValidationErrors(validation.errors)
      setEditSaveError(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    try {
      saveUserAgent(manifest as AgentManifest)
      loadAgents()
      setIsEditMode(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 2000)
      
      // Refresh the selected agent
      const updated = getAllAgents().find(a => a.id === manifest.id && a.source === 'user')
      if (updated) {
        setSelectedAgent(updated)
      }
      
      // Notify parent to refresh desktop if needed
      if (onAgentUpdated) {
        onAgentUpdated()
      }
    } catch (error) {
      setEditSaveError(error instanceof Error ? error.message : 'Failed to save agent')
    }
  }

  const handleDeleteAgent = (agentId: string) => {
    try {
      deleteUserAgent(agentId)
      loadAgents()
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null)
        setIsEditMode(false)
      }
      setShowDeleteConfirm(null)
      if (onAgentUpdated) {
        onAgentUpdated()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete agent')
    }
  }

  const handleDuplicateAgent = (agentId: string) => {
    try {
      const duplicated = duplicateUserAgent(agentId)
      loadAgents()
      // Select the newly duplicated agent
      const allAgents = getAllAgents()
      const newAgent = allAgents.find(a => a.id === duplicated.id)
      if (newAgent) {
        setSelectedAgent(newAgent)
      }
      if (onAgentUpdated) {
        onAgentUpdated()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate agent')
    }
  }

  const handleAddRule = () => {
    setEditRules([...editRules, ''])
  }

  const handleRemoveRule = (index: number) => {
    if (editRules.length > 1) {
      setEditRules(editRules.filter((_, i) => i !== index))
    } else {
      setEditRules([''])
    }
  }

  const handleRuleChange = (index: number, value: string) => {
    const updated = [...editRules]
    updated[index] = value
    setEditRules(updated)
  }

  /**
   * Validates the agent manifest in real-time while editing.
   * Updates validation errors as the user modifies form fields.
   */
  useEffect(() => {
    if (isEditMode) {
      const manifest: Partial<AgentManifest> = {
        id: selectedAgent?.id,
        name: editName.trim(),
        purpose: editPurpose.trim(),
        tone: editTone,
        description: editDescription.trim(),
        icon: editIcon.trim(),
        rules: editRules.filter(r => r.trim().length > 0),
        outputStyle: editOutputStyle.trim(),
      }
      const validation = validateAgentManifest(manifest)
      setEditValidationErrors(validation.errors)
    }
  }, [isEditMode, editName, editPurpose, editTone, editDescription, editIcon, editRules, editOutputStyle, selectedAgent?.id])

  const compiledPrompt = selectedAgent ? buildSystemPrompt(selectedAgent) : ''
  const editCompiledPrompt = isEditMode ? buildSystemPrompt({
    id: selectedAgent?.id || '',
    name: editName.trim(),
    description: editDescription.trim(),
    icon: editIcon.trim() || '🤖',
    purpose: editPurpose.trim(),
    rules: editRules.filter(r => r.trim().length > 0),
    tone: editTone,
    outputStyle: editOutputStyle.trim(),
  } as AgentManifest) : ''

  return (
    <>
      <Win95Window
        title="Control Panel - Agent Manager"
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
            minHeight: '500px',
          }}
        >
          {/* Content Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            {/* Left Panel: Agent List */}
            <div
              style={{
                width: '250px',
                borderRight: '2px solid var(--win95-border-dark)',
                backgroundColor: '#c0c0c0',
                overflowY: 'auto',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>
                Agents ({agents.length})
              </div>
              
              {agents.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#808080', fontStyle: 'italic', padding: '8px', textAlign: 'center' }}>
                  No agents yet.<br />
                  Create one in Agent Creator!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {agents.map((agent) => (
                    <div
                      key={`${agent.source}_${agent.id}`}
                      onClick={() => handleSelectAgent(agent)}
                      style={{
                        padding: '8px',
                        backgroundColor: selectedAgent?.id === agent.id ? '#000080' : '#ffffff',
                        border: '1px solid var(--win95-border-dark)',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px' }}>{agent.icon}</span>
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: selectedAgent?.id === agent.id ? '#ffffff' : '#000000',
                          }}
                        >
                          {agent.name}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: selectedAgent?.id === agent.id ? '#c0c0c0' : '#808080',
                        }}
                      >
                        {agent.source === 'builtin' ? 'Built-in' : 'Your agent'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Agent Details or Edit Form */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#c0c0c0',
                overflowY: 'auto',
              }}
            >
              {!selectedAgent ? (
                <div style={{ color: '#000000', fontSize: '11px', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                  Select an agent from the list to view or edit details
                </div>
              ) : isEditMode ? (
                // Edit Mode: Inline Form
                <div style={{ color: '#000000' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>Editing: {selectedAgent.name}</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="win95-button"
                        onClick={cancelEdit}
                        style={{ minWidth: '70px', fontSize: '11px' }}
                      >
                        Cancel
                      </button>
                      <button
                        className="win95-button"
                        onClick={handleSaveEdit}
                        disabled={editValidationErrors.length > 0}
                        style={{
                          minWidth: '70px',
                          fontSize: '11px',
                          opacity: editValidationErrors.length > 0 ? 0.5 : 1,
                          cursor: editValidationErrors.length > 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {editSaveError && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '8px',
                      backgroundColor: '#ffcccc',
                      border: '1px solid #ff0000',
                      fontSize: '11px',
                    }}>
                      {editSaveError}
                    </div>
                  )}

                  {editValidationErrors.length > 0 && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '8px',
                      backgroundColor: '#fff4cc',
                      border: '1px solid #ffcc00',
                      fontSize: '11px',
                    }}>
                      <strong>Issues to fix:</strong>
                      <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                        {editValidationErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Name: <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
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
                      {editName.trim().length}/100 characters
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Description:
                    </label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
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
                      {editDescription.trim().length}/200 characters
                    </div>
                  </div>

                  {/* Icon */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Icon (Emoji):
                    </label>
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
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
                  </div>

                  {/* Purpose */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Purpose: <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    <textarea
                      value={editPurpose}
                      onChange={(e) => setEditPurpose(e.target.value)}
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
                      {editPurpose.trim().length}/500 characters
                    </div>
                  </div>

                  {/* Rules */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Rules:
                    </label>
                    {editRules.map((rule, index) => (
                      <div key={index} style={{ marginBottom: '6px', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => handleRuleChange(index, e.target.value)}
                          placeholder="e.g., Always provide code examples"
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
                        {editRules.length > 1 && (
                          <button
                            className="win95-button"
                            onClick={() => handleRemoveRule(index)}
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="win95-button"
                      onClick={handleAddRule}
                      style={{ fontSize: '10px', padding: '2px 8px', marginTop: '4px' }}
                    >
                      + Add Rule
                    </button>
                  </div>

                  {/* Tone */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Tone: <span style={{ color: '#ff0000' }}>*</span>
                    </label>
                    {(['serious', 'friendly', 'playful', 'blunt'] as const).map((toneOption) => (
                      <label
                        key={toneOption}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        <input
                          type="radio"
                          name="editTone"
                          value={toneOption}
                          checked={editTone === toneOption}
                          onChange={() => setEditTone(toneOption)}
                          style={{ marginRight: '6px', cursor: 'pointer' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{toneOption}</span>
                      </label>
                    ))}
                  </div>

                  {/* Output Style */}
                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Output Style:
                    </label>
                    <textarea
                      value={editOutputStyle}
                      onChange={(e) => setEditOutputStyle(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
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
                      {editOutputStyle.trim().length}/300 characters
                    </div>
                  </div>

                  {/* Live Preview */}
                  {editCompiledPrompt && (
                    <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Preview: Compiled System Prompt</div>
                      <textarea
                        readOnly
                        value={editCompiledPrompt}
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '4px',
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          border: '2px inset',
                          borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                          backgroundColor: '#f5f5f5',
                          resize: 'vertical',
                          whiteSpace: 'pre-wrap',
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#808080', marginTop: '4px' }}>
                        {editCompiledPrompt.length} characters
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // View Mode: Read-only Details
                <div style={{ color: '#000000' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{selectedAgent.icon}</span>
                      <div>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>
                          {selectedAgent.name}
                        </h2>
                        <div style={{ fontSize: '10px', color: '#808080' }}>
                          {selectedAgent.source === 'builtin' 
                            ? 'Built-in example (read-only)' 
                            : 'Your custom agent'}
                        </div>
                      </div>
                    </div>
                    {selectedAgent.source === 'user' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="win95-button"
                          onClick={handleStartEdit}
                          style={{ minWidth: '60px', fontSize: '11px' }}
                        >
                          Edit
                        </button>
                        <button
                          className="win95-button"
                          onClick={() => handleDuplicateAgent(selectedAgent.id)}
                          style={{ minWidth: '60px', fontSize: '11px' }}
                        >
                          Duplicate
                        </button>
                        <button
                          className="win95-button"
                          onClick={() => setShowDeleteConfirm(selectedAgent.id)}
                          style={{ minWidth: '60px', fontSize: '11px', backgroundColor: '#ffcccc' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Description</div>
                    <div style={{ fontSize: '11px' }}>{selectedAgent.description || 'No description'}</div>
                  </div>

                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Purpose</div>
                    <div style={{ fontSize: '11px' }}>{selectedAgent.purpose}</div>
                  </div>

                  {selectedAgent.rules.length > 0 && (
                    <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Rules</div>
                      <ul style={{ marginLeft: '20px', fontSize: '11px', marginTop: '4px' }}>
                        {selectedAgent.rules.map((rule, index) => (
                          <li key={index} style={{ marginBottom: '2px' }}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Tone</div>
                    <div style={{ fontSize: '11px', textTransform: 'capitalize' }}>{selectedAgent.tone}</div>
                  </div>

                  {selectedAgent.outputStyle && (
                    <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Output Style</div>
                      <div style={{ fontSize: '11px' }}>{selectedAgent.outputStyle}</div>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Compiled System Prompt</div>
                    <textarea
                      readOnly
                      value={compiledPrompt}
                      style={{
                        width: '100%',
                        minHeight: '150px',
                        padding: '4px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#f5f5f5',
                        resize: 'vertical',
                        whiteSpace: 'pre-wrap',
                      }}
                    />
                    <div style={{ fontSize: '10px', color: '#808080', marginTop: '4px' }}>
                      {compiledPrompt.length} characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Win95Window>

      {/* Save Success Dialog */}
      {showSaveSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            backgroundColor: '#c0c0c0',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '2px 2px 0 0 var(--win95-shadow-dark), -2px -2px 0 0 var(--win95-shadow-light)',
            padding: '16px',
            minWidth: '200px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
            Agent Saved
          </div>
          <div style={{ fontSize: '11px', marginBottom: '12px', color: '#000000' }}>
            Changes have been saved successfully.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="win95-button"
              onClick={() => setShowSaveSuccess(false)}
              style={{ minWidth: '60px' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            backgroundColor: '#c0c0c0',
            border: '2px solid',
            borderColor: 'var(--win95-border-light) var(--win95-border-darker) var(--win95-border-darker) var(--win95-border-light)',
            boxShadow: '2px 2px 0 0 var(--win95-shadow-dark), -2px -2px 0 0 var(--win95-shadow-light)',
            padding: '16px',
            minWidth: '300px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', color: '#000000' }}>
            Delete Agent
          </div>
          <div style={{ fontSize: '11px', marginBottom: '16px', color: '#000000' }}>
            Are you sure you want to delete this agent? This action cannot be undone.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              className="win95-button"
              onClick={() => setShowDeleteConfirm(null)}
              style={{ minWidth: '60px' }}
            >
              Cancel
            </button>
            <button
              className="win95-button"
              onClick={() => handleDeleteAgent(showDeleteConfirm)}
              style={{ minWidth: '60px', backgroundColor: '#ffcccc' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  )
}
