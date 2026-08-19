# AyTool 外链建设 Playbook

> 原则：只做白帽。钱相关主题（YMYL）+ 新域名 = 最经不起垃圾外链的组合。
> **禁止**：自动外链软件、目录站群一键提交、买外链、PBN、评论区撒链接——轻则被 Google 忽略，重则 spam 惩罚。
>
> **本清单每个条目均于 2026-08-19 逐一核验过真实性与活跃度**（存在、2025–26 有活动、菲律宾相关）。已核死并剔除：Peso Lab（域名挂售）、PinoyExchange（2023 年关站）、Connectively（2024-12 关闭）、iMoney PH（重定向马来西亚站）、Peso Hacks（SSL 失效）。

## 第一层：一次性提交（半天做完，零风险，建立品牌实体）

目的不是权重，是让 AyTool 实体在网上有一致存在——对 GEO/AI 引用同样有帮助。

| 渠道 | 动作 | 核验备注 |
|---|---|---|
| GitHub | 仓库 About 栏填 https://aytool.com；**仓库需设为 public 才有外链效果** | ✅ 仓库已有 |
| Facebook 主页 | 创建 AyTool 主页，About 填网址 | 本来就要建（分发主阵地） |
| X/Twitter、Pinterest、YouTube | 注册占坑，简介放链接 | Pinterest 图卡与菲律宾用户契合 |
| **Product Hunt** | 以免费工具身份发布一次 | ✅ 2026 年发布仍免费，日均 50+ launch，工具站冷启动经典渠道 |
| **AlternativeTo** | 提交 AyTool 为独立工具 | ⚠️ 核验发现 Sweldong Pinoy **并未被收录**——"竞品替代"角度不成立；直接独立提交，或先提交 Sweldong Pinoy 再挂 alternative |
| Indie Hackers | 产品页 + 一篇 build log | ✅ 产品目录 2026 仍活跃；PH 流量低，纯占坑 |
| **TechShake**（techshake.asia） | 提交到菲律宾创业生态目录 | ✅ 活跃，菲律宾本地唯一值得做的目录站 |

## 第二层：菲律宾本地社区（持续，最有效）

Reddit 社区（成员数为 2026 年中核验值）：

| 社区 | 规模 | 契合度 |
|---|---|---|
| **r/phcareers** | — | ⭐ 薪资/职场问题主阵地，最对口 |
| **r/taxPH** | — | ⭐ 税 + SSS/扣缴计算，主题最贴 |
| **r/phinvest** | ~80 万 | 菲律宾第二大 sub，理财主阵地；**反自我推广规则严格**，只答题不裸发链接 |
| r/adultingph | ~53 万 | 第一份工作/工资单/福利问题多 |
| r/AskPH | ~50 万 | 泛问答，薪资问题常出现 |
| **r/buhaydigital** | ~43 万 | 自由职业者问 voluntary SSS/税，契合 OFW/SE 计算器 |
| r/Philippines | ~350 万 | 太泛，转化低，看到对口帖再答 |

打法红线：先当正常用户（账号要有活动历史），看到 "how much SSS deduction" / "back pay 多久拿到" 这类真实提问时**文字完整回答 + 附计算器链接作工具**；不开新帖打广告，被删就换社区不硬刚。

其他：**Facebook 群组**（OFW 群、jobseekers PH、HR Philippines）用带水印图卡；**Quora** 英文长尾问题认真答一次吃很久。~~PinoyExchange~~（已核死：2023-04 宣布关站，站点 530）。

## 第三层：编辑型外链 outreach（每月 1–2 封，真正推排名）

按核验后的优先级：

1. **Moneymax**（moneymax.ph）⭐ 最佳单一目标：博客持续更新至 2026-07，长期写 13th month/SSS/sweldo 选题，天然需要可引用计算器
2. **Ready To Be Rich**（fitzvillafuerte.com）：✅ 核验活跃（最新文 2026-08-17），菲律宾老牌个人理财博客
3. **Grit.ph**：✅ 活跃，指南型站点，中优先级
4. Pinoy Money Talk（pinoymoneytalk.com）：活着、有薪资/税表内容，但更新零散，低优先级
5. **HR/Payroll 从业者社区、大学 career office 资源页**：角度是"发薪前让员工自查的工具"
6. **记者需求平台**：**HARO 已复活**（2025-04 被 Featured.com 收购后在 helpareporter.com 重启，免费每日 3 封邮件）+ **Qwoted**（免费档可用）。~~Connectively~~（2024-12 关闭）、~~SourceBottle/PressPlugs~~（澳英向，与菲无关）
7. **数据引用钩子**：每年 1 月费率更新时第一时间发"新年四险变化"——写年度盘点的博主/记者需要标注官方来源 + 核验日期的干净引用源

Outreach 邮件角度模板："你写 X 文章时可以直接引用我们的计算器——每个数字都注明官方 circular 编号和核验日期，不用你自己去翻 SSS 官网核对。"

## 已自动化的部分（不用再做）

- **IndexNow**：每次 `make deploy` 自动 ping Bing 系（收录提交，非外链）
- **GSC/Bing sitemap**：已提交
- **AI 引用基建**：robots.txt 放行 AI 爬虫 + llms.txt + 答案先行句已就位（GA4 AI 渠道分组可测效果）

## 节奏与预期

- 第一层：本周一次性做完
- 第二层：每周 2–3 次真实参与（每次 10 分钟），与 FB 图卡日历（docs/ops-calendar.md）合并执行
- 第三层：每月 1–2 封 outreach，质量 > 数量；Moneymax 和 Ready To Be Rich 优先
- 预期：外链起效在 3–6 个月；D90 决策（2026-11-18）时把"编辑型外链数"作为参考指标之一
