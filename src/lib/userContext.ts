export type Goal = {
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'high' | 'medium' | 'low';
  relatedTech?: string[];
};

export type UserPreferences = {
  codeStyle?: 'verbose' | 'minimal' | 'balanced';
  documentationLevel?: 'none' | 'minimal' | 'moderate' | 'extensive';
  errorHandling?: 'strict' | 'flexible';
  comments?: 'none' | 'sparse' | 'generous';
};

export type UserContext = {
  name: string;
  role: string;
  projects?: string; // Legacy field, kept for backward compatibility
  goals?: Goal[]; // New structured goals array
  tone: 'friendly' | 'blunt' | 'concise' | 'playful';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  techStack?: string[];
  timeCapacity?: 'limited' | 'moderate' | 'flexible';
  preferences?: UserPreferences;
  constraints?: string[];
  learningStyle?: 'visual' | 'hands-on' | 'conceptual' | 'examples';
};

const STORAGE_KEY = 'doors94_user';

/**
 * Migrate old user context format to new format
 */
function migrateUserContext(old: any): UserContext {
  const migrated: UserContext = {
    name: old.name || '',
    role: old.role || '',
    tone: old.tone || 'friendly',
  };

  // Migrate old projects string to goals array if needed
  if (old.projects && typeof old.projects === 'string' && old.projects.trim()) {
    migrated.projects = old.projects; // Keep for backward compatibility
    // Optionally convert to goals - for now we'll keep both
  }

  // Copy new fields if they exist
  if (old.goals) migrated.goals = old.goals;
  if (old.skillLevel) migrated.skillLevel = old.skillLevel;
  if (old.techStack) migrated.techStack = old.techStack;
  if (old.timeCapacity) migrated.timeCapacity = old.timeCapacity;
  if (old.preferences) migrated.preferences = old.preferences;
  if (old.constraints) migrated.constraints = old.constraints;
  if (old.learningStyle) migrated.learningStyle = old.learningStyle;

  return migrated;
}

/**
 * Get user context from localStorage (client-side only)
 */
export function getUserContext(): UserContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    return migrateUserContext(parsed);
  } catch (error) {
    console.error('Error reading user context from localStorage:', error);
    return null;
  }
}

/**
 * Save user context to localStorage (client-side only)
 */
export function saveUserContext(userContext: UserContext): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userContext));
  } catch (error) {
    console.error('Error saving user context to localStorage:', error);
  }
}

/**
 * Serialize user context into a short paragraph to be appended to the system prompt
 * Agent-specific serialization provides relevant context for each agent type
 */
export function serializeUserContext(userContext: UserContext | null | undefined, agentId?: string): string {
  if (!userContext) {
    return '';
  }
  const toneDescriptions = {
    friendly: 'in a warm, friendly, and approachable manner',
    blunt: 'directly and without unnecessary pleasantries',
    concise: 'briefly and to the point, avoiding unnecessary elaboration',
    playful: 'with a light, playful, and engaging tone',
  };

  const skillLevelDescriptions = {
    beginner: 'They are a beginner and may need more explanation and guidance.',
    intermediate: 'They have intermediate experience and can handle moderate complexity.',
    advanced: 'They are advanced and can handle complex topics with less explanation.',
    expert: 'They are an expert and can discuss advanced topics at a high level.',
  };

  const timeCapacityDescriptions = {
    limited: 'They have limited time, so prioritize quick wins and minimal viable solutions.',
    moderate: 'They have moderate time available for their projects.',
    flexible: 'They have flexible time constraints and can invest in more thorough solutions.',
  };

  const parts: string[] = [];
  
  // Basic info (all agents)
  if (userContext.name) {
    parts.push(`The user's name is ${userContext.name}.`);
  }
  
  if (userContext.role) {
    parts.push(`They work as a ${userContext.role}.`);
  }

  // Agent-specific context
  if (agentId === 'pm95') {
    // PM95 needs: goals, constraints, time capacity
    if (userContext.goals && userContext.goals.length > 0) {
      const activeGoals = userContext.goals.filter(g => g.status === 'in-progress' || g.status === 'planning');
      if (activeGoals.length > 0) {
        parts.push(`Their current goals include: ${activeGoals.map(g => g.title).join(', ')}.`);
        activeGoals.forEach(goal => {
          if (goal.description) {
            parts.push(`- ${goal.title}: ${goal.description} (priority: ${goal.priority})`);
          }
        });
      }
    } else if (userContext.projects) {
      parts.push(`They are currently working on: ${userContext.projects}`);
    }
    
    if (userContext.constraints && userContext.constraints.length > 0) {
      parts.push(`Key constraints: ${userContext.constraints.join(', ')}.`);
    }
    
    if (userContext.timeCapacity) {
      parts.push(timeCapacityDescriptions[userContext.timeCapacity]);
    }
  } else if (agentId === 'builder') {
    // Builder needs: tech stack, skill level, code preferences
    if (userContext.techStack && userContext.techStack.length > 0) {
      parts.push(`Their preferred tech stack: ${userContext.techStack.join(', ')}.`);
    }
    
    if (userContext.skillLevel) {
      parts.push(skillLevelDescriptions[userContext.skillLevel]);
    }
    
    if (userContext.preferences) {
      const prefParts: string[] = [];
      if (userContext.preferences.codeStyle) {
        prefParts.push(`code style: ${userContext.preferences.codeStyle}`);
      }
      if (userContext.preferences.documentationLevel) {
        prefParts.push(`documentation: ${userContext.preferences.documentationLevel}`);
      }
      if (userContext.preferences.comments) {
        prefParts.push(`comments: ${userContext.preferences.comments}`);
      }
      if (prefParts.length > 0) {
        parts.push(`Code preferences: ${prefParts.join(', ')}.`);
      }
    }

    if (userContext.goals && userContext.goals.length > 0) {
      const activeGoals = userContext.goals.filter(g => g.status === 'in-progress');
      if (activeGoals.length > 0) {
        parts.push(`They are currently building: ${activeGoals.map(g => g.title).join(', ')}.`);
      }
    } else if (userContext.projects) {
      parts.push(`They are currently working on: ${userContext.projects}`);
    }
  } else if (agentId === 'fixit') {
    // Fixit needs: skill level, tech stack, learning style
    if (userContext.skillLevel) {
      parts.push(skillLevelDescriptions[userContext.skillLevel]);
    }
    
    if (userContext.techStack && userContext.techStack.length > 0) {
      parts.push(`Their tech stack: ${userContext.techStack.join(', ')}. Use stack-specific solutions.`);
    }
    
    if (userContext.learningStyle) {
      const styleDescriptions = {
        visual: 'They learn best with visual aids, diagrams, and examples.',
        'hands-on': 'They learn best by doing, so provide step-by-step instructions they can follow.',
        conceptual: 'They prefer understanding the underlying concepts first.',
        examples: 'They learn best from concrete examples and code snippets.',
      };
      parts.push(styleDescriptions[userContext.learningStyle]);
    }
  } else if (agentId === 'tinkerer') {
    // Tinkerer needs: interests/goals, skill level, tech stack
    if (userContext.goals && userContext.goals.length > 0) {
      const goalTech = userContext.goals
        .flatMap(g => g.relatedTech || [])
        .filter((v, i, a) => a.indexOf(v) === i);
      if (goalTech.length > 0) {
        parts.push(`They're interested in: ${goalTech.join(', ')}.`);
      }
    }
    
    if (userContext.skillLevel) {
      parts.push(skillLevelDescriptions[userContext.skillLevel]);
    }
    
    if (userContext.techStack && userContext.techStack.length > 0) {
      parts.push(`They enjoy working with: ${userContext.techStack.join(', ')}.`);
    }

    if (userContext.projects) {
      parts.push(`Current interests: ${userContext.projects}`);
    }
  } else {
    // Default: general context for unknown agents
    if (userContext.goals && userContext.goals.length > 0) {
      const activeGoals = userContext.goals.filter(g => g.status === 'in-progress' || g.status === 'planning');
      if (activeGoals.length > 0) {
        parts.push(`Current goals: ${activeGoals.map(g => g.title).join(', ')}.`);
      }
    } else if (userContext.projects) {
      parts.push(`They are currently working on: ${userContext.projects}`);
    }
    
    if (userContext.skillLevel) {
      parts.push(skillLevelDescriptions[userContext.skillLevel]);
    }
    
    if (userContext.techStack && userContext.techStack.length > 0) {
      parts.push(`Tech stack: ${userContext.techStack.join(', ')}.`);
    }
  }
  
  // Communication tone (all agents)
  if (userContext.tone && userContext.tone in toneDescriptions) {
    parts.push(`You should communicate with them ${toneDescriptions[userContext.tone]}.`);
  }

  const result = parts.join(' ').trim();
  return result || ''; // Return empty string if no parts
}

// Agent Overrides Storage
const AGENT_OVERRIDES_KEY = 'agent_overrides';

export type AgentOverrides = Record<string, string>; // agentId -> extra instructions

/**
 * Get agent overrides from localStorage (client-side only)
 */
export function getAgentOverrides(): AgentOverrides {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(AGENT_OVERRIDES_KEY);
    if (!stored) {
      return {};
    }
    return JSON.parse(stored) as AgentOverrides;
  } catch (error) {
    console.error('Error reading agent overrides from localStorage:', error);
    return {};
  }
}

/**
 * Save agent overrides to localStorage (client-side only)
 */
export function saveAgentOverrides(overrides: AgentOverrides): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(AGENT_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving agent overrides to localStorage:', error);
  }
}

/**
 * Get override for a specific agent
 */
export function getAgentOverride(agentId: string): string {
  const overrides = getAgentOverrides();
  return overrides[agentId] || '';
}

/**
 * Set override for a specific agent
 */
export function setAgentOverride(agentId: string, instructions: string): void {
  const overrides = getAgentOverrides();
  overrides[agentId] = instructions;
  saveAgentOverrides(overrides);
}

// Conversation Memory Storage
const CONVERSATION_MEMORY_KEY = 'conversation_memory';

export type ConversationMemory = {
  agentId: string;
  timestamp: number;
  summary: string;
  keyTopics: string[];
  decisions?: string[];
  codeSnippets?: string[];
  preferencesDiscovered?: string[];
};

export type ConversationMemoryStore = {
  conversations: ConversationMemory[];
  lastUpdated: number;
};

/**
 * Get all conversation memories from localStorage
 */
export function getConversationMemories(): ConversationMemoryStore {
  if (typeof window === 'undefined') {
    return { conversations: [], lastUpdated: 0 };
  }

  try {
    const stored = localStorage.getItem(CONVERSATION_MEMORY_KEY);
    if (!stored) {
      return { conversations: [], lastUpdated: 0 };
    }
    return JSON.parse(stored) as ConversationMemoryStore;
  } catch (error) {
    console.error('Error reading conversation memories from localStorage:', error);
    return { conversations: [], lastUpdated: 0 };
  }
}

/**
 * Get conversation memories for a specific agent
 */
export function getConversationMemoriesForAgent(agentId: string): ConversationMemory[] {
  const store = getConversationMemories();
  return store.conversations.filter(c => c.agentId === agentId);
}

/**
 * Save a conversation memory
 */
export function saveConversationMemory(memory: ConversationMemory): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const store = getConversationMemories();
    store.conversations.push(memory);
    store.lastUpdated = Date.now();
    
    // Keep only last 50 conversations
    if (store.conversations.length > 50) {
      store.conversations = store.conversations.slice(-50);
    }
    
    localStorage.setItem(CONVERSATION_MEMORY_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving conversation memory to localStorage:', error);
  }
}

/**
 * Clear all conversation memories
 */
export function clearConversationMemories(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CONVERSATION_MEMORY_KEY);
  } catch (error) {
    console.error('Error clearing conversation memories from localStorage:', error);
  }
}

