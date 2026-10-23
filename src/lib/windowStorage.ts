export interface WindowState {
  id: string
  title: string
  appId: string
  agentId?: string
  minimized: boolean
  maximized?: boolean
  x: number
  y: number
  width: number
  height: number
}

const STORAGE_KEY = 'DOORS94_WINDOWS'
const WELCOMED_KEY = 'DOORS94_WELCOMED'
const BOOTED_KEY = 'DOORS94_BOOTED'

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

/** True the first time this browser opens the desktop; sticky afterwards. */
export function consumeFirstRun(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(WELCOMED_KEY)) return false
    localStorage.setItem(WELCOMED_KEY, '1')
    return true
  } catch {
    return false
  }
}

/** True once per browser tab session, so the boot screen plays on arrival but not on every reload. */
export function consumeBootScreen(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (sessionStorage.getItem(BOOTED_KEY)) return false
    sessionStorage.setItem(BOOTED_KEY, '1')
    return true
  } catch {
    return false
  }
}
