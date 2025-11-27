export type UserContext = {
  name: string;
  role: string;
  projects: string;
  tone: 'friendly' | 'blunt' | 'concise' | 'playful';
};

const STORAGE_KEY = 'doors94_user';

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
    return JSON.parse(stored) as UserContext;
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
 */
export function serializeUserContext(userContext: UserContext): string {
  const toneDescriptions = {
    friendly: 'in a warm, friendly, and approachable manner',
    blunt: 'directly and without unnecessary pleasantries',
    concise: 'briefly and to the point, avoiding unnecessary elaboration',
    playful: 'with a light, playful, and engaging tone',
  };

  const parts: string[] = [];
  
  if (userContext.name) {
    parts.push(`The user's name is ${userContext.name}.`);
  }
  
  if (userContext.role) {
    parts.push(`They work as a ${userContext.role}.`);
  }
  
  if (userContext.projects) {
    parts.push(`They are currently working on: ${userContext.projects}`);
  }
  
  if (userContext.tone) {
    parts.push(`You should communicate with them ${toneDescriptions[userContext.tone]}.`);
  }

  return parts.join(' ');
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

