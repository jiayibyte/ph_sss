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

## 5. 挂件邮件跟进（每家只发一次）

写于 2026-09-29。规则：原信发出约 7 天后仍没回复才发；**发之前先查收件箱和「已发送」**——对方已回复的不发，09-24 / 09-28 定时的那几封要先确认确实发出去了。最好在原邮件线程里点「回复」再粘贴正文（主题自动变成 Re:），这样对方能看到上一封；链接里的预填写信只作备用。按记忆里的规矩，只用 `view=cm` 预填链接写信，不在 Gmail 主界面直接打字。

| # | 对象 | 收件人 | 原信 | 跟进日 |
|---|---|---|---|---|
| #2 | Tax and Accounting Center, Inc. | info@taxacctgcenter.ph | 09-23 | **09-30** |
| #7 | filipinos.sg | hello@filipinos.sg | 09-23 | **09-30** |
| #4 | FilePino | info@filepino.com | 09-23 | **09-30** |
| #6 | iScale Solutions | info@iscale-solutions.com | 09-23 | **09-30** |
| #3 | Triple i Consulting | info@tripleiconsulting.com | 09-24 | **10-01** |
| #8 | Dubai OFW | admin@dubaiOFW.com | 09-24 | **10-01** |
| #9 | Pilipino sa Kuwait | pilipinosakuwait@gmail.com | 09-24 | **10-01** |
| #11 | Philippine HR Institute (PHRI) | secretariat@phri.com.ph | 09-24 | **10-01** |
| #10 | PMAP | pmap@pmap.org.ph | 09-28 | **10-05** |
| #1 | Accountaholics PH | hello@accountaholicsph.com | 09-28 | **10-05** |
| #12 | University of the Cordilleras — Career Development Center | careercenter@uc-bcf.edu.ph | 09-28 | **10-05** |

---

**#2 Tax and Accounting Center, Inc.** · info@taxacctgcenter.ph · 跟进日 09-30
Subject: Re: Withholding tax calculator for your compensation-tax article

> Hi Tax and Accounting Center team,
>
> A short follow-up on the free income tax calculator I mentioned last week. With year-end annualization and the ₱90,000 bonus exemption coming up in December, it may be useful under your withholding tax article: it follows the current BIR table (15%–35% since January 2023) and shows the table it used with every result.
>
> Preview: https://aytool.com/embed/income-tax-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=info%40taxacctgcenter.ph&su=Re%3A%20Withholding%20tax%20calculator%20for%20your%20compensation-tax%20article&body=Hi%20Tax%20and%20Accounting%20Center%20team%2C%0A%0AA%20short%20follow-up%20on%20the%20free%20income%20tax%20calculator%20I%20mentioned%20last%20week.%20With%20year-end%20annualization%20and%20the%20%E2%82%B190%2C000%20bonus%20exemption%20coming%20up%20in%20December%2C%20it%20may%20be%20useful%20under%20your%20withholding%20tax%20article%3A%20it%20follows%20the%20current%20BIR%20table%20%2815%25%E2%80%9335%25%20since%20January%202023%29%20and%20shows%20the%20table%20it%20used%20with%20every%20result.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fincome-tax-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#7 filipinos.sg** · hello@filipinos.sg · 跟进日 09-30
Subject: Re: SSS (OFW) and MP2 calculators for your Singapore guides

> Hi filipinos.sg team,
>
> Just a quick follow-up on the SSS (OFW) and Pag-IBIG MP2 calculators I offered last week. Two things your readers ask about this time of year: land-based OFWs can still pay January–September SSS contributions until December 31, and the MP2 calculator already uses the 7.12% dividend Pag-IBIG declared for 2025.
>
> SSS: https://aytool.com/embed/sss-contribution-calculator/
> MP2: https://aytool.com/embed/pagibig-mp2-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=hello%40filipinos.sg&su=Re%3A%20SSS%20%28OFW%29%20and%20MP2%20calculators%20for%20your%20Singapore%20guides&body=Hi%20filipinos.sg%20team%2C%0A%0AJust%20a%20quick%20follow-up%20on%20the%20SSS%20%28OFW%29%20and%20Pag-IBIG%20MP2%20calculators%20I%20offered%20last%20week.%20Two%20things%20your%20readers%20ask%20about%20this%20time%20of%20year%3A%20land-based%20OFWs%20can%20still%20pay%20January%E2%80%93September%20SSS%20contributions%20until%20December%2031%2C%20and%20the%20MP2%20calculator%20already%20uses%20the%207.12%25%20dividend%20Pag-IBIG%20declared%20for%202025.%0A%0ASSS%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fsss-contribution-calculator%2F%0AMP2%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fpagibig-mp2-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#4 FilePino** · info@filepino.com · 跟进日 09-30
Subject: Re: A SIL conversion calculator for your service incentive leave guide

> Hi FilePino team,
>
> A short follow-up on the service incentive leave calculator I mentioned last week. Year-end is when most employers convert unused SIL to cash, so it may help readers of your SIL guide check the amount (5 days a year under Art. 95, using their daily rate).
>
> Preview: https://aytool.com/embed/service-incentive-leave-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=info%40filepino.com&su=Re%3A%20A%20SIL%20conversion%20calculator%20for%20your%20service%20incentive%20leave%20guide&body=Hi%20FilePino%20team%2C%0A%0AA%20short%20follow-up%20on%20the%20service%20incentive%20leave%20calculator%20I%20mentioned%20last%20week.%20Year-end%20is%20when%20most%20employers%20convert%20unused%20SIL%20to%20cash%2C%20so%20it%20may%20help%20readers%20of%20your%20SIL%20guide%20check%20the%20amount%20%285%20days%20a%20year%20under%20Art.%2095%2C%20using%20their%20daily%20rate%29.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fservice-incentive-leave-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#6 iScale Solutions** · info@iscale-solutions.com · 跟进日 09-30
Subject: Re: Final pay calculator for your final pay guide

> Hi iScale team,
>
> A quick follow-up on the final pay calculator I offered last week for your final pay guide. It covers unpaid salary, leave conversion, prorated 13th month and separation pay, and shows the DOLE 30-day release rule with the result.
>
> Preview: https://aytool.com/embed/final-pay-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=info%40iscale-solutions.com&su=Re%3A%20Final%20pay%20calculator%20for%20your%20final%20pay%20guide&body=Hi%20iScale%20team%2C%0A%0AA%20quick%20follow-up%20on%20the%20final%20pay%20calculator%20I%20offered%20last%20week%20for%20your%20final%20pay%20guide.%20It%20covers%20unpaid%20salary%2C%20leave%20conversion%2C%20prorated%2013th%20month%20and%20separation%20pay%2C%20and%20shows%20the%20DOLE%2030-day%20release%20rule%20with%20the%20result.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Ffinal-pay-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#3 Triple i Consulting** · info@tripleiconsulting.com · 跟进日 10-01
Subject: Re: Night differential + overtime calculator for your BPO payroll post

> Hi Triple i team,
>
> A short follow-up on the night differential and overtime calculators I mentioned last week. Since then the NCR minimum wage moved to ₱755 on September 26, and the overtime page now has a per-hour table for common daily rates (₱755 comes to ₱117.97 for one ordinary-day OT hour) — handy for a BPO payroll post.
>
> Overtime: https://aytool.com/embed/overtime-pay-calculator/
> Night differential: https://aytool.com/embed/night-differential-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=info%40tripleiconsulting.com&su=Re%3A%20Night%20differential%20%2B%20overtime%20calculator%20for%20your%20BPO%20payroll%20post&body=Hi%20Triple%20i%20team%2C%0A%0AA%20short%20follow-up%20on%20the%20night%20differential%20and%20overtime%20calculators%20I%20mentioned%20last%20week.%20Since%20then%20the%20NCR%20minimum%20wage%20moved%20to%20%E2%82%B1755%20on%20September%2026%2C%20and%20the%20overtime%20page%20now%20has%20a%20per-hour%20table%20for%20common%20daily%20rates%20%28%E2%82%B1755%20comes%20to%20%E2%82%B1117.97%20for%20one%20ordinary-day%20OT%20hour%29%20%E2%80%94%20handy%20for%20a%20BPO%20payroll%20post.%0A%0AOvertime%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fovertime-pay-calculator%2F%0ANight%20differential%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fnight-differential-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#8 Dubai OFW** · admin@dubaiOFW.com · 跟进日 10-01
Subject: Re: "How much?" to go with your "how to pay SSS" guide

> Hi Dubai OFW team,
>
> A quick follow-up on the SSS calculator I offered for your "how to pay SSS" guide. It may be timely: land-based OFWs can still pay their January–September 2026 contributions until December 31, and the calculator shows the OFW minimum (₱8,000 salary credit, ₱1,200 a month).
>
> Preview: https://aytool.com/embed/sss-contribution-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=admin%40dubaiOFW.com&su=Re%3A%20%22How%20much%3F%22%20to%20go%20with%20your%20%22how%20to%20pay%20SSS%22%20guide&body=Hi%20Dubai%20OFW%20team%2C%0A%0AA%20quick%20follow-up%20on%20the%20SSS%20calculator%20I%20offered%20for%20your%20%22how%20to%20pay%20SSS%22%20guide.%20It%20may%20be%20timely%3A%20land-based%20OFWs%20can%20still%20pay%20their%20January%E2%80%93September%202026%20contributions%20until%20December%2031%2C%20and%20the%20calculator%20shows%20the%20OFW%20minimum%20%28%E2%82%B18%2C000%20salary%20credit%2C%20%E2%82%B11%2C200%20a%20month%29.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fsss-contribution-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#9 Pilipino sa Kuwait** · pilipinosakuwait@gmail.com · 跟进日 10-01
Subject: Re: Free SSS and OEC calculators for your OFW guides

> Hi Pilipino sa Kuwait team,
>
> A short follow-up on the SSS and OEC tools I mentioned last week. For your readers: land-based OFWs can still pay January–September 2026 SSS contributions until December 31, and the OEC page has a five-question check for who can skip the OEC as a returning worker.
>
> SSS: https://aytool.com/embed/sss-contribution-calculator/
> OEC guide: https://aytool.com/oec-exemption/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=pilipinosakuwait%40gmail.com&su=Re%3A%20Free%20SSS%20and%20OEC%20calculators%20for%20your%20OFW%20guides&body=Hi%20Pilipino%20sa%20Kuwait%20team%2C%0A%0AA%20short%20follow-up%20on%20the%20SSS%20and%20OEC%20tools%20I%20mentioned%20last%20week.%20For%20your%20readers%3A%20land-based%20OFWs%20can%20still%20pay%20January%E2%80%93September%202026%20SSS%20contributions%20until%20December%2031%2C%20and%20the%20OEC%20page%20has%20a%20five-question%20check%20for%20who%20can%20skip%20the%20OEC%20as%20a%20returning%20worker.%0A%0ASSS%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fsss-contribution-calculator%2F%0AOEC%20guide%3A%20https%3A%2F%2Faytool.com%2Foec-exemption%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#11 Philippine HR Institute (PHRI)** · secretariat@phri.com.ph · 跟进日 10-01
Subject: Re: A minimum wage widget that updates itself for your wage posts

> Hi PHRI team,
>
> A quick follow-up on the minimum wage widget I mentioned last week — it did what I described: on September 26 it switched to the NCR-28 rates (₱755 / ₱718) by itself, with no edit on anyone's page. The Bicol and BARMM second tranches on December 1 will switch the same way.
>
> Preview: https://aytool.com/embed/minimum-wage-philippines/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=secretariat%40phri.com.ph&su=Re%3A%20A%20minimum%20wage%20widget%20that%20updates%20itself%20for%20your%20wage%20posts&body=Hi%20PHRI%20team%2C%0A%0AA%20quick%20follow-up%20on%20the%20minimum%20wage%20widget%20I%20mentioned%20last%20week%20%E2%80%94%20it%20did%20what%20I%20described%3A%20on%20September%2026%20it%20switched%20to%20the%20NCR-28%20rates%20%28%E2%82%B1755%20%2F%20%E2%82%B1718%29%20by%20itself%2C%20with%20no%20edit%20on%20anyone%27s%20page.%20The%20Bicol%20and%20BARMM%20second%20tranches%20on%20December%201%20will%20switch%20the%20same%20way.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fminimum-wage-philippines%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#10 PMAP** · pmap@pmap.org.ph · 跟进日 10-05
Subject: Re: A holiday pay calculator for members, ahead of the December holidays

> Hi PMAP team,
>
> A short follow-up on the holiday pay calculator I offered for members. The busy stretch is close: Bonifacio Day (Nov 30), Christmas (Dec 25) and Rizal Day (Dec 30) are regular holidays at 200% if worked, with the special days in between at 130%. The calculator follows the official 2026 list, and the 2027 list is already on the site.
>
> Preview: https://aytool.com/embed/holiday-pay-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=pmap%40pmap.org.ph&su=Re%3A%20A%20holiday%20pay%20calculator%20for%20members%2C%20ahead%20of%20the%20December%20holidays&body=Hi%20PMAP%20team%2C%0A%0AA%20short%20follow-up%20on%20the%20holiday%20pay%20calculator%20I%20offered%20for%20members.%20The%20busy%20stretch%20is%20close%3A%20Bonifacio%20Day%20%28Nov%2030%29%2C%20Christmas%20%28Dec%2025%29%20and%20Rizal%20Day%20%28Dec%2030%29%20are%20regular%20holidays%20at%20200%25%20if%20worked%2C%20with%20the%20special%20days%20in%20between%20at%20130%25.%20The%20calculator%20follows%20the%20official%202026%20list%2C%20and%20the%202027%20list%20is%20already%20on%20the%20site.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fholiday-pay-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#1 Accountaholics PH** · hello@accountaholicsph.com · 跟进日 10-05
Subject: Re: A free SSS calculator for your employer-compliance post

> Hi Accountaholics team,
>
> A quick follow-up on the SSS calculator I offered for your employer-compliance post. It follows the current SSS schedule (15%, ₱5,000–₱35,000 salary credit) and shows the circular behind every result, so readers can check the employee, employer and EC shares themselves.
>
> Preview: https://aytool.com/embed/sss-contribution-calculator/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=hello%40accountaholicsph.com&su=Re%3A%20A%20free%20SSS%20calculator%20for%20your%20employer-compliance%20post&body=Hi%20Accountaholics%20team%2C%0A%0AA%20quick%20follow-up%20on%20the%20SSS%20calculator%20I%20offered%20for%20your%20employer-compliance%20post.%20It%20follows%20the%20current%20SSS%20schedule%20%2815%25%2C%20%E2%82%B15%2C000%E2%80%93%E2%82%B135%2C000%20salary%20credit%29%20and%20shows%20the%20circular%20behind%20every%20result%2C%20so%20readers%20can%20check%20the%20employee%2C%20employer%20and%20EC%20shares%20themselves.%0A%0APreview%3A%20https%3A%2F%2Faytool.com%2Fembed%2Fsss-contribution-calculator%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#12 University of the Cordilleras — Career Development Center** · careercenter@uc-bcf.edu.ph · 跟进日 10-05
Subject: Re: A take-home pay calculator for your Workforce Essentials resources

> Hi UC Career Development Center,
>
> A short follow-up on the take-home pay calculator I mentioned for your Workforce Essentials resources. For graduating students it answers the first-job question — what is left of a salary after SSS, PhilHealth, Pag-IBIG and tax — and our first-time jobseeker page lists the documents they can get free under RA 11261.
>
> Take-home pay: https://aytool.com/embed/take-home-pay-calculator/
> First-time jobseeker guide: https://aytool.com/first-time-jobseeker/
>
> If it isn't a fit, no need to reply — I won't write again.
>
> JJ
> AyTool — free Philippine payroll calculators
> https://aytool.com · contact@aytool.com

[备用：预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=careercenter%40uc-bcf.edu.ph&su=Re%3A%20A%20take-home%20pay%20calculator%20for%20your%20Workforce%20Essentials%20resources&body=Hi%20UC%20Career%20Development%20Center%2C%0A%0AA%20short%20follow-up%20on%20the%20take-home%20pay%20calculator%20I%20mentioned%20for%20your%20Workforce%20Essentials%20resources.%20For%20graduating%20students%20it%20answers%20the%20first-job%20question%20%E2%80%94%20what%20is%20left%20of%20a%20salary%20after%20SSS%2C%20PhilHealth%2C%20Pag-IBIG%20and%20tax%20%E2%80%94%20and%20our%20first-time%20jobseeker%20page%20lists%20the%20documents%20they%20can%20get%20free%20under%20RA%2011261.%0A%0ATake-home%20pay%3A%20https%3A%2F%2Faytool.com%2Fembed%2Ftake-home-pay-calculator%2F%0AFirst-time%20jobseeker%20guide%3A%20https%3A%2F%2Faytool.com%2Ffirst-time-jobseeker%2F%0A%0AIf%20it%20isn%27t%20a%20fit%2C%20no%20need%20to%20reply%20%E2%80%94%20I%20won%27t%20write%20again.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20calculators%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

## 6. 考试订阅日历外联（新资产：会自己更新的考试日历）

写于 2026-09-29。可以拿去讲的点只有一个：**订阅一次，PRC 公布 2027 日程那天，报名截止、考试日、放榜日就自动出现在考生的日历里**，不用注册、不留邮箱。每个考试页首屏都有订阅链接（Google Calendar / iPhone·Outlook），订阅源是 `https://aytool.com/data/prc/feed/<slug>.ics`。

红线：只发给公开了收件邮箱或表单的对象，每家只发一封；群里发帖先读群规，只允许管理员审核帖的群就走审核；不冒充考生、不刷评论。

### 6a. 考生 Facebook 群 / Reddit 帖（护理为例，其他专业替换考试名和链接）

> **PNLE 2027 dates: a calendar that fills itself in**
>
> PRC hasn't released the 2027 schedule yet (last year it went up in mid-November). If you don't want to keep checking, you can subscribe to a free PNLE calendar: https://aytool.com/nursing-board-exam-schedule/ → "subscribe to this exam's calendar" (Google Calendar or iPhone). The day PRC posts 2027, the filing deadline, exam days and results date show up in your calendar on their own. No sign-up, no email.
>
> For reference, the Aug–Sep 2026 PNLE results came out Sept 18: 28,652 of 37,359 passed (76.69%).
>
> (I made this page. It's free and not affiliated with PRC — always confirm on prc.gov.ph.)

其他专业替换：
- LET：https://aytool.com/let-board-exam-schedule/（9/20 那轮 PRC 目标放榜日 11/27）
- CPALE：https://aytool.com/cpa-board-exam-schedule/（10/24–26 考试，目标放榜 11/3）
- 犯罪学：https://aytool.com/criminology-board-exam-schedule/
- 土木：https://aytool.com/civil-engineering-board-exam-schedule/（9/26–27 那轮目标放榜 10/2）
- 心理测量师：https://aytool.com/psychometrician-board-exam-schedule/（9 月轮 9/23 放榜，14,146/15,423，91.72%）

### 6b. 复习中心 / 学校邮件模板

Subject: A free {EXAM} calendar your reviewees can subscribe to

> Hi {ORG} team,
>
> {ONE LINE ABOUT THEIR PAGE — e.g. "Your post listing the 2026 {EXAM} dates is one your reviewees clearly use."}
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free {EXAM} calendar that anyone can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: {PAGE_URL}
>
> If it's useful for your reviewees, feel free to link it. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

具体对象见 6c。

### 6c. 复习中心名单与定制邮件（2026-09-29 调研，逐个在对方官网核实）

每天发 4 封左右，避免新域名被当成群发。挂件跟进信在 09-30 / 10-01 / 10-05，这批排在 10-02、10-03、10-06。#6、#12 契合度弱，放最后可发可不发。#2 只有表单，把正文贴进表单。

| # | 对象 | 专业 | 联系方式 | 建议发送日 |
|---|---|---|---|---|
| #1 | CEVAS Philippines | 护理（+犯罪学、CPA） | client.cevas@gmail.com | 10-02 |
| #2 | Ray A. Gapuz Review System | 护理 | https://www.raygapuzreviewsystem.com/contact-us | 10-02 |
| #3 | St. Louis Review Center (SLRC) San Pablo | LET（+护理、犯罪学） | slrcsanpablo@gmail.com | 10-02 |
| #4 | CREED Review Center | 犯罪学 | creedreviewcenter@gmail.com | 10-02 |
| #5 | Team PRTC | CPA | enroll@teamprtc.com.ph | 10-03 |
| #7 | Inhinyero Review Center | 土木 | admin@inhinyero.ph | 10-03 |
| #8 | GERTC (Gillesania) | 土木 | inquiries@gertcrev.com | 10-03 |
| #9 | ACTS Review Center | 医检 | info@actsreviewcenter.com | 10-03 |
| #10 | Pioneer Review Center (PRCI) | 医检 | consult@perc.com.ph | 10-06 |
| #11 | Overarch Review Center | 医检 | overarchreviewcenter@gmail.com | 10-06 |
| #6 | CRC-ACE Review School（可选：官网最近更新 2025-07） | CPA | crc_ace@yahoo.com | 可选 |
| #12 | Manor Review Center（可选：页面没有考试日期，契合度弱） | 药剂 | manorreviewcenter@yahoo.com | 可选 |

未入选（记录原因，免得重复调研）：CPAR、QARC、Megareview（页面只能在浏览器里加载，脚本读不到）；ReSA 站点无响应；Centro 域名解析失败；CBRC 考试更新栏停在 2023–2024-01；REO 最新内容 2025-09，无考试日期页（备选 inquiry@reo.com.ph）；Brex 无日期、页面是模板占位；Legend 只有电话；Kippap 无邮箱；RGO 以心理测量为主且无日期；NFJPIA / USC-JPIA 无邮箱；大学页面只有放榜贺帖或只有注册处邮箱。竞品/聚合站不发：supertutor、cpareview.ph、schoolfinderph、board.com.ph、prcworld.ph、boardexams.ph。

---

**#1 CEVAS Philippines** · client.cevas@gmail.com · 10-02
Subject: A free PNLE and CLE calendar for your reviewees

> Hi CEVAS team,
>
> Your NLE review page still lists the August 29–30, 2026 exam, and your criminology page is already on the February 2027 review — so your reviewees are looking a round ahead.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free PNLE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything. The same calendars exist for criminology (https://aytool.com/criminology-board-exam-schedule/) and CPALE (https://aytool.com/cpa-board-exam-schedule/).
>
> Page and subscribe links: https://aytool.com/nursing-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=client.cevas%40gmail.com&su=A%20free%20PNLE%20and%20CLE%20calendar%20for%20your%20reviewees&body=Hi%20CEVAS%20team%2C%0A%0AYour%20NLE%20review%20page%20still%20lists%20the%20August%2029%E2%80%9330%2C%202026%20exam%2C%20and%20your%20criminology%20page%20is%20already%20on%20the%20February%202027%20review%20%E2%80%94%20so%20your%20reviewees%20are%20looking%20a%20round%20ahead.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20PNLE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%20The%20same%20calendars%20exist%20for%20criminology%20%28https%3A%2F%2Faytool.com%2Fcriminology-board-exam-schedule%2F%29%20and%20CPALE%20%28https%3A%2F%2Faytool.com%2Fcpa-board-exam-schedule%2F%29.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fnursing-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#2 Ray A. Gapuz Review System** · https://www.raygapuzreviewsystem.com/contact-us · 10-02
Subject: A free PNLE calendar that updates itself

> Hi Ray A. Gapuz Review System team,
>
> Your NLE 2026 study guide has an "Official Exam Schedule 2026" table that many reviewees use. The August–September 2026 results came out on September 18, and the 2027 rounds are not published yet.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free PNLE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/nursing-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

（表单：把 Subject 和正文贴进对方的联系表单）

---

**#3 St. Louis Review Center (SLRC) San Pablo** · slrcsanpablo@gmail.com · 10-02
Subject: A free LET calendar that follows the PRC schedule

> Hi SLRC team,
>
> Your guide on applying for the licensure exam tells reviewees to always verify the LET schedule with PRC — this calendar is built from the PRC resolution itself.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free LET calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything. PRC's target results date for the September 20, 2026 LET is November 27. There are matching calendars for the NLE (https://aytool.com/nursing-board-exam-schedule/) and criminology (https://aytool.com/criminology-board-exam-schedule/).
>
> Page and subscribe links: https://aytool.com/let-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=slrcsanpablo%40gmail.com&su=A%20free%20LET%20calendar%20that%20follows%20the%20PRC%20schedule&body=Hi%20SLRC%20team%2C%0A%0AYour%20guide%20on%20applying%20for%20the%20licensure%20exam%20tells%20reviewees%20to%20always%20verify%20the%20LET%20schedule%20with%20PRC%20%E2%80%94%20this%20calendar%20is%20built%20from%20the%20PRC%20resolution%20itself.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20LET%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%20PRC%27s%20target%20results%20date%20for%20the%20September%2020%2C%202026%20LET%20is%20November%2027.%20There%20are%20matching%20calendars%20for%20the%20NLE%20%28https%3A%2F%2Faytool.com%2Fnursing-board-exam-schedule%2F%29%20and%20criminology%20%28https%3A%2F%2Faytool.com%2Fcriminology-board-exam-schedule%2F%29.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Flet-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#4 CREED Review Center** · creedreviewcenter@gmail.com · 10-02
Subject: The February 2027 CLE dates, straight into your reviewees' calendars

> Hi CREED team,
>
> Your countdown to the February 2027 Criminologists Licensure Examination is a nice touch for reviewees.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free criminology board exam calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything. PRC has not published the exact 2027 dates yet; once it does, they show up in subscribers' calendars on their own.
>
> Page and subscribe links: https://aytool.com/criminology-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=creedreviewcenter%40gmail.com&su=The%20February%202027%20CLE%20dates%2C%20straight%20into%20your%20reviewees%27%20calendars&body=Hi%20CREED%20team%2C%0A%0AYour%20countdown%20to%20the%20February%202027%20Criminologists%20Licensure%20Examination%20is%20a%20nice%20touch%20for%20reviewees.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20criminology%20board%20exam%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%20PRC%20has%20not%20published%20the%20exact%202027%20dates%20yet%3B%20once%20it%20does%2C%20they%20show%20up%20in%20subscribers%27%20calendars%20on%20their%20own.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fcriminology-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#5 Team PRTC** · enroll@teamprtc.com.ph · 10-03
Subject: A free CPALE calendar for your May 2027 batch

> Hi Team PRTC team,
>
> You're already enrolling the May 2027 batch while the October 2026 batch sits the exam (October 24–26; PRC's results target is November 3).
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free CPALE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/cpa-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=enroll%40teamprtc.com.ph&su=A%20free%20CPALE%20calendar%20for%20your%20May%202027%20batch&body=Hi%20Team%20PRTC%20team%2C%0A%0AYou%27re%20already%20enrolling%20the%20May%202027%20batch%20while%20the%20October%202026%20batch%20sits%20the%20exam%20%28October%2024%E2%80%9326%3B%20PRC%27s%20results%20target%20is%20November%203%29.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20CPALE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fcpa-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#7 Inhinyero Review Center** · admin@inhinyero.ph · 10-03
Subject: A free CELE calendar for your next batch

> Hi Inhinyero team,
>
> Your homepage countdown was set to the September 26–27, 2026 CELE; PRC's results target for it is October 2.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free civil engineering board exam calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything. It could also carry your countdown into the 2027 rounds once PRC names the dates.
>
> Page and subscribe links: https://aytool.com/civil-engineering-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=admin%40inhinyero.ph&su=A%20free%20CELE%20calendar%20for%20your%20next%20batch&body=Hi%20Inhinyero%20team%2C%0A%0AYour%20homepage%20countdown%20was%20set%20to%20the%20September%2026%E2%80%9327%2C%202026%20CELE%3B%20PRC%27s%20results%20target%20for%20it%20is%20October%202.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20civil%20engineering%20board%20exam%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%20It%20could%20also%20carry%20your%20countdown%20into%20the%202027%20rounds%20once%20PRC%20names%20the%20dates.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fcivil-engineering-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#8 GERTC (Gillesania)** · inquiries@gertcrev.com · 10-03
Subject: A free CELE calendar for your reviewees

> Hi GERTC team,
>
> Your review packages follow the March and September CELE rounds, and the 2027 rounds are the next thing your reviewees will ask about.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free civil engineering board exam calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/civil-engineering-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=inquiries%40gertcrev.com&su=A%20free%20CELE%20calendar%20for%20your%20reviewees&body=Hi%20GERTC%20team%2C%0A%0AYour%20review%20packages%20follow%20the%20March%20and%20September%20CELE%20rounds%2C%20and%20the%202027%20rounds%20are%20the%20next%20thing%20your%20reviewees%20will%20ask%20about.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20civil%20engineering%20board%20exam%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fcivil-engineering-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#9 ACTS Review Center** · info@actsreviewcenter.com · 10-03
Subject: A free MTLE calendar for your 2027 batches

> Hi ACTS team,
>
> Your 2027 Medical Technology Licensure Examination batches are already posted, starting October 6, 2026.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free MTLE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/medtech-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=info%40actsreviewcenter.com&su=A%20free%20MTLE%20calendar%20for%20your%202027%20batches&body=Hi%20ACTS%20team%2C%0A%0AYour%202027%20Medical%20Technology%20Licensure%20Examination%20batches%20are%20already%20posted%2C%20starting%20October%206%2C%202026.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20MTLE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fmedtech-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#10 Pioneer Review Center (PRCI)** · consult@perc.com.ph · 10-06
Subject: The March 2027 MTLE dates, as soon as PRC posts them

> Hi Pioneer Review Center team,
>
> Your March 2027 board review class schedule is marked TBA while everyone waits on PRC.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free MTLE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/medtech-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=consult%40perc.com.ph&su=The%20March%202027%20MTLE%20dates%2C%20as%20soon%20as%20PRC%20posts%20them&body=Hi%20Pioneer%20Review%20Center%20team%2C%0A%0AYour%20March%202027%20board%20review%20class%20schedule%20is%20marked%20TBA%20while%20everyone%20waits%20on%20PRC.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20MTLE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fmedtech-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#11 Overarch Review Center** · overarchreviewcenter@gmail.com · 10-06
Subject: A free MTLE calendar for your March 2027 reviewees

> Hi Overarch team,
>
> Your one-year MT board review is aimed at the March 2027 MTLE.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free MTLE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/medtech-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=overarchreviewcenter%40gmail.com&su=A%20free%20MTLE%20calendar%20for%20your%20March%202027%20reviewees&body=Hi%20Overarch%20team%2C%0A%0AYour%20one-year%20MT%20board%20review%20is%20aimed%20at%20the%20March%202027%20MTLE.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20MTLE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fmedtech-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#6 CRC-ACE Review School（可选：官网最近更新 2025-07）** · crc_ace@yahoo.com · 可选
Subject: A free CPALE calendar for your reviewees

> Hi CRC-ACE team,
>
> Your review runs five months before each May and October CPA licensure exam.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free CPALE calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/cpa-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=crc_ace%40yahoo.com&su=A%20free%20CPALE%20calendar%20for%20your%20reviewees&body=Hi%20CRC-ACE%20team%2C%0A%0AYour%20review%20runs%20five%20months%20before%20each%20May%20and%20October%20CPA%20licensure%20exam.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20CPALE%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fcpa-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

---

**#12 Manor Review Center（可选：页面没有考试日期，契合度弱）** · manorreviewcenter@yahoo.com · 可选
Subject: A free pharmacist licensure exam calendar for your reviewees

> Hi Manor Review Center team,
>
> As a long-running review provider for the Pharmacist Licensure Examination, you probably get the "when is the next PhLE?" question often. The next one is October 15–16, 2026, with PRC's results target on October 21.
>
> I run AyTool, an independent site that keeps the PRC schedule by profession. We now have a free pharmacist licensure exam calendar your reviewees can subscribe to in Google Calendar or on an iPhone: filing deadlines, exam days and results dates, and it updates itself — when PRC releases the 2027 schedule (expected mid-November), the new dates appear in subscribers' calendars without them doing anything.
>
> Page and subscribe links: https://aytool.com/pharmacy-board-exam-schedule/
>
> If it's useful, feel free to link it for your reviewees. If not, no need to reply.
>
> JJ
> AyTool — free Philippine payroll and PRC exam tools
> https://aytool.com · contact@aytool.com

[预填写信链接](https://mail.google.com/mail/u/0/?view=cm&fs=1&to=manorreviewcenter%40yahoo.com&su=A%20free%20pharmacist%20licensure%20exam%20calendar%20for%20your%20reviewees&body=Hi%20Manor%20Review%20Center%20team%2C%0A%0AAs%20a%20long-running%20review%20provider%20for%20the%20Pharmacist%20Licensure%20Examination%2C%20you%20probably%20get%20the%20%22when%20is%20the%20next%20PhLE%3F%22%20question%20often.%20The%20next%20one%20is%20October%2015%E2%80%9316%2C%202026%2C%20with%20PRC%27s%20results%20target%20on%20October%2021.%0A%0AI%20run%20AyTool%2C%20an%20independent%20site%20that%20keeps%20the%20PRC%20schedule%20by%20profession.%20We%20now%20have%20a%20free%20pharmacist%20licensure%20exam%20calendar%20your%20reviewees%20can%20subscribe%20to%20in%20Google%20Calendar%20or%20on%20an%20iPhone%3A%20filing%20deadlines%2C%20exam%20days%20and%20results%20dates%2C%20and%20it%20updates%20itself%20%E2%80%94%20when%20PRC%20releases%20the%202027%20schedule%20%28expected%20mid-November%29%2C%20the%20new%20dates%20appear%20in%20subscribers%27%20calendars%20without%20them%20doing%20anything.%0A%0APage%20and%20subscribe%20links%3A%20https%3A%2F%2Faytool.com%2Fpharmacy-board-exam-schedule%2F%0A%0AIf%20it%27s%20useful%2C%20feel%20free%20to%20link%20it%20for%20your%20reviewees.%20If%20not%2C%20no%20need%20to%20reply.%0A%0AJJ%0AAyTool%20%E2%80%94%20free%20Philippine%20payroll%20and%20PRC%20exam%20tools%0Ahttps%3A%2F%2Faytool.com%20%C2%B7%20contact%40aytool.com)

