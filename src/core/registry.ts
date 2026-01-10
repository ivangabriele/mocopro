import { ensureMocoproDirectoriesExist, getRegistryFilePath, readJsonFile, writeJsonFile } from '../libs/filesystem.js'
import type { Registry, ServerRegistryEntry } from '../types/index.js'

const EMPTY_REGISTRY: Registry = { servers: {} }

export async function loadRegistry(): Promise<Registry> {
  await ensureMocoproDirectoriesExist()

  const registry = await readJsonFile<Registry>(getRegistryFilePath())
  return registry ?? EMPTY_REGISTRY
}

export async function saveRegistry(registry: Registry): Promise<void> {
  await ensureMocoproDirectoriesExist()
  await writeJsonFile(getRegistryFilePath(), registry)
}

export async function getServer(serverName: string): Promise<ServerRegistryEntry | undefined> {
  const registry = await loadRegistry()
  return registry.servers[serverName]
}

export async function addServer(server: ServerRegistryEntry): Promise<void> {
  const registry = await loadRegistry()
  registry.servers[server.name] = server
  await saveRegistry(registry)
}

export async function updateServer(serverName: string, updates: Partial<ServerRegistryEntry>): Promise<void> {
  const registry = await loadRegistry()
  const existingServer = registry.servers[serverName]

  if (!existingServer) {
    throw new Error(`Server "${serverName}" not found in registry`)
  }

  registry.servers[serverName] = { ...existingServer, ...updates }
  await saveRegistry(registry)
}

export async function removeServer(serverName: string): Promise<void> {
  const registry = await loadRegistry()

  if (!registry.servers[serverName]) {
    throw new Error(`Server "${serverName}" not found in registry`)
  }

  delete registry.servers[serverName]
  await saveRegistry(registry)
}

export async function listServers(): Promise<ServerRegistryEntry[]> {
  const registry = await loadRegistry()
  return Object.values(registry.servers)
}

export async function serverExists(serverName: string): Promise<boolean> {
  const registry = await loadRegistry()
  return serverName in registry.servers
}
