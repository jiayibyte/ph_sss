# 外链草稿（2026-09-23）

需要用户本人发的内容。Reddit 在 Claude in Chrome 里打不开，Facebook 群要本人加入。每条发出后记到 [backlinks-submissions.md](backlinks-submissions.md)。

## 1. r/PinoyProgrammer 开发复盘帖

发之前先看侧边栏版规，有没有 Showcase / Project flair、是否限定星期几发。正文不要改成广告腔，要保留"我是作者"这句。

**Title**

> I built a static site for PH payroll rules (Astro + Preact). Every SSS/BIR/DOLE rate is a versioned JSON with its circular and last-verified date

**Body**

> I've been building aytool.com, a free calculator site for Philippine payroll: SSS/PhilHealth/Pag-IBIG contributions, BIR withholding, 13th month, final pay, and the PRC exam schedules. No ads, no sign-up. I'm the maker. Posting here because a few engineering choices might be useful to anyone who has to encode government rules.
>
> **Rules as data, not code.** Each agency has a `src/data/<agency>/2026.json` with `rule_version`, `effective_from`, `last_verified` and the official source URL. Calculators are pure functions over that data, and the vitest suite (172 tests) includes rows from the official tables and the agencies' own worked examples. When SSS or BIR changes something, it's a data diff plus a test diff.
>
> **Content that changes by date.** Wage orders take effect on a specific day, so pages are built "as of" today's date in Manila. A server timer rebuilds the live commit at 00:05 Manila time and only publishes if the output changed. Sitemap `lastmod` is the max of the page's git date, its datasets' `last_verified`, and any scheduled change already reached.
>
> **Static + islands.** Astro 5 with Preact islands; every calculation runs client-side. Embeddable widgets live under `/embed/` (noindex, and the only path that allows framing).
>
> **A build that refuses to ship SEO drift.** An audit script over `dist/` fails on canonical/noindex mismatches, sitemap vs. indexable-set differences, and internal links that would 301 or 404.
>
> **Fun gotchas:** the BIR's own withholding table PDF prints a base tax as "6,034.00.30" (the arithmetic says 6,034.30); SSS contributions are on salary-credit brackets, not your exact salary; PhilHealth has both a floor and a ceiling.
>
> Repo is public: github.com/jiayibyte/ph_sss. I'd love feedback on how I model the rules, and corrections if you spot a wrong number (that's the whole point of the site).

## 2. LET 考生 Facebook 群帖

目标群："Licensure Exam for Teachers (LET) Community"（约 20 万人）、"LET REVIEW GROUP 2026"（约 4 万人）。先读群规，很多群只允许管理员批准的帖子。配图用 `public/og/let-board-exam-schedule.png`。

> **When are the September 2026 LET results coming out?** 📅
>
> PRC's target release date for the Sept 20, 2026 LET is **November 27, 2026**.
>
> For reference, the March 2026 LET results came out on **May 12**, 39 working days after the exam and 3 days ahead of PRC's target. 63,377 of 94,357 passed (Elementary 18,376 of 32,796; Secondary 45,001 of 61,561).
>
> I keep a free page that tracks the LET dates, filing windows and results against PRC's own announcements. You can also add the exam to your phone calendar with one tap:
> aytool.com/let-board-exam-schedule/
>
> The 2027 LET schedule isn't out yet (PRC usually publishes it around November). The page will update when it is. Good luck to everyone waiting! 🙏

## 3. 目录站提交文案（Uneed / Fazier）

用户 09-23 决定不提交 SaaSHub。

通用字段见 [backlinks-submissions.md](backlinks-submissions.md) 的"通用字段"。补充：

- **一句话**：Free Philippine payroll calculators and embeddable widgets, with official 2026 rates
- **Categories**：Finance / Calculators / HR & Payroll
- **新增卖点**：/free-calculator-widgets/ 提供 28 个免费嵌入挂件

## 3b. Indie Hackers 开发日志（新号暂不能发帖，攒点评论积分后再发）

数据来自 GSC 效果报告（2026-08-18～09-20，默认全部国家）。发之前按当天最新数字更新。

**Title**：Building a niche calculator site for the Philippines: the first month in numbers

> I launched aytool.com on Aug 19: free calculators for Philippine payroll (take-home pay, SSS/PhilHealth/Pag-IBIG, 13th month, final pay, income tax) plus the PRC board exam schedules. It's a solo side project, bootstrapped, a static Astro site. $0 revenue, and no ads yet.
>
> **Google Search Console, Aug 18 – Sep 20:** 9,210 impressions, 42 clicks (0.5% CTR), average position 19.3, across 511 different queries. Daily impressions went from zero to around a thousand.
>
> **What surprised me:**
> - Apart from my brand name, the first clicks came from **exam-schedule** searches ("when is the next pnle exam", "pnle exam schedule 2026"), not from payroll calculators. So I built out a PRC exam cluster: one page per profession, with dates, filing windows, results and .ics calendar files.
> - The payroll searches are crowded. I count more than ten Philippine calculator sites, and most sit on pages 2–3. A new domain doesn't win those by being a little better.
> - What I think will make the difference over time: every rate cites the official circular and shows the date it was last verified, and date-driven content (wage orders, holiday pay) rebuilds itself nightly so it's never stale.
>
> **Next:** a results page for each exam release, real community backlinks (answering questions on Quora and local forums rather than dropping links), and free embeddable widgets for HR blogs and OFW sites (aytool.com/free-calculator-widgets/).
>
> If you've grown a YMYL niche site: what got you your first genuine backlinks?

## 4. 挂件外联邮件（12 封）

2026-09-23 调研：对象都核实过 2025–2026 仍在更新；联系方式只用对方网站公开的收件邮箱或联系表单。
- **节奏**：新域名一天发十几封冷邮件，容易进垃圾箱，每天发 4 封左右，分 3 天发完。
- **切入点核实**：#2、#5 的切入点 09-23 已用 WebFetch 核实。
- **只发一家**：FilePino 和 TeleHR Solutions 电话相同，基本是同一家公司，只发 FilePino。

所有邮件共用的两条链接：
- 挂件预览：`https://aytool.com/embed/<slug>/`
- 全部挂件代码：https://aytool.com/free-calculator-widgets/

签名统一用：
```
[Your name]
AyTool — free Philippine payroll calculators
https://aytool.com · contact@aytool.com
```

---

**#1 Accountaholics PH** · hello@accountaholicsph.com
Subject: A free SSS calculator for your employer-compliance post

> Hi Accountaholics team,
>
> I read your post on the SSS, PhilHealth and Pag-IBIG mistakes employers make (accountaholicsph.com/sss-philhealth-pagibig-employer-compliance-mistakes/). It's a clear list, and it made me think your readers would want to check their own numbers right there.
>
> I run AyTool, a free, independent set of Philippine payroll calculators. You're welcome to embed our SSS contribution calculator (or the take-home pay one) under that post. It's one iframe snippet: no sign-up, no ads, and it updates itself when SSS changes its schedule. Every result shows the circular it follows and when we last checked it.
>
> Preview: https://aytool.com/embed/sss-contribution-calculator/
> All 28 widgets and their code: https://aytool.com/free-calculator-widgets/
>
> No strings attached. If it's not a fit, no reply needed.

---

**#2 Tax and Accounting Center, Inc.** · info@taxacctgcenter.ph
Subject: Withholding tax calculator for your compensation-tax article

> Hi Tax and Accounting Center team,
>
> Your article on the features of withholding tax on compensation (taxacctgcenter.ph/features-of-withholding-tax-on-compensation-in-the-philippines/) is a helpful explainer. One small thing I noticed: it describes the rates as "ranging from 20%-32%", which was the 2018–2022 table. Since January 2023 the BIR table (Annex E, RR 11-2018) runs 15% to 35%.
>
> If it saves you a rewrite, you're welcome to embed our free income tax calculator under that section. It follows the current BIR table, shows the table and its effective date with every result, and updates itself when the rates change. It's one iframe snippet with no sign-up and no ads.
>
> Preview: https://aytool.com/embed/income-tax-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> Thanks for the payroll webinars you run for practitioners.

---

**#3 Triple i Consulting** · info@tripleiconsulting.com
Subject: Night differential + overtime calculator for your BPO payroll post

> Hi Triple i team,
>
> Your post on payroll for BPOs with high overtime and night-differential pay (tripleiconsulting.com/payroll-outsourcing-solutions-for-bpos-with-high-overtime-night-differential-pay/) explains how those premiums stack better than most.
>
> I run AyTool, a free set of Philippine payroll calculators. You're welcome to embed our night differential calculator, or the overtime one, in that post so readers can try it with their own rate. It's one iframe snippet: no sign-up, no ads, and it follows the DOLE handbook rules, with the source shown under every result.
>
> Previews: https://aytool.com/embed/night-differential-calculator/ · https://aytool.com/embed/overtime-pay-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> If it's not a fit, no reply needed.

---

**#4 FilePino** · info@filepino.com
Subject: A SIL conversion calculator for your service incentive leave guide

> Hi FilePino team,
>
> Your guide to service incentive leave (filepino.com/service-incentive-leave-sil-in-the-philippines/) walks through converting unused SIL to cash. That's the part readers most often get stuck on.
>
> I run AyTool, a free set of Philippine payroll calculators. You're welcome to embed our SIL calculator right under that section. It does the pro-rated conversion at the current daily rate (Labor Code Art. 95), and it's one iframe snippet with no sign-up and no ads.
>
> Preview: https://aytool.com/embed/service-incentive-leave-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> No strings attached.

---

**#5 Manila Recruitment** · contact form: manilarecruitment.com/contact-us/
Subject: The calculator for your "13th Month Pay Calculator" article

> Hi Manila Recruitment team,
>
> Your article "How to Compute 13th Month Pay Philippines Calculator" (Dec 15, 2025) recommends using a 13th month pay calculator but doesn't link one. With the December payout coming, I thought you might like a free one to embed there.
>
> I run AyTool, a free, independent set of Philippine payroll calculators. Our 13th month widget follows PD 851: total basic salary actually earned in the year ÷ 12. It handles mid-year hires, resignations and mid-year raises, and has a month-by-month mode. One detail readers often ask about is that the divisor stays 12. A partial year is pro-rated because the salary earned is smaller; you don't multiply by months worked again.
>
> Preview: https://aytool.com/embed/13th-month-pay-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> It's one iframe snippet with no sign-up and no ads. Happy to help if you'd like it placed differently.

---

**#6 iScale Solutions** · info@iscale-solutions.com
Subject: Final pay calculator for your final pay guide

> Hi iScale team,
>
> Your final pay guide (iscale-solutions.com/final-pay-in-the-philippines/), updated this week, is thorough, and the worked example helps.
>
> I run AyTool, a free set of Philippine payroll calculators. You're welcome to embed our final pay calculator next to that example so readers can enter their own figures: unpaid salary, pro-rated 13th month, SIL conversion and the 30-day release rule. It's one iframe snippet with no sign-up and no ads, and it follows the DOLE rules, with the source shown under every result.
>
> Preview: https://aytool.com/embed/final-pay-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> If it's not a fit, no reply needed.

---

**#7 filipinos.sg** · hello@filipinos.sg
Subject: SSS (OFW) and MP2 calculators for your Singapore guides

> Hi filipinos.sg team,
>
> Your guide to SSS, Pag-IBIG and PhilHealth for OFWs in Singapore is one of the clearest I've found. I also saw you already run a rest-day pay tool for helpers.
>
> I run AyTool, a free set of Philippine payroll calculators. Two widgets might sit well on your pages. The SSS contribution calculator has an OFW mode with the ₱8,000 minimum salary credit, so readers can see exactly what they'll pay. The MP2 calculator uses the official dividend history. Both are one iframe snippet with no sign-up and no ads, and they update themselves when the rates change.
>
> Previews: https://aytool.com/embed/sss-contribution-calculator/ · https://aytool.com/embed/pagibig-mp2-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> Salamat, and keep up the good work for the community.

---

**#8 Dubai OFW** · admin@dubaiOFW.com
Subject: "How much?" to go with your "how to pay SSS" guide

> Hi Dubai OFW team,
>
> Your guide on how to pay SSS from Dubai (dubaiofw.com/how-to-pay-sss/) covers the "how". The question readers usually ask next is "how much?"
>
> I run AyTool, a free set of Philippine payroll calculators. Our SSS contribution calculator has an OFW mode (₱8,000 minimum salary credit, full 15% paid by the member), and you're welcome to embed it under your guide. It's one iframe snippet: no sign-up, no ads, and it updates itself when SSS changes the schedule.
>
> Preview: https://aytool.com/embed/sss-contribution-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> No strings attached.

---

**#9 Pilipino sa Kuwait** · contact form: pilipinosakuwait.com/contact-us/ (or pilipinosakuwait@gmail.com, listed on /about-us/)
Subject: Free SSS and OEC calculators for your OFW guides

> Hi Pilipino sa Kuwait team,
>
> Thank you for the guides you publish for kababayans in Kuwait: the SSS contribution check and the online OEC guide especially.
>
> I run AyTool, a free set of Philippine payroll calculators, and two of our widgets fit under those posts. The SSS contribution calculator has an OFW mode. The OEC exemption checker walks through who can skip the OEC under DMW rules. Both are one iframe snippet with no sign-up and no ads, and they're free for community sites.
>
> Previews: https://aytool.com/embed/sss-contribution-calculator/ · https://aytool.com/embed/oec-exemption/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> Maraming salamat!

---

**#10 PMAP** · pmap@pmap.org.ph
Subject: A holiday pay calculator for members, ahead of the December holidays

> Dear PMAP Secretariat,
>
> Your circulars relaying the DOLE holiday pay advisories (most recently Labor Advisory 13-2026) are something many HR practitioners rely on. With the December holidays coming, I wanted to offer a free tool members can use to apply those rates.
>
> I run AyTool, an independent set of Philippine payroll calculators. Our holiday pay calculator follows the DOLE advisories for each 2026 holiday: regular and special days, worked or not, plus rest-day and overtime premiums. It can be embedded on any page with one iframe snippet, with no sign-up and no ads, and every result cites the advisory used.
>
> Preview: https://aytool.com/embed/holiday-pay-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> Thank you for your work for the HR profession.

---

**#11 Philippine HR Institute (PHRI)** · secretariat@phri.com.ph
Subject: A minimum wage widget that updates itself for your wage posts

> Hi PHRI team,
>
> Your post on the NCR 2026 minimum wage review (phri.com.ph/minimum-wage-review-ncr-2026/) is the kind of update that dates quickly when a new wage order comes out.
>
> I run AyTool, a free set of Philippine payroll calculators. Our minimum wage widget shows every region's current rate and switches to a new wage order on its effectivity date on its own (NCR-28 on Sep 26, 2026, for example), so an embedded copy never goes stale. It's one iframe snippet with no sign-up and no ads.
>
> Preview: https://aytool.com/embed/minimum-wage-philippines/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> If it's not a fit, no reply needed.

---

**#12 University of the Cordilleras — Career Development Center** · careercenter@uc-bcf.edu.ph
Subject: A take-home pay calculator for your Workforce Essentials resources

> Dear UC Career Development Center,
>
> I came across your Workforce Essentials 2025 session with PhilHealth, Pag-IBIG, BIR and SSS. It's a great idea to walk graduates through those agencies before their first job.
>
> As a follow-up resource, you're welcome to embed our free take-home pay calculator on your resources page. It shows a new graduate exactly what SSS, PhilHealth, Pag-IBIG and withholding tax do to a first payslip, line by line. It's one iframe snippet with no sign-up and no ads, and nothing students type leaves their browser.
>
> Preview: https://aytool.com/embed/take-home-pay-calculator/
> All widgets: https://aytool.com/free-calculator-widgets/
>
> Thank you for looking out for your graduates.

---

**建议发送顺序**：第 1 天 #5（13th month 季节性最强）、#2、#7、#4；第 2 天 #6、#3、#8、#9；第 3 天 #11、#10、#1、#12。

**调研时剔除的**：内容农场（PhilNews、WorldNgayon 等）、HR/薪资软件厂商、大型区域事务所、停更或查不到联系方式的站点。Poor Pinoy Investor 很活跃，但它是个人理财博客，可以放进 Moneymax 那一档的编辑型 outreach。
