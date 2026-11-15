import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = new URL('../', import.meta.url)
const maintenance = { active: '🟢 持续维护', paused: '🟡 维护暂停', discontinued: '⚪ 停止维护' }
const stages = { 'public-beta': '公开测试', stable: '正式发布' }
const text = (value) => String(value).replace(/[|<>\r\n\[\]]/g, ' ').trim()

export function validate(catalog) {
  if (!Array.isArray(catalog.software) || !catalog.software.length) throw new Error('Software list is empty')
  const seen = new Set()
  for (const item of catalog.software) {
    if (!item.name || !/^poniard-li\/[A-Za-z0-9_.-]+$/.test(item.repository)) throw new Error('Invalid software identity')
    if (seen.has(item.repository)) throw new Error('Duplicate repository')
    seen.add(item.repository)
    if (!maintenance[item.maintenance] || !stages[item.stage]) throw new Error('Invalid status')
    if (!Array.isArray(item.platforms) || !item.platforms.length || item.platforms.some(p => typeof p !== 'string' || !p.trim())) throw new Error('Invalid platforms')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.checkedAt) || new Date(item.checkedAt).toISOString().slice(0, 10) !== item.checkedAt) throw new Error('Invalid review date')
    if (!/^v?\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(item.releaseTag) || item.releaseTag.replace(/^v/, '') !== item.version) throw new Error('Version and release tag differ')
    for (const key of ['guide', 'changelog']) {
      const url = new URL(item[key])
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' || !url.pathname.startsWith(`/${item.repository}/`) || url.username || url.password) throw new Error('Documentation must use the official repository')
    }
    if (item.maintenance === 'discontinued' && !item.migration) throw new Error('Discontinued software needs migration guidance')
  }
}

export function render(catalog) {
  validate(catalog)
  const rows = catalog.software.map(item => {
    const repo = `https://github.com/${item.repository}`
    const download = `${repo}/releases/tag/${encodeURIComponent(item.releaseTag)}`
    return `| **[${text(item.name)}](${repo})** | ${maintenance[item.maintenance]} | ${stages[item.stage]} | ${item.platforms.map(text).join(' / ')} | ${text(item.version)} | ${item.checkedAt} | [下载](${download}) · [指南](${item.guide}) · [更新日志](${item.changelog}) |`
  }).join('\n')
  const migration = catalog.software.filter(item => item.maintenance === 'discontinued').map(item => `- **${text(item.name)}**：${text(item.migration)}`).join('\n')
  return `<div align="center">

# D.E.X Studio Software Status

**软件状态与下载**

D.E.X Studio 软件维护状态、公开版本与官方入口。

[软件总览](#软件总览) · [状态说明](#状态说明) · [更新记录](CHANGELOG.md)

</div>

---

## 软件总览

| 软件 | 维护状态 | 发布阶段 | 支持平台 | 当前版本 | 核对日期 | 官方入口 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

版本与下载入口对应已发布的 GitHub Release。测试版本的功能与兼容性可能继续调整，安装前请阅读相应更新日志。
${migration ? `\n## 迁移说明\n\n${migration}\n` : ''}
## 状态说明

### 维护状态

| 状态 | 含义 |
| :--- | :--- |
| 🟢 持续维护 | 继续提供版本更新或问题修复。 |
| 🟡 维护暂停 | 暂停常规更新，恢复时间以正式公告为准。 |
| ⚪ 停止维护 | 不再提供常规更新，并提供迁移说明。 |

### 发布阶段

| 阶段 | 含义 |
| :--- | :--- |
| 公开测试 | 已提供公开下载，仍在收集反馈和完善功能。 |
| 正式发布 | 已发布正式版本，支持范围以软件文档为准。 |

核对日期表示最近一次版本信息核验日期。维护状态由项目维护者确认，不根据提交频率自动判断。

## 支持与反馈

- 使用问题和功能建议，请前往对应软件仓库的 Issues。
- 版本、状态或链接有误，请在[本仓库提交反馈](https://github.com/poniard-li/DEX-Studio-Software-Status/issues)。
- 本页展示软件维护与发布信息；账号、下载及其他在线服务的实时可用性不在此状态范围内。

---

D.E.X Studio
`
}

export async function refresh(catalog, fetcher = fetch, today = new Date().toISOString().slice(0, 10)) {
  validate(catalog)
  const next = structuredClone(catalog)
  const api = async (path) => {
    const response = await fetcher(`https://api.github.com/repos/${path}`, {
      headers: { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
      signal: AbortSignal.timeout(20000)
    })
    if (!response.ok) throw new Error(`GitHub request failed (${response.status})`)
    return response.json()
  }
  for (const item of next.software) {
    const repo = await api(item.repository)
    if (repo.private !== false || repo.full_name !== item.repository) throw new Error('Only confirmed public repositories may be listed')
    const releases = await api(`${item.repository}/releases?per_page=100`)
    const release = releases.filter(r => !r.draft && r.published_at && /^v?\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(r.tag_name))
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0]
    if (!release) throw new Error('No published release found')
    item.releaseTag = release.tag_name
    item.version = release.tag_name.replace(/^v/, '')
    item.stage = release.prerelease || /-/.test(item.version) ? 'public-beta' : 'stable'
    item.checkedAt = today
  }
  validate(next)
  return next
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length > 1 || (args.length && !['--check', '--refresh'].includes(args[0]))) throw new Error('Usage: node scripts/status.mjs [--check | --refresh]')
  let catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'))
  if (args[0] === '--refresh') {
    catalog = await refresh(catalog)
    await writeFile(new URL('catalog.json', root), JSON.stringify(catalog, null, 2) + '\n')
  }
  const markdown = render(catalog)
  if (args[0] === '--check') {
    if (await readFile(new URL('README.md', root), 'utf8') !== markdown) throw new Error('README differs from catalog; run node scripts/status.mjs')
  } else await writeFile(new URL('README.md', root), markdown)
  console.log('Software status validated.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
