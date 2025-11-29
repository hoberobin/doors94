/**
 * Environment variable validation
 * Validates required environment variables and provides clear error messages
 */

export function validateEnv(): { valid: boolean; error?: string } {
  if (typeof window !== 'undefined') {
    // Client-side: environment variables are not available
    // This validation is primarily for server-side
    return { valid: true }
  }

  // Server-side validation
  if (!process.env.OPENAI_API_KEY) {
    return {
      valid: false,
      error: 'OPENAI_API_KEY is not configured. Please add it to your .env.local file.',
    }
  }

  return { valid: true }
}


