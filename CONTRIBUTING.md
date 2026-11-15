# 维护指南

使用 Node.js 24，无需安装依赖。

## 更新软件信息

`catalog.json` 是软件信息的统一来源。修改后执行：

```sh
node scripts/status.mjs
node scripts/status.mjs --check
node --test scripts/status.test.mjs
```

新增软件前，确认仓库与下载已公开。维护状态由维护者明确设置；停止维护时填写 migration 迁移说明。平台按实际提供的安装包填写，不能将计划支持的平台列为已支持。

## 同步公开版本

在 Actions 中选择 **Refresh software versions**，点击 **Run workflow**。工作流核对公开仓库的 Release，更新版本、发布阶段和核对日期，再提交软件目录与首页。维护状态和支持平台不会自动修改。

也可以在本地执行 `node scripts/status.mjs --refresh`。请求失败时保留现有信息，不将软件标记为故障或停止维护。

首页由目录生成，请修改目录或生成脚本后重新生成。更新记录只描述用户能看到的信息变化。
