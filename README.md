# AyTool — Philippine Payroll & Contribution Calculators

> Ay! May tool para diyan.

菲律宾工资/法定缴费计算工具站。独立站点，与任何菲律宾政府机构无关。

- 域名：aytool.com（已持有）
- 目标：日均 1000 自然访问（GSC organic clicks 口径），不要求盈利
- 技术：Astro + React 岛屿 + Tailwind，纯静态构建，自有服务器 nginx + 自有 CDN 部署

## 文档导航

| 位置 | 内容 |
|---|---|
| [openspec/changes/aytool-site-v1/proposal.md](openspec/changes/aytool-site-v1/proposal.md) | 为什么做、交付什么、明确不做什么 |
| [openspec/changes/aytool-site-v1/design.md](openspec/changes/aytool-site-v1/design.md) | 技术选型、站点结构与关键词分配、数据层、SEO 规格、部署、风险 |
| [openspec/changes/aytool-site-v1/tasks.md](openspec/changes/aytool-site-v1/tasks.md) | 一次性全量交付的任务清单 + 验收门禁 |
| [docs/research/竞品分析.md](docs/research/竞品分析.md) | 六类竞品分档 + 开发前侦察清单 + 差异化总结 |
| [docs/research/](docs/research/) | 上游调研归档：完整方案 v1.1、PRD v1.0、SERP Phase 0 验证报告、三大市场选型 v3.1 |

## 当前状态

**v1 代码全量完成（2026-08-19），待部署。** 全部 18 页（13 内容/工具 + 5 信任）、8 个计算引擎（41 条官方示例值单测全过）、数据层 8 个规则 JSON（逐项对官方来源核验）、SEO/GEO 层、infra 部署文件均已交付。剩余为需要服务器/账号权限的上线动作，清单见 [infra/README.md](infra/README.md)。

- 代码仓库：https://github.com/jiayibyte/ph_sss
- 本地开发：`npm install && npm run dev`；测试：`npm test`；构建：`npm run build`
- 部署：配置 `infra/deploy.sh` 顶部的服务器变量后 `make deploy`（原子发布，`make rollback` 回滚）
- GA4：申请 measurement ID 后填入 `site.config.ts` 的 `ga4Id`（留空 = 不注入任何分析脚本）

## 硬红线（写在最前面）

1. 不冒充任何政府机构；不收集账号/密码/OTP/证件号；查询动作一律跳官方站。
2. 缴费费率数字只来自官方来源，禁止从竞品站抄；上线前逐条人工复核。
3. 站内 100% 菲律宾 payroll 主题，不放无关工具。
