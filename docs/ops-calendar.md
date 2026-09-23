# AyTool 运营日历（年度规则更新 + 监控节点）

> 这是上线后唯一的持续运营义务（design.md §9 的落地版）。
> 配套 [infra/aytool-ops-calendar.ics](../infra/aytool-ops-calendar.ics) 可直接导入 Apple/Google 日历，全部提醒已设为年度循环。
>
> 每个节点的通用动作模式：**查官方源 → 有变化则更新 `src/data/` 对应 JSON（+ `last_verified` + 页面 Title 年份）→ `make deploy`（单测自动挡错）→ 无变化也要更新 `last_verified` 并部署一次（新鲜度信号）**。

## 一、年度固定节点（每年循环）

| 提醒日期 | 节点 | 具体动作 | 官方源 |
|---|---|---|---|
| **12 月 10 日** | 次年四险费率核查启动 | 查 SSS 次年 circular（历年 12 月中发布、1 月生效；15% 已是 RA 11199 最后一档，大概率不变但必须确认）、PhilHealth premium advisory、Pag-IBIG circular | sss.gov.ph / philhealth.gov.ph / pagibigfund.gov.ph |
| **1 月 5 日** | 新年度生效复核 + 换年 | 新建 `src/data/{sss,philhealth,pagibig,labor,tax}/<新年>.json`（SSS 全表用 `scripts/generate-sss-*.mjs` 改参数生成）；页面 Title/H1/答案句的年份全部 +1；llms.txt 年份与事实句同步；部署后 GSC 手动请求首页重新抓取 | 同上 |
| **2 月 20 日** | Eid'l Fitr 日期核查 | 斋月相关假日由单独 Proclamation 定（2026 年是 Proc. 1189，3 月 12 日才签）；查到后更新 `holidays/<年>.json` | Official Gazette / PCO / DOLE |
| **4 月 15 日** | BIR 税表年检 | 核对预扣税表是否有新 Revenue Regulation（TRAIN 2023 档是长期档，变动概率低）；顺带核对 ₱90,000 免税上限 | bir.gov.ph |
| **5 月 10 日** | Eid'l Adha 日期核查 | 同 Eid'l Fitr（2026 年是 Proc. 1264，5 月 21 日签） | Official Gazette / PCO |
| **8 月 20 日** | 8 月末节日簇 | Ninoy Aquino Day（8/21，SNW）+ National Heroes Day（8 月最后一个周一，RH）前更新 holidays JSON 的 `last_verified` 并部署（页面 `Updated` 日期自动取 lastmod，不再手改）；发 FB 倍率提醒图卡 | — |
| **9 月 5 日** | 次年节假日 Proclamation | Malacañang 通常 9–11 月发布次年节假日总 Proclamation（2026 年的 Proc. 1006 是 2025-09-03 签署，2027 年的 Proc. 1427 是 2026-09-08 签署、09-11 公布）；发布即录入 `holidays/<次年>.json`（含 `proclamation` 块，Eid 先放 `pending`），/philippine-holidays/ 页会自动切到最新年份；**若 9 月没查到，10 月 15 日复查一次** | PCO / Official Gazette |
| **10 月 12 日** | 13th month 页大促前核验 | 全年最大流量脉冲（11–12 月）前：核对 DOLE 年度 Labor Advisory（13th month 指引每年 10–11 月重申）、补充 FAQ、更新 labor JSON `last_verified`（页面 `Updated` 自动跟随）、重点检查计算器与示例；这也是发 FB 图卡的最佳窗口 | dole.gov.ph / bwc.dole.gov.ph |
| **10 月 20 日** | Undas + 年末前节日簇 | All Saints/Souls（11/1–2）、Bonifacio（11/30）前刷新 holiday 页；FB 图卡 | — |
| **11 月 15 日** | PRC 次年考试日历 | PRC Resolution 通常 10 月下旬签署、11 月中挂网（2026 年的 Res. 2113 是 10/23 签、11/17 发布）；录入 `prc/<次年>.json`，页面 Title 年份 +1（PRC 页、nursing 页，以及 `src/lib/prcProfessionPages.ts` 里 10 个专业页的 title/h1；psychometrician 页「Was the August 2026 exam rescheduled」FAQ 与 `prc/2026.json` 两条 psychology 行的改期 note 一并清掉；`src/lib/pages.ts` 的 label 同步）；`/data/prc/<年>/*.ics` 与 EducationEvent 结构化数据都从 JSON 自动生成，只需把 `src/pages/data/prc/2026/[slug].ics.ts` 复制成次年目录（或改成按年参数）；**同时清掉 09-16 / 09-22 加的时效内容**：nursing 页首屏「Both 2026 rounds are over → next PNLE is 2027」段改回「两轮」句、description 改回、「PNLE 2027 Schedule: What Is Known So Far」「August 2026 PNLE: Rescheduled Sittings and Results」两段、Results 段里的 09-18 放榜句与 10-13 注册句、FAQ（When is the next PNLE / Kailan ang susunod na PNLE / results released / reschedule / 2027 release date / Feb 2027；requirements 保留）、llms.txt nursing 行、PRC 页「Rescheduled exams」bullet；`prc/2026.json` 的 `note` 与 `results_released` 随 2027 JSON 自然退役，2027 各场放榜后按同样方式补 `results_released` | prc.gov.ph |
| **12 月 15 日** | 圣诞季节日簇 | Christmas Eve/Day（12/24–25）、Rizal（12/30）、年末（12/31）前刷新 holiday 页；FB 图卡（"double pay this Christmas" 是天然爆款选题） | — |

## 二、每月固定节点

| 提醒 | 动作（合计约 10 分钟） |
|---|---|
| **每月 1 日** | ① GSC：收录数、impressions 趋势、出现 impression 的新 query（决定是否开闸扩页）② GA4：流量 + AI 渠道分组占比 ③ 服务器跑一次 AI bot 抓取统计：`ssh 139 "grep -icE 'GPTBot\|ClaudeBot\|PerplexityBot\|Google-Extended' /var/log/nginx/aytool.access.log"` ④ UptimeRobot 有无告警记录 ⑤ 打开 [prc.gov.ph/articles/exam-results](https://www.prc.gov.ph/articles/exam-results)，凡上月放榜的考试，把 PRC 文章的 "Posted on" 日期写进 `src/data/prc/<年>.json` 对应行的 `results_released`，并把文章里的 "X out of Y passed" 写进 `passers` / `examinees`（表格、专业区块、专业页会自动改显示 "released"，/board-exam-results-2026/ 汇总页与各专业页的通过率 FAQ 自动更新；有分级的如 LET 用 `results_note` 写明细），`last_verified` 顺带更新后部署 |

## 三、里程碑节点（一次性，2026）

| 日期 | 节点 |
|---|---|
| **2026-09-19**（上线满 30 天） | D30 复盘：是否被索引、impressions 是否出现。低流量≠失败，只看趋势 |
| **2026-10-19**（满 60 天） | D60 复盘：只扩有 impression 的集群；检查 holiday / "for X salary" 词群是否出信号（弹药库开闸条件） |
| **2026-11-18**（满 90 天） | **D90 决策：Go（扩 60–80 页/复制第二市场）/ Pivot（改意图强化工具）/ Stop（停簇不恋战）** |

## 四、事件驱动（无固定日期，出现即做）

- 任何官方源发布新 circular/advisory/proclamation → 当周内更新对应 JSON 并部署
- 用户邮件（contact@）报数据错误 → 最高优先级，核实官方源后当天修复
- 证书/服务器告警 → `ssh 139` 排查；证书自动续期，一般无需干预（有效期见 `ssh 139 "certbot certificates"`）

## 五、当前待办（2026-09-22 起，按时间排）

> 背景：用户目标是**先把流量做到每月能变现几十美元的水平**（联盟口径约 2–5 千相关访问/月，广告口径约 2–4 万 PV/月），变现代码（赞助位、广告页、联盟模块）**暂不加**，只做流量。09-22 上线的 PRC 考试集群（PRC 总表 + 护理 + 10 个专业页 = 12 页）是主抓手，最大的一次机会是 11 月中 PRC 发布 2027 日历那天全集群换年重发。观察指标看「菲律宾 + 非品牌 + 均位 ≤10 的查询数与点击周环比」，不看 CTR；单查询展示 <100 不下结论。

| 时间 / 触发 | 谁 | 事项 | 怎么做 |
|---|---|---|---|
| **立刻** | 用户 | GSC 请求编入索引所有 09-22 新页 | GSC → 网址检查 → 逐个「请求编入索引」（22 个）：18 个考试页（`/prc-board-exam-schedule/`、`/nursing-`、`/let-`、`/criminology-`、`/cpa-`、`/civil-engineering-`、`/physician-`、`/pharmacy-`、`/midwifery-`、`/psychometrician-`、`/radtech-`、`/medtech-`、`/electrical-engineering-`、`/mechanical-engineering-`、`/architecture-`、`/electronics-engineering-`、`/dentistry-`、`/social-work-board-exam-schedule/`）+ `/sss-pension-calculator/`、`/sss-maternity-benefit-calculator/`、`/sss-salary-loan-calculator/`、`/sss-sickness-benefit-calculator/`、`/sss-unemployment-benefit-calculator/`、`/minimum-wage-philippines/`、`/daily-rate-calculator/`、`/separation-pay-calculator/`、`/retirement-pay-calculator/`、`/board-exam-results-2026/`、`/how-to-get-sss-number/`、`/how-to-get-tin-number/`、`/how-to-get-pagibig-mid-number/`、`/how-to-get-philhealth-number/`、`/pagibig-mp2-calculator/`、`/pagibig-housing-loan-calculator/`（09-23 上线，共 34 个新页）。先做 minimum wage、TIN、SSS number、pension、maternity、results 六个（搜索量最大），再做考试页。IndexNow 已在部署时推给 Bing/Yandex，Google 只认 GSC。 |
| **立刻起、持续** | 用户 | 外链与分发 | 按 [backlinks-playbook.md](backlinks-playbook.md) 红线：r/taxPH、r/phcareers 里真实提问下完整作答 + 附工具链接；护理/教师/CPA 复习生的 FB 群分享对应专业页（每页正文末尾的 share card 就是 OG 图）；复习中心、HR 博客可用计算器页的「Embed this calculator」代码，嵌入即带反链 |
| **持续（竞品分析结论，09-22）** | 用户 + 代码 | 把排名从 6–12 位推进前 3 | 09-22 竞品分析（lisensyaprep / prcboard / thesummitexpress / sprout / recruitgo / taxcalculatorphilippines / ssscalc）结论：aytool 的页面深度、schema、官方引用已超过全部竞品，差距在 **站龄与外链、每次放榜发一页的结果页集群、逐场考试的时效帖、FB/X 帖子直接占 SERP、评论区 UGC**。按性价比排：① 代码：每个专业加「<考试> <月年> results: passing rate, topnotchers, top schools」页（先 PNLE 09-18 轮、LET 11-27 放榜），从 schedule 页链过去，每轮新 URL；② 用户：开 FB 页 + X 号，每次改期/放榜/截止发一帖带链接（PRC 类 SERP 里 FB/X 帖子本身就排在前 9）；③ 用户：5–10 条真实外链——复习中心与学校 guidance office 链免费 .ics/嵌入计算器、Reddit r/Philippines & r/phcareers wiki、Wikipedia PNLE/LET 条目引用本站 PRC 溯源的历史表；④ 代码：逐场「<月年> <考试> application: filing dates, requirements」时效帖链回常青页；⑤ 代码：考试页开评论（Giscus）吃 Taglish 长尾；⑥ 代码：8 个高曝光页加 Taglish 摘要 FAQ 块（已部分完成）。仅靠站内改动到不了前 3，需两轮放榜周期（11 月 LET、2027-02 PNLE）叠加 ①②③。 |
| **2026-09-30** | 代码 | 09-16 SERP 轮效果评估 | 导 GSC 09-16～09-29 与前两周对比：13th month（prorated）、final pay（separation/back pay）、overtime（monthly salary）、SSS voluntary、take-home（absences/GSIS）、OEC（login/validity）各页目标查询的位置变化。此前不评估，避免与 09-22 大轮混淆归因 |
| **PRC 放榜当天**（事件） | 代码 | 补实际放榜日 | 见「每月 1 日」⑤。**首个待补：Psychometricians 9 月轮**（PRC 截至 09-22 未放榜）——补 `results_released` 时同时删掉该行 note 里的 "new results date not announced"，以及 `prcProfessionPages.ts` psychometrician 页 FAQ「Was the August 2026 psychometrician board exam rescheduled?」中 "As of September 22, 2026 PRC has not released…" 一句。之后依次：CPALE 10/24–26（目标 11/3）、PLE 10/3–4 & 10–11（目标 10/16）、Pharmacists 10/15–16（目标 10/21）、Midwives 11/7–8（目标 11/11）、LET 9/20（目标 11/27）、RadTech 12/10–11（目标 12/16） |
| **2026-10-12** | 代码 | Event 富结果 / 缩略图实验裁决 | GSC「增强功能」有没有出 Event 报告：有富结果 → 保留并考虑把 60 天窗口放宽；无富结果且无报错 → 保留（无害）；报 "missing address" 类错误 → 给 `educationEvents()` 的 location 补 `addressLocality`（PRC 总部 Manila）再看一轮，仍不行就撤掉三处 `educationEvents` 调用。移动端缩略图：在手机上搜 "pnle 2026 schedule" 看结果卡有没有图；没有 → 检查 GSC 网址检查里的「已编入索引的图片」 |
| **2026-10-19（D60）** | 代码 | 考试集群复盘 + 下一批专业页决策 | 导 GSC 按页：12 个考试页各自 impressions / 均位 / 出现的查询。已出词的专业 = 模板成立；据此决定下一批（候选按考生规模：牙医 Dentists（4 行，需 `exams` 覆盖成 Written 两行）、建筑 Architects、电气 REE/RME、机械 ME、社工、营养师、电子 ECE）。每加一页：`prcProfessionPages.ts` 一条配置（法律原文必须逐条核，用子代理读 lawphil/prc.gov.ph）+ `pages.ts` + `lastmod.mjs` 的 PAGE_SOURCE/PAGE_DATA + `prcProfessions.ts` 的 href + `node scripts/generate-og.mjs` + llms.txt + sources 页法律清单；单测 `prcProfessionPages.test.ts` 会挡住漏项 |
| **2026-11-15** | 代码 | PRC 2027 日历上线日（全集群换年） | 第一节 11 月 15 日行有完整清理清单。补充：① `src/lib/prcProfessionPages.ts` 10 个专业页与 `src/lib/pages.ts` 的 label 年份 +1，`extraFaqs` 里 2026 各轮通过率 FAQ 保留为历史、问句加年份；② `node scripts/generate-og.mjs` 重生成 OG 卡片；③ `src/pages/data/prc/2026/[slug].ics.ts` 复制为 2027 目录（或改成 `[year]` 参数）；④ 部署当天 GSC 对 12 页再请求一次抓取；⑤ nursing 页的 `results_released` 构建 guard 会在 2027 JSON 缺该字段时故意失败——这是提醒你改回「两轮未考」文案，改完再去掉 guard 或补字段 |
| **2026-11-18（D90）** | 用户 + 代码 | Go / Pivot / Stop | 依据 D60 集群数据与 11-15 换年后首周 GSC；Go 的方向已明确是继续扩考试集群（专业页 + 2027 全年），不是薪资 pSEO |
| **2026-09-27 前后** | 代码 | NCR-28 生效日 | 看 https://nwpc.dole.gov.ph/ncr/ 与 wage order matrix 有没有印出 NCR-28 的 effectivity；有 → `src/data/wages/2026.json` 的 `ncr.upcoming.effectivity` 填日期、`ncr.in_force` 换成 NCR-28（₱755/₱718）、regions[ncr] tiers 与 upcoming 同步、`last_verified` 更新，部署；同时把 llms.txt 那行改掉 |
| **2026-12-01** | 代码 | Bicol / BARMM 第二档生效 | Region V 全部门 ₱455→₱480；BARMM 城市 ₱436/₱411→₱461/₱436、其他地区 ₱411/₱401→₱436/₱426；改 `wages/2026.json` tiers、删 upcoming、更新 last_verified |
| **每月 1 日** | 代码 | 四篇「how to get」指南巡检 | 打开四个官方页（sss.gov.ph/become-an-sss-member、bir.gov.ph/primary-registration + ORUS、Virtual Pag-IBIG registration、PhilHealth Member Portal pinApplication）对照指南步骤/费用/处理时长；BIR 常改 RMC（Digital TIN ID、ORUS 停机），PhilHealth Circular 2025-0017 当时 PDF 损坏未读——读到后核对注册规则 |
| **每年 1 月 / Pag-IBIG 公布新分红率时** | 代码 | MP2 分红率 | pagibigfund.gov.ph/member_savings_mp2.html 公布上一年 MP2 return rate 后（通常 2–3 月），在 `src/data/pagibig/<年>.json` 的 `mp2.dividend_rates` 最前面加一行（source: live），计算器与页面自动用最新值 |
| **2026-12-31** | 代码 | Pag-IBIG 房贷利率到期 | 官网写的是 "rates until December 31, 2026"（常规 6.5%–9.75%、促销 4.5%/5.75% 前 3 年）；年底前后看 Availmentofnewloan.html 的新利率图，更新 `housing_loan.regular_rates` / `promo` / `rates_valid_until`。官网的利率表是图片（HL_InterestRates_01/02），要用浏览器看图 |
| **每月 1 日** | 代码 | 最低工资巡检 | 对 NWPC summary 页（stats/summary-of-current-regional-daily-minimum-wage-rates）新 PDF 逐区核对；Region III/IV-A/VII/VI/XII/CAR/I/X 正在评审，新 wage order 公布后 15 天生效——公布当天录入 |
| **2026-12-10** | 代码 | RadTech 考试周 | 12/10–11 考试、12/16 目标放榜；专业页首屏「Next round」会自动变成「All 2026 rounds have been held」，放榜后补 `results_released` |

## 2026–2027 当前周期的具体日期速查

| 日期 | 事项 |
|---|---|
| 2026-08-20 | ⬅ 最近的一个：8/21 Ninoy + 8/31 National Heroes 节前刷新 + FB 图卡 |
| ~~2026-09-05~~ | ~~查 2027 节假日 Proclamation~~ ✅ Proc. 1427 已于 09-08 签署，09-14 录入 `holidays/2027.json` + 上线 /philippine-holidays/ |
| ~~2026-09-18~~ | ~~PNLE 8 月轮放榜目标日：PRC 出结果后改 nursing 页时效句并部署~~ ✅ PRC 09-18 如期放榜（28,652/37,359，76.69%，21 人暂扣，注册 10-13 起线上办）；09-22 改完：`prc/2026.json` 加 `results_released`、首屏改成「两轮已结束 → 下一次是 2027」、2027 段上移、新增 next-PNLE FAQ（英/Taglish） |
| 2026-09-30 | 09-16 SERP 轮效果评估（见第五节） |
| 2026-10-12 | 13th month 页核验（11–12 月脉冲前）；Event 富结果 / 移动端缩略图实验裁决（见第五节） |
| 2026-10-19 | D60：考试集群 12 页逐页复盘，决定下一批专业页（见第五节） |
| 2026-10-20 | Undas + Bonifacio 节前刷新 |
| 2026-11-15 | PRC 2027 日历（Resolution 预计 10 月底签）——全集群 12 页换年重发，最大的一次流量机会（清单见第一节 + 第五节） |
| 2026-11-18 | D90 Go/Pivot/Stop 决策 |
| 2026-12-10 | 2027 四险费率核查 |
| 2026-12-10 | RadTech 考试 12/10–11，12/16 目标放榜后补 `results_released` |
| 2026-12-15 | 圣诞季节日簇刷新 |
| 2027-01-05 | 2027 规则生效复核 + 全站换年部署 |
| 2027-02-20 / 05-10 | Eid'l Fitr / Eid'l Adha 2027 日期核查（查到后把 `holidays/2027.json` 的 `pending` 项移入 `holidays`、更新 `rule_version`） |
| 2027-04-15 | BIR 税表年检 |
