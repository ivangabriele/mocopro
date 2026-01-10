import { afterEach, describe, expect, test } from 'bun:test'
import { rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { ClaudeCode } from '../ClaudeCode.js'

describe('ClaudeCode', () => {
  const claudeCode = new ClaudeCode()

  describe('name', () => {
    test('returns Claude Code', () => {
      expect(claudeCode.name).toBe('Claude Code')
    })
  })

  describe('getConfigPath', () => {
    test('returns global config path when scope is global', () => {
      const result = claudeCode.getConfigPath('global')

      expect(result).toBe(join(homedir(), '.claude.json'))
    })

    test('returns local config path when scope is local', () => {
      const result = claudeCode.getConfigPath('local')

      expect(result).toBe(join(process.cwd(), '.mcp.json'))
    })
  })

  describe('buildServerConfig', () => {
    test('builds config without environment variables', () => {
      const result = claudeCode.buildServerConfig('podman', 'mocopro/owner-repo', 'main', {})

      expect(result).toEqual({
        args: ['run', '--rm', '-i', 'mocopro/owner-repo:main'],
        command: 'podman',
        type: 'stdio',
      })
    })

    test('builds config with environment variables as container flags', () => {
      const result = claudeCode.buildServerConfig('docker', 'mocopro/owner-repo', 'v1.0.0', {
        API_KEY: 'secret123',
        DEBUG: 'true',
      })

      expect(result).toEqual({
        args: ['run', '--rm', '-i', '-e', 'API_KEY=secret123', '-e', 'DEBUG=true', 'mocopro/owner-repo:v1.0.0'],
        command: 'docker',
        type: 'stdio',
      })
    })
  })

  describe('addServer', () => {
    const testConfigPath = join(process.cwd(), '.mcp.json')

    afterEach(async () => {
      await rm(testConfigPath, { force: true })
    })

    test('adds server to empty config', async () => {
      const serverConfig = {
        args: ['run', '--rm', '-i', 'mocopro/test:main'],
        command: 'podman',
        type: 'stdio' as const,
      }

      await claudeCode.addServer('local', 'test-server', serverConfig)

      const content = await Bun.file(testConfigPath).text()
      const config = JSON.parse(content)
      expect(config.mcpServers['test-server']).toEqual(serverConfig)
    })

    test('adds server to existing config with other servers', async () => {
      const existingConfig = {
        mcpServers: {
          'existing-server': {
            args: ['run', '--rm', '-i', 'mocopro/existing:main'],
            command: 'docker',
            type: 'stdio',
          },
        },
      }
      await Bun.write(testConfigPath, JSON.stringify(existingConfig))

      const serverConfig = {
        args: ['run', '--rm', '-i', 'mocopro/test:main'],
        command: 'podman',
        type: 'stdio' as const,
      }

      await claudeCode.addServer('local', 'new-server', serverConfig)

      const content = await Bun.file(testConfigPath).text()
      const config = JSON.parse(content)
      expect(config.mcpServers['existing-server']).toBeDefined()
      expect(config.mcpServers['new-server']).toEqual(serverConfig)
    })
  })

  describe('removeServer', () => {
    const testConfigPath = join(process.cwd(), '.mcp.json')

    afterEach(async () => {
      await rm(testConfigPath, { force: true })
    })

    test('returns false when config does not exist', async () => {
      const result = await claudeCode.removeServer('local', 'nonexistent')

      expect(result).toBe(false)
    })

    test('returns false when server is not in config', async () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            args: ['run', '--rm', '-i', 'mocopro/other:main'],
            command: 'podman',
            type: 'stdio',
          },
        },
      }
      await Bun.write(testConfigPath, JSON.stringify(existingConfig))

      const result = await claudeCode.removeServer('local', 'nonexistent')

      expect(result).toBe(false)
    })

    test('removes server and returns true', async () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            args: ['run', '--rm', '-i', 'mocopro/other:main'],
            command: 'podman',
            type: 'stdio',
          },
          'test-server': {
            args: ['run', '--rm', '-i', 'mocopro/test:main'],
            command: 'podman',
            type: 'stdio',
          },
        },
      }
      await Bun.write(testConfigPath, JSON.stringify(existingConfig))

      const result = await claudeCode.removeServer('local', 'test-server')

      expect(result).toBe(true)
      const content = await Bun.file(testConfigPath).text()
      const config = JSON.parse(content)
      expect(config.mcpServers['test-server']).toBeUndefined()
      expect(config.mcpServers['other-server']).toBeDefined()
    })
  })

  describe('hasServer', () => {
    const testConfigPath = join(process.cwd(), '.mcp.json')

    afterEach(async () => {
      await rm(testConfigPath, { force: true })
    })

    test('returns false when config does not exist', async () => {
      const result = await claudeCode.hasServer('local', 'test-server')

      expect(result).toBe(false)
    })

    test('returns false when server is not in config', async () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            args: ['run', '--rm', '-i', 'mocopro/other:main'],
            command: 'podman',
            type: 'stdio',
          },
        },
      }
      await Bun.write(testConfigPath, JSON.stringify(existingConfig))

      const result = await claudeCode.hasServer('local', 'test-server')

      expect(result).toBe(false)
    })

    test('returns true when server is in config', async () => {
      const existingConfig = {
        mcpServers: {
          'test-server': {
            args: ['run', '--rm', '-i', 'mocopro/test:main'],
            command: 'podman',
            type: 'stdio',
          },
        },
      }
      await Bun.write(testConfigPath, JSON.stringify(existingConfig))

      const result = await claudeCode.hasServer('local', 'test-server')

      expect(result).toBe(true)
    })
  })
})
