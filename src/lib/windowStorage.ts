export interface WindowState {
  id: string
  title: string
  appId: string
  agentId?: string
  minimized: boolean
  x: number
  y: number
  width: number
  height: number
}

const STORAGE_KEY = 'DOORS94_WINDOWS'

/**
 * Saves window states to localStorage
 */
export function saveWindowStates(windows: WindowState[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windows))
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Cannot save window states.')
    }
  }
}

/**
 * Loads window states from localStorage
 */
export function loadWindowStates(): WindowState[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
  } catch (error) {
    console.error('Error loading window states:', error)
    return []
  }
}

/**
 * Clears saved window states
 */
export function clearWindowStates(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing window states:', error)
  }
}


