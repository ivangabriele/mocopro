import { homedir } from 'node:os'
import { join } from 'node:path'
import { readJsonFile, writeJsonFile } from '../libs/filesystem.js'
import type { ClaudeGlobalConfig, ClaudeLocalConfig, EnvironmentVariables, SetupScope } from '../types/index.js'
import type { McpClientIntegration, McpServerConfig } from './types.js'

const CLAUDE_GLOBAL_CONFIG_FILENAME = '.claude.json'
const CLAUDE_LOCAL_CONFIG_FILENAME = '.mcp.json'

export class ClaudeIntegration implements McpClientIntegration {
  readonly name = 'Claude CLI'

  getConfigPath(scope: SetupScope): string {
    if (scope === 'global') {
      return join(homedir(), CLAUDE_GLOBAL_CONFIG_FILENAME)
    }

    return join(process.cwd(), CLAUDE_LOCAL_CONFIG_FILENAME)
  }

  buildServerConfig(
    runtime: string,
    imageName: string,
    imageTag: string,
    environmentVariables: EnvironmentVariables,
  ): McpServerConfig {
    const config: McpServerConfig = {
      args: ['run', '--rm', '-i', `${imageName}:${imageTag}`],
      command: runtime,
      type: 'stdio',
    }

    const envVarEntries = Object.entries(environmentVariables)
    if (envVarEntries.length > 0) {
      config.env = {}
      for (const [key, value] of envVarEntries) {
        config.env[key] = value
      }
    }

    return config
  }

  async addServer(scope: SetupScope, serverName: string, serverConfig: McpServerConfig): Promise<void> {
    const config = await this.readConfig(scope)

    if (!config.mcpServers) {
      config.mcpServers = {}
    }

    config.mcpServers[serverName] = serverConfig
    await this.writeConfig(scope, config)
  }

  async removeServer(scope: SetupScope, serverName: string): Promise<boolean> {
    const config = await this.readConfig(scope)

    if (!config.mcpServers || !(serverName in config.mcpServers)) {
      return false
    }

    delete config.mcpServers[serverName]
    await this.writeConfig(scope, config)

    return true
  }

  async hasServer(scope: SetupScope, serverName: string): Promise<boolean> {
    const config = await this.readConfig(scope)

    return config.mcpServers !== undefined && serverName in config.mcpServers
  }

  private async readConfig(scope: SetupScope): Promise<ClaudeLocalConfig | ClaudeGlobalConfig> {
    const configPath = this.getConfigPath(scope)
    const config = await readJsonFile<ClaudeLocalConfig | ClaudeGlobalConfig>(configPath)

    return config ?? {}
  }

  private async writeConfig(scope: SetupScope, config: ClaudeLocalConfig | ClaudeGlobalConfig): Promise<void> {
    const configPath = this.getConfigPath(scope)
    await writeJsonFile(configPath, config)
  }
}
