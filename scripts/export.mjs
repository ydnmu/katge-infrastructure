import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const git = args => execFileSync('git', args, { cwd: root, windowsHide: true, encoding: 'utf8' })
// Export the exact reviewed commit, with no inherited Git database or local files.
git(['diff', '--quiet']); git(['diff', '--cached', '--quiet'])
if (git(['ls-files', '--others', '--exclude-standard']).trim()) throw new Error('Commit reviewed presentation files before exporting')
execFileSync(process.execPath, ['scripts/check-publication.mjs'], { cwd: root, windowsHide: true, stdio: 'inherit' })
const output = resolve(root, '.data'); mkdirSync(output, { recursive: true })
const head = git(['rev-parse', 'HEAD']).trim()
const file = `katge-public-${head.slice(0, 12)}.zip`
git(['archive', '--format=zip', '--prefix=katge-public/', `--output=${resolve(output, file)}`, head])
const sha256 = createHash('sha256').update(readFileSync(resolve(output, file))).digest('hex')
writeFileSync(resolve(output, 'export.json'), JSON.stringify({ commit: head, file, sha256 }, null, 2) + '\n')
console.log(`Reviewed presentation export: .data/${file} (${sha256})`)
