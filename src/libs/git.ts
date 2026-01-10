import simpleGit from 'simple-git'
import { ensureDirectoryExists } from './filesystem.js'

export async function cloneRepository(repositoryUrl: string, destinationPath: string, branch?: string): Promise<void> {
  await ensureDirectoryExists(destinationPath)

  const git = simpleGit()
  const cloneOptions: string[] = ['--depth', '1']

  if (branch) {
    cloneOptions.push('--branch', branch)
  }

  await git.clone(repositoryUrl, destinationPath, cloneOptions)
}

export async function pullRepository(repositoryPath: string): Promise<void> {
  const git = simpleGit(repositoryPath)
  await git.pull()
}

export async function getDefaultBranch(repositoryPath: string): Promise<string> {
  const git = simpleGit(repositoryPath)
  const branchSummary = await git.branch()
  return branchSummary.current
}
