# Tasks: AyTool 菲律宾工资工具站 v1（一次性全量交付）

> 顺序 = 依赖顺序，不是排期。全部完成 + 末章验收通过 = v1 交付。

## 0. 脚手架

- [x] 0.1 `npm create astro@latest`（TypeScript strict）+ `@astrojs/preact` + `@astrojs/tailwind` + `@astrojs/sitemap` + `@astrojs/partytown`；Astro 配置 `inlineStylesheets: 'always'` + prefetch
- [x] 0.2 项目结构：`src/layouts/`（BaseLayout / ToolPageLayout）、`src/components/`、`src/islands/`（Preact 计算器）、`src/data/`、`src/pages/`、`infra/`
- [x] 0.3 BaseLayout：Title/meta/canonical/OG 插槽、`Organization` schema、导航 + 页脚（not-affiliated 声明 + slogan `Ay! May tool para diyan.` + Related 区块插槽）
- [x] 0.4 设计 token 与基调（design.md §7）：白底 + 强调色 CSS 变量体系（`site.config.ts` 单点配置，内置 teal/indigo/green 三色板，AA 对比度预校，**禁蓝红黄政府配色**、组件禁硬编码色值）、卡片式布局、结果大数字排版、表格小屏折叠、**系统字体栈（零字体下载）**、仅 light 主题、v1 零广告
- [x] 0.5 FB + Messenger 分享按钮组件 + OG 品牌图模板（slogan 上 OG 图）
- [x] 0.6 GA4 接入（经 Partytown 跑 Web Worker，idle 后注入）；事件白名单：仅 page_view + 计算器使用次数，**禁止上报任何输入数值**
- [x] 0.7 站点基线件：自定义 404 页（带工具导航）、favicon/apple-touch-icon/webmanifest（内联 SVG 派生）、`<html lang="en-PH">`、URL 尾斜杠全站一致（canonical 同步）
- [x] 0.8 git init + remote 设为 **https://github.com/jiayibyte/ph_sss**；nginx 配置 / deploy 脚本 / robots.txt / llms.txt 入 `infra/` 目录

## 1. 数据层（先于一切页面）

- [x] 1.1 定义规则 JSON Schema（含 effective_from / effective_to / last_verified / official_source_url / rule_version 元数据），TS 类型生成
- [x] 1.2 录入 `sss/2026.json`：官方 Schedule of Contributions 全表 ×（Employee / Self-Employed / Voluntary / OFW）——来源 sss.gov.ph，禁抄竞品
- [x] 1.3 录入 `philhealth/2026.json`：rate / floor / ceiling / member types——来源 philhealth.gov.ph advisories
- [x] 1.4 录入 `pagibig/2026.json`：费率 + MFS ceiling——来源 pagibigfund.gov.ph circular
- [x] 1.5 录入 `labor/2026.json`：节假日倍率矩阵（Regular 200% / Special 130% / +Rest Day 组合）、ND 10%、OT 倍率、13th month 规则——来源 DOLE/BWC
- [x] 1.6 录入 `holidays/2026.json`：当年 Proclamation 节假日清单
- [x] 1.7 录入 `tax/2026.json`：BIR 预扣税表（TRAIN 现行档）
- [x] 1.8 录入 `prc/2026.json`：PRC Resolution 考试日历（职业/考期/报名窗口/官方链接）

## 2. Calculator Engine（纯函数层 + 冒烟测试）

- [x] 2.1 `computeSss(salary, memberType, rules)` → MSC 落档 + 双方 share 拆解（含 floor/ceiling 边界）
- [x] 2.2 `computePhilhealth` / `computePagibig`（同结构）
- [x] 2.3 `compute13thMonth(monthlyBasics[])`（Simple = 单值×月数；Accurate = 逐月数组；中途入职/离职天然覆盖）
- [x] 2.4 `computeHolidayPay(dayType, worked, restDay, hourlyRate, hours)` → 倍率拆解
- [x] 2.5 `computeNightDiff(hourly, shiftStart, shiftEnd, dayType, isOT)` → 10PM–6AM 逐小时计
- [x] 2.6 `computeOvertime(salary, otHours, dayType, nightHours?)`
- [x] 2.7 `computeFinalPay(模块化输入…)` → 加减项汇总（复用 2.3 做 pro-rated 13th month）
- [x] 2.8 `computeTakeHome(salary)` = 2.1+2.2+PagIBIG+税 组合，逐项拆解
- [x] 2.9 每个引擎 3–5 个官方示例值冒烟单测（vitest）——数字对不上不许继续

## 3. 计算器岛（Preact，共用 UI 规格）

- [x] 3.1 共用组件：CurrencyInput（千分位 + inputmode=numeric + 即时校验）、ResultCard（金额 + Breakdown + 规则版本/来源/核验日期 + 复制 + Reset）、MemberTypeTabs——**a11y 基线**：所有输入带 label、tabs 用 aria-selected、全键盘可操作、焦点样式不隐藏
- [x] 3.2 按引擎逐个包岛（首屏计算器 `client:idle`、非首屏 `client:visible`），确保无岛页面零 JS；SSS 全表默认只渲染当前 member type，其余 tab 延迟渲染

## 4. 页面（13 个 URL / 12 条任务——4.12 含两页；规格按 PRD §4–§7 + design.md §2 关键词分配）

- [x] 4.1 首页：工具卡片矩阵（P0 首排）、slogan hero、无博客流
- [x] 4.2 /sss-contribution-table/：全表 + Member Type 切换（不刷新不改 URL）+ Salary Lookup + 高亮对应行；独占 table 系词
- [x] 4.3 /sss-contribution-calculator/：独占 calculator / how to compute 系词；链回表格页
- [x] 4.4 /13th-month-pay-calculator/：Simple + Accurate 双模式；≥3 个 worked examples（含年中入职/离职/涨薪）
- [x] 4.5 /philhealth-contribution/：calculator + table 合页
- [x] 4.6 /pagibig-contribution/：calculator + table 合页
- [x] 4.7 /take-home-pay-calculator/：四险一税拆解，每项链回对应工具页（内链枢纽）
- [x] 4.8 /holiday-pay-calculator/：倍率计算 + 当年节假日历区块（数据驱动）
- [x] 4.9 /night-differential-calculator/
- [x] 4.10 /final-pay-calculator/（Final/Back Pay 合页 + 30 天释放 FAQ）
- [x] 4.11 /overtime-pay-calculator/（holiday 作输入维度）
- [x] 4.12 /oec-exemption/ + /prc-board-exam-schedule/（日历表：搜索/按月/按职业筛选/排序）

## 5. 信任页（5 个）

- [x] 5.1 /about/（独立站定位 + 联系方式）
- [x] 5.2 /methodology/（计算方法 + 数据来源机构 + 核验日期 + 纠错联系）
- [x] 5.3 /sources/（按机构列：SSS / PhilHealth / Pag-IBIG / DOLE·BWC / DMW / PRC，链官方）
- [x] 5.4 /privacy/（不存输入、不收敏感信息；如实披露 GA4 与 cookie、声明不上报输入数值）
- [x] 5.5 /disclaimer/（estimate 性质 + not-affiliated）

## 6. SEO 技术层（design.md §5 清单逐条落地）

- [x] 6.1 每页唯一 Title/H1/description/canonical；OG 图（品牌模板）
- [x] 6.2 结构化数据：WebApplication + FAQPage（真实问题）+ PRC Dataset
- [x] 6.3 sitemap.xml + robots.txt（**显式 Allow GPTBot/ClaudeBot/PerplexityBot/Google-Extended**，AI 引用渠道）；内链拓扑走查（无孤儿页）
- [x] 6.3b GEO 落地（design.md §5.4）：每页答案先行句 + 正文显式 Updated 日期 + `/llms.txt` + 实体一致性自称 + FAQ 独立成答走查
- [x] 6.3c GA4 AI 渠道分组（chatgpt/perplexity/copilot/gemini referrer 正则）+ nginx AI bot UA 日志统计
- [x] 6.4 性能预算执行（design.md §5.5）：单页总传输 <100KB、HTML+内联 CSS <40KB、岛 JS <30KB、零字体下载、零首屏图片、LCP 必须是文本元素
- [x] 6.5 Lighthouse 移动端（Moto G4 + Slow 4G 节流）全部 18 页 Performance ≥95、LCP<2.0s、CLS<0.1、INP<200ms

## 7. 部署

- [ ] 7.1 aytool.com DNS → 自有服务器；HTTPS 证书；www/裸域 301 唯一主机名
- [ ] 7.2 nginx 按 design.md §6 配置（指纹资产 immutable / HTML 短 TTL+ETag / gzip 或 brotli / 自定义 404 / **安全响应头 HSTS+CSP+XCTO+Referrer-Policy**）
- [ ] 7.3 `make deploy`：build → releases/<timestamp> → 切软链（**原子发布，保留 5 版可回滚**）→ CDN 刷新 → IndexNow ping
- [ ] 7.4 CDN 海外/东南亚节点确认 + 菲律宾侧拨测延迟
- [ ] 7.5 GSC 域名验证 + 提交 sitemap
- [ ] 7.6 Bing Webmaster Tools：从 GSC 一键导入站点与 sitemap（Bing 索引同时喂 ChatGPT search/Copilot 与 DuckDuckGo）
- [ ] 7.7 IndexNow：生成 key 文件放站点根目录，`make deploy` 末尾追加 ping（新页/更新页即时通知 Bing 系）
- [ ] 7.8 uptime 拨测（首页 + 1 个工具页，邮件告警）+ nginx logrotate
- [ ] 7.9 contact@aytool.com 邮箱转发配置，About/Methodology 页外显

## 8. 验收门禁（全过才算交付）

- [x] 8.1 四个缴费引擎与官方当前 Schedule **逐条人工复核一致**（Employee/SE/Voluntary/OFW 全 member type）
- [x] 8.2 13th month 双模式含年中入职/离职正确；Take-home 与四引擎单算结果一致
- [x] 8.3 移动端一次计算 ≤3 次主要操作；Calculator 首屏可见
- [x] 8.4 每个结果卡显示规则版本/生效日期/核验日期/官方来源
- [ ] 8.5 性能门禁：18 页全过 §5.5 预算 + 节流 Lighthouse ≥95；上线后菲律宾侧拨测 TTFB <400ms
- [x] 8.5b 18 页 Title/H1 唯一；sitemap 含全部 18 个可索引 URL（404 noindex）；robots/canonical 完整；GA4 事件确认无输入数值上报
- [x] 8.6 不收集敏感输入（代码走查）；全站 not-affiliated 声明在位
- [x] 8.7 slogan 仅出现在 hero/页脚/OG 图，SEO 位全部为描述性定位语
- [ ] 8.8 （上线后）slogan 与页面英文/Taglish 文案找 1–2 位母语者校验
- [ ] 8.9 上线收尾走查：404 页可达、favicon/manifest 在位、安全响应头生效（securityheaders.com 测 A 档）、结构化数据过 Rich Results 测试、uptime 探针绿、contact@ 邮箱收发通、回滚演练一次（切软链回上一版再切回）
- [x] 8.10 运营交接：design.md §9 年度日历设为日历提醒（12–1 月缴费表 / Q3–Q4 节假日 / 10 月 13th month / 11 月 PRC / Q2 税表 / 每月 GSC 十分钟）
