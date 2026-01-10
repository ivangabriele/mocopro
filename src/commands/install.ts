import { rm } from 'node:fs/promises'
import { buildImage } from '../core/image.js'
import { addServer, serverExists } from '../core/registry.js'
import { getRepositoryLocalPath } from '../libs/filesystem.js'
import { cloneRepository, getDefaultBranch } from '../libs/git.js'
import { buildImageName, parseRepositoryInput } from '../libs/parser.js'
import type { ServerRegistryEntry } from '../types/index.js'

export async function installCommand(repositoryInput: string): Promise<void> {
  const parsedRepository = parseRepositoryInput(repositoryInput)
  const { owner, repository, fullUrl } = parsedRepository

  const alreadyInstalled = await serverExists(repository)
  if (alreadyInstalled) {
    console.error(`Server "${repository}" is already installed. Use "mocopro update ${repository}" to update it.`)
    process.exit(1)
  }

  console.log(`Installing MCP server from ${owner}/${repository}...`)

  const repositoryLocalPath = getRepositoryLocalPath(owner, repository)

  try {
    console.log('Cloning repository...')
    await cloneRepository(fullUrl, repositoryLocalPath, parsedRepository.branch)

    const branch = parsedRepository.branch ?? (await getDefaultBranch(repositoryLocalPath))
    const imageName = buildImageName(owner, repository)
    const imageTag = branch

    console.log('Building container image...')
    await buildImage(repositoryLocalPath, imageName, imageTag)

    const serverEntry: ServerRegistryEntry = {
      branch,
      environmentVariables: {},
      imageName,
      imageTag,
      installedAt: new Date().toISOString(),
      name: repository,
      owner,
      repository,
      updatedAt: new Date().toISOString(),
    }

    await addServer(serverEntry)

    console.log(`Successfully installed "${repository}".`)
    console.log(`Run "mocopro start ${repository}" to start the server.`)
  } catch (error) {
    await rm(repositoryLocalPath, { force: true, recursive: true })
    throw error
  }
}
