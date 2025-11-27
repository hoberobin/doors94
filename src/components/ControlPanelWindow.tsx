'use client'

import React, { useState, useEffect } from 'react'
import Win95Window from './Win95Window'
import { getUserContext, saveUserContext, UserContext, Goal, UserPreferences, getConversationMemories, ConversationMemory, clearConversationMemories } from '@/lib/userContext'
import { AGENTS, AgentId } from '@/lib/agents'
import { getAgentOverrides, saveAgentOverrides, AgentOverrides } from '@/lib/userContext'
import { CONTEXT_TEMPLATES, applyTemplate } from '@/lib/contextTemplates'

interface ControlPanelWindowProps {
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onClick: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
  style?: React.CSSProperties
}

type Tab = 'context' | 'agents' | 'conversations'

export default function ControlPanelWindow({
  isActive,
  onClose,
  onMinimize,
  onClick,
  onMove,
  onResize,
  style,
}: ControlPanelWindowProps) {
  const [activeTab, setActiveTab] = useState<Tab>('context')
  const [showSavedDialog, setShowSavedDialog] = useState(false)
  
  // Context tab state
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [projects, setProjects] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [tone, setTone] = useState<'friendly' | 'blunt' | 'concise' | 'playful'>('friendly')
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert' | undefined>(undefined)
  const [techStack, setTechStack] = useState<string[]>([])
  const [techStackInput, setTechStackInput] = useState('')
  const [timeCapacity, setTimeCapacity] = useState<'limited' | 'moderate' | 'flexible' | undefined>(undefined)
  const [learningStyle, setLearningStyle] = useState<'visual' | 'hands-on' | 'conceptual' | 'examples' | undefined>(undefined)
  const [constraints, setConstraints] = useState<string[]>([])
  const [constraintInput, setConstraintInput] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>({})
  
  // Agents tab state
  const [agentOverrides, setAgentOverrides] = useState<AgentOverrides>({})
  
  // Conversations tab state
  const [conversationMemories, setConversationMemories] = useState<ConversationMemory[]>([])

  // Load data on mount
  useEffect(() => {
    const userContext = getUserContext()
    if (userContext) {
      setName(userContext.name || '')
      setRole(userContext.role || '')
      setProjects(userContext.projects || '')
      setGoals(userContext.goals || [])
      setTone(userContext.tone || 'friendly')
      setSkillLevel(userContext.skillLevel)
      setTechStack(userContext.techStack || [])
      setTimeCapacity(userContext.timeCapacity)
      setLearningStyle(userContext.learningStyle)
      setConstraints(userContext.constraints || [])
      setPreferences(userContext.preferences || {})
    }
    
    const overrides = getAgentOverrides()
    setAgentOverrides(overrides)
    
    const memories = getConversationMemories()
    setConversationMemories(memories.conversations.sort((a, b) => b.timestamp - a.timestamp))
  }, [])

  // Refresh conversations when tab becomes active
  useEffect(() => {
    if (activeTab === 'conversations') {
      const memories = getConversationMemories()
      setConversationMemories(memories.conversations.sort((a, b) => b.timestamp - a.timestamp))
    }
  }, [activeTab])

  const handleSaveContext = () => {
    const userContext: UserContext = {
      name: name.trim(),
      role: role.trim(),
      projects: projects.trim() || undefined,
      goals: goals.length > 0 ? goals : undefined,
      tone,
      skillLevel,
      techStack: techStack.length > 0 ? techStack : undefined,
      timeCapacity,
      learningStyle,
      constraints: constraints.length > 0 ? constraints : undefined,
      preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
    }
    
    saveUserContext(userContext)
    setShowSavedDialog(true)
    setTimeout(() => setShowSavedDialog(false), 2000)
  }

  const handleAddTechStack = () => {
    const trimmed = techStackInput.trim()
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed])
      setTechStackInput('')
    }
  }

  const handleRemoveTechStack = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech))
  }

  const handleAddConstraint = () => {
    const trimmed = constraintInput.trim()
    if (trimmed && !constraints.includes(trimmed)) {
      setConstraints([...constraints, trimmed])
      setConstraintInput('')
    }
  }

  const handleRemoveConstraint = (constraint: string) => {
    setConstraints(constraints.filter(c => c !== constraint))
  }

  const handleAddGoal = () => {
    const newGoal: Goal = {
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
    }
    setGoals([...goals, newGoal])
  }

  const handleUpdateGoal = (index: number, field: keyof Goal, value: any) => {
    const updated = [...goals]
    updated[index] = { ...updated[index], [field]: value }
    setGoals(updated)
  }

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
  }

  // Calculate context completeness
  const getContextCompleteness = (): number => {
    let score = 0
    let maxScore = 0
    
    // Basic fields (required)
    maxScore += 2
    if (name.trim()) score += 1
    if (role.trim()) score += 1
    
    // Enhanced fields (optional but helpful)
    maxScore += 8
    if (skillLevel) score += 1
    if (techStack.length > 0) score += 1
    if (timeCapacity) score += 1
    if (learningStyle) score += 1
    if (goals.length > 0 || projects.trim()) score += 1
    if (constraints.length > 0) score += 1
    if (preferences.codeStyle) score += 1
    if (preferences.documentationLevel) score += 1
    
    return Math.round((score / maxScore) * 100)
  }

  const completeness = getContextCompleteness()

  const handleExportContext = () => {
    const contextToExport: UserContext = {
      name: name.trim(),
      role: role.trim(),
      projects: projects.trim() || undefined,
      goals: goals.length > 0 ? goals : undefined,
      tone,
      skillLevel,
      techStack: techStack.length > 0 ? techStack : undefined,
      timeCapacity,
      learningStyle,
      constraints: constraints.length > 0 ? constraints : undefined,
      preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
    }
    
    const dataStr = JSON.stringify(contextToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `context-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportContext = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as Partial<UserContext>
          
          // Apply imported context to state
          if (imported.name) setName(imported.name)
          if (imported.role) setRole(imported.role)
          if (imported.projects) setProjects(imported.projects || '')
          if (imported.goals) setGoals(imported.goals)
          if (imported.tone) setTone(imported.tone)
          if (imported.skillLevel) setSkillLevel(imported.skillLevel)
          if (imported.techStack) setTechStack(imported.techStack)
          if (imported.timeCapacity) setTimeCapacity(imported.timeCapacity)
          if (imported.learningStyle) setLearningStyle(imported.learningStyle)
          if (imported.constraints) setConstraints(imported.constraints)
          if (imported.preferences) setPreferences(imported.preferences)
          
          alert('Context imported successfully! Click Save to apply.')
        } catch (error) {
          alert('Error importing context: Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleSaveAgents = () => {
    saveAgentOverrides(agentOverrides)
    setShowSavedDialog(true)
    setTimeout(() => setShowSavedDialog(false), 2000)
  }

  const handleAgentOverrideChange = (agentId: AgentId, value: string) => {
    setAgentOverrides((prev) => ({
      ...prev,
      [agentId]: value,
    }))
  }

  return (
    <>
      <Win95Window
        title="Control Panel"
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
            minHeight: '600px',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid var(--win95-border-dark)',
              backgroundColor: '#c0c0c0',
            }}
          >
            <button
              onClick={() => setActiveTab('context')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                borderRight: '1px solid var(--win95-border-dark)',
                backgroundColor: activeTab === 'context' ? '#c0c0c0' : '#d4d0c8',
                color: '#000000',
                cursor: 'pointer',
                borderBottom: activeTab === 'context' ? '2px solid #c0c0c0' : 'none',
                marginBottom: activeTab === 'context' ? '-2px' : '0',
              }}
            >
              Context
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                borderRight: '1px solid var(--win95-border-dark)',
                backgroundColor: activeTab === 'agents' ? '#c0c0c0' : '#d4d0c8',
                color: '#000000',
                cursor: 'pointer',
                borderBottom: activeTab === 'agents' ? '2px solid #c0c0c0' : 'none',
                marginBottom: activeTab === 'agents' ? '-2px' : '0',
              }}
            >
              Agents
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                backgroundColor: activeTab === 'conversations' ? '#c0c0c0' : '#d4d0c8',
                color: '#000000',
                cursor: 'pointer',
                borderBottom: activeTab === 'conversations' ? '2px solid #c0c0c0' : 'none',
                marginBottom: activeTab === 'conversations' ? '-2px' : '0',
              }}
            >
              Conversations
            </button>
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              backgroundColor: '#c0c0c0',
            }}
          >
            {activeTab === 'context' ? (
              <div style={{ color: '#000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      User Context
                    </h2>
                    <div style={{ fontSize: '10px', color: '#808080' }}>
                      Completeness: {completeness}%
                      {completeness < 50 && ' - Consider adding more details for better personalization'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                      Template:
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const template = CONTEXT_TEMPLATES.find(t => t.id === e.target.value)
                          if (template) {
                            const currentContext = getUserContext()
                            const merged = applyTemplate(template, currentContext || {})
                            
                            // Apply template to state
                            if (merged.name) setName(merged.name)
                            if (merged.role) setRole(merged.role)
                            if (merged.skillLevel) setSkillLevel(merged.skillLevel)
                            if (merged.techStack) setTechStack(merged.techStack)
                            if (merged.timeCapacity) setTimeCapacity(merged.timeCapacity)
                            if (merged.learningStyle) setLearningStyle(merged.learningStyle)
                            if (merged.tone) setTone(merged.tone)
                            if (merged.goals) setGoals(merged.goals)
                            if (merged.constraints) setConstraints(merged.constraints)
                            if (merged.preferences) setPreferences(merged.preferences)
                            
                            // Reset select
                            e.target.value = ''
                          }
                        }
                      }}
                      style={{
                        padding: '2px 4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Load template...</option>
                      {CONTEXT_TEMPLATES.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Import/Export */}
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    className="win95-button"
                    onClick={handleExportContext}
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                  >
                    📥 Export Context
                  </button>
                  <button
                    className="win95-button"
                    onClick={handleImportContext}
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                  >
                    📤 Import Context
                  </button>
                </div>
                
                {/* Basic Info */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Basic Information</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Name:
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
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Role:
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
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Skill Level:
                    </label>
                    <select
                      value={skillLevel || ''}
                      onChange={(e) => setSkillLevel(e.target.value as any || undefined)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Goals */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold' }}>Goals / Projects</h3>
                    <button
                      className="win95-button"
                      onClick={handleAddGoal}
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      + Add Goal
                    </button>
                  </div>
                  {goals.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#808080', fontStyle: 'italic', marginBottom: '8px' }}>
                      No goals defined. Add structured goals or use the projects field below.
                    </div>
                  )}
                  {goals.map((goal, index) => (
                    <div key={index} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #c0c0c0', backgroundColor: '#f5f5f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="Goal title"
                          value={goal.title}
                          onChange={(e) => handleUpdateGoal(index, 'title', e.target.value)}
                          style={{
                            flex: 1,
                            marginRight: '8px',
                            padding: '4px',
                            fontSize: '11px',
                            fontFamily: 'inherit',
                            border: '2px inset',
                            borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <button
                          className="win95-button"
                          onClick={() => handleRemoveGoal(index)}
                          style={{ fontSize: '10px', padding: '2px 8px' }}
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        placeholder="Description"
                        value={goal.description}
                        onChange={(e) => handleUpdateGoal(index, 'description', e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '50px',
                          marginBottom: '8px',
                          padding: '4px',
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          border: '2px inset',
                          borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                          backgroundColor: '#ffffff',
                          resize: 'vertical',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          Status:
                          <select
                            value={goal.status}
                            onChange={(e) => handleUpdateGoal(index, 'status', e.target.value)}
                            style={{
                              marginLeft: '4px',
                              padding: '2px',
                              fontSize: '11px',
                              fontFamily: 'inherit',
                              border: '2px inset',
                              borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            <option value="planning">Planning</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                          </select>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          Priority:
                          <select
                            value={goal.priority}
                            onChange={(e) => handleUpdateGoal(index, 'priority', e.target.value)}
                            style={{
                              marginLeft: '4px',
                              padding: '2px',
                              fontSize: '11px',
                              fontFamily: 'inherit',
                              border: '2px inset',
                              borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Legacy Projects Field (free text):
                    </label>
                    <textarea
                      value={projects}
                      onChange={(e) => setProjects(e.target.value)}
                      placeholder="Use structured goals above, or enter free-form projects here"
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
                  </div>
                </div>

                {/* Tech Stack */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Tech Stack</h3>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTechStack();
                        }
                      }}
                      placeholder="Enter technology (e.g., React, Python, Node.js)"
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
                    <button
                      className="win95-button"
                      onClick={handleAddTechStack}
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      Add
                    </button>
                  </div>
                  {techStack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {techStack.map((tech) => (
                        <div
                          key={tech}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            backgroundColor: '#e0e0e0',
                            border: '1px solid var(--win95-border-dark)',
                            fontSize: '10px',
                          }}
                        >
                          {tech}
                          <button
                            onClick={() => handleRemoveTechStack(tech)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '12px',
                              color: '#000000',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Constraints */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Constraints</h3>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={constraintInput}
                      onChange={(e) => setConstraintInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddConstraint();
                        }
                      }}
                      placeholder="Enter constraint (e.g., Limited budget, Tight deadline)"
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
                    <button
                      className="win95-button"
                      onClick={handleAddConstraint}
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      Add
                    </button>
                  </div>
                  {constraints.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {constraints.map((constraint) => (
                        <div
                          key={constraint}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            backgroundColor: '#e0e0e0',
                            border: '1px solid var(--win95-border-dark)',
                            fontSize: '10px',
                          }}
                        >
                          {constraint}
                          <button
                            onClick={() => handleRemoveConstraint(constraint)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '12px',
                              color: '#000000',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferences & Settings */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Preferences & Settings</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Time Capacity:
                    </label>
                    <select
                      value={timeCapacity || ''}
                      onChange={(e) => setTimeCapacity(e.target.value as any || undefined)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="limited">Limited</option>
                      <option value="moderate">Moderate</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Learning Style:
                    </label>
                    <select
                      value={learningStyle || ''}
                      onChange={(e) => setLearningStyle(e.target.value as any || undefined)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="visual">Visual</option>
                      <option value="hands-on">Hands-on</option>
                      <option value="conceptual">Conceptual</option>
                      <option value="examples">Examples</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Code Style Preference:
                    </label>
                    <select
                      value={preferences.codeStyle || ''}
                      onChange={(e) => setPreferences({ ...preferences, codeStyle: e.target.value as any || undefined })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="verbose">Verbose</option>
                      <option value="minimal">Minimal</option>
                      <option value="balanced">Balanced</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Documentation Level:
                    </label>
                    <select
                      value={preferences.documentationLevel || ''}
                      onChange={(e) => setPreferences({ ...preferences, documentationLevel: e.target.value as any || undefined })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="none">None</option>
                      <option value="minimal">Minimal</option>
                      <option value="moderate">Moderate</option>
                      <option value="extensive">Extensive</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>
                      Comment Style:
                    </label>
                    <select
                      value={preferences.comments || ''}
                      onChange={(e) => setPreferences({ ...preferences, comments: e.target.value as any || undefined })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        border: '2px inset',
                        borderColor: 'var(--win95-border-dark) var(--win95-border-light) var(--win95-border-light) var(--win95-border-dark)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Not specified</option>
                      <option value="none">None</option>
                      <option value="sparse">Sparse</option>
                      <option value="generous">Generous</option>
                    </select>
                  </div>
                </div>

                {/* Communication Tone */}
                <div style={{ marginBottom: '16px', padding: '8px', border: '1px solid var(--win95-border-dark)', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Communication Tone</h3>
                  {(['friendly', 'blunt', 'concise', 'playful'] as const).map((toneOption) => (
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
                        style={{
                          marginRight: '8px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{toneOption}</span>
                    </label>
                  ))}
                </div>

                <button
                  className="win95-button"
                  onClick={handleSaveContext}
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </div>
            ) : activeTab === 'agents' ? (
              <div style={{ color: '#000000' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Agent Customization
                </h2>
                <p style={{ fontSize: '11px', marginBottom: '16px', color: '#000000' }}>
                  Add extra instructions for each agent. These will be appended to the agent's base system prompt.
                </p>
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      marginBottom: '20px',
                      padding: '12px',
                      border: '1px solid var(--win95-border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#808080', marginTop: '2px' }}>
                        {agent.description}
                      </div>
                    </div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        marginBottom: '4px',
                        fontWeight: 'bold',
                        color: '#000000',
                      }}
                    >
                      Extra Instructions:
                    </label>
                    <textarea
                      value={agentOverrides[agent.id] || ''}
                      onChange={(e) => handleAgentOverrideChange(agent.id, e.target.value)}
                      placeholder="Add custom instructions for this agent..."
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
                  </div>
                ))}
                <button
                  className="win95-button"
                  onClick={handleSaveAgents}
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ color: '#000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Conversation History
                  </h2>
                  {conversationMemories.length > 0 && (
                    <button
                      className="win95-button"
                      onClick={() => {
                        if (confirm('Clear all conversation memories?')) {
                          clearConversationMemories()
                          setConversationMemories([])
                        }
                      }}
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {conversationMemories.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#808080', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                    No conversation history yet. Conversations will appear here as you chat with agents.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {conversationMemories.map((memory, index) => {
                      const agent = AGENTS.find(a => a.id === memory.agentId)
                      const date = new Date(memory.timestamp)
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '12px',
                            border: '1px solid var(--win95-border-dark)',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                              {agent?.name || memory.agentId}
                            </div>
                            <div style={{ fontSize: '10px', color: '#808080' }}>
                              {date.toLocaleString()}
                            </div>
                          </div>
                          {memory.summary && (
                            <div style={{ fontSize: '11px', marginBottom: '8px', color: '#000000' }}>
                              <strong>Summary:</strong> {memory.summary}
                            </div>
                          )}
                          {memory.keyTopics && memory.keyTopics.length > 0 && (
                            <div style={{ fontSize: '11px', marginBottom: '8px', color: '#000000' }}>
                              <strong>Key Topics:</strong> {memory.keyTopics.join(', ')}
                            </div>
                          )}
                          {memory.decisions && memory.decisions.length > 0 && (
                            <div style={{ fontSize: '11px', marginBottom: '8px', color: '#000000' }}>
                              <strong>Decisions:</strong>
                              <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                                {memory.decisions.map((decision, i) => (
                                  <li key={i} style={{ fontSize: '11px' }}>{decision}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {memory.preferencesDiscovered && memory.preferencesDiscovered.length > 0 && (
                            <div style={{ fontSize: '11px', color: '#000000' }}>
                              <strong>Preferences Discovered:</strong> {memory.preferencesDiscovered.join(', ')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Win95Window>

      {/* Saved Dialog */}
      {showSavedDialog && (
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
            Context Saved
          </div>
          <div style={{ fontSize: '11px', marginBottom: '12px', color: '#000000' }}>
            Your preferences have been saved.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="win95-button"
              onClick={() => setShowSavedDialog(false)}
              style={{ minWidth: '60px' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}

