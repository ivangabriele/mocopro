import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const MOCOPRO_DIRECTORY_NAME = '.mocopro'
const REPOS_DIRECTORY_NAME = 'repos'

export function getMocoproDirectoryPath(): string {
  return join(homedir(), MOCOPRO_DIRECTORY_NAME)
}

export function getReposDirectoryPath(): string {
  return join(getMocoproDirectoryPath(), REPOS_DIRECTORY_NAME)
}

export function getConfigFilePath(): string {
  return join(getMocoproDirectoryPath(), 'config.json')
}

export function getRegistryFilePath(): string {
  return join(getMocoproDirectoryPath(), 'registry.json')
}

export function getRepositoryLocalPath(owner: string, repository: string): string {
  return join(getReposDirectoryPath(), `${owner}_${repository}`)
}

export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true })
}

export async function ensureMocoproDirectoriesExist(): Promise<void> {
  await ensureDirectoryExists(getMocoproDirectoryPath())
  await ensureDirectoryExists(getReposDirectoryPath())
}

export async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return undefined
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2)
  await writeFile(filePath, content, 'utf-8')
}
