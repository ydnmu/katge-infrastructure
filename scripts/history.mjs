import { execFileSync } from 'node:child_process'

export function contentFindings(file, bytes) {
  if (bytes.length > 16 * 1024 * 1024) return [`${file}: oversized presentation asset`]
  if (file.endsWith('.png')) {
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? [] : [`${file}: unexpected image format`]
  }
  const text = bytes.toString('utf8')
  if (/(?:postgres(?:ql)?|mysql|redis):\/\/[^\s/]+:[^\s/@]+@|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|C:\\Users\\|\/app\/engine\//i.test(text)) return [`${file}: private content marker`]
  return []
}

// Inspect reachable history, including content removed from the current tree.
// Diagnostics identify paths and finding categories, never matched values.
export function historyFindings(root, allowed, expectedRoot) {
  const git = (args, input) => execFileSync('git', args, { cwd: root, input, windowsHide: true, maxBuffer: 32 * 1024 * 1024 })
  const failures = []
  const roots = git(['rev-list', '--max-parents=0', '--all']).toString().trim().split(/\r?\n/)
  if (roots.length !== 1 || roots[0] !== expectedRoot) failures.push('History no longer starts from the reviewed isolated root')
  const paths = git(['log', '--all', '--format=', '--name-only']).toString().split(/\r?\n/).filter(Boolean)
  if (paths.some(file => !allowed.has(file))) failures.push('Unreviewed path exists in presentation history')
  const objects = git(['rev-list', '--objects', '--all']).toString().trim().split(/\r?\n/).map(line => {
    const boundary = line.indexOf(' ')
    return { id: boundary < 0 ? line : line.slice(0, boundary), file: boundary < 0 ? '' : line.slice(boundary + 1) }
  })
  const metadata = git(['cat-file', '--batch-check=%(objecttype) %(objectsize)'], objects.map(object => object.id).join('\n') + '\n').toString().trim().split(/\r?\n/)
  for (let index = 0; index < objects.length; index++) {
    const object = objects[index], [type, size] = metadata[index].split(' ')
    if (type !== 'blob') continue
    if (!allowed.has(object.file)) { failures.push('Unreviewed blob exists in presentation history'); continue }
    if (Number(size) > 16 * 1024 * 1024) { failures.push(`${object.file}: oversized historical asset`); continue }
    failures.push(...contentFindings(object.file, git(['cat-file', 'blob', object.id])))
  }
  return [...new Set(failures)]
}
