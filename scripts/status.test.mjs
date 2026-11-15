import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { render, refresh, validate } from './status.mjs'

const catalog = { software: [{
  name: 'Navio', repository: 'poniard-li/Navio', maintenance: 'active', stage: 'public-beta',
  platforms: ['Windows x64'], version: '1.0.0-beta.7', releaseTag: 'v1.0.0-beta.7', checkedAt: '2026-11-15',
  guide: 'https://github.com/poniard-li/Navio/blob/main/docs/guide.md',
  changelog: 'https://github.com/poniard-li/Navio/blob/main/CHANGELOG.md'
}] }
const fixture = () => structuredClone(catalog)
const response = data => ({ ok: true, json: async () => data })

const websiteFixture = async () => {
  const data = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'))
  return { software: [data.software.find(item => item.id === 'mystery')] }
}

test('website links expose latest and history without inventing GitHub releases', async () => {
  const result = render(await websiteFixture())
  assert.match(result, /https:\/\/mystery.mydex.top\/api\/download/)
  assert.match(result, /维护暂停/)
  assert.match(result, /mystery-versions.md/)
  assert.doesNotMatch(result, /undefined|\/releases\/tag/)
})

test('website refresh requires the reviewed artifact and never sends GitHub authorization', async () => {
  const data = await websiteFixture()
  const item = data.software[0]
  const release = { ...item, available: true, fileAvailable: true, channel: 'stable' }
  const before = JSON.stringify(data)
  const updated = await refresh(data, async (url, options) => {
    assert.equal(url, item.releaseApi)
    assert.equal(options.headers, undefined)
    assert.equal(options.redirect, 'error')
    return response(release)
  }, '2026-11-16')
  assert.equal(updated.software[0].checkedAt, '2026-11-16')
  assert.equal(updated.software[0].maintenance, 'paused')
  for (const change of [{ sha256: '0'.repeat(64) }, { version: '2.2.0' }, { fileAvailable: false }, { available: false }, { sizeBytes: 1 }, { filename: 'other.exe' }, { channel: 'beta' }]) {
    await assert.rejects(refresh(data, async () => response({ ...release, ...change })), /review/)
  }
  await assert.rejects(refresh(data, async () => ({ ok: false, status: 503 })), /503/)
  assert.equal(JSON.stringify(data), before)
})

test('rejects unapproved website origins and invalid artifact metadata', async () => {
  for (const change of [{ homepage: 'https://example.com' }, { releaseApi: 'http://mystery.mydex.top/api/release' }, { download: 'https://example.com/app.exe' }, { sha256: 'invalid' }, { sizeBytes: -1 }, { filename: 'DEX-Setup-9.0.0-x64.exe' }, { source: 'unknown' }]) {
    const data = await websiteFixture()
    Object.assign(data.software[0], change)
    assert.throws(() => validate(data))
  }
})

test('renders official release links and explicit status labels', () => {
  const result = render(fixture())
  assert.match(result, /持续维护/)
  assert.match(result, /公开测试/)
  assert.match(result, /https:\/\/github.com\/poniard-li\/Navio\/releases\/tag\/v1.0.0-beta.7/)
  assert.match(result, /Windows x64/)
})

test('rejects invalid dates, duplicate entries and unofficial documentation', () => {
  const duplicate = fixture()
  duplicate.software.push(duplicate.software[0])
  assert.throws(() => validate(duplicate), /Duplicate/)
  const date = fixture()
  date.software[0].checkedAt = '2026-02-30'
  assert.throws(() => validate(date), /date/)
  const url = fixture()
  url.software[0].guide = 'https://example.com/guide'
  assert.throws(() => validate(url), /official/)
})

test('requires migration guidance when maintenance ends', () => {
  const data = fixture()
  data.software[0].maintenance = 'discontinued'
  assert.throws(() => validate(data), /migration/)
  data.software[0].migration = '请先导出配置，再按迁移指南切换客户端。'
  assert.match(render(data), /迁移说明/)
})

test('refresh ignores drafts and preserves manually confirmed maintenance', async () => {
  const data = fixture()
  data.software[0].maintenance = 'paused'
  const fetcher = async url => url.includes('/releases?')
    ? response([
      { tag_name: 'v9.0.0', draft: true, published_at: '2026-11-17T00:00:00Z' },
      { tag_name: 'v1.0.0-beta.8', draft: false, prerelease: false, published_at: '2026-11-16T00:00:00Z' },
      { tag_name: 'v1.0.0-beta.7', draft: false, published_at: '2026-11-12T00:00:00Z' }
    ])
    : response({ private: false, full_name: 'poniard-li/Navio' })
  const updated = await refresh(data, fetcher, '2026-11-16')
  assert.equal(updated.software[0].version, '1.0.0-beta.8')
  assert.equal(updated.software[0].stage, 'public-beta')
  assert.equal(updated.software[0].maintenance, 'paused')
  assert.equal(data.software[0].version, '1.0.0-beta.7')
})

test('does not change saved status after a failed request or private repository response', async () => {
  const data = fixture()
  const before = JSON.stringify(data)
  await assert.rejects(refresh(data, async () => ({ ok: false, status: 403 })), /403/)
  await assert.rejects(refresh(data, async () => response({ private: true, full_name: 'poniard-li/Navio' })), /public/)
  assert.equal(JSON.stringify(data), before)
})
