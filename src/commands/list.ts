import { B } from 'bhala'
import { getContainerStatus } from '../core/container.js'
import { listServers } from '../core/registry.js'

export async function listCommand(): Promise<void> {
  const servers = await listServers()

  if (servers.length === 0) {
    B.info('No MCP servers installed.')
    B.info('Use "mocopro install <repository>" to install a server.')

    return
  }

  B.log('Installed MCP servers:\n')

  for (const server of servers) {
    const containerStatus = await getContainerStatus(server.repository)
    const statusIndicator = containerStatus.isRunning ? '●' : '○'
    const statusText = containerStatus.isRunning ? 'running' : 'stopped'

    console.info(`${statusIndicator} ${server.name}`)
    console.info(`  Repository: ${server.owner}/${server.repository}`)
    console.info(`  Branch: ${server.branch}`)
    console.info(`  Image: ${server.imageName}:${server.imageTag}`)
    console.info(`  Status: ${statusText}`)
    console.info(`  Installed: ${formatDate(server.installedAt)}`)
    console.info(`  Updated: ${formatDate(server.updatedAt)}`)
    console.info('')
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)

  return date.toLocaleString()
}
