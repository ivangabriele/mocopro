import { getContainerStatus } from '../core/container.js'
import { listServers } from '../core/registry.js'

export async function listCommand(): Promise<void> {
  const servers = await listServers()

  if (servers.length === 0) {
    console.log('No MCP servers installed.')
    console.log('Use "mocopro install <repository>" to install a server.')
    return
  }

  console.log('Installed MCP servers:\n')

  for (const server of servers) {
    const containerStatus = await getContainerStatus(server.repository)
    const statusIndicator = containerStatus.isRunning ? '●' : '○'
    const statusText = containerStatus.isRunning ? 'running' : 'stopped'

    console.log(`${statusIndicator} ${server.name}`)
    console.log(`  Repository: ${server.owner}/${server.repository}`)
    console.log(`  Branch: ${server.branch}`)
    console.log(`  Image: ${server.imageName}:${server.imageTag}`)
    console.log(`  Status: ${statusText}`)
    console.log(`  Installed: ${formatDate(server.installedAt)}`)
    console.log(`  Updated: ${formatDate(server.updatedAt)}`)
    console.log('')
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleString()
}
