import { B } from 'bhala'
import { buildImage } from '../core/image.js'
import { getServer, updateServer } from '../core/registry.js'
import { getRepositoryLocalPath } from '../libs/filesystem.js'
import { pullRepository } from '../libs/git.js'

export async function updateCommand(serverName: string): Promise<void> {
  const server = await getServer(serverName)

  if (!server) {
    B.error(`Server "${serverName}" is not installed.`)

    process.exit(1)
  }

  B.info(`Updating "${serverName}"...`)

  const repositoryLocalPath = getRepositoryLocalPath(server.owner, server.repository)

  B.info('Pulling latest changes...')
  await pullRepository(repositoryLocalPath)

  B.info('Rebuilding container image...')
  await buildImage(repositoryLocalPath, server.imageName, server.imageTag)

  await updateServer(serverName, {
    updatedAt: new Date().toISOString(),
  })

  B.success(`Successfully updated "${serverName}".`)
}
