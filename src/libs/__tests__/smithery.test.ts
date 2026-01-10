import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { SmitheryConfig } from '../../types/index.js'
import { generateDockerfileFromSmithery, readSmitheryConfig } from '../smithery.js'

describe('readSmitheryConfig', () => {
  const testDirectoryPath = join(tmpdir(), 'mocopro-test-smithery')

  afterEach(async () => {
    await rm(testDirectoryPath, { force: true, recursive: true })
  })

  test('reads and parses smithery.yaml file', async () => {
    await mkdir(testDirectoryPath, { recursive: true })
    const smitheryContent = `startCommand:
  type: stdio
  commandFunction: |
    (config) => ({
      command: 'node',
      args: ['dist/index.js'],
      env: {}
    })
`
    await Bun.write(join(testDirectoryPath, 'smithery.yaml'), smitheryContent)

    const result = await readSmitheryConfig(testDirectoryPath)

    expect(result).toBeDefined()
    expect(result?.startCommand.type).toBe('stdio')
    expect(result?.startCommand.commandFunction).toContain("command: 'node'")
  })

  test('returns undefined when smithery.yaml does not exist', async () => {
    await mkdir(testDirectoryPath, { recursive: true })

    const result = await readSmitheryConfig(testDirectoryPath)

    expect(result).toBeUndefined()
  })

  test('returns undefined for non-existent directory', async () => {
    const result = await readSmitheryConfig('/non/existent/path')

    expect(result).toBeUndefined()
  })
})

describe('generateDockerfileFromSmithery', () => {
  test('generates Dockerfile with node command', () => {
    const smitheryConfig: SmitheryConfig = {
      startCommand: {
        commandFunction: `(config) => ({
					command: 'node',
					args: ['dist/index.js'],
					env: {}
				})`,
        type: 'stdio',
      },
    }

    const result = generateDockerfileFromSmithery(smitheryConfig)

    expect(result).toContain('FROM node:20-alpine')
    expect(result).toContain('WORKDIR /app')
    expect(result).toContain('COPY package*.json ./')
    expect(result).toContain('RUN npm ci --only=production')
    expect(result).toContain('COPY . .')
    expect(result).toContain('CMD ["node", "dist/index.js"]')
  })

  test('generates Dockerfile with custom command and args', () => {
    const smitheryConfig: SmitheryConfig = {
      startCommand: {
        commandFunction: `(config) => ({
					command: 'python',
					args: ['main.py', '--serve'],
					env: {}
				})`,
        type: 'stdio',
      },
    }

    const result = generateDockerfileFromSmithery(smitheryConfig)

    expect(result).toContain('CMD ["python", "main.py", "--serve"]')
  })

  test('defaults to node when command is not specified', () => {
    const smitheryConfig: SmitheryConfig = {
      startCommand: {
        commandFunction: `(config) => ({
					args: ['server.js'],
					env: {}
				})`,
        type: 'stdio',
      },
    }

    const result = generateDockerfileFromSmithery(smitheryConfig)

    expect(result).toContain('CMD ["node", "server.js"]')
  })
})
