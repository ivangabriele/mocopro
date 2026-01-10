import { B } from 'bhala'
import { $ } from 'bun'

const LOG_PREFIX = '[BUILD]'

const targets = [
  { out: 'mocopro-linux-x64', target: 'bun-linux-x64' },
  { out: 'mocopro-linux-arm64', target: 'bun-linux-arm64' },
  { out: 'mocopro-darwin-x64', target: 'bun-darwin-x64' },
  { out: 'mocopro-darwin-arm64', target: 'bun-darwin-arm64' },
  { out: 'mocopro-windows-x64.exe', target: 'bun-windows-x64' },
  { out: 'mocopro-windows-arm64.exe', target: 'bun-windows-arm64' },
]

for (const { target, out } of targets) {
  B.info(LOG_PREFIX, `Building for ${target}...`)
  await $`bun build ./src/index.ts --compile --minify --target=${target} --outfile=dist/${out}`
}

B.info(LOG_PREFIX, 'Done!')
