import type { ParsedRepository } from '../types/index.js'

const GITHUB_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/#]+?)(?:\.git)?(?:#(.+))?$/
const SHORT_FORMAT_REGEX = /^([^/]+)\/([^#]+?)(?:#(.+))?$/

export function parseRepositoryInput(input: string): ParsedRepository {
  const githubUrlMatch = input.match(GITHUB_URL_REGEX)
  if (githubUrlMatch) {
    const [, owner, repository, branch] = githubUrlMatch
    return {
      branch: branch || undefined,
      fullUrl: buildGitHubUrl(owner as string, repository as string),
      owner: owner as string,
      repository: repository as string,
    }
  }

  const shortFormatMatch = input.match(SHORT_FORMAT_REGEX)
  if (shortFormatMatch) {
    const [, owner, repository, branch] = shortFormatMatch
    return {
      branch: branch || undefined,
      fullUrl: buildGitHubUrl(owner as string, repository as string),
      owner: owner as string,
      repository: repository as string,
    }
  }

  throw new Error(`Invalid repository format: "${input}". Expected "owner/repository" or a GitHub URL.`)
}

function buildGitHubUrl(owner: string, repository: string): string {
  return `https://github.com/${owner}/${repository}.git`
}

export function buildImageName(owner: string, repository: string): string {
  return `mocopro/${owner}-${repository}`
}

export function buildContainerName(repository: string): string {
  return `mocopro-${repository}`
}
