import { B } from 'bhala'
import { getContainerStatus, startContainer } from '../core/container.js'
import { getServer } from '../core/registry.js'

export interface StartOptions {
  detach: boolean
}

export async function startCommand(serverName: string, options: StartOptions): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const containerStatus = await getContainerStatus(server.repository)

  if (containerStatus.isRunning) {
    B.error(`Server "${serverName}" is already running.`)
    process.exit(1)
  }

  const mode = options.detach ? 'detached' : 'foreground'
  B.info(`Starting "${serverName}" in ${mode} mode...`)

  await startContainer(
    server.imageName,
    server.imageTag,
    server.repository,
    options.detach,
    server.environmentVariables,
  )

  if (options.detach) {
    B.success(`Server "${serverName}" is now running in the background.`)
    B.info(`Use "mocopro stop ${serverName}" to stop it.`)
  }
}
