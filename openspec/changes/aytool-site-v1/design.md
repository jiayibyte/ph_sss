# Design: AyTool 菲律宾工资工具站 v1

> 配套 proposal.md；实现任务清单见 tasks.md。

## 1. 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | **Astro**（最新稳定版）+ TypeScript | 构建期输出纯 HTML（Googlebot 免执行 JS 即读全文）、默认零 JS、CWV 天然高分；State of JS 静态框架满意度连年第一，内容型站点事实标准 |
| 交互组件 | **Preact 岛屿**（`@astrojs/preact`，React 语法兼容），仅计算器用 | 运行时 ~4KB gzip（React 约 45KB，为极致性能弃用）；18 页里 90% 纯静态，计算器局部 hydrate，JS 载荷最小化 |
| 样式 | Tailwind CSS（`@astrojs/tailwind`）+ 主题 CSS 变量 | purge 后 ~10KB；强调色经 CSS 变量单点配置（见 §7） |
| 数据层 | 版本化 JSON（构建期注入，见 §3） | 规则变化只改数据不改代码 |
| 构建产物 | `dist/` 纯静态文件 | 服务器无需 Node 运行时 |
| 分析 | **GA4（经 `@astrojs/partytown` 跑在 Web Worker）** + Google Search Console | 用户要求接 GA4；Partytown 把 gtag.js 挪出主线程，INP 零损耗。**硬规则：事件只记页面级行为，永不发送用户输入的工资数值**；/privacy/ 如实披露 GA4 与 cookie |

## 2. 站点结构与关键词分配（防吃自己的硬分配）

```text
/                                  P0  首页：工具卡片矩阵，无博客流
/sss-contribution-table/           P0  独占: table / 2026 / monthly contribution 系词
/sss-contribution-calculator/      P0  独占: calculator / how to compute 系词
/13th-month-pay-calculator/        P0  Simple + Accurate（逐月）双模式
/philhealth-contribution/          P0  calculator + table 合页
/pagibig-contribution/             P0  calculator + table 合页
/take-home-pay-calculator/         P1  旗舰复合工具（四险一税拆解），全站内链枢纽
/holiday-pay-calculator/           P1  节日类型×是否上班×时薪→倍率拆解 + 年度节假日历区块
/night-differential-calculator/    P1  10PM–6AM 时段 ×日型 ×OT 组合
/final-pay-calculator/             P1  Final/Back Pay 合页（DOLE LA 06-20 同概念）
/overtime-pay-calculator/          P1  日型×OT 倍率；holiday 仅作输入维度不建薄页
/oec-exemption/                    P2  纯指南页（SERP 实测弱，回报预期高）
/prc-board-exam-schedule/          P2  可筛选考试日历表
/about/ /methodology/ /sources/ /privacy/ /disclaimer/   信任层
```

规则：
- URL 永不带年份；年度更新改同一 URL 的数据 + Title + 更新时间。
- P0/P1/P2 = 内链权重与首页排位（P0 五件套占首页首排、获最多内链），不是排期。
- SSS 表格页内嵌 Salary Lookup 组件（体验），但主 CTA 指向计算器页；两页 Title/H1/首段不互蹭关键词。
- 每页 Title/H1/覆盖词遵循 PRD v1.0 §4–§6 规格（见 docs/research/ 归档），其中 `how to compute sss contribution` 划归计算器页独占。

## 3. 数据层（版本化规则 JSON）

```text
src/data/
├── sss/2026.json            # 官方 Schedule 全表（MSC 区间×4 member types）
├── philhealth/2026.json     # rate / floor / ceiling / member types
├── pagibig/2026.json        # 费率 + MFS ceiling
├── labor/2026.json          # 节假日倍率矩阵 / ND 10% / OT 倍率 / 13th month 规则
├── holidays/2026.json       # 当年官方 Proclamation 节假日清单（Regular / Special）
├── tax/2026.json            # BIR 预扣税表（take-home 计算用）
└── prc/2026.json            # PRC 考试日历
```

每个文件必含元数据：`effective_from / effective_to / last_verified / official_source_url / rule_version`。
硬规则：**费率数字禁止散落在组件里；禁止从竞品站抄数字，一律官方来源人工录入 + 上线前逐条复核。**

## 4. Calculator Engine（共用规格）

- 纯函数核心：`(input, rulesJson) => ResultBreakdown`，与 UI 解耦，可单测。
- 输入：₱ 千分位格式化、`inputmode="numeric"`、非法输入即时提示、Salary 越界自动落入官方 floor/ceiling 规则。
- 结果卡统一含：Estimated 金额、逐项 Breakdown、`Schedule used / Effective from / Last verified / Official source`。
- 一键 Reset、可复制结果；默认不保存任何输入；分析工具不记录输入值。
- 每个计算器 = 一个 React 岛（`client:visible`），页面其余部分零 JS。

## 5. SEO 规格（显式清单）

1. **渲染**：全站构建期静态 HTML，无 CSR 依赖——爬虫可读性满分。
2. **元信息**：每页唯一 Title（≤60 字符，含年份在 Title 不在 URL）+ meta description + canonical + OG/Twitter 卡。
3. **页面模板**（每个工具页）：H1 → 一句话直接回答 → Calculator（首屏）→ Current Rule/Table → How It Is Calculated → Examples（≥3 个）→ Who This Applies To → Official Source → FAQ → Related Calculators。
4. **结构化数据**（如实标注，不夸大）：工具页 `WebApplication` + `FAQPage`（FAQ 须为真实问题）；PRC 日历可加 `Dataset`；全站 `Organization`（标注 independent）。
5. **内链**：PRD §11 拓扑 + take-home 页作枢纽（四险一税每项链回对应工具页）；页脚 Related Philippine Payroll Calculators 区块；无孤儿页。
6. **技术项**：sitemap.xml（`@astrojs/sitemap`）、robots.txt、301 规范（www→裸域或反之，全站唯一主机名）、图片 `loading="lazy"` + 显式宽高（零 CLS）、字体本地托管。
7. **E-E-A-T 信任层**：methodology/sources 页 + 每页官方来源引用 + last_verified 日期外显 + not-affiliated 声明——钱相关内容的核心排名要素。
8. **新鲜度（真实的）**：缴费表随官方年更；holiday 年历随 Proclamation 更新且大节前 1–2 周刷新页面日期与内容；13th month 页 10–12 月核验更新。
9. **CWV 验收**：移动端 LCP < 2.5s / CLS < 0.1 / INP < 200ms（真机 + 慢网测）。
10. **红线**：不用官方 logo/配色仿制；域名/子域不含机构名；FAQ 不批量生成同义句（scaled content 红线）。
11. **上线动作**：GSC 验证 + 提交 sitemap；**Bing Webmaster Tools 从 GSC 一键导入**（Bing 索引喂 ChatGPT search/Copilot 与 DuckDuckGo，与 AI 引用渠道联动）；**IndexNow** key 文件 + deploy 时 ping（Bing 系即时收录）；90 天门槛——0–30 天看索引与 impressions，31–60 天只扩有 impression 的集群，61–90 天 Go（扩到 60–80 页/复制第二市场）/ Pivot（改意图强化工具）/ Stop（停簇不恋战）。
12. **AI 搜索引用友好**：robots.txt 显式 Allow GPTBot / ClaudeBot / PerplexityBot / Google-Extended——AI 助手回答「菲律宾 X 工资扣多少 SSS」时需要可引用的干净数据源，本站的结构化表格 + 官方来源 + last_verified 是理想引用对象（2026 年真实增量渠道，参考 calicrash 实践）。
13. **冷启动预期（显式写死，防止误读门槛）**：新域名 Google 冷启动 6–12 个月属正常，头半年低流量**不是失败信号**；90 天门槛判定的是 impressions 趋势与集群信号，不是绝对流量。aytool.com 为 2002 年注册的老域名（长期空置、无惩罚史），略优于全新域名。0–6 个月流量主力预期来自 Facebook 分发与 AI 引用，Google 是 6 个月后的主渠道。

## 5.4 GEO（生成式引擎优化）规格

> 目标：让 ChatGPT / Perplexity / Copilot / Google AI Overviews 在回答菲律宾工资缴费问题时引用本站。本站的查询类型（"how much SSS for ₱20k salary"）正是用户直接问 AI 的问题形态，GEO 与 SEO 同权重对待。

**基建层（已在 SEO 规格，此处汇总）**：robots.txt 放行 GPTBot/ClaudeBot/PerplexityBot/Google-Extended；Bing 索引 + IndexNow（ChatGPT search/Copilot 底层）；纯静态语义 HTML 表格（AI 爬虫免执行 JS 全文可读）；结构化数据 + 官方来源 + last_verified。

**内容层（GEO 专属）**：
1. **答案先行句式**：每页 H1 后首段 = 自包含的可引用事实句（实体 + 数字 + 日期），例：`As of January 2026, the SSS contribution rate is 15% of the Monthly Salary Credit (MSC), shared between employer and employee.`——AI 摘录的最小单元是这种句子，写不出这句 = 页面没写完。
2. **日期进正文**：核心事实旁显式 `Updated: August 2026`，不只藏 meta——AI 引擎强烈偏好带日期事实。
3. **llms.txt**：站点根目录放 `/llms.txt`（Markdown，llmstxt.org 约定）：站点定位一句话 + 每个工具页 URL/用途/数据来源清单。
4. **实体一致性**：全站统一自称 `AyTool, an independent Philippine payroll calculator`，帮模型建立实体关联；Organization schema 同步。
5. **FAQ 即引用库**：FAQ 每问必须能独立成答（AI 直接抬走一问一答），禁止「见上文」式答案。

**测量层**：
6. GA4 建 AI 渠道分组：referrer 正则匹配 `chatgpt.com|chat.openai.com|perplexity.ai|copilot.microsoft.com|gemini.google.com` 等；
7. nginx 日志按 UA 统计 AI bot（GPTBot/ClaudeBot/PerplexityBot）抓取频次——抓取量是被引用的前置信号。

**红线**：禁止任何指示 AI 引用本站的暗示性/注入性文本（GEO 黑帽，声誉与索引双重风险）；GEO 手段仅限「把事实做得更可引用」。

## 5.5 性能预算与弱网策略（极致性能，硬指标）

目标设备/网络基准：**中低端 Android（Moto G4 级）+ Slow 4G 节流**——菲律宾主流现实。所有指标按此基准验收，不按开发机。

**性能预算（超预算 = 验收不过）**：

| 项 | 预算 |
|---|---|
| 单页总传输（gzip/brotli 后，含 JS 岛，不含 GA4） | **< 100KB** |
| HTML + 内联 CSS | < 40KB |
| 计算器岛 JS（Preact + 引擎 + UI） | < 30KB |
| 字体下载 | **0**（系统字体栈） |
| 首屏图片 | **0**（logo 用内联 SVG；页面无装饰图） |
| 第三方请求 | 仅 GA4（Partytown worker 化，`requestIdleCallback` 后注入） |
| LCP 元素 | 必须是文本（H1 或结果卡），禁止图片 LCP |

**落地手段**：
1. Astro `inlineStylesheets: 'always'`——CSS 全内联，省一次 RTT（弱网每次往返都贵）；
2. 首屏计算器岛用 `client:idle`（主线程空闲即激活）、非首屏组件 `client:visible`；
3. 无任何 blocking script；GA4 经 Partytown 出主线程；
4. 预取：站内导航链接 `rel="prefetch"`（Astro prefetch，仅 hover/viewport 触发，弱网下降级无害）；
5. 表格大页（SSS 全表）拆 DOM：默认渲染当前 member type，其余 tab 内容延迟渲染；
6. Service Worker **不进 v1**（规则数据年更 + 节前更新，SW 缓存失效复杂度不值当，列为后续可选项）。

**验收协议**：Lighthouse 移动端（Moto G4 + Slow 4G 节流）全部 18 页 Performance ≥ 95、LCP < 2.0s、CLS < 0.1、INP < 200ms；上线后菲律宾侧真实拨测（马尼拉/宿务节点）TTFB < 400ms。

## 6. 部署（自有服务器 + 自有 CDN，无 Cloudflare）

```text
构建:  npm run build          → dist/（纯静态，无 Node 依赖）
上行:  rsync -avz --delete dist/ user@server:/var/www/aytool/
CDN:   自有 CDN 回源到 nginx；确认含东南亚/海外边缘节点（目标用户在菲律宾 + Googlebot 可达性）
```

nginx 要点：

```nginx
server {
  listen 443 ssl http2;
  server_name aytool.com;
  root /var/www/aytool;

  # 指纹资产：一年 immutable
  location /_astro/ { add_header Cache-Control "public, max-age=31536000, immutable"; }

  # HTML：CDN 边缘短 TTL + ETag（弱网下边缘命中远快于回源；
  # 规则更新靠 deploy 后主动刷新 CDN，不牺牲所有用户的 TTFB）
  location / {
    add_header Cache-Control "public, max-age=600";
    etag on;
    try_files $uri $uri/index.html =404;
  }

  error_page 404 /404.html;   # 自定义 404（带工具导航）

  # 安全响应头（钱相关站点信任基线）
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  # CSP：静态站可收紧；GA4/Partytown 域名按实际接入放行
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com; img-src 'self' data: https://*.google-analytics.com" always;

  gzip on;            # 有 brotli 模块则优先 brotli
}
# 80 → 301 https；www 与裸域二选一做主域，另一个 301（全站唯一主机名）
```

**原子部署 + 回滚**：不用 `rsync --delete` 直接覆盖 web root——按 `releases/<timestamp>/` 上传，`/var/www/aytool` 是指向当前 release 的软链，切软链 = 原子发布，回滚 = 软链指回上一版（保留最近 5 个 release）。`make deploy` = build → rsync 到新 release 目录 → 切软链 → CDN 刷新 → IndexNow ping。规则 JSON 更新走同一条链路。

**基建入库**：nginx 配置、deploy 脚本、llms.txt、robots.txt 全部进 git 仓库（`infra/` 目录）——服务器可随时重建。**项目仓库：https://github.com/jiayibyte/ph_sss**。

## 7. UI / 品牌视觉规范

**基调：fintech-clean**——视觉信任锚点是菲律宾人天天用的钱包 App（GCash / Maya / NextPay），不是竞品。SERP 在位竞品的 UI 全是洼地（sweldongpinoy 陈旧、philpad/requirementph 广告堆砌、sprout B2B 企业风），**干净本身就是差异化**。

| 项 | 规范 |
|---|---|
| 配色 | 白底 + 单一强调色（青绿或靛蓝系）。**红线：禁用蓝+红+黄组合**（菲律宾国旗/政府视觉，撞上即违反不仿官方原则） |
| 布局 | 卡片式；结果金额用大号字（₱12,345.67，像钱包 App 余额）；Breakdown 折叠展开 |
| 字体 | **系统字体栈**（`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`）——零字体下载，弱网首屏最优；仅 light 主题（dark 不在 v1） |
| 主题色配置 | 强调色 = `site.config.ts` 单点配置，映射到 `:root` CSS 变量（`--accent` / `--accent-strong` / `--accent-soft`）；内置 3 个预校对比度（AA）的色板：**teal（默认）/ indigo / green**，切换 = 改一行配置重建；全站组件只允许取变量，禁止硬编码色值 |
| 移动端 | 目标设备 = 中低端 Android + 预付费流量：无 hero 大图、无视频、图片能省则省（与 CWV 验收同一件事）；大拇指点击区；表格小屏折叠成卡片 |
| 分享 | FB + Messenger 原生分享按钮（菲律宾流量文化围绕 Facebook）；OG 分享图做品牌模板（slogan 可上 OG 图） |
| 文案 | 英文为主；FAQ 问题句允许 Taglish 问法（贴搜索习惯）；微文案克制使用 slogan 语气 |
| 广告 | **v1 零广告**——既是干净 UI 的组成，也是对广告站群竞品的直接反差；变现留待流量稳定后再议 |

## 8. 内容策略（文章页）

**v1 = 0 篇独立文章。** 工具页自带文章级内容（How it's calculated / ≥3 worked examples / FAQ），这就是本赛道排名页的标准形态，不需要博客。

上线后按 GSC 数据长出 `/guides/<slug>/` 层（常青问答页，非资讯流）：

1. **选题来源**：只做 GSC 已出现 impression 的真实问句（如 "is 13th month pay taxable" / "when is 13th month pay released"）+ 自动补全实证词；不做臆测选题。
2. **生产流程**：官方来源先行（先找到 DOLE/SSS/PhilHealth 依据再动笔）→ AI 起草 → 校对 → 带 last_verified + Sources 区块发布；复用 ToolPageLayout（去掉计算器岛）。
3. **反 scaled-content 纪律**（ZEN Calculators 反例：5,100 页仅 1,191 PV/月）：每篇必须有独有价值（表格/判例/决策树）；禁止同义词铺页；禁止无信号批量生成。
4. **节奏上限**：每月 ≤5–10 篇，且只加进有流量信号的簇；每篇与对应工具页双向内链。

**程序化扩页预留（两条弹药库，均有开闸条件，v1 不建）**：

| 弹药库 | 形态 | 开闸条件 |
|---|---|---|
| 逐节日页 | `/holiday-pay/<holiday-slug>/` 固定 URL ×18 个/年，年年原地更新（吃节前 "double pay <节日>" 爆发搜索，新闻报道会过期而固定 URL 累积权重） | GSC 中 holiday 集群出现 impressions 后，先建最近 2–3 个节日试点 |
| Salary 定点页 | `/sss-contribution/<salary>-salary/` 等（数据层天然支持批量生成，印度 NBFC 已验证此模式有效） | **仅当** GSC 出现 "for X salary" 类 query 才建——无信号硬铺 = ZEN Calculators 反例（5,100 页 1,191 PV）的死法 |

**Facebook 分发规格（升级）**：不止发链接——**缴费表做成可转发图卡**（菲律宾 FB 群组文化里表格图片的传播力远大于链接），图卡带品牌水印 + 短链回站；节假日倍率提醒同理。TikTok 科普短视频列为可选（菲律宾是 TikTok 重度市场），不进 v1 承诺。

## 9. 上线运营手册（年度日历 + 监控）

### 年度规则更新日历（唯一的持续运营义务，逐项对官方源）

| 时间 | 动作 | 官方源 |
|---|---|---|
| 12 月–1 月 | 核查次年 SSS Schedule（历年 1 月生效）、PhilHealth premium advisory、Pag-IBIG circular → 更新对应 JSON + last_verified + 页面 Title 年份 | sss.gov.ph / philhealth.gov.ph / pagibigfund.gov.ph |
| Q3–Q4 | 次年节假日 Proclamation 发布 → 更新 holidays JSON | Malacañang / Official Gazette |
| 10 月中 | 13th month 页全面核验 + FAQ 补充（11–12 月大脉冲前） | DOLE 年度 Labor Advisory |
| 11 月前后 | PRC 次年考试日历 Resolution → 更新 prc JSON | prc.gov.ph |
| 每年 Q2 | BIR 预扣税表核查（税档变动年份） | bir.gov.ph |
| 每逢大节前 1–2 周 | holiday 页刷新（内容 + 更新日期） | — |
| 每月 10 分钟 | GSC + GA4 AI 渠道看板；D30/D60/D90 按 90 天门槛做决策 | — |

### 监控与联系

- **可用性拨测**：免费 uptime 监控（如 UptimeRobot）指向首页 + 一个工具页，挂了邮件告警——站挂 = 流量静默流失。
- **联系邮箱**：`contact@aytool.com` 域名邮箱转发（注册商/服务器别名均可），About/Methodology 页外显——纠错反馈通道是 E-E-A-T 的组成部分。
- **日志**：nginx 日志 logrotate；每月看一眼 AI bot 抓取统计（GEO 前置信号）。

## 10. 风险与对策

| 风险 | 对策 |
|---|---|
| 缴费数字算错（比没流量更致命） | 上线前四引擎对官方 Schedule 逐条人工复核；引擎纯函数 + 边界用例单测；页面外显核验日期与来源 |
| 被误认为官方（法律/Google scam 双红线） | proposal Non-Goals 全套执行；每页 not-affiliated；查询动作跳官方 |
| CDN 无海外节点导致菲律宾访问慢/收录差 | 上线前实测菲律宾侧延迟（在线拨测）；不达标则 CDN 加海外节点或换边缘 |
| KP 量级桶失真 | 一切以 GSC 实测重排优先级（90 天门槛） |
| 单渠道依赖 Google | 上线后开 Facebook 主页发缴费表/节假日倍率提醒（每月 2–4 帖） |
