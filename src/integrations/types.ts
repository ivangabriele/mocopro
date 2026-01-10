import type { ClaudeMcpServerConfig, EnvironmentVariables, SetupScope } from '../types/index.js'

export type McpServerConfig = ClaudeMcpServerConfig

export interface McpClientIntegration {
  readonly name: string

  getConfigPath(scope: SetupScope): string

  buildServerConfig(
    runtime: string,
    imageName: string,
    imageTag: string,
    environmentVariables: EnvironmentVariables,
  ): McpServerConfig

  addServer(scope: SetupScope, serverName: string, serverConfig: McpServerConfig): Promise<void>

  removeServer(scope: SetupScope, serverName: string): Promise<boolean>

  hasServer(scope: SetupScope, serverName: string): Promise<boolean>
}
