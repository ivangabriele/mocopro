#!/usr/bin/env node

import { program } from 'commander'
import { envListCommand, envSetCommand, envUnsetCommand } from './commands/env.js'
import { installCommand } from './commands/install.js'
import { listCommand } from './commands/list.js'
import { setupClaudeAddCommand, setupClaudeRemoveCommand } from './commands/setup.js'
import { startCommand } from './commands/start.js'
import { stopCommand } from './commands/stop.js'
import { uninstallCommand } from './commands/uninstall.js'
import { updateCommand } from './commands/update.js'

program.name('mocopro').description('CLI tool to manage MCP servers locally').version('0.1.0')

program
  .command('install')
  .description('Install an MCP server from a GitHub repository')
  .argument('<repository>', 'GitHub repository (owner/repo or full URL)')
  .action(async (repository: string) => {
    try {
      await installCommand(repository)
    } catch (error) {
      console.error('Installation failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('uninstall')
  .description('Uninstall an MCP server')
  .argument('<server>', 'Name of the server to uninstall')
  .action(async (server: string) => {
    try {
      await uninstallCommand(server)
    } catch (error) {
      console.error('Uninstallation failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('update')
  .description('Update an installed MCP server')
  .argument('<server>', 'Name of the server to update')
  .action(async (server: string) => {
    try {
      await updateCommand(server)
    } catch (error) {
      console.error('Update failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('List all installed MCP servers')
  .action(async () => {
    try {
      await listCommand()
    } catch (error) {
      console.error('Failed to list servers:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('start')
  .description('Start an MCP server')
  .argument('<server>', 'Name of the server to start')
  .option('-d, --detach', 'Run the server in the background', false)
  .action(async (server: string, options: { detach: boolean }) => {
    try {
      await startCommand(server, { detach: options.detach })
    } catch (error) {
      console.error('Failed to start server:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('stop')
  .description('Stop a running MCP server')
  .argument('<server>', 'Name of the server to stop')
  .action(async (server: string) => {
    try {
      await stopCommand(server)
    } catch (error) {
      console.error('Failed to stop server:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

const envCommand = program.command('env').description('Manage environment variables for MCP servers')

envCommand
  .command('list')
  .description('List environment variables for a server')
  .argument('<server>', 'Name of the server')
  .action(async (server: string) => {
    try {
      await envListCommand(server)
    } catch (error) {
      console.error('Failed to list environment variables:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

envCommand
  .command('set')
  .description('Set environment variables for a server')
  .argument('<server>', 'Name of the server')
  .argument('<pairs...>', 'Environment variables in KEY=value format')
  .action(async (server: string, pairs: string[]) => {
    try {
      await envSetCommand(server, pairs)
    } catch (error) {
      console.error('Failed to set environment variables:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

envCommand
  .command('unset')
  .description('Unset environment variables for a server')
  .argument('<server>', 'Name of the server')
  .argument('<keys...>', 'Environment variable names to unset')
  .action(async (server: string, keys: string[]) => {
    try {
      await envUnsetCommand(server, keys)
    } catch (error) {
      console.error('Failed to unset environment variables:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

const setupCommand = program.command('setup').description('Configure MCP servers for AI agent CLIs and IDEs')

const setupClaudeCommand = setupCommand.command('claude').description('Configure MCP servers for Claude CLI')

setupClaudeCommand
  .command('add')
  .description('Add an MCP server to Claude CLI configuration')
  .argument('<server>', 'Name of the server to add')
  .option('-g, --global', 'Add to global configuration instead of local', false)
  .action(async (server: string, options: { global: boolean }) => {
    try {
      await setupClaudeAddCommand(server, { global: options.global })
    } catch (error) {
      console.error('Failed to add server to Claude CLI:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

setupClaudeCommand
  .command('remove')
  .description('Remove an MCP server from Claude CLI configuration')
  .argument('<server>', 'Name of the server to remove')
  .option('-g, --global', 'Remove from global configuration instead of local', false)
  .action(async (server: string, options: { global: boolean }) => {
    try {
      await setupClaudeRemoveCommand(server, { global: options.global })
    } catch (error) {
      console.error('Failed to remove server from Claude CLI:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()
