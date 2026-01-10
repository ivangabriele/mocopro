import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

const CLI_PATH = join(import.meta.dir, '..', 'src', 'index.ts')
const TEST_SERVER_REPO = 'hellokaton/unsplash-mcp-server'
const TEST_SERVER_NAME = 'unsplash-mcp-server'
const LOCAL_MCP_CONFIG_PATH = join(process.cwd(), '.mcp.json')

interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

async function runCli(args: string[]): Promise<CommandResult> {
  const process = Bun.spawn(['bun', 'run', CLI_PATH, ...args], {
    stderr: 'pipe',
    stdout: 'pipe',
  })

  const stdout = await new Response(process.stdout).text()
  const stderr = await new Response(process.stderr).text()
  const exitCode = await process.exited

  return { exitCode, stderr, stdout }
}

async function cleanupTestServer(): Promise<void> {
  await runCli(['uninstall', TEST_SERVER_NAME])
}

async function cleanupLocalMcpConfig(): Promise<void> {
  await rm(LOCAL_MCP_CONFIG_PATH, { force: true })
}

describe('mocopro CLI', () => {
  beforeAll(async () => {
    await cleanupTestServer()
  })

  afterAll(async () => {
    await cleanupTestServer()
    await cleanupLocalMcpConfig()
  })

  describe('--help', () => {
    test('displays help information', async () => {
      const result = await runCli(['--help'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Usage: mocopro')
      expect(result.stdout).toContain('install')
      expect(result.stdout).toContain('uninstall')
      expect(result.stdout).toContain('list')
      expect(result.stdout).toContain('start')
      expect(result.stdout).toContain('stop')
      expect(result.stdout).toContain('env')
      expect(result.stdout).toContain('setup')
    })
  })

  describe('--version', () => {
    test('displays version', async () => {
      const result = await runCli(['--version'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
    })
  })

  describe('list (empty)', () => {
    test('shows no servers when none installed', async () => {
      const result = await runCli(['list'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No MCP servers installed')
    })
  })

  describe('install', () => {
    test('installs server from short format repository', async () => {
      const result = await runCli(['install', TEST_SERVER_REPO])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Installing MCP server')
      expect(result.stdout).toContain('Successfully installed')
    }, 300000)

    test('fails when server already installed', async () => {
      const result = await runCli(['install', TEST_SERVER_REPO])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('already installed')
    })

    test('fails with invalid repository format', async () => {
      const result = await runCli(['install', 'invalid'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid repository format')
    })
  })

  describe('list (with server)', () => {
    test('shows installed server', async () => {
      const result = await runCli(['list'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain(TEST_SERVER_NAME)
      expect(result.stdout).toContain('drumnation')
      expect(result.stdout).toContain('stopped')
    })
  })

  describe('env', () => {
    test('list shows no environment variables initially', async () => {
      const result = await runCli(['env', 'list', TEST_SERVER_NAME])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No environment variables set')
    })

    test('set adds environment variables', async () => {
      const result = await runCli(['env', 'set', TEST_SERVER_NAME, 'TEST_KEY=test_value', 'ANOTHER_KEY=another_value'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Environment variables updated')
    })

    test('list shows set environment variables', async () => {
      const result = await runCli(['env', 'list', TEST_SERVER_NAME])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('TEST_KEY=test_value')
      expect(result.stdout).toContain('ANOTHER_KEY=another_value')
    })

    test('unset removes environment variables', async () => {
      const result = await runCli(['env', 'unset', TEST_SERVER_NAME, 'TEST_KEY'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Environment variables updated')
    })

    test('list shows remaining environment variables after unset', async () => {
      const result = await runCli(['env', 'list', TEST_SERVER_NAME])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).not.toContain('TEST_KEY')
      expect(result.stdout).toContain('ANOTHER_KEY=another_value')
    })

    test('fails for non-existent server', async () => {
      const result = await runCli(['env', 'list', 'non-existent-server'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not installed')
    })

    test('set fails with invalid format', async () => {
      const result = await runCli(['env', 'set', TEST_SERVER_NAME, 'INVALID_FORMAT'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid format')
    })
  })

  describe('setup', () => {
    describe('claude', () => {
      test('help shows add and remove subcommands', async () => {
        const result = await runCli(['setup', 'claude', '--help'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('add')
        expect(result.stdout).toContain('remove')
      })

      test('add fails for non-existent server', async () => {
        const result = await runCli(['setup', 'claude', 'add', 'non-existent-server'])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('not installed')
      })

      test('add adds server to local Claude Code configuration', async () => {
        const result = await runCli(['setup', 'claude', 'add', TEST_SERVER_NAME])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('has been added to Claude Code configuration')
        expect(result.stdout).toContain('.mcp.json')

        const configContent = await Bun.file(LOCAL_MCP_CONFIG_PATH).text()
        const config = JSON.parse(configContent)
        expect(config.mcpServers[TEST_SERVER_NAME]).toBeDefined()
        expect(config.mcpServers[TEST_SERVER_NAME].type).toBe('stdio')
        expect(config.mcpServers[TEST_SERVER_NAME].command).toMatch(/podman|docker/)
      })

      test('add fails when server already configured', async () => {
        const result = await runCli(['setup', 'claude', 'add', TEST_SERVER_NAME])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('already configured')
      })

      test('remove removes server from local Claude Code configuration', async () => {
        const result = await runCli(['setup', 'claude', 'remove', TEST_SERVER_NAME])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('has been removed from Claude Code configuration')
        expect(result.stdout).toContain('.mcp.json')

        const configContent = await Bun.file(LOCAL_MCP_CONFIG_PATH).text()
        const config = JSON.parse(configContent)
        expect(config.mcpServers[TEST_SERVER_NAME]).toBeUndefined()
      })

      test('remove fails when server not configured', async () => {
        const result = await runCli(['setup', 'claude', 'remove', TEST_SERVER_NAME])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('not configured')
      })

      test('remove fails for non-existent server', async () => {
        const result = await runCli(['setup', 'claude', 'remove', 'non-existent-server'])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('not configured')
      })
    })
  })

  describe('start', () => {
    test('starts server in detached mode', async () => {
      const result = await runCli(['start', TEST_SERVER_NAME, '--detach'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Starting')
      expect(result.stdout).toContain('running in the background')
    })

    test('fails when server already running', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const result = await runCli(['start', TEST_SERVER_NAME, '--detach'])

      if (result.exitCode === 1) {
        expect(result.stderr).toContain('already running')
      }
    })

    test('fails for non-existent server', async () => {
      const result = await runCli(['start', 'non-existent-server'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not installed')
    })
  })

  describe('stop', () => {
    test('stops running server', async () => {
      const result = await runCli(['stop', TEST_SERVER_NAME])

      if (result.exitCode === 0) {
        expect(result.stdout).toContain('stopped')
      }
    })

    test('fails for non-existent server', async () => {
      const result = await runCli(['stop', 'non-existent-server'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not installed')
    })
  })

  describe('update', () => {
    test('updates installed server', async () => {
      const result = await runCli(['update', TEST_SERVER_NAME])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Updating')
      expect(result.stdout).toContain('Successfully updated')
    }, 300000)

    test('fails for non-existent server', async () => {
      const result = await runCli(['update', 'non-existent-server'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not installed')
    })
  })

  describe('uninstall', () => {
    test('uninstalls server', async () => {
      const result = await runCli(['uninstall', TEST_SERVER_NAME])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Uninstalling')
      expect(result.stdout).toContain('Successfully uninstalled')
    })

    test('list shows no servers after uninstall', async () => {
      const result = await runCli(['list'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No MCP servers installed')
    })

    test('fails for non-existent server', async () => {
      const result = await runCli(['uninstall', 'non-existent-server'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not installed')
    })
  })
})
