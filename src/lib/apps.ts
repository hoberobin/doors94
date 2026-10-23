export interface AppDefinition {
  id: string
  label: string
  icon: string
  hint: string
  width: number
  height: number
}

/**
 * The non-agent programs on the desktop and in the Start menu.
 * The window id for an app equals its app id, so each opens at most once.
 */
export const APPS: AppDefinition[] = [
  { id: 'agent_lab', label: 'Agent Creator', icon: '🤖', hint: 'Build a new agent step by step', width: 600, height: 520 },
  { id: 'playground', label: 'Playground', icon: '🛝', hint: 'Compare an agent with raw GPT side by side', width: 820, height: 600 },
  { id: 'manage_agents', label: 'Manage Agents', icon: '⚙️', hint: 'Edit, remix, or delete your agents', width: 640, height: 520 },
  { id: 'readme', label: 'Read Me', icon: '📄', hint: 'How doors94 works', width: 560, height: 520 },
  { id: 'welcome', label: 'Welcome', icon: '👋', hint: 'The first-run welcome screen', width: 460, height: 380 },
]

export function getApp(appId: string): AppDefinition | undefined {
  return APPS.find((app) => app.id === appId)
}
