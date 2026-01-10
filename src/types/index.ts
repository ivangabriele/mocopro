export type ContainerRuntime = 'auto' | 'podman' | 'docker'

export interface Configuration {
  containerRuntime: ContainerRuntime
  defaultDetach: boolean
}

export type EnvironmentVariables = Record<string, string>

export interface ServerRegistryEntry {
  name: string
  owner: string
  repository: string
  branch: string
  imageName: string
  imageTag: string
  environmentVariables: EnvironmentVariables
  installedAt: string
  updatedAt: string
}

export interface Registry {
  servers: Record<string, ServerRegistryEntry>
}

export interface ParsedRepository {
  owner: string
  repository: string
  branch: string | undefined
  fullUrl: string
}

export interface SmitheryStartCommand {
  type: 'stdio'
  configSchema?: {
    type: string
    properties?: Record<string, { type: string; description?: string }>
    required?: string[]
  }
  commandFunction: string
}

export interface SmitheryConfig {
  startCommand: SmitheryStartCommand
}

export interface ContainerStatus {
  isRunning: boolean
  containerId: string | undefined
  containerName: string | undefined
}

export type DetectedRuntime = 'podman' | 'docker'

export interface ClaudeMcpServerConfig {
  type: 'stdio'
  command: string
  args: string[]
  env?: EnvironmentVariables
}

export interface ClaudeLocalConfig {
  mcpServers?: Record<string, ClaudeMcpServerConfig>
}

export interface ClaudeGlobalConfig {
  mcpServers?: Record<string, ClaudeMcpServerConfig>
}

export type SetupScope = 'local' | 'global'
