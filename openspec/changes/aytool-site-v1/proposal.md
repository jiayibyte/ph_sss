# Proposal: AyTool 菲律宾工资工具站 v1（一次性全量交付）

> 状态：待实现（用户已批准方案，尚未开始开发）
> 日期：2026-08-19
> 上游输入：`docs/research/` 下的三份文档（完整方案 v1.1 / PRD v1.0 审定 / SERP Phase 0 验证报告）

## Why（为什么做）

- 目标：一个面向菲律宾用户的工资/法定缴费计算工具站，**日均 1000 自然访问**（GSC organic clicks + GA4 organic sessions 口径），不要求盈利。
- 选题依据（已验证，非假设）：30+ 关键词 SERP 实测显示菲律宾 payroll 词群前排是独立小站、弱质结果与「有搜索无工具」缺口（holiday pay / back pay 前排零交互工具）；同市场 Flippa 验证案例月 UV 5–6.5 万，量级天花板足够。
- 时间窗口：13th month pay 词群每年 11–12 月爆发，**10 月中前上线并完成收录**可吃到全年最大脉冲。

## What Changes（交付什么）

从零建站，一次性交付（不分阶段）：

1. **共用层**：Astro 站点骨架、统一 Calculator Engine、版本化规则数据层（JSON）、页面模板、内链体系、sitemap/robots/canonical/OG。
2. **13 个内容/工具页（含首页）**：首页、SSS Contribution Table、SSS Calculator、13th Month Pay、PhilHealth、Pag-IBIG、Take-home Pay、Holiday Pay、Night Differential、Final/Back Pay、Overtime、OEC Exemption Guide、PRC Exam Schedule。
3. **5 个信任页**：About / Methodology / Sources / Privacy / Disclaimer。
4. **部署链路**：构建产物部署到自有服务器（nginx）+ 自有 CDN；接入 Google Search Console。

品牌已定：**AyTool**（域名 aytool.com，用户已持有，Wayback 历史核查干净）；slogan `Ay! May tool para diyan.`（仅用于 hero/页脚/OG 图，SEO 位用描述性定位语）。

## Non-Goals（明确不做）

- 不做政府账号登录、不收集 SSS/PhilHealth/Pag-IBIG 账号、密码、OTP、证件号。
- 不冒充任何政府机构（SSS/PhilHealth/Pag-IBIG/DOLE/DMW/PRC）；不做形似官方的 status checker；真实查询动作一律跳官方站。
- 不做博客/资讯流首页；不做与菲律宾 payroll 无关的任何工具（主题纯度硬约束）。
- 第一版不做变现、不做多语言、不做用户系统。
- 不用 Cloudflare（用户自有服务器 + CDN）。

## Impact（影响面）

- 全新独立项目，与 talea 无关；本仓库（ph_sss）为项目根。
- 上线后运营动作仅两类：按官方节奏更新规则 JSON（年更缴费表 + 节前更新 holiday 年历）；按 GSC 数据决定扩页方向（90 天 Go/Pivot/Stop 门槛见 design.md）。

## 验收概要（详见 tasks.md 末章）

- 四个缴费引擎计算结果与官方当前 Schedule 逐条一致（人工复核）。
- 全部 18 页（13 内容/工具 + 5 信任）移动端 CWV 达标、Calculator 首屏可见、Title/H1 唯一；sitemap 提交 Google/Bing 的可索引 URL = 18（404 页 noindex 不计入）。
- 每个结果卡显示规则版本 / 生效日期 / 核验日期 / 官方来源。
- 全站含 not-affiliated 声明；不收集敏感输入；计算纯 client-side。
