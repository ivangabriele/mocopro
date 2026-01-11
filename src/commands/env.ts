import { B } from 'bhala'
import { getServer, updateServer } from '../core/registry.js'
import type { EnvironmentVariables } from '../types/index.js'

export async function envListCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)

    process.exit(1)
  }

  const envVars = server.environmentVariables
  const envVarEntries = Object.entries(envVars)

  if (envVarEntries.length === 0) {
    B.info(`No environment variables set for "${serverName}".`)
    B.info(`Use "mocopro env set ${serverName} KEY=value" to add one.`)

    return
  }

  B.info(`Environment variables for "${serverName}":\n`)
  for (const [key, value] of envVarEntries) {
    B.info(`  ${key}=${value}`)
  }
}

export async function envSetCommand(serverName: string, keyValuePairs: string[]): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)

    process.exit(1)
  }

  const newEnvironmentVariables: EnvironmentVariables = { ...server.environmentVariables }

  for (const pair of keyValuePairs) {
    const equalsIndex = pair.indexOf('=')
    if (equalsIndex === -1) {
      B.error(`Invalid format: "${pair}". Expected KEY=value.`)

      process.exit(1)
    }

    const key = pair.slice(0, equalsIndex)
    const value = pair.slice(equalsIndex + 1)

    if (!key) {
      B.error(`Invalid format: "${pair}". Key cannot be empty.`)

      process.exit(1)
    }

    newEnvironmentVariables[key] = value
  }

  await updateServer(serverName, {
    environmentVariables: newEnvironmentVariables,
    updatedAt: new Date().toISOString(),
  })

  B.success(`Environment variables updated for "${serverName}".`)
}

export async function envUnsetCommand(serverName: string, keys: string[]): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)

    process.exit(1)
  }

  const newEnvironmentVariables: EnvironmentVariables = { ...server.environmentVariables }

  for (const key of keys) {
    if (!(key in newEnvironmentVariables)) {
      B.warn(`"${key}" is not set for "${serverName}".`)

      continue
    }

    delete newEnvironmentVariables[key]
  }

  await updateServer(serverName, {
    environmentVariables: newEnvironmentVariables,
    updatedAt: new Date().toISOString(),
  })

  B.success(`Environment variables updated for "${serverName}".`)
}
