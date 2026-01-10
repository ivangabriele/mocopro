import { describe, expect, test } from 'bun:test'
import { buildContainerName, buildImageName, parseRepositoryInput } from '../parser.js'

describe('parseRepositoryInput', () => {
  test('parses short format owner/repository', () => {
    const result = parseRepositoryInput('hellokaton/unsplash-mcp-server')

    expect(result.owner).toBe('drumnation')
    expect(result.repository).toBe('unsplash-mcp-server')
    expect(result.branch).toBeUndefined()
    expect(result.fullUrl).toBe('hellokaton/unsplash-mcp-server.git')
  })

  test('parses short format with branch', () => {
    const result = parseRepositoryInput('owner/repo#develop')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.branch).toBe('develop')
    expect(result.fullUrl).toBe('https://github.com/owner/repo.git')
  })

  test('parses short format with tag', () => {
    const result = parseRepositoryInput('owner/repo#v1.0.0')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.branch).toBe('v1.0.0')
  })

  test('parses full GitHub URL', () => {
    const result = parseRepositoryInput('hellokaton/unsplash-mcp-server')

    expect(result.owner).toBe('drumnation')
    expect(result.repository).toBe('unsplash-mcp-server')
    expect(result.branch).toBeUndefined()
    expect(result.fullUrl).toBe('hellokaton/unsplash-mcp-server.git')
  })

  test('parses GitHub URL with .git suffix', () => {
    const result = parseRepositoryInput('https://github.com/owner/repo.git')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.branch).toBeUndefined()
  })

  test('parses GitHub URL with branch', () => {
    const result = parseRepositoryInput('https://github.com/owner/repo#feature-branch')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.branch).toBe('feature-branch')
  })

  test('parses GitHub URL with .git and branch', () => {
    const result = parseRepositoryInput('https://github.com/owner/repo.git#main')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.branch).toBe('main')
  })

  test('throws error for invalid format', () => {
    expect(() => parseRepositoryInput('invalid')).toThrow('Invalid repository format')
  })

  test('throws error for empty string', () => {
    expect(() => parseRepositoryInput('')).toThrow('Invalid repository format')
  })

  test('parses GitHub URL without protocol', () => {
    const result = parseRepositoryInput('github.com/owner/repo')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
    expect(result.fullUrl).toBe('https://github.com/owner/repo.git')
  })

  test('parses GitHub URL with www prefix', () => {
    const result = parseRepositoryInput('https://www.github.com/owner/repo')

    expect(result.owner).toBe('owner')
    expect(result.repository).toBe('repo')
  })

  test('throws error for single word input', () => {
    expect(() => parseRepositoryInput('justarepo')).toThrow('Invalid repository format')
  })

  test('handles repository names with hyphens and numbers', () => {
    const result = parseRepositoryInput('owner-name/repo-v2-test')

    expect(result.owner).toBe('owner-name')
    expect(result.repository).toBe('repo-v2-test')
  })
})

describe('buildImageName', () => {
  test('builds correct image name', () => {
    const result = buildImageName('drumnation', 'unsplash-mcp-server')

    expect(result).toBe('mocopro/drumnation-unsplash-mcp-server')
  })
})

describe('buildContainerName', () => {
  test('builds correct container name', () => {
    const result = buildContainerName('unsplash-mcp-server')

    expect(result).toBe('mocopro-unsplash-mcp-server')
  })
})
