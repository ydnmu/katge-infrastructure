import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function checkLinks(root, files) {
  const failures = []
  for (const file of files) {
    const source = resolve(root, file)
    if (!existsSync(source)) { failures.push(`${file}: missing document`); continue }
    const content = readFileSync(source, 'utf8').replace(/```[\s\S]*?```/g, '')
    for (const match of content.matchAll(/!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g)) {
      const target = match[1] ?? match[2]
      if (/^(https?:|mailto:)/i.test(target)) {
        try { const url = new URL(target); if (url.username || url.password) throw new Error() }
        catch { failures.push(`${file}: unsafe external link`) }
        continue
      }
      const [path, fragment] = target.split('#')
      let destination
      try { destination = resolve(dirname(source), decodeURIComponent(path || '.')) }
      catch { failures.push(`${file}: malformed relative link`); continue }
      if (!path) destination = source
      const location = relative(root, destination)
      if (location.startsWith('..') || location.startsWith('/') || /^[A-Za-z]:/.test(location)) { failures.push(`${file}: link leaves repository`); continue }
      if (!existsSync(destination) || !statSync(destination).isFile()) { failures.push(`${file}: missing relative target`); continue }
      if (fragment && extname(destination) === '.md') {
        const seen = new Map()
        const anchors = readFileSync(destination, 'utf8').split(/\r?\n/).filter(line => /^#{1,6}\s/.test(line)).map(line => {
          const slug = line.replace(/^#{1,6}\s+/, '').toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-')
          const count = seen.get(slug) ?? 0; seen.set(slug, count + 1)
          return count ? `${slug}-${count}` : slug
        })
        let anchor
        try { anchor = decodeURIComponent(fragment) } catch { failures.push(`${file}: malformed anchor`); continue }
        if (!anchors.includes(anchor)) failures.push(`${file}: missing heading anchor`)
      }
    }
  }
  return failures
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const files = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'docs/PUBLIC_ARCHITECTURE.md', 'docs/REPOSITORY_REFINEMENT.md']
  const failures = checkLinks(root, files)
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1 }
  else console.log(`Publication-safe documentation links passed: ${files.length} documents.`)
}
