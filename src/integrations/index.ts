import { ClaudeCode } from './ClaudeCode.js'
import type { McpClientIntegration } from './types.js'

export { ClaudeCode } from './ClaudeCode.js'
export type { McpClientIntegration, McpServerConfig } from './types.js'

const integrations: Record<string, McpClientIntegration> = {
  claude: new ClaudeCode(),
}

export function getIntegration(name: string): McpClientIntegration | undefined {
  return integrations[name]
}

export function getAvailableIntegrations(): string[] {
  return Object.keys(integrations)
}
