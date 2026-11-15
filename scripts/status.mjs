import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = new URL('../', import.meta.url)
const maintenance = { active: '🟢 持续维护', paused: '🟡 维护暂停', discontinued: '⚪ 停止维护' }
const stages = { 'public-beta': '公开测试', stable: '正式发布' }
const studioRepository = 'poniard-li/DEX-Studio-Software-Status'
const mysteryOrigin = 'https://mystery.mydex.top'
const text = (value) => String(value).replace(/[|<>\r\n\[\]]/g, ' ').trim()

export function validate(catalog) {
  if (!Array.isArray(catalog.software) || !catalog.software.length) throw new Error('Software list is empty')
  const seen = new Set()
  for (const item of catalog.software) {
    const website = item.source === 'website'
    if (item.source && !['website', 'github'].includes(item.source)) throw new Error('Invalid source')
    if (!item.name || (website ? item.homepage !== mysteryOrigin || item.id !== 'mystery' : !/^poniard-li\/[A-Za-z0-9_.-]+$/.test(item.repository))) throw new Error('Invalid software identity')
    const identity = website ? item.id : item.repository
    if (seen.has(identity)) throw new Error('Duplicate repository or website')
    seen.add(identity)
    if (!maintenance[item.maintenance] || !stages[item.stage]) throw new Error('Invalid status')
    if (!Array.isArray(item.platforms) || !item.platforms.length || item.platforms.some(p => typeof p !== 'string' || !p.trim())) throw new Error('Invalid platforms')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.checkedAt) || new Date(item.checkedAt).toISOString().slice(0, 10) !== item.checkedAt) throw new Error('Invalid review date')
    if (!/^v?\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(item.releaseTag) || item.releaseTag.replace(/^v/, '') !== item.version) throw new Error('Version and release tag differ')
    if (website && (item.download !== `${mysteryOrigin}/api/download` || item.releaseApi !== `${mysteryOrigin}/api/release` || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.sizeBytes) || item.sizeBytes <= 0 || !/^DEX-Setup-[0-9.]+-x64\.exe$/.test(item.filename) || item.filename !== `DEX-Setup-${item.version}-x64.exe`)) throw new Error('Invalid website release metadata')
    for (const key of ['guide', 'changelog', ...(item.history ? ['history'] : [])]) {
      const url = new URL(item[key])
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' || !url.pathname.startsWith(`/${website ? studioRepository : item.repository}/`) || url.username || url.password || /[\s()<>]/.test(item[key])) throw new Error('Documentation must use the official repository')
    }
    if (item.maintenance === 'discontinued' && !item.migration) throw new Error('Discontinued software needs migration guidance')
  }
}

export function render(catalog) {
  validate(catalog)
  const entries = catalog.software.map(item => {
    const website = item.source === 'website'
    const home = website ? item.homepage : `https://github.com/${item.repository}`
    return { ...item, home, website,
      downloadUrl: website ? item.download : `${home}/releases/tag/${encodeURIComponent(item.releaseTag)}`,
      historyUrl: item.history || `${home}/releases` }
  })
  const rows = entries.map(item =>
    `| **[${text(item.name)}](${item.home})** | ${maintenance[item.maintenance]} | ${item.platforms.map(text).join(' / ')} | ${text(item.version)} | [下载](${item.downloadUrl}) · [指南](${item.guide}) | [${item.website ? '官网' : '仓库'}](${item.home}) |`
  ).join('\n')
  const installs = entries.map(item =>
    `| **${text(item.name)}** | ${item.platforms.map(text).join(' / ')} | [${stages[item.stage]} ${text(item.version)}](${item.downloadUrl}) | [安装与使用](${item.guide}) |`
  ).join('\n')
  const details = entries.map(item => `### ${text(item.name)}

**${stages[item.stage]} · ${item.platforms.map(text).join(' / ')}**

${item.website ? '官网与安装包使用 D.E.X 名称。安装包信息、文件校验值和使用说明见下载指南。' : '提供订阅管理、代理组切换和主题设置。安装与配置步骤见使用指南。'}

[下载当前版本](${item.downloadUrl}) · [使用指南](${item.guide}) · [${item.website ? '版本记录' : '更新日志'}](${item.changelog}) · [历史版本](${item.historyUrl})

最近核对：${item.checkedAt}。`).join('\n\n')
  const inactive = entries.filter(item => item.maintenance !== 'active').map(item =>
    `- **[${text(item.name)}](${item.home})**：${item.maintenance === 'paused' ? '维护暂停，已发布版本仍提供下载；恢复常规更新的时间以正式公告为准。' : `停止维护。${text(item.migration)}`}`
  ).join('\n')
  const history = entries.map(item =>
    `| **${text(item.name)}** | [查看历史版本](${item.historyUrl}) | ${item.website ? '已核对的历史记录见版本页，下载开放范围以页面标注为准。' : '按 Release 选择版本，查看对应说明与附件。'} |`
  ).join('\n')
  return `# D.E.X Studio Software Status

**D.E.X Studio 软件导航 · 维护状态 · 最新下载 · 历史版本**

集中查看软件维护状态、支持平台和官方发布入口。

[软件总览](#-软件总览) · [快速安装](#-快速安装) · [软件介绍](#-软件介绍) · [历史版本](#-历史版本) · [反馈](https://github.com/${studioRepository}/issues)

## 📊 软件总览

> 🟢 持续维护 · 🟡 维护暂停 · ⚪ 停止维护

| 软件 | 维护状态 | 适配平台 | 当前版本 | 下载 / 指南 | 项目入口 |
| :--- | :---: | :--- | :--- | :--- | :--- |
${rows}

维护状态与发布阶段分别标注。公开测试版仍在完善功能与兼容性；正式版的支持范围以软件说明为准。

---

## ⚡ 快速安装

| 软件 | 系统 | 当前发布 | 安装说明 |
| :--- | :--- | :--- | :--- |
${installs}

1. 选择软件，确认系统和安装包架构相符。
2. 从上表进入官方发布页或官网下载，按对应指南安装。
3. 升级前备份个人配置，并阅读版本说明。

目前收录的平台：**${[...new Set(entries.flatMap(item => item.platforms))].map(text).join(' / ')}**。其他平台将在正式提供下载后收录。

---

## 🧭 软件介绍

${details}

---

## 🕘 历史版本

| 软件 | 版本归档 | 下载说明 |
| :--- | :--- | :--- |
${history}

历史版本可能存在已知问题，请先阅读对应版本说明。尚未提供独立下载地址的记录不作为可下载版本展示。

---

## ⏸ 维护暂停与停止维护

${inactive || '当前没有维护暂停或停止维护的软件。'}

${entries.some(item => item.maintenance === 'discontinued') ? '### 迁移说明\n\n停止维护软件的替代方案与数据迁移要求见上方项目说明。\n\n' : ''}维护暂停表示暂不提供常规更新；停止维护表示不再提供常规更新。两者均由维护者确认，不根据提交频率自动判断。

## 💬 支持与反馈

- **使用问题**：通过对应软件指南中的渠道反馈。
- **链接或版本有误**：在[本仓库提交反馈](https://github.com/${studioRepository}/issues)。
- **目录变化**：查看[更新记录](CHANGELOG.md)。

核对日期表示最近一次版本信息核验日期。本页展示维护与发布信息，不代表账号、下载等在线服务的实时运行状态。

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
    if (item.source === 'website') {
      const response = await fetcher(item.releaseApi, { signal: AbortSignal.timeout(20000), redirect: 'error' })
      if (!response.ok) throw new Error(`Website request failed (${response.status})`)
      const release = await response.json()
      if (release.available !== true || release.fileAvailable !== true || release.channel !== 'stable' || release.version !== item.version || release.sha256 !== item.sha256 || release.sizeBytes !== item.sizeBytes || release.filename !== item.filename) throw new Error('Website release changed or unavailable; review the download before updating the catalog')
      item.checkedAt = today
      continue
    }
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
