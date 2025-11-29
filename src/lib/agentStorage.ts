import { AgentManifest, AgentManifestWithSource, AgentSource, validateAgentManifest } from './agentManifest';
import { BUILTIN_AGENTS } from './builtinAgents';

const STORAGE_KEY = 'DOOR94_USER_AGENTS';
const MAX_USER_AGENTS = 50;

/**
 * Saves a user-created agent to localStorage.
 * Validates the manifest and handles ID collisions.
 */
export function saveUserAgent(manifest: AgentManifest): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Validate manifest
  const validation = validateAgentManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid agent manifest: ${validation.errors.join(', ')}`);
  }

  // Check for built-in ID collision
  const builtinIds = BUILTIN_AGENTS.map((a) => a.id);
  if (builtinIds.includes(manifest.id)) {
    throw new Error(`Agent ID "${manifest.id}" conflicts with a built-in agent. Please choose a different ID.`);
  }

  // Load existing agents
  const existing = loadUserAgents();

  // Check for duplicate user agent ID
  const existingIndex = existing.findIndex((a) => a.id === manifest.id);
  if (existingIndex >= 0) {
    // Update existing agent
    existing[existingIndex] = manifest;
  } else {
    // Check agent count limit
    if (existing.length >= MAX_USER_AGENTS) {
      throw new Error(`Maximum of ${MAX_USER_AGENTS} user agents allowed. Please delete an existing agent first.`);
    }
    // Add new agent
    existing.push(manifest);
  }

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some agents or clear browser storage.');
    }
    throw error;
  }
}

/**
 * Loads all user-created agents from localStorage.
 */
export function loadUserAgents(): AgentManifest[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    
    // Validate it's an array
    if (!Array.isArray(parsed)) {
      console.error('Invalid user agents data in localStorage');
      return [];
    }

    // Filter out invalid manifests
    return parsed.filter((agent: any) => {
      const validation = validateAgentManifest(agent);
      if (!validation.valid) {
        console.warn('Skipping invalid agent:', agent.id, validation.errors);
        return false;
      }
      return true;
    }) as AgentManifest[];
  } catch (error) {
    console.error('Error loading user agents from localStorage:', error);
    return [];
  }
}

/**
 * Deletes a user-created agent by ID.
 * Cannot delete built-in agents.
 */
export function deleteUserAgent(agentId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if it's a built-in agent
  const builtinIds = BUILTIN_AGENTS.map((a) => a.id);
  if (builtinIds.includes(agentId)) {
    throw new Error('Cannot delete built-in agents');
  }

  const existing = loadUserAgents();
  const filtered = existing.filter((a) => a.id !== agentId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting user agent:', error);
    throw error;
  }
}

/**
 * Gets a user agent by ID.
 */
export function getUserAgent(agentId: string): AgentManifest | undefined {
  const userAgents = loadUserAgents();
  return userAgents.find((a) => a.id === agentId);
}

/**
 * Gets all agents (built-in + user), merged with source information.
 * Built-in agents come first, then user agents sorted alphabetically.
 */
export function getAllAgents(): AgentManifestWithSource[] {
  const builtins: AgentManifestWithSource[] = BUILTIN_AGENTS.map((agent) => ({
    ...agent,
    source: 'builtin' as AgentSource,
  }));

  const userAgents: AgentManifestWithSource[] = loadUserAgents()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((agent) => ({
      ...agent,
      source: 'user' as AgentSource,
    }));

  return [...builtins, ...userAgents];
}

/**
 * Gets an agent by ID and source.
 */
export function getAgentByIdAndSource(
  id: string,
  source: AgentSource
): AgentManifest | undefined {
  if (source === 'builtin') {
    return BUILTIN_AGENTS.find((a) => a.id === id);
  } else {
    return getUserAgent(id);
  }
}

/**
 * Gets remaining agent slots available for user-created agents.
 */
export function getRemainingAgentSlots(): number {
  const userAgents = loadUserAgents();
  return Math.max(0, MAX_USER_AGENTS - userAgents.length);
}

/**
 * Duplicates a user agent by creating a copy with a new ID.
 * The new agent will have "_copy" appended to the name and ID.
 */
export function duplicateUserAgent(agentId: string): AgentManifest {
  const agent = getUserAgent(agentId);
  if (!agent) {
    throw new Error(`Agent with id "${agentId}" not found`);
  }

  // Create a duplicate with modified name and ID
  const existingAgents = getAllAgents();
  let copyNumber = 1;
  let newId = `${agent.id}_copy${copyNumber}`;
  let newName = `${agent.name} (Copy ${copyNumber})`;

  // Find a unique ID and name
  while (existingAgents.some(a => a.id === newId)) {
    copyNumber++;
    newId = `${agent.id}_copy${copyNumber}`;
    newName = `${agent.name} (Copy ${copyNumber})`;
  }

  const duplicate: AgentManifest = {
    ...agent,
    id: newId,
    name: newName,
  };

  // Save the duplicate
  saveUserAgent(duplicate);
  return duplicate;
}

