export type AgentManifest = {
  id: string;
  name: string;
  description: string;
  icon: string;
  purpose: string;
  rules: string[];
  tone: "serious" | "friendly" | "playful" | "blunt";
  outputStyle: string;
};

export type AgentSource = "builtin" | "user";

export type AgentManifestWithSource = AgentManifest & {
  source: AgentSource;
};

/**
 * Builds a complete system prompt from an AgentManifest.
 * This function compiles all manifest fields into a structured prompt
 * that teaches users how agent design maps to prompt engineering.
 */
export function buildSystemPrompt(manifest: AgentManifest): string {
  const parts: string[] = [];

  // Introduction: Who the agent is
  parts.push(`You are ${manifest.name}.`);
  
  if (manifest.description) {
    parts.push(manifest.description);
  }

  // Purpose: What the agent does
  if (manifest.purpose) {
    parts.push(`\nYour mission: ${manifest.purpose}`);
  }

  // Rules: Always/Never statements
  if (manifest.rules && manifest.rules.length > 0) {
    parts.push(`\nRULES:`);
    manifest.rules.forEach((rule) => {
      parts.push(`- ${rule}`);
    });
  }

  // Tone: How the agent communicates
  const toneDescriptions: Record<AgentManifest["tone"], string> = {
    serious: "Maintain a serious, professional, and no-nonsense tone. Be direct and factual.",
    friendly: "Be warm, friendly, and approachable. Use a conversational style that puts users at ease.",
    playful: "Be light-hearted, creative, and engaging. Don't be afraid to show personality and have fun.",
    blunt: "Be direct, honest, and straightforward. Skip pleasantries and get straight to the point.",
  };
  
  if (manifest.tone) {
    parts.push(`\nTONE & STYLE:`);
    parts.push(toneDescriptions[manifest.tone]);
  }

  // Output Style: Formatting and length instructions
  if (manifest.outputStyle) {
    parts.push(`\nOUTPUT FORMAT:`);
    parts.push(manifest.outputStyle);
  }

  return parts.join('\n').trim();
}

/**
 * Validates an agent manifest and returns validation results.
 */
export function validateAgentManifest(
  manifest: Partial<AgentManifest>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!manifest.id || manifest.id.trim() === '') {
    errors.push('Agent ID is required');
  } else {
    // ID validation
    if (manifest.id.length > 50) {
      errors.push('Agent ID must be 50 characters or less');
    }
    if (!/^[a-z0-9_]+$/.test(manifest.id)) {
      errors.push('Agent ID must contain only lowercase letters, numbers, and underscores');
    }
  }

  if (!manifest.name || manifest.name.trim() === '') {
    errors.push('Agent name is required');
  } else if (manifest.name.length > 100) {
    errors.push('Agent name must be 100 characters or less');
  }

  if (!manifest.purpose || manifest.purpose.trim() === '') {
    errors.push('Purpose is required');
  } else if (manifest.purpose.length > 500) {
    errors.push('Purpose must be 500 characters or less');
  }

  if (!manifest.tone) {
    errors.push('Tone is required');
  } else if (!['serious', 'friendly', 'playful', 'blunt'].includes(manifest.tone)) {
    errors.push('Tone must be one of: serious, friendly, playful, blunt');
  }

  // Optional fields with limits
  if (manifest.description && manifest.description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  if (manifest.rules) {
    if (manifest.rules.length > 20) {
      errors.push('Maximum 20 rules allowed');
    }
    manifest.rules.forEach((rule, index) => {
      if (rule && rule.length > 200) {
        errors.push(`Rule ${index + 1} must be 200 characters or less`);
      }
    });
  }

  if (manifest.outputStyle && manifest.outputStyle.length > 300) {
    errors.push('Output style must be 300 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates an agent ID from a name.
 * Converts to lowercase, replaces spaces with underscores, removes special chars.
 */
export function generateAgentId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

