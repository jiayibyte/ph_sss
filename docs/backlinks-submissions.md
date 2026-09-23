# 外链提交文案（2026-09-23 起草）

配合 [backlinks-playbook.md](backlinks-playbook.md) 第一层使用。每条提交前由用户确认；账号注册/登录由用户本人完成。

## 通用字段

- **名称**：AyTool
- **网址**：https://aytool.com/
- **一句话**（≤60 字符）：Free Philippine payroll, SSS & PRC calculators
- **标签**：Philippines, payroll, salary calculator, SSS, PhilHealth, Pag-IBIG, tax, board exam
- **价格**：Free，无需注册，无广告
- **平台**：Web（移动端优先）

**短描述（~160 字符）**

> Free calculators for Philippine workers: take-home pay, SSS/PhilHealth/Pag-IBIG contributions, 13th month, overtime, final pay, plus PRC board exam schedules.

**长描述**

> AyTool is a free, independent set of calculators for employees and freelancers in the Philippines. It covers the numbers people actually check on payday: take-home pay after SSS, PhilHealth, Pag-IBIG and withholding tax; 13th month pay; overtime, night differential and holiday pay; final pay, separation pay and retirement pay; and SSS benefits (pension, maternity, sickness, unemployment, salary loan).
>
> Every rate comes from the official source — SSS circulars, PhilHealth advisories, BIR TRAIN tables, DOLE handbooks, NWPC wage orders — and each page shows the circular number and the date it was last verified. There is no sign-up, and nothing you type leaves your browser.
>
> It also tracks PRC board exam schedules and results for 18 professions (nursing, LET, CPA, civil engineering and more), with downloadable calendar files.

## AlternativeTo

- 路径：登录 → Add application（https://alternativeto.net/add-app/ 类似）
- 分类：Business & Commerce › Finance / Online Services
- 许可：Free；平台：Online
- 描述：用「长描述」前两段
- Alternative to：Sweldong Pinoy 未被收录（playbook 核验过），独立提交即可

## Product Hunt

- **Name**：AyTool
- **Tagline**（≤60）：Payroll & SSS calculators for Filipino workers, free
- **Description**（≤260）：
  > Check your take-home pay, SSS/PhilHealth/Pag-IBIG, 13th month, overtime and final pay in seconds. Every rate cites the official circular and verification date. Free, no sign-up, runs in your browser. Also tracks PRC board exam schedules.
- **Topics**：Fintech, Productivity, Free
- **First comment（maker comment）**：
  > Hi Product Hunt! I built AyTool because Filipino workers usually find payroll numbers in scattered PDFs and Facebook posts, and a lot of the calculators online still use 2023 rates. Each page here shows exactly which SSS circular or BIR table it follows and when I last checked it. Feedback on anything that looks wrong is very welcome — correctness is the whole point.
- 发布日建议选周二至周四菲律宾时间 15:01（PH 发布日是 PT 00:01）

## Indie Hackers

- 产品页：名称/网址/短描述同上，Revenue 填 $0，状态 Side project
- Build log 首帖标题：*Building a niche calculator site for the Philippines: month one numbers*
  内容：上线日期、GSC 首月展示/点击/均位、AIO 引用占展示比例的观察、下一步（放榜页集群）。数据取自 memory/ops-calendar 的实测值，发前按最新 GSC 更新。

## Quora

- 个人简介 credential：*Builds free Philippine payroll calculators at aytool.com*
- 目标问题类型（登录后搜）：「How is SSS contribution computed 2026」「How to compute 13th month pay Philippines」「How long before I get my final pay Philippines」
- 答法：先给完整算式与官方依据，最后一行"If you want to plug in your own numbers: <对应计算器链接>"。每个问题只答一次，不在同一天连答同类题。

## 提交记录

| 日期 | 平台 | 状态 | 链接 / 备注 |
|---|---|---|---|
| 2026-09-23 | Product Hunt | 已排期：2026-09-24 00:01 PT（菲律宾时间 15:01）上线 | https://www.producthunt.com/products/aytool ；账号 @jj_l4，solo maker、Free、Bootstrapped；标签 Fintech / Personal Finance / Productivity；图：icon-512 缩 240、og/home + 4 张实填计算器截图（1270×760，CDP 驱动 headless Chrome 截取） |
| 2026-09-23 | Quora | 已发 | 账号 Jahgs，credential "Maker of Free Philippine Payroll Calculators at AyTool (2026–present)"（默认）。① 13th month 算法 → /13th-month-pay-calculator/ https://www.quora.com/How-do-I-compute-13th-month-pay-in-the-Philippines-quickly-and-correctly/answer/Jahgs-2 ② SSS 缴费表 → /sss-contribution-table/ https://www.quora.com/What-is-the-SSS-contribution-table/answer/Jahgs-2 |
| 2026-09-23 | Quora | 已发（第二批，新页上线后） | ③ 员工代扣税 → /income-tax-calculator/ https://www.quora.com/How-is-withholding-tax-calculated-for-employees-in-the-Philippines/answer/Jahgs-2 ④ 自由职业者给海外客户干活的税（8% vs 累进）→ /freelancer-tax-calculator/ https://www.quora.com/I-am-a-freelancer-from-and-living-in-the-Philippines-Should-I-pay-withholding-or-any-form-of-tax-if-I-provide-services-online-for-a-US-based-company/answer/Jahgs-2 |
| 2026-09-23 | AlternativeTo | 已提交，排队审核 | 应用 id cd653292-b528-4926-9eeb-dee03ff52a45；Free、Source available（仓库 public 无 LICENSE）→ github.com/jiayibyte/ph_sss；标签 salary-calculator / payroll-calculator / tax-calculator / personal-finance；功能勾 No registration required、Ad-free（有 GA，未勾 Privacy focused；无暗色模式）；icon-512 + 4 张截图。**未付 $5 插队**。站内没有真正的同类工具，alternatives 一步跳过 |
| 2026-09-23 | Expat Forum › Philippines | 已回复，**待审核**（新号前几帖要人工审） | 账号由用户注册。在版主 M.C.A. 的《Live in maids/helpers》帖（/threads/live-in-maids-helpers.1554580/，第 3 页）回复：从他说的"₱12,000"切入，两名保姆按地区最低工资合计约 ₱13k–14k；再按 RA 10361 列雇佣要求（地区月最低工资、SSS/PhilHealth/Pag-IBIG 按 ₱5,000 分界、以 ₱6,500 月薪算的缴费金额、书面合同、barangay 登记、休息、13th month、SIL、不许收押金）。**不带链接**：新号试用期限制发链接，用户名也不能用品牌名。等发够正常帖、过了试用期，再私信 M.C.A. 请他把计算器加进《Useful Links For Expats》 |
| 2026-09-23 | PHCorner（phcorner.org） | 已注册，**暂不发** | 版规：只能用英语或他加禄语；不许为打广告发博客或网站链接，作为引用来源可以；YouTube、社交群组、其他论坛都算广告。Career & Finance（/forums/524/）很活跃，但工资社保类求助很少；SSS 病假帖 7 月已标注 resolved，别挖坟。**11–12 月 13th month 旺季再来**；站内搜索偶尔会冒出可疑的验证框，别去点 |
| 2026-09-23 | Indie Hackers | 产品页已上线 | https://www.indiehackers.com/product/aytool （账号 aytools；Solo、Side Project、Bootstrapped、Free、Web；标签 B2C / Financial Services / Utilities）。新号还不能发帖，开发日志草稿在 backlinks-drafts-2026-09.md 的 3b，先在社区评论攒积分 |
| 2026-09-23 | Uneed | 免费队列，**2027-02-20 自动上线** | 账号 cherryeveli-10e6；描述改掉了 AI 自动填的"每年更新"；标签 Productivity / Personal Finances；logo + 3 张图。规则：上线当天投票分 ≥10 才能保留，≥20 才给 dofollow。付费插队（$14.99 / $29.99）和 $249 的"100+ 目录提交"都没买 |
| 2026-09-23 | Fazier | **不做** | 免费档要求在我方首页或页脚放 Fazier 回链徽章，等于链接交换，违反 playbook；付费档 $29–$99 |
| 2026-09-23 | SaaSHub | **不做**（用户决定） | |
| 2026-09-23 | 挂件外联邮件（草稿见 backlinks-drafts-2026-09.md §4） | 已发 4 封，定时 7 封，跳过 1 封 | 从用户 Gmail（cherryeveli@gmail.com）发出，署名 JJ。**09-23 已发**：#2 Tax and Accounting Center、#7 filipinos.sg、#4 FilePino、#6 iScale。**09-24 08:00 定时**：#3 Triple i、#8 Dubai OFW、#9 Pilipino sa Kuwait（pilipinosakuwait@gmail.com，对方 /about-us/ 公布，Cloudflare 混淆解码核实）、#11 PHRI。**09-28 08:00 定时**：#10 PMAP、#1 Accountaholics、#12 UC Career Center。**跳过** #5 Manila Recruitment：只有招聘业务的销售表单，必填电话且选项不对口。回信跟进：约 7 天后没回的，可以发一封简短的跟进，只发一次 |
| — | Reddit | 需手动发 | Claude in Chrome 对 reddit.com 有安全限制，自动化打不开 |

Quora 待答队列（新号一天 ≤4 条、同类题隔天；每条先完整作答再附链接并注明"我做的"）：
- Is a "Service Incentive Leave" (SIL) the same as a "Vacation Leave"?（0 答 2 关注）→ /service-incentive-leave-calculator/
- How is Pag-IBIG salary loan calculated?（1 答）→ /pagibig-salary-loan-calculator/
- How is the 13th month pay computed by absences in the Philippines?（与①同类，隔几天再答）→ /13th-month-pay-calculator/
- Company never paid 13th month, SIL and holiday pay for years, employee being retrenched — can they demand it?（法律向，答时只讲 Labor Code 权利与 DOLE 投诉途径，不下结论）→ /separation-pay-calculator/、/final-pay-calculator/
- Do we still get a Senior Citizen discount on the doctor's fee after having an HMO discount?（需先核实 RA 9994 与 HMO 的叠加规则再答）→ /senior-citizen-discount-calculator/

Quora 编辑器坑：行首输入 "1)" 会自动转编号列表且一直延续，列表结束要连按两次回车跳出；网址后紧跟句号有被吞进链接的风险，用括号隔开。

**Gmail 操作注意**：这个账号**开着 Gmail 键盘快捷键**。写信框没抢到焦点就开始输入时，字符会落到主界面上被当成快捷键执行。09-23 发生过两次，事后查了已发、定时、垃圾、星标、静音、回收站、归档和标签，都没有被误操作。以后写邮件一律用 `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=…&su=…&body=…` 预填打开，完全不在主界面上打字；定时发送用发送按钮旁的箭头 → "安排发送时间"。
