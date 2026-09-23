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

## 3. 目录站提交文案（SaaSHub / Uneed / Fazier）

通用字段见 [backlinks-submissions.md](backlinks-submissions.md) 的"通用字段"。补充：

- **一句话**：Free Philippine payroll calculators and embeddable widgets, with official 2026 rates
- **Categories**：Finance / Calculators / HR & Payroll
- **SaaSHub competitors 栏**：SaaSHub 要求填竞品，否则会排到队尾。先在站内搜 SweldoPH、Sprout Solutions 有没有被收录，有就挂上
- **新增卖点**：/free-calculator-widgets/ 提供 28 个免费嵌入挂件

## 4. 挂件外联邮件

见下方"外联名单与邮件"（调研子代理产出后填入）。
