import { ClaudeIntegration } from './ClaudeIntegration.js'
import type { McpClientIntegration } from './types.js'

export { ClaudeIntegration } from './ClaudeIntegration.js'
export type { McpClientIntegration, McpServerConfig } from './types.js'

const integrations: Record<string, McpClientIntegration> = {
  claude: new ClaudeIntegration(),
}

export function getIntegration(name: string): McpClientIntegration | undefined {
  return integrations[name]
}

export function getAvailableIntegrations(): string[] {
  return Object.keys(integrations)
}
