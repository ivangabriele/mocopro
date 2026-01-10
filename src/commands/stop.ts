import { getContainerStatus, stopContainer } from '../core/container.js'
import { getServer } from '../core/registry.js'

export async function stopCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  const containerStatus = await getContainerStatus(server.repository)

  if (!containerStatus.isRunning) {
    console.error(`Server "${serverName}" is not running.`)
    process.exit(1)
  }

  console.log(`Stopping "${serverName}"...`)

  await stopContainer(server.repository)

  console.log(`Server "${serverName}" has been stopped.`)
}
