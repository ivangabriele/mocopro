import { buildImage } from '../core/image.js'
import { getServer, updateServer } from '../core/registry.js'
import { getRepositoryLocalPath } from '../libs/filesystem.js'
import { pullRepository } from '../libs/git.js'

export async function updateCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    console.error(`Server "${serverName}" is not installed.`)
    process.exit(1)
  }

  console.log(`Updating "${serverName}"...`)

  const repositoryLocalPath = getRepositoryLocalPath(server.owner, server.repository)

  console.log('Pulling latest changes...')
  await pullRepository(repositoryLocalPath)

  console.log('Rebuilding container image...')
  await buildImage(repositoryLocalPath, server.imageName, server.imageTag)

  await updateServer(serverName, {
    updatedAt: new Date().toISOString(),
  })

  console.log(`Successfully updated "${serverName}".`)
}
