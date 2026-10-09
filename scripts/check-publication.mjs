import { execFileSync } from 'node:child_process'
import { readFileSync, lstatSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkLinks } from './doc-links.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const allowed = new Set([
  '.gitattributes', '.gitignore', 'README.md', 'SECURITY.md', 'CHANGELOG.md',
  'assets/katge-mark.png', 'assets/product-preview.png', 'assets/PROVENANCE.md',
  'docs/architecture.md', 'docs/api.md', 'docs/extension.md', 'docs/privacy.md', 'docs/search-openapi.json',
  'scripts/check-publication.mjs', 'scripts/doc-links.mjs',
  '.github/workflows/verify.yml',
  'scripts/export.mjs',
])
const inventory = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean)
const failures = []
for (const file of new Set(inventory)) {
  if (!allowed.has(file)) { failures.push('Unreviewed path in presentation tree'); continue }
  const stat = lstatSync(resolve(root, file))
  if (!stat.isFile() || stat.isSymbolicLink()) { failures.push(`${file}: linked or special file`); continue }
  if (file.endsWith('.png')) {
    const bytes = readFileSync(resolve(root, file))
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || stat.size > 16 * 1024 * 1024) failures.push(`${file}: unexpected image format or size`)
  } else {
    const content = readFileSync(resolve(root, file), 'utf8')
    if (/(?:postgres(?:ql)?|mysql|redis):\/\/[^\s/]+:[^\s/@]+@|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|C:\\Users\\|\/app\/engine\//i.test(content)) failures.push(`${file}: private content marker`)
  }
}
for (const file of allowed) if (!inventory.includes(file)) failures.push(`Missing presentation file: ${file}`)
failures.push(...checkLinks(root, [...allowed].filter(file => file.endsWith('.md'))))
const schema = JSON.parse(readFileSync(resolve(root, 'docs/search-openapi.json'), 'utf8'))
if (schema.openapi !== '3.1.0' || Object.keys(schema.paths ?? {}).length !== 8) failures.push('Unexpected contract reference')
const roots = execFileSync('git', ['rev-list', '--max-parents=0', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/)
if (roots.length !== 1 || roots[0] !== '1b61b32883aaf0c1931c037e56296ad7e9e2a4a5') failures.push('Presentation history no longer starts from the reviewed isolated root')
const historicalPaths = execFileSync('git', ['log', '--all', '--format=', '--name-only'], { cwd: root, encoding: 'utf8', windowsHide: true }).split(/\r?\n/).filter(Boolean)
if (historicalPaths.some(file => !allowed.has(file))) failures.push('Unreviewed path exists in presentation history')
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1 }
else console.log(`Public presentation review passed: ${new Set(inventory).size} approved files; documentation and contract links verified.`)
