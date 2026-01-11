import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ensureDirectoryExists,
  getConfigFilePath,
  getMocoproDirectoryPath,
  getRegistryFilePath,
  getReposDirectoryPath,
  getRepositoryLocalPath,
  readJsonFile,
  writeJsonFile,
} from '../filesystem.js'

describe('getMocoproDirectoryPath', () => {
  test('returns path in home directory', () => {
    const result = getMocoproDirectoryPath()

    expect(result).toBe(join(homedir(), '.mocopro'))
  })
})

describe('getReposDirectoryPath', () => {
  test('returns repos path inside mocopro directory', () => {
    const result = getReposDirectoryPath()

    expect(result).toBe(join(homedir(), '.mocopro', 'repos'))
  })
})

describe('getConfigFilePath', () => {
  test('returns config.json path', () => {
    const result = getConfigFilePath()

    expect(result).toBe(join(homedir(), '.mocopro', 'config.json'))
  })
})

describe('getRegistryFilePath', () => {
  test('returns registry.json path', () => {
    const result = getRegistryFilePath()

    expect(result).toBe(join(homedir(), '.mocopro', 'registry.json'))
  })
})

describe('getRepositoryLocalPath', () => {
  test('returns correct repository path with owner_repo format', () => {
    const result = getRepositoryLocalPath('hellokaton', 'unsplash-mcp-server')

    expect(result).toBe(join(homedir(), '.mocopro', 'repos', 'hellokaton_unsplash-mcp-server'))
  })
})

describe('ensureDirectoryExists', () => {
  const testDirectoryPath = join(tmpdir(), 'mocopro-test-ensure-dir')

  afterEach(async () => {
    await rm(testDirectoryPath, { force: true, recursive: true })
  })

  test('creates directory if it does not exist', async () => {
    await ensureDirectoryExists(testDirectoryPath)

    const stat = await Bun.file(testDirectoryPath).exists()
    expect(stat).toBe(false)
  })

  test('creates nested directories recursively', async () => {
    const nestedPath = join(testDirectoryPath, 'nested', 'deep', 'path')

    await ensureDirectoryExists(nestedPath)

    await mkdir(nestedPath, { recursive: true })
  })

  test('does not throw if directory already exists', async () => {
    await mkdir(testDirectoryPath, { recursive: true })

    await expect(ensureDirectoryExists(testDirectoryPath)).resolves.toBeUndefined()
  })
})

describe('ensureMocoproDirectoriesExist', () => {
  test('creates mocopro and repos directories', async () => {
    const { ensureMocoproDirectoriesExist } = await import('../filesystem.js')

    await expect(ensureMocoproDirectoriesExist()).resolves.toBeUndefined()
  })
})

describe('readJsonFile', () => {
  const testFilePath = join(tmpdir(), 'mocopro-test-read.json')

  afterEach(async () => {
    await rm(testFilePath, { force: true })
  })

  test('reads and parses JSON file', async () => {
    const testData = { name: 'test', value: 42 }
    await Bun.write(testFilePath, JSON.stringify(testData))

    const result = await readJsonFile<{ name: string; value: number }>(testFilePath)

    expect(result).toEqual(testData)
  })

  test('returns undefined for non-existent file', async () => {
    const result = await readJsonFile('/non/existent/path.json')

    expect(result).toBeUndefined()
  })

  test('returns undefined for invalid JSON', async () => {
    await Bun.write(testFilePath, 'not valid json')

    const result = await readJsonFile(testFilePath)

    expect(result).toBeUndefined()
  })
})

describe('writeJsonFile', () => {
  const testFilePath = join(tmpdir(), 'mocopro-test-write.json')

  afterEach(async () => {
    await rm(testFilePath, { force: true })
  })

  test('writes data as formatted JSON', async () => {
    const testData = { name: 'test', value: 42 }

    await writeJsonFile(testFilePath, testData)

    const content = await readFile(testFilePath, 'utf-8')
    expect(content).toBe(JSON.stringify(testData, null, 2))
  })

  test('overwrites existing file', async () => {
    await Bun.write(testFilePath, JSON.stringify({ old: 'data' }))
    const newData = { new: 'data' }

    await writeJsonFile(testFilePath, newData)

    const content = await readFile(testFilePath, 'utf-8')
    expect(JSON.parse(content)).toEqual(newData)
  })
})
