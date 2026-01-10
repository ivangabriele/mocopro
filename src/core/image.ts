import { spawn } from 'node:child_process'
import { access, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateDockerfileFromSmithery, readSmitheryConfig } from '../libs/smithery.js'
import { detectContainerRuntime } from './container.js'

const DOCKERFILE_NAME = 'Dockerfile'

export async function buildImage(repositoryPath: string, imageName: string, imageTag: string): Promise<void> {
  await ensureDockerfileExists(repositoryPath)

  const runtime = detectContainerRuntime()
  const fullImageName = `${imageName}:${imageTag}`

  return new Promise((resolve, reject) => {
    const process = spawn(runtime, ['build', '-t', fullImageName, repositoryPath], {
      stdio: 'inherit',
    })

    process.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Image build failed with exit code ${code}`))
      }
    })

    process.on('error', reject)
  })
}

export async function removeImage(imageName: string, imageTag: string): Promise<void> {
  const runtime = detectContainerRuntime()
  const fullImageName = `${imageName}:${imageTag}`

  return new Promise((resolve, reject) => {
    const process = spawn(runtime, ['rmi', '-f', fullImageName], { stdio: 'inherit' })

    process.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Image removal failed with exit code ${code}`))
      }
    })

    process.on('error', reject)
  })
}

export async function imageExists(imageName: string, imageTag: string): Promise<boolean> {
  const runtime = detectContainerRuntime()
  const fullImageName = `${imageName}:${imageTag}`

  return new Promise(resolve => {
    const process = spawn(runtime, ['image', 'inspect', fullImageName], { stdio: 'ignore' })

    process.on('close', code => {
      resolve(code === 0)
    })
  })
}

async function ensureDockerfileExists(repositoryPath: string): Promise<void> {
  const dockerfilePath = join(repositoryPath, DOCKERFILE_NAME)

  const hasDockerfile = await fileExists(dockerfilePath)
  if (hasDockerfile) {
    return
  }

  const smitheryConfig = await readSmitheryConfig(repositoryPath)
  if (!smitheryConfig) {
    throw new Error(`No Dockerfile or smithery.yaml found in repository at ${repositoryPath}`)
  }

  const generatedDockerfile = generateDockerfileFromSmithery(smitheryConfig)
  await writeFile(dockerfilePath, generatedDockerfile, 'utf-8')
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}
