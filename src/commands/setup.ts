import { B } from 'bhala'
import { detectContainerRuntime } from '../core/container.js'
import { getServer } from '../core/registry.js'
import { ClaudeCode } from '../integrations/index.js'
import type { SetupScope } from '../types/index.js'

export interface SetupOptions {
  global: boolean
}

function getScope(options: SetupOptions): SetupScope {
  return options.global ? 'global' : 'local'
}

const claudeCode = new ClaudeCode()

export async function setupClaudeAddCommand(serverName: string, options: SetupOptions): Promise<void> {
  const scope = getScope(options)
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)

    process.exit(1)
  }

  const isAlreadyConfigured = await claudeCode.hasServer(scope, serverName)
  if (isAlreadyConfigured) {
    B.error(`Server "${serverName}" is already configured in ${claudeCode.name} (${scope} scope).`)

    process.exit(1)
  }

  const runtime = detectContainerRuntime()
  const serverConfig = claudeCode.buildServerConfig(
    runtime,
    server.imageName,
    server.imageTag,
    server.environmentVariables,
  )

  await claudeCode.addServer(scope, serverName, serverConfig)

  const configPath = claudeCode.getConfigPath(scope)
  B.success(`Server "${serverName}" has been added to ${claudeCode.name} configuration.`)
  B.info(`Configuration file: ${configPath}`)
}

export async function setupClaudeRemoveCommand(serverName: string, options: SetupOptions): Promise<void> {
  const scope = getScope(options)

  const wasRemoved = await claudeCode.removeServer(scope, serverName)

  if (!wasRemoved) {
    B.error(`Server "${serverName}" is not configured in ${claudeCode.name} (${scope} scope).`)

    process.exit(1)
  }

  const configPath = claudeCode.getConfigPath(scope)
  B.success(`Server "${serverName}" has been removed from ${claudeCode.name} configuration.`)
  B.info(`Configuration file: ${configPath}`)
}
