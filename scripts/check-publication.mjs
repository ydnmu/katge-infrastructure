import { execFileSync } from 'node:child_process'
import { readFileSync, lstatSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkLinks } from './doc-links.mjs'
import { contentFindings, historyFindings } from './history.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const allowed = new Set([
  '.gitattributes', '.gitignore', 'README.md', 'SECURITY.md', 'CHANGELOG.md',
  'assets/katge-mark.png', 'assets/product-preview.png', 'assets/PROVENANCE.md',
  'assets/product-flow.svg', 'assets/product-flow-dark.svg',
  'assets/product-flow.gif', 'assets/product-flow-dark.gif',
  'docs/architecture.md', 'docs/api.md', 'docs/extension.md', 'docs/privacy.md', 'docs/search-openapi.json',
  'docs/mcp.md', 'docs/website.md', 'docs/releases.md',
  'scripts/check-publication.mjs', 'scripts/doc-links.mjs',
  '.github/workflows/verify.yml',
  'scripts/export.mjs',
  'scripts/history.mjs', 'scripts/history.test.mjs',
])
const inventory = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean)
const failures = []
for (const file of new Set(inventory)) {
  if (!allowed.has(file)) { failures.push('Unreviewed path in presentation tree'); continue }
  const stat = lstatSync(resolve(root, file))
  if (!stat.isFile() || stat.isSymbolicLink()) { failures.push(`${file}: linked or special file`); continue }
  if (stat.size > 16 * 1024 * 1024) { failures.push(`${file}: oversized presentation asset`); continue }
  failures.push(...contentFindings(file, readFileSync(resolve(root, file))))
}
for (const file of allowed) if (!inventory.includes(file)) failures.push(`Missing presentation file: ${file}`)
failures.push(...checkLinks(root, [...allowed].filter(file => file.endsWith('.md'))))
const schema = JSON.parse(readFileSync(resolve(root, 'docs/search-openapi.json'), 'utf8'))
if (schema.openapi !== '3.1.0' || Object.keys(schema.paths ?? {}).length !== 8) failures.push('Unexpected contract reference')
failures.push(...historyFindings(root, allowed, '1b61b32883aaf0c1931c037e56296ad7e9e2a4a5'))
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1 }
else console.log(`Public presentation review passed: ${new Set(inventory).size} approved files; documentation and contract links verified.`)
