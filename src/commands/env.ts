import { getServer, updateServer } from '../core/registry.js'
import type { EnvironmentVariables } from '../types/index.js'

export async function envListCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const envVars = server.environmentVariables
  const envVarEntries = Object.entries(envVars)

  if (envVarEntries.length === 0) {
    console.log(`No environment variables set for "${serverName}".`)
    console.log(`Use "mocopro env set ${serverName} KEY=value" to add one.`)
    return
  }

  console.log(`Environment variables for "${serverName}":\n`)
  for (const [key, value] of envVarEntries) {
    console.log(`  ${key}=${value}`)
  }
}

export async function envSetCommand(serverName: string, keyValuePairs: string[]): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const newEnvironmentVariables: EnvironmentVariables = { ...server.environmentVariables }

  for (const pair of keyValuePairs) {
    const equalsIndex = pair.indexOf('=')
    if (equalsIndex === -1) {
      console.error(`Invalid format: "${pair}". Expected KEY=value.`)
      process.exit(1)
    }

    const key = pair.slice(0, equalsIndex)
    const value = pair.slice(equalsIndex + 1)

    if (!key) {
      console.error(`Invalid format: "${pair}". Key cannot be empty.`)
      process.exit(1)
    }

    newEnvironmentVariables[key] = value
  }

  await updateServer(serverName, {
    environmentVariables: newEnvironmentVariables,
    updatedAt: new Date().toISOString(),
  })

  console.log(`Environment variables updated for "${serverName}".`)
}

export async function envUnsetCommand(serverName: string, keys: string[]): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const newEnvironmentVariables: EnvironmentVariables = { ...server.environmentVariables }

  for (const key of keys) {
    if (!(key in newEnvironmentVariables)) {
      console.warn(`Warning: "${key}" is not set for "${serverName}".`)
      continue
    }

    delete newEnvironmentVariables[key]
  }

  await updateServer(serverName, {
    environmentVariables: newEnvironmentVariables,
    updatedAt: new Date().toISOString(),
  })

  console.log(`Environment variables updated for "${serverName}".`)
}
