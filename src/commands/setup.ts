import { detectContainerRuntime } from '../core/container.js'
import { getServer } from '../core/registry.js'
import { ClaudeIntegration } from '../integrations/index.js'
import type { SetupScope } from '../types/index.js'

export interface SetupOptions {
  global: boolean
}

function getScope(options: SetupOptions): SetupScope {
  return options.global ? 'global' : 'local'
}

const claudeIntegration = new ClaudeIntegration()

export async function setupClaudeAddCommand(serverName: string, options: SetupOptions): Promise<void> {
  const scope = getScope(options)
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const isAlreadyConfigured = await claudeIntegration.hasServer(scope, serverName)
  if (isAlreadyConfigured) {
    console.error(`Server "${serverName}" is already configured in ${claudeIntegration.name} (${scope} scope).`)
    process.exit(1)
  }

  const runtime = detectContainerRuntime()
  const serverConfig = claudeIntegration.buildServerConfig(
    runtime,
    server.imageName,
    server.imageTag,
    server.environmentVariables,
  )

  await claudeIntegration.addServer(scope, serverName, serverConfig)

  const configPath = claudeIntegration.getConfigPath(scope)
  console.log(`Server "${serverName}" has been added to ${claudeIntegration.name} configuration.`)
  console.log(`Configuration file: ${configPath}`)
}

export async function setupClaudeRemoveCommand(serverName: string, options: SetupOptions): Promise<void> {
  const scope = getScope(options)

  const wasRemoved = await claudeIntegration.removeServer(scope, serverName)

  if (!wasRemoved) {
    console.error(`Server "${serverName}" is not configured in ${claudeIntegration.name} (${scope} scope).`)
    process.exit(1)
  }

  const configPath = claudeIntegration.getConfigPath(scope)
  console.log(`Server "${serverName}" has been removed from ${claudeIntegration.name} configuration.`)
  console.log(`Configuration file: ${configPath}`)
}
