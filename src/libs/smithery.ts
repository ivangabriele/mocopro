import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { SmitheryConfig } from '../types/index.js'

const SMITHERY_FILENAME = 'smithery.yaml'

export async function readSmitheryConfig(repositoryPath: string): Promise<SmitheryConfig | undefined> {
  const smitheryPath = join(repositoryPath, SMITHERY_FILENAME)

  try {
    const content = await readFile(smitheryPath, 'utf-8')
    return parseYaml(content) as SmitheryConfig
  } catch {
    return undefined
  }
}

export function generateDockerfileFromSmithery(smitheryConfig: SmitheryConfig): string {
  const commandFunction = smitheryConfig.startCommand.commandFunction
  const parsedCommand = parseCommandFunction(commandFunction)

  const dockerfileLines = [
    'FROM node:20-alpine',
    '',
    'WORKDIR /app',
    '',
    'COPY package*.json ./',
    'RUN npm ci --only=production',
    '',
    'COPY . .',
    '',
    'RUN npm run build 2>/dev/null || true',
    '',
    `CMD ["${parsedCommand.command}", ${parsedCommand.args.map(arg => `"${arg}"`).join(', ')}]`,
  ]

  return dockerfileLines.join('\n')
}

interface ParsedCommand {
  command: string
  args: string[]
}

function parseCommandFunction(commandFunction: string): ParsedCommand {
  const commandMatch = commandFunction.match(/command:\s*['"]([^'"]+)['"]/)
  const argsMatch = commandFunction.match(/args:\s*\[([^\]]+)\]/)

  const command = commandMatch ? commandMatch[1] : 'node'
  const argsString = argsMatch ? argsMatch[1] : "'dist/index.js'"
  const args = argsString
    .split(',')
    .map(arg => arg.trim().replace(/['"]/g, ''))
    .filter(Boolean)

  return { args, command: command as string }
}
