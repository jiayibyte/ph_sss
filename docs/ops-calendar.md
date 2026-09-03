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
| **9 月 5 日** | 次年节假日 Proclamation | Malacañang 通常 9–11 月发布次年节假日总 Proclamation（2026 年的 Proc. 1006 是 2025-09-03 签署）；发布即录入 `holidays/<次年>.json`；**若 9 月没查到，10 月 15 日复查一次** | PCO / Official Gazette |
| **10 月 12 日** | 13th month 页大促前核验 | 全年最大流量脉冲（11–12 月）前：核对 DOLE 年度 Labor Advisory（13th month 指引每年 10–11 月重申）、补充 FAQ、更新 labor JSON `last_verified`（页面 `Updated` 自动跟随）、重点检查计算器与示例；这也是发 FB 图卡的最佳窗口 | dole.gov.ph / bwc.dole.gov.ph |
| **10 月 20 日** | Undas + 年末前节日簇 | All Saints/Souls（11/1–2）、Bonifacio（11/30）前刷新 holiday 页；FB 图卡 | — |
| **11 月 15 日** | PRC 次年考试日历 | PRC Resolution 通常 10 月下旬签署、11 月中挂网（2026 年的 Res. 2113 是 10/23 签、11/17 发布）；录入 `prc/<次年>.json`，页面 Title 年份 +1 | prc.gov.ph |
| **12 月 15 日** | 圣诞季节日簇 | Christmas Eve/Day（12/24–25）、Rizal（12/30）、年末（12/31）前刷新 holiday 页；FB 图卡（"double pay this Christmas" 是天然爆款选题） | — |

## 二、每月固定节点

| 提醒 | 动作（合计约 10 分钟） |
|---|---|
| **每月 1 日** | ① GSC：收录数、impressions 趋势、出现 impression 的新 query（决定是否开闸扩页）② GA4：流量 + AI 渠道分组占比 ③ 服务器跑一次 AI bot 抓取统计：`ssh 139 "grep -icE 'GPTBot\|ClaudeBot\|PerplexityBot\|Google-Extended' /var/log/nginx/aytool.access.log"` ④ UptimeRobot 有无告警记录 |

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

## 2026–2027 当前周期的具体日期速查

| 日期 | 事项 |
|---|---|
| 2026-08-20 | ⬅ 最近的一个：8/21 Ninoy + 8/31 National Heroes 节前刷新 + FB 图卡 |
| 2026-09-05 | 查 2027 节假日 Proclamation |
| 2026-10-12 | 13th month 页核验（11–12 月脉冲前） |
| 2026-10-20 | Undas + Bonifacio 节前刷新 |
| 2026-11-15 | PRC 2027 日历（Resolution 预计 10 月底签） |
| 2026-11-18 | D90 Go/Pivot/Stop 决策 |
| 2026-12-10 | 2027 四险费率核查 |
| 2026-12-15 | 圣诞季节日簇刷新 |
| 2027-01-05 | 2027 规则生效复核 + 全站换年部署 |
| 2027-02-20 / 05-10 | Eid'l Fitr / Eid'l Adha 2027 日期核查 |
| 2027-04-15 | BIR 税表年检 |
