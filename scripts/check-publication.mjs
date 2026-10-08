import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkLinks } from './doc-links.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const allowed = new Set([
  '.gitattributes', '.gitignore', 'README.md', 'SECURITY.md', 'CHANGELOG.md',
  'assets/katge-mark.png', 'assets/product-preview.png', 'assets/PROVENANCE.md',
  'docs/architecture.md', 'docs/api.md', 'docs/extension.md', 'docs/privacy.md', 'docs/search-openapi.json',
  'scripts/check-publication.mjs', 'scripts/doc-links.mjs',
])
const inventory = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean)
const failures = []
for (const file of new Set(inventory)) {
  if (!allowed.has(file)) { failures.push('Unreviewed path in presentation tree'); continue }
  if (/\.(?:md|json)$/.test(file)) {
    const content = readFileSync(resolve(root, file), 'utf8')
    if (/(?:postgres(?:ql)?|mysql|redis):\/\/[^\s/]+:[^\s/@]+@|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|C:\\Users\\|\/app\/engine\//i.test(content)) failures.push(`${file}: private content marker`)
  }
}
for (const file of allowed) if (!inventory.includes(file)) failures.push(`Missing presentation file: ${file}`)
failures.push(...checkLinks(root, [...allowed].filter(file => file.endsWith('.md'))))
const schema = JSON.parse(readFileSync(resolve(root, 'docs/search-openapi.json'), 'utf8'))
if (schema.openapi !== '3.1.0' || Object.keys(schema.paths ?? {}).length !== 8) failures.push('Unexpected contract reference')
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1 }
else console.log(`Public presentation review passed: ${new Set(inventory).size} approved files; documentation and contract links verified.`)
