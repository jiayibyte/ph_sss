# 菲律宾 Payroll & Contribution Tools — 产品 / SEO 详细需求文档 v1.0

> 更新时间：2026-08-19  
> 目标市场：Philippines  
> 站点定位：**菲律宾工资、法定缴费与雇员收入计算工具站**  
> 建议品牌方向：中性品牌，例如 `PayTools.ph` / `SalaryTools.ph`（域名可用性需另行实时确认）  
> SEO 数据基础：Google Keyword Planner，2025-08-01 ～ 2026-07-31；搜索量按量级理解。  
> SERP 基础：v6.0 SERP 复核。  
> 核心原则：**一个计算引擎承接一组同意图关键词，不为同义词复制页面。**

---

# 1. 项目目标

做一个只服务菲律宾用户的垂直工具站，核心围绕：

1. SSS Contribution
2. PhilHealth Contribution
3. Pag-IBIG Contribution
4. 13th Month Pay
5. Night Differential / Overtime
6. Final Pay / Back Pay

第一阶段不追求大量文章，而是用 **高搜索量工具页 + 官方规则来源 + 清晰计算过程** 获取 Google 自然流量。

## 核心用户

- 菲律宾普通雇员
- HR / Payroll 人员
- Self-employed / Voluntary / OFW
- 准备离职或刚离职的员工
- 想确认 SSS / PhilHealth / Pag-IBIG 缴费的人

## 非目标

- 不做政府账号登录。
- 不收集 SSS / PhilHealth / Pag-IBIG 账号、密码、OTP、身份证件。
- 不冒充 SSS、PhilHealth、Pag-IBIG、DOLE、DMW、PRC 官方网站。
- 不提供“官方查询结果”，只做独立计算、说明与官方入口。

---

# 2. 网站结构

```text
/
├── /sss-contribution-table/
├── /sss-contribution-calculator/
├── /13th-month-pay-calculator/
├── /philhealth-contribution/
├── /pagibig-contribution/
├── /night-differential-calculator/
├── /final-pay-calculator/
├── /overtime-pay-calculator/
│
├── /oec-exemption/
├── /prc-board-exam-schedule/
│
├── /about/
├── /methodology/
├── /sources/
├── /privacy/
└── /disclaimer/
```

## URL 原则

年度关键词有搜索量，但**不要每年新建几乎相同的 URL**。

例如：

- URL 固定：`/sss-contribution-table/`
- 2026 页面 Title：`SSS Contribution Table 2026 + Calculator`
- 2027 直接更新同一个 URL 的数据、Title、更新时间。

这样避免：

```text
/sss-contribution-table-2025/
/sss-contribution-table-2026/
/sss-contribution-table-2027/
```

造成旧页、重复页和权重分散。

---

# 3. 页面优先级总表

| 优先级 | 页面 | 主关键词 | 月搜索量 | SERP难度 | 是否首发 |
|---|---|---|---:|---|---|
| P0 | SSS Contribution Table | `sss contribution table 2026` | 50,000 | 中高 | 是 |
| P0 | SSS Contribution Calculator | `sss contribution calculator` | 5,000 | 中 | 是 |
| P0 | 13th Month Pay Calculator | `how to compute 13th month pay` | 50,000 | 中高 | 是 |
| P0 | PhilHealth Contribution | `philhealth contribution calculator` | 5,000 | 中 | 是 |
| P0 | Pag-IBIG Contribution | `pag ibig contribution 2026` | 5,000 | 中 | 是 |
| P1 | Night Differential Calculator | `night differential calculator` | 5,000 | 中 | 第二批 |
| P1 | Final / Back Pay Calculator | `final pay calculator philippines` | 500 | 中高 | 第二批 |
| P1 | Overtime Pay Calculator | `overtime pay computation philippines` | 500 | 中 | 第二批 |
| P2 | OEC Exemption Guide | `oec exemption` | 5,000 | 高 | 后做 |
| P2 | PRC Exam Schedule | `prc board exam schedule 2026` | 5,000 | 高 | 后做 |

---

# 4. P0 页面详细需求

# 4.1 SSS Contribution Table

## URL

```text
/sss-contribution-table/
```

## 目标关键词

### 主关键词

- `sss contribution table 2026` — **50,000/月**

### 同页覆盖

- `sss contribution 2026` — **5,000/月**
- `sss contribution table` — **5,000/月**
- `sss monthly contribution 2026` — **5,000/月**
- `how to compute sss contribution` — **5,000/月**
- `sss contribution table ofw 2026` — 50/月
- `sss contribution table self employed 2026` — 50/月
- `sss contribution table voluntary 2026` — 50/月

## SEO

**Title**

```text
SSS Contribution Table 2026 – Employee, Employer, Self-Employed & OFW
```

**H1**

```text
SSS Contribution Table 2026
```

页面开头 100–150 字直接回答：

- 当前使用哪一版 SSS Schedule。
- 生效日期。
- 页面最后核验日期。
- 明确链接到 SSS 官方 Contribution Table。

## 页面功能

### 功能 A：完整 Contribution Table

必须支持筛选：

```text
Member Type:
[ Employee ]
[ Self-Employed ]
[ Voluntary ]
[ OFW ]
```

表格字段按 SSS 官方 Schedule 原样结构化，不自己发明费率。

建议显示：

- Monthly Salary / Compensation Range
- Monthly Salary Credit (MSC)
- Employee Share
- Employer Share
- Employees' Compensation / official additional component（如适用）
- Total Contribution
- Effective Date

### 功能 B：快速 Salary Lookup

表格上方提供：

```text
Monthly Salary: ₱ [________]

Member Type: [Employee ▼]

[Find My SSS Contribution]
```

提交后：

```text
Monthly Salary
MSC
Employee Contribution
Employer Contribution
Other applicable components
Total
```

并自动滚动 / 高亮表格中对应行。

### 功能 C：Member Type Tabs

用户切换 Employee / Self-Employed / Voluntary / OFW 时：

- 不刷新页面。
- 切换对应官方 Schedule。
- URL 不变化。
- 页面内容区同步出现对应说明。

## 内容结构

```text
H1 SSS Contribution Table 2026
Calculator / Salary Lookup
Current SSS contribution summary
Employee contribution table
Self-employed contribution table
Voluntary contribution table
OFW contribution table
How SSS contribution is computed
What is MSC?
Employee vs employer share
Examples
Official source & effective date
FAQ
```

## 官方数据要求

SSS 官方当前页面说明，2025 年起总 contribution rate 已达到 15%，当前计算必须以**最新官方 Schedule of Contributions**为准。

不要仅使用简单百分比公式替代表格；应把官方 contribution schedule 存储成版本化配置。

---

# 4.2 SSS Contribution Calculator

## URL

```text
/sss-contribution-calculator/
```

## 目标关键词

- `sss contribution calculator` — **5,000/月**
- `how to compute sss contribution` — **5,000/月**
- `sss monthly contribution 2026` — **5,000/月**
- `sss contribution calculator 2026` — 50/月
- `sss contribution calculator self employed` — 50/月
- `sss contribution calculator voluntary` — 50/月
- `sss contribution calculator ofw` — 50/月

## SEO

**Title**

```text
SSS Contribution Calculator 2026 – Calculate Monthly SSS Contribution
```

**H1**

```text
SSS Contribution Calculator
```

## Calculator 输入

```text
Monthly Salary / Income: ₱ [________]

Member Type:
[ Employee ▼ ]

Options:
- Employee
- Self-Employed
- Voluntary
- OFW

[Calculate]
```

如果不同 Member Type 的计算逻辑需要额外字段，只在切换后动态显示。

## Calculator 输出

```text
Your estimated SSS contribution

Monthly Salary: ₱xx,xxx
Applicable MSC: ₱xx,xxx

Employee / Member Share: ₱xxx
Employer Share: ₱xxx
Other applicable component: ₱xxx
Total Contribution: ₱xxx

Schedule used:
Effective from: xxxx
Last verified: xxxx
```

## 必须功能

- 输入非法字符提示。
- Salary 低于 / 高于 Schedule 范围时正确落入官方最低 / 最高规则。
- 所有计算来源于统一 JSON / DB 配置，不把费率散落写死在前端。
- “View Full SSS Contribution Table”链接到 `/sss-contribution-table/`。
- 一键 Reset。
- 可复制计算结果。
- 移动端优先。
- 默认不保存用户工资输入。

## 页面内容

```text
Calculator
How the calculation works
Current SSS contribution rate/schedule
What is MSC?
Employee example
Self-employed example
Voluntary example
OFW example
Official SSS source
FAQ
```

---

# 4.3 13th Month Pay Calculator

## URL

```text
/13th-month-pay-calculator/
```

## 目标关键词

- `how to compute 13th month pay` — **50,000/月**
- `13th month pay calculator philippines` — **5,000/月**
- `13th month pay calculator` — **5,000/月**
- `13th month pay computation philippines` — **5,000/月**
- `13th month pay formula philippines` — 50/月

## SEO

**Title**

```text
13th Month Pay Calculator Philippines 2026 – Formula & Computation
```

**H1**

```text
13th Month Pay Calculator Philippines
```

## 核心计算

DOLE 的官方原则：

```text
13th Month Pay =
Total Basic Salary Earned During the Calendar Year ÷ 12
```

## Calculator 模式

提供两个模式。

### Simple Mode

```text
Monthly Basic Salary: ₱ [________]
Months Worked: [12]
[Calculate]
```

适合全年固定工资用户。

### Accurate Mode

```text
Jan Basic Salary  ₱____
Feb Basic Salary  ₱____
Mar Basic Salary  ₱____
...
Dec Basic Salary  ₱____
```

支持：

- mid-year hire
- resigned / terminated during year
- salary increase
- unpaid absence
- basic salary varying month to month

## 输出

```text
Total Basic Salary Earned: ₱xxx,xxx
÷ 12
Estimated 13th Month Pay: ₱xx,xxx
```

下面展开：

```text
What was included
What was not included
Calculation steps
```

## 内容

必须解释：

- 什么是 basic salary。
- 哪些常见收入通常不直接作为 basic salary 计算。
- 中途入职怎么计算。
- 中途离职怎么计算。
- Salary increase 怎么计算。
- 至少 3 个 worked examples。
- 明确“实际 payroll/company policy 可能有更有利待遇”。

## UX

Calculator 必须放在首屏。

不要让用户先读 1000 字文章再看到工具。

---

# 4.4 PhilHealth Contribution Calculator + Table

## URL

```text
/philhealth-contribution/
```

## 目标关键词

- `philhealth contribution table 2026` — **5,000/月**
- `philhealth contribution 2026` — **5,000/月**
- `philhealth contribution calculator` — **5,000/月**
- `philhealth contribution table` — **5,000/月**
- `how to compute philhealth contribution` — 500/月
- `philhealth contribution calculator 2026` — 50/月

## SEO

**Title**

```text
PhilHealth Contribution Calculator & Table 2026
```

**H1**

```text
PhilHealth Contribution Calculator 2026
```

## Calculator 输入

```text
Monthly Basic Salary / Income: ₱ [________]

Member Type:
[ Employed ▼ ]

Options:
- Employed
- Self-Paying / Self-Earning
- OFW / other relevant direct contributor modes
```

## 输出

```text
Monthly income used
Applicable premium base
Total monthly premium
Employee share (if applicable)
Employer share (if applicable)
Member-paid amount
```

## 当前规则设计要求

规则不能散落 hardcode。

建立：

```text
philhealth_rules.json
```

示意：

```json
{
  "effective_from": "...",
  "rate": "...",
  "income_floor": "...",
  "income_ceiling": "...",
  "member_types": {}
}
```

2026 官方 PhilHealth advisory 仍说明 Direct Contributors 自 2025 年起按 5% 的 monthly income 计算；规则变化时只更新配置。

## 内容

```text
Calculator
Current PhilHealth contribution rate
2026 contribution table
Income floor / ceiling
Employee + employer sharing
Self-paying members
Examples
How to pay / official portal
Official sources
FAQ
```

可额外加入 2026 对 self-paying members 的 SPA 相关提醒，但不要把网站做成 PhilHealth payment portal。

---

# 4.5 Pag-IBIG Contribution Calculator + Table

## URL

```text
/pagibig-contribution/
```

## 目标关键词

- `pag ibig contribution 2026` — **5,000/月**
- `pag ibig contribution table 2026` — **5,000/月**
- `pag ibig contribution calculator` — 500/月
- `pag ibig contribution table` — 500/月
- `how to compute pag ibig contribution` — 500/月
- `pag ibig contribution calculator 2026` — 50/月

## SEO

**Title**

```text
Pag-IBIG Contribution Calculator & Table 2026
```

**H1**

```text
Pag-IBIG Contribution Calculator 2026
```

## Calculator 输入

```text
Monthly Salary / Income: ₱ [________]
Member / Employment Type: [________]
[Calculate]
```

## 输出

```text
Applicable monthly fund salary
Employee / member contribution
Employer contribution
Total monthly Pag-IBIG contribution
```

## 数据实现

创建版本化：

```text
pagibig_rules.json
```

规则必须来自当前 Pag-IBIG Circular / 官方资料。

不要直接从竞争站复制数字。

## 内容

```text
Calculator
Current contribution table
Employee contribution
Employer contribution
Contribution ceiling / MFS
Examples
How to pay
Official Pag-IBIG source
FAQ
```

---

# 5. P1 页面详细需求

# 5.1 Night Differential Calculator

## URL

```text
/night-differential-calculator/
```

## 关键词

- `night differential calculator` — **5,000/月**
- `night differential computation philippines` — 500/月

## 功能

输入：

```text
Hourly Rate
Night Work Start
Night Work End
Ordinary / Rest Day / Holiday
Overtime? Yes / No
```

输出：

```text
Eligible night hours
Base pay
Night differential
Other applicable premium
Total estimated pay
```

## 页面重点

- 菲律宾 night work 时间范围。
- ordinary / rest day / holiday 的区别。
- overtime 与 night differential 同时出现时的计算说明。
- DOLE / Labor Code 来源。
- Calculator 结果拆解。

此页面规则较复杂，必须使用版本化 `labor_rules.json`。

---

# 5.2 Final Pay / Back Pay Calculator

## URL

```text
/final-pay-calculator/
```

## 关键词

- `final pay calculator philippines` — 500/月
- `final pay calculator` — 500/月
- `final pay computation philippines` — 500/月
- `back pay calculator` — 500/月
- `back pay computation philippines` — 500/月
- `back pay calculator philippines` — 50/月

## 为什么合成一个页面

DOLE Labor Advisory No. 06-20 将 **Final Pay / Last Pay / Back Pay** 放在同一概念下说明。

因此不要分别做两个高度重复的 Calculator 页面。

## Calculator 输入

采用可选模块：

```text
Unpaid earned salary       ₱____
Unused SIL / leave         ₱____
Other convertible leave    ₱____
Pro-rated 13th month       [Auto / Manual]
Separation pay             ₱____
Retirement pay             ₱____
Tax refund / adjustment    ₱____
Cash bond / deposit return ₱____
Other compensation         ₱____
Deductions                 ₱____
```

## 输出

```text
Estimated Final / Back Pay

Unpaid Salary
+ Leave Conversion
+ Pro-rated 13th Month
+ Separation / other pay
+ Refund / deposits
- Deductions
---------------------------
Estimated Total
```

## 内容

- Final Pay / Back Pay 是什么。
- 哪些项目可能包含。
- 哪些项目不是每个人都有。
- Pro-rated 13th month 如何计算。
- DOLE 官方指南。
- 明确结果为 estimate，不代替公司 payroll / legal determination。

DOLE 2020 Advisory 还说明，一般 Final Pay 应在 separation / termination 后 30 天内释放，除非更有利的公司政策或协议适用；页面可做 FAQ，但需显示来源和核验日期。

---

# 5.3 Overtime Pay Calculator

## URL

```text
/overtime-pay-calculator/
```

## 关键词

- `overtime pay computation philippines` — 500/月
- `overtime pay calculator philippines` — 50/月
- `holiday pay calculator philippines` — 50/月
- `holiday pay computation philippines` — 50/月

## 功能

输入：

```text
Monthly / Daily / Hourly Salary
Normal hours per day
Overtime hours
Day Type:
- Ordinary Day
- Rest Day
- Special Day
- Regular Holiday
- Holiday + Rest Day

Night hours:
optional
```

输出必须逐项拆解：

```text
Base hourly rate
Applicable OT multiplier
OT pay
Night differential if applicable
Total additional pay
```

Holiday Pay 只有 50 量级，不首发独立页面，先作为本 Calculator 的 mode / section。

---

# 6. P2 内容页

# 6.1 OEC Exemption Guide

## URL

```text
/oec-exemption/
```

## 关键词

- `oec exemption` — **5,000/月**
- `oec exemption online` — 500/月
- `oec exemption requirements` — 50/月

## 定位

只做 Guide，不做仿 DMW / POEA Portal。

## 内容

```text
Who may qualify
Same employer / jobsite scenarios
Requirements checklist
Online process
Official DMW link
Common errors
FAQ
Last verified date
```

---

# 6.2 PRC Board Exam Schedule

## URL

```text
/prc-board-exam-schedule/
```

## 关键词

- `prc board exam schedule 2026` — **5,000/月**
- `prc exam schedule 2026` — **5,000/月**
- `prc board exam results 2026` — 50/月

## 功能

数据库 / Table 页面：

```text
Profession / Exam
Exam Date
Application Start / Deadline
Expected Result Date（仅官方有明确依据时）
Official PRC Link
Last Verified
```

支持：

```text
Search
Filter by month
Filter by profession
Sort by exam date
```

不要托管 / 冒充官方 Exam Result Portal。

---

# 7. 首页需求

## URL

```text
/
```

## Title

```text
Philippines Salary, Payroll & Contribution Calculators
```

## H1

```text
Philippines Payroll & Contribution Calculators
```

## 首屏

```text
Free calculators for SSS, PhilHealth, Pag-IBIG,
13th Month Pay and employee payroll computations.
```

下面直接放工具卡片：

```text
SSS Contribution
13th Month Pay
PhilHealth Contribution
Pag-IBIG Contribution
Night Differential
Final Pay
Overtime Pay
```

不要做传统博客首页。

首页的目标是：

1. 告诉 Google 站点 Topic。
2. 把权重分给核心工具页。
3. 帮用户快速进入 Calculator。

---

# 8. 共用 Calculator Engine 要求

所有 Calculator 共用统一设计。

## Input

- PHP currency formatting。
- 数字输入允许逗号 / 小数。
- 手机数字键盘。
- 明确字段单位。
- 输入错误立即提示。

## Result

统一结果卡：

```text
Estimated Result
₱XX,XXX.XX

Breakdown
...
```

同时显示：

```text
Rule / schedule used
Effective date
Last verified
Official source
```

## 隐私

默认：

- 不登录。
- 不保存 Salary。
- 不保存个人身份信息。
- Calculator 尽量 client-side。
- Analytics 不记录用户具体输入值。

页面加入：

```text
This is an independent calculator and is not affiliated with
SSS, PhilHealth, Pag-IBIG Fund, DOLE or other Philippine government agencies.
```

---

# 9. 规则 / 数据架构

不要把 2026 数字散落硬编码在 React/Vue/模板中。

建议：

```text
/data
├── sss/
│   ├── 2025-current.json
│   └── metadata.json
├── philhealth/
│   └── current.json
├── pagibig/
│   └── current.json
└── labor/
    └── current.json
```

每个规则文件必须包含：

```text
effective_from
effective_to
last_verified
official_source_url
rule_version
```

页面自动显示：

```text
Last verified: August 2026
Based on: [Official Source]
```

规则变化时只更新数据文件，不重写整个 Calculator。

---

# 10. SEO 页面模板

每个工具页统一结构：

```text
H1
一句话直接回答
Calculator
Result

H2 Current Rule / Table
H2 How It Is Calculated
H2 Example Calculations
H2 Who This Applies To
H2 Official Source
H2 FAQ
Related Calculators
```

## 不要这样做

不要为下面这些同义词生成独立薄页：

```text
sss contribution calculator
sss calculator
calculate sss contribution
sss contribution calculator 2026
```

如果用户意图相同，就在一个主页面覆盖。

---

# 11. Internal Linking

## SSS

```text
SSS Table
↔ SSS Calculator
→ PhilHealth
→ Pag-IBIG
→ 13th Month Pay
```

## 13th Month

```text
13th Month
→ Final Pay
→ Overtime
→ Night Differential
```

## Final Pay

```text
Final Pay
→ 13th Month
→ Overtime
→ SSS / PhilHealth / Pag-IBIG
```

所有页面底部放：

```text
Related Philippine Payroll Calculators
```

不要随机推荐无关页面。

---

# 12. Trust 页面

首发必须至少有：

```text
/about/
/methodology/
/sources/
/privacy/
/disclaimer/
```

## Methodology

说明：

- Calculator 如何计算。
- 数据来自什么官方机构。
- 最近核验日期。
- 发现错误如何联系。

## Sources

按机构整理：

```text
SSS
PhilHealth
Pag-IBIG Fund
DOLE / Bureau of Working Conditions
DMW
PRC
```

---

# 13. 上线顺序

## Sprint 1 — 必须先做

```text
Homepage
SSS Contribution Table
SSS Contribution Calculator
13th Month Pay Calculator
PhilHealth Contribution Calculator
Pag-IBIG Contribution Calculator
About
Methodology
Sources
Privacy
Disclaimer
```

这一步上线后立即接 Google Search Console。

## Sprint 2

有 impressions 后增加：

```text
Night Differential Calculator
Final / Back Pay Calculator
Overtime Pay Calculator
```

## Sprint 3

根据 GSC 再增加：

```text
OEC Exemption
PRC Board Exam Schedule
具体长尾页面
```

不要第一天为了“页面数量”生成 50 个低质量页。

---

# 14. 首发关键词清单

## SSS

```text
sss contribution table 2026                50,000
sss contribution 2026                       5,000
sss contribution calculator                 5,000
sss contribution table                      5,000
sss monthly contribution 2026               5,000
how to compute sss contribution             5,000
```

## 13th Month Pay

```text
how to compute 13th month pay              50,000
13th month pay calculator philippines       5,000
13th month pay calculator                   5,000
13th month pay computation philippines      5,000
```

## PhilHealth

```text
philhealth contribution table 2026          5,000
philhealth contribution 2026                5,000
philhealth contribution calculator          5,000
philhealth contribution table               5,000
how to compute philhealth contribution        500
```

## Pag-IBIG

```text
pag ibig contribution 2026                  5,000
pag ibig contribution table 2026            5,000
pag ibig contribution calculator              500
pag ibig contribution table                   500
how to compute pag ibig contribution          500
```

## Payroll

```text
night differential calculator               5,000
night differential computation philippines    500
final pay calculator philippines               500
final pay calculator                           500
final pay computation philippines              500
back pay calculator                            500
back pay computation philippines               500
overtime pay computation philippines           500
```

## 后做

```text
oec exemption                               5,000
oec exemption online                          500
prc board exam schedule 2026                5,000
prc exam schedule 2026                      5,000
```

---

# 15. 第一版验收标准

## SSS

- Employee / Self-Employed / Voluntary / OFW 至少按官方当前 Schedule 正确计算。
- Salary lookup 与完整 table 数据一致。
- 每一个结果显示 Schedule 版本与官方来源。
- 手机端完成一次计算不超过 3 次主要操作。

## 13th Month

- 支持固定工资和逐月工资两种模式。
- 能处理年中入职 / 离职。
- Result 展示 total basic salary ÷ 12 的完整过程。

## PhilHealth / Pag-IBIG

- Salary 输入后结果与当前官方规则一致。
- 有 employee / employer split 的场景必须显示拆分。
- 页面显示 effective date / verified date。

## 全站

- Lighthouse mobile 性能优先。
- Calculator 首屏可见。
- 所有页面有唯一 Title / H1。
- Sitemap、robots.txt、canonical 完整。
- 接入 Google Search Console。
- 不收集敏感个人账号信息。
- 所有政府相关页面都有 Independent / Not affiliated 声明。

---

# 16. 规则来源（开发时优先核对）

以下为本需求文档核对时使用的官方来源方向；上线前再次确认最新版本：

- SSS — Pay Contributions / Contribution Table / official contribution circulars  
  https://www.sss.gov.ph/pay-contribution/  
  https://www.sss.gov.ph/sss-contribution-table/

- PhilHealth — official advisories / member contribution guidance  
  https://www.philhealth.gov.ph/advisories/2026/  
  https://www.philhealth.gov.ph/services/

- Pag-IBIG Fund — official circulars / contribution guidelines  
  https://www.pagibigfund.gov.ph/

- DOLE / Bureau of Working Conditions — 13th Month Pay / Final Pay / Labor Code  
  https://dole.gov.ph/  
  https://bwc.dole.gov.ph/

---

# 17. 最终开发优先级

如果开发资源有限，只按这个顺序做：

```text
1. SSS Contribution Table
2. SSS Contribution Calculator
3. 13th Month Pay Calculator
4. PhilHealth Contribution Calculator
5. Pag-IBIG Contribution Calculator
6. Night Differential Calculator
7. Final / Back Pay Calculator
8. Overtime Pay Calculator
9. OEC Exemption
10. PRC Board Exam Schedule
```

最重要的不是页面越多越好，而是前 5 个页面：

- 数据正确
- Calculator 好用
- 官方来源清楚
- 移动端快
- 页面一次满足多个同意图关键词

**第一版站点的核心就是：SSS + 13th Month + PhilHealth + Pag-IBIG。**
