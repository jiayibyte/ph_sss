# AyTool 外链建设 Playbook

> 原则：只做白帽。钱相关主题（YMYL）+ 新域名 = 最经不起垃圾外链的组合。
> **禁止**：自动外链软件、目录站群一键提交、Fiverr/淘宝买外链、PBN、评论区撒链接。
> 这些轻则被 Google 忽略，重则触发 spam 惩罚，且钱白花。

## 第一层：一次性提交（半天做完，低价值但零风险，建立基础实体）

做这些的目的不是权重，是让品牌实体（AyTool）在网上有一致的存在——对 GEO/AI 引用同样有帮助。

| 渠道 | 动作 | 备注 |
|---|---|---|
| GitHub | 仓库 About 栏填 https://aytool.com ✅ 仓库已有 | 顺手把 repo 设为 public（若还是 private 则无外链效果） |
| Facebook 主页 | 创建 AyTool 主页，About 填网址 | 本来就要建（分发主阵地） |
| X/Twitter | 注册 @aytool 或近似名，简介放链接 | 占坑 + 实体一致性 |
| Pinterest | 商业账号，缴费表图卡天然适合 Pin | 菲律宾 Pinterest 用户量可观 |
| YouTube | 频道 About 放链接（哪怕暂不发视频） | 占坑 |
| LinkedIn | 公司页（可选） | HR/Payroll 人群在 LinkedIn |
| Product Hunt | 以免费工具身份发布一次 | 工具站冷启动经典渠道，可带来首批真实用户+外链 |
| AlternativeTo | 提交为 sweldongpinoy 等的 alternative | 精准：搜竞品的人会看到 |
| Indie Hackers | 产品页 + 一篇 build log | dofollow 产品页 |

## 第二层：菲律宾本地渠道（持续，最有效）

菲律宾互联网文化围绕 Facebook + Reddit + 本地论坛，这是真实流量和自然外链的来源：

1. **Reddit**（r/phinvest、r/AskPH、r/Philippines、r/adultingph、r/PHCreditCards）
   - 打法：**先当正常用户**，看到 "how much SSS deduction"、"back pay 多久能拿到"、"13th month 怎么算" 这类真实提问时，用文字完整回答 + 附上计算器链接作为工具
   - 红线：不开新帖打广告；账号要有正常活动历史；被版主删一次就换社区，不硬刚
2. **Facebook 群组**（OFW 群、jobseekers PH 群、HR Philippines 群）
   - 图卡策略：缴费表/倍率提醒做成图片（带 aytool.com 水印），图片在群里的转发力远大于链接
3. **PinoyExchange 论坛**：老牌菲律宾论坛，签名档/回帖可带链接
4. **Quora**：英文提问 "how to compute 13th month pay Philippines" 长期有流量，认真答一次吃很久

## 第三层：值得主动争取的编辑型外链（每月挑 1–2 个做）

这类才是真正推动排名的外链：

1. **菲律宾个人理财博主**（Peso Lab、Ready To Be Rich、Moneymax 的内容团队等）：邮件介绍工具，角度是"你写 13th month 文章时可以直接引用/链接我们的计算器，数据都注明官方来源和核验日期"
2. **HR/Payroll 从业者社区**：给 HR 群体的角度是"发工资条前让员工自查的工具"
3. **大学/求职辅导资源页**：career office 的 resource 页常年链接实用工具
4. **数据引用钩子**：每年 1 月费率更新时，第一时间发布"2027 年四险扣缴变化一图看懂"——记者和博主写年度盘点时需要可引用的干净来源（我们的 last_verified + 官方链接正是为此设计）
5. **HARO 类**（Connectively/Featured/SourceBottle）：回应 payroll/PH 相关的记者需求

## 已自动化的部分（不用再做）

- **IndexNow**：每次 `make deploy` 自动 ping Bing 系 —— 这是"收录提交"不是外链
- **GSC/Bing sitemap**：已提交 —— 同上
- **AI 引用**：robots.txt 放行 AI 爬虫 + llms.txt + 答案先行句已就位，AI 助手引用本站会带来点击（GA4 AI 渠道分组可测）

## 节奏与预期

- 第一层：本周一次性做完
- 第二层：每周 2–3 次真实参与（每次 10 分钟），跟 FB 图卡日历（docs/ops-calendar.md）合并执行
- 第三层：每月 1–2 封 outreach 邮件即可，质量 > 数量
- 预期：新站 90 天内外链对排名的作用有限，真正起效在 3–6 个月；D90 决策（2026-11-18）时把"获得的编辑型外链数"作为参考指标之一
