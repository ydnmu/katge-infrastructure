import { execFileSync } from 'node:child_process'

function validAnimation(bytes) {
  // Only bounded image frames, graphics controls and the standard loop extension.
  // Reject truncated blocks, hidden comment/plain-text payloads and trailing data.
  let cursor = 0, frames = 0
  const take = count => {
    if (cursor + count > bytes.length) throw new Error('Truncated GIF')
    const block = bytes.subarray(cursor, cursor + count); cursor += count; return block
  }
  const blocks = () => { let count; while ((count = take(1)[0])) take(count) }
  try {
    if (!['GIF87a', 'GIF89a'].includes(take(6).toString('ascii'))) return false
    const screen = take(7), width = screen.readUInt16LE(0), height = screen.readUInt16LE(2)
    if (!width || !height || width > 1600 || height > 900) return false
    if (screen[4] & 0x80) take(3 * (1 << ((screen[4] & 7) + 1)))
    while (cursor < bytes.length) {
      const marker = take(1)[0]
      if (marker === 0x3b) return cursor === bytes.length && frames > 1
      if (marker === 0x2c) {
        const frame = take(9), x = frame.readUInt16LE(0), y = frame.readUInt16LE(2), w = frame.readUInt16LE(4), h = frame.readUInt16LE(6)
        if (!w || !h || x + w > width || y + h > height || ++frames > 300) return false
        if (frame[8] & 0x80) take(3 * (1 << ((frame[8] & 7) + 1)))
        const codeSize = take(1)[0]
        if (codeSize < 2 || codeSize > 8) return false
        blocks()
      } else if (marker === 0x21) {
        const kind = take(1)[0]
        if (kind === 0xf9) {
          if (take(1)[0] !== 4) return false
          take(4); if (take(1)[0] !== 0) return false
        } else if (kind === 0xff) {
          if (take(1)[0] !== 11 || take(11).toString('ascii') !== 'NETSCAPE2.0') return false
          if (take(1)[0] !== 3 || take(3)[0] !== 1 || take(1)[0] !== 0) return false
        } else return false
      } else return false
    }
  } catch { return false }
  return false
}

export function contentFindings(file, bytes) {
  if (bytes.length > 16 * 1024 * 1024) return [`${file}: oversized presentation asset`]
  if (file.endsWith('.png')) {
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? [] : [`${file}: unexpected image format`]
  }
  if (file.endsWith('.gif')) {
    return validAnimation(bytes) ? [] : [`${file}: malformed or unsupported GIF content`]
  }
  const text = bytes.toString('utf8')
  if (file.endsWith('.svg')) {
    if (!/^<svg\b[\s\S]*<\/svg>\s*$/.test(text)) return [`${file}: unexpected SVG format`]
    if (/<!DOCTYPE|<!ENTITY|<(?:script|foreignObject|image|animate\w*|set|a)\b|\son[a-z]+\s*=|(?:href|src)\s*=|url\(\s*(?!#)|@import/i.test(text)) return [`${file}: active or external SVG content`]
  }
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
