import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { historyFindings, contentFindings } from './history.mjs'

test('presentation history detects removed sensitive content and unrelated roots without echoing values', () => {
  const root = mkdtempSync(join(tmpdir(), 'katge-history-'))
  const git = args => execFileSync('git', args, { cwd: root, windowsHide: true, encoding: 'utf8' }).trim()
  const commit = message => { git(['add', 'README.md']); git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', message]) }
  try {
    git(['init', '-q'])
    writeFileSync(join(root, 'README.md'), '# Public fixture\n'); commit('Fixture root')
    const initial = git(['rev-parse', 'HEAD']), allowed = new Set(['README.md'])
    assert.deepEqual(historyFindings(root, allowed, initial), [])
    const synthetic = ['postgres:', '//fixture:', 'synthetic-password', '@example.invalid/db'].join('')
    writeFileSync(join(root, 'README.md'), synthetic); commit('Fixture content')
    writeFileSync(join(root, 'README.md'), '# Public fixture\n'); commit('Remove fixture content')
    const failures = historyFindings(root, allowed, initial)
    assert.match(failures.join('\n'), /private content marker/)
    assert.ok(!failures.join('\n').includes('synthetic-password'))
    assert.ok(historyFindings(root, allowed, '0'.repeat(40)).some(value => value.includes('isolated root')))
  } finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep))
    rmSync(root, { recursive: true, force: true })
  }
})

test('product diagrams allow static local shapes and reject executable or external SVG resources', () => {
  assert.deepEqual(contentFindings('flow.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" /></defs><rect fill="url(#grid)" /></svg>')), [])
  for (const content of ['<svg onload="alert(1)"></svg>', '<svg><script>1</script></svg>', '<svg><image href="https://example.invalid/a.png" /></svg>', '<svg><rect fill="url(https://example.invalid/a)" /></svg>', '<svg><foreignObject /></svg>']) {
    assert.equal(contentFindings('flow.svg', Buffer.from(content)).length, 1)
  }
})
