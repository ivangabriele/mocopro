import { rm } from 'node:fs/promises'
import { removeContainer } from '../core/container.js'
import { removeImage } from '../core/image.js'
import { getServer, removeServer } from '../core/registry.js'
import { getRepositoryLocalPath } from '../libs/filesystem.js'

export async function uninstallCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  console.log(`Uninstalling "${serverName}"...`)

  try {
    console.log('Stopping and removing container...')
    await removeContainer(server.repository)
  } catch {
    // Container might not exist, continue
  }

  try {
    console.log('Removing container image...')
    await removeImage(server.imageName, server.imageTag)
  } catch {
    // Image might not exist, continue
  }

  const repositoryLocalPath = getRepositoryLocalPath(server.owner, server.repository)
  console.log('Removing local repository...')
  await rm(repositoryLocalPath, { force: true, recursive: true })

  await removeServer(serverName)

  console.log(`Successfully uninstalled "${serverName}".`)
}
