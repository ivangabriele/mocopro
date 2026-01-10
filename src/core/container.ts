import { spawn, spawnSync } from 'node:child_process'
import { buildContainerName } from '../libs/parser.js'
import type { ContainerStatus, DetectedRuntime, EnvironmentVariables } from '../types/index.js'

let cachedRuntime: DetectedRuntime | undefined

export function detectContainerRuntime(): DetectedRuntime {
  if (cachedRuntime) {
    return cachedRuntime
  }

  const podmanResult = spawnSync('podman', ['--version'], { stdio: 'ignore' })
  if (podmanResult.status === 0) {
    cachedRuntime = 'podman'
    return 'podman'
  }

  const dockerResult = spawnSync('docker', ['--version'], { stdio: 'ignore' })
  if (dockerResult.status === 0) {
    cachedRuntime = 'docker'
    return 'docker'
  }

  throw new Error('No container runtime found. Please install Podman or Docker.')
}

export async function getContainerStatus(repository: string): Promise<ContainerStatus> {
  const runtime = detectContainerRuntime()
  const containerName = buildContainerName(repository)

  return new Promise(resolve => {
    const process = spawn(runtime, ['ps', '-a', '--filter', `name=${containerName}`, '--format', '{{.ID}} {{.State}}'])

    let output = ''
    process.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })

    process.on('close', () => {
      const trimmedOutput = output.trim()
      if (!trimmedOutput) {
        resolve({ containerId: undefined, containerName: undefined, isRunning: false })
        return
      }

      const [containerId, state] = trimmedOutput.split(' ')
      resolve({
        containerId,
        containerName,
        isRunning: state === 'running',
      })
    })
  })
}

export async function startContainer(
  imageName: string,
  imageTag: string,
  repository: string,
  detach: boolean,
  environmentVariables: EnvironmentVariables,
): Promise<void> {
  const runtime = detectContainerRuntime()
  const containerName = buildContainerName(repository)
  const fullImageName = `${imageName}:${imageTag}`

  const existingStatus = await getContainerStatus(repository)
  if (existingStatus.containerId) {
    await removeContainer(repository)
  }

  const args = ['run', '--name', containerName]

  for (const [key, value] of Object.entries(environmentVariables)) {
    args.push('-e', `${key}=${value}`)
  }

  if (detach) {
    args.push('-d')
  } else {
    args.push('-i')
  }

  args.push(fullImageName)

  return new Promise((resolve, reject) => {
    const process = spawn(runtime, args, {
      stdio: detach ? 'ignore' : 'inherit',
    })

    if (detach) {
      process.on('close', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Container failed to start with exit code ${code}`))
        }
      })
    } else {
      process.on('close', () => {
        resolve()
      })
    }

    process.on('error', reject)
  })
}

export async function stopContainer(repository: string): Promise<void> {
  const runtime = detectContainerRuntime()
  const containerName = buildContainerName(repository)

  return new Promise((resolve, reject) => {
    const process = spawn(runtime, ['stop', containerName], { stdio: 'inherit' })

    process.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to stop container with exit code ${code}`))
      }
    })

    process.on('error', reject)
  })
}

export async function removeContainer(repository: string): Promise<void> {
  const runtime = detectContainerRuntime()
  const containerName = buildContainerName(repository)

  return new Promise((resolve, reject) => {
    const process = spawn(runtime, ['rm', '-f', containerName], { stdio: 'ignore' })

    process.on('close', () => {
      resolve()
    })

    process.on('error', reject)
  })
}
