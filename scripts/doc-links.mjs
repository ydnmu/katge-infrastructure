import { readFileSync, existsSync, realpathSync, statSync } from 'node:fs'
import { dirname, resolve, relative, extname, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const withoutFences = text => text.replace(/(^|\n)[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n[ \t]{0,3}\2[^\n]*(?=\n|$)/g, '$1')
const prose = text => withoutFences(text).replace(/`[^`\n]*`/g, '')
const label = value => value.trim().replace(/\s+/g, ' ').toLowerCase()
const outside = (root, path) => { const location = relative(root, path); return location === '..' || location.startsWith(`..${sep}`) || isAbsolute(location) }
function anchors(text) {
  const seen = new Map(), lines = withoutFences(text).split(/\r?\n/), result = []
  for (let index = 0; index < lines.length; index++) {
    let heading = lines[index].match(/^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/)?.[1]
    if (!heading && lines[index].trim() && /^ {0,3}(?:=+|-+)\s*$/.test(lines[index + 1] ?? '')) heading = lines[index].trim()
    if (!heading) continue
    const slug = heading.toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-')
    const count = seen.get(slug) ?? 0; seen.set(slug, count + 1)
    result.push(count ? `${slug}-${count}` : slug)
  }
  return result
}
export function checkLinks(root, files) {
  const failures = []
  for (const file of files) {
    const source = resolve(root, file)
    if (!existsSync(source) || outside(realpathSync(root), realpathSync(source))) { failures.push(`${file}: missing or external document`); continue }
    const content = prose(readFileSync(source, 'utf8')), targets = [], definitions = new Map()
    for (const match of content.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)) definitions.set(label(match[1]), match[2] ?? match[3])
    for (const match of content.matchAll(/!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g)) targets.push(match[1] ?? match[2])
    for (const match of content.matchAll(/!?\[([^\]]+)\]\[([^\]]*)\]/g)) {
      const target = definitions.get(label(match[2] || match[1]))
      if (target) targets.push(target); else failures.push(`${file}: missing link reference`)
    }
    for (const match of content.matchAll(/!?\[([^\]]+)\](?![\[(:])/g)) { const target = definitions.get(label(match[1])); if (target) targets.push(target) }
    for (const match of content.matchAll(/<(?:a|img)\b[^>]*\b(?:href|src)=["']([^"']+)["'][^>]*>/gi)) targets.push(match[1])
    for (const match of content.matchAll(/<source\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi)) targets.push(...match[1].split(',').map(value => value.trim().split(/\s+/)[0]))
    for (const target of new Set(targets)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) {
        try {
          const url = new URL(target)
          if (!['https:', 'http:', 'mailto:'].includes(url.protocol) || url.username || url.password) throw new Error()
        } catch { failures.push(`${file}: unsafe external link`) }
        continue
      }
      const [path, fragment] = target.split('#')
      let destination
      try { destination = path ? resolve(dirname(source), decodeURIComponent(path)) : source }
      catch { failures.push(`${file}: malformed relative link`); continue }
      if (outside(root, destination)) { failures.push(`${file}: link leaves repository`); continue }
      if (!existsSync(destination) || !statSync(destination).isFile()) { failures.push(`${file}: missing relative target`); continue }
      if (outside(realpathSync(root), realpathSync(destination))) { failures.push(`${file}: linked target leaves repository`); continue }
      if (fragment && extname(destination) === '.md') {
        let anchor
        try { anchor = decodeURIComponent(fragment) } catch { failures.push(`${file}: malformed anchor`); continue }
        if (!anchors(readFileSync(destination, 'utf8')).includes(anchor)) failures.push(`${file}: missing heading anchor`)
      }
    }
  }
  return failures
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const files = ['README.md', 'SECURITY.md', 'CHANGELOG.md', 'assets/PROVENANCE.md', 'docs/architecture.md', 'docs/extension.md', 'docs/api.md', 'docs/mcp.md', 'docs/website.md', 'docs/releases.md', 'docs/privacy.md']
  const failures = checkLinks(root, files)
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1 }
  else console.log(`Publication-safe documentation links passed: ${files.length} documents.`)
}
