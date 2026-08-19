# AyTool infra

服务器可随时用本目录重建（design.md §6）。

## 文件

| 文件 | 用途 |
|---|---|
| `nginx-aytool.conf` | nginx 站点配置：HTTPS、www→裸域 301、指纹资产 immutable、HTML 短 TTL+ETag、gzip/brotli、安全响应头（HSTS/CSP/XCTO/Referrer-Policy）、自定义 404、AI bot 日志统计命令 |
| `deploy.sh` | 原子部署：test → build → rsync 到 `releases/<ts>` → 切软链 → CDN 刷新 → IndexNow ping；`deploy.sh rollback` 回滚上一版；保留最近 5 个 release |
| `.indexnow-key` | IndexNow key（对应 `public/<key>.txt`，随构建部署到站点根） |

`robots.txt` 与 `llms.txt` 在 `public/` 目录（需随构建产物部署到站点根，故不放本目录）。

## 上线待办（需要服务器/账号权限，代码无法代办）

1. **DNS**：aytool.com A/AAAA 指向服务器；配 `contact@aytool.com` 邮箱转发（注册商别名即可），About/Methodology 页已外显该地址。
2. **证书**：`certbot certonly -d aytool.com -d www.aytool.com`。
3. **nginx**：拷贝 `nginx-aytool.conf` 到 `sites-available` 并 enable；`mkdir -p /var/www/aytool-releases`。
4. **deploy.sh**：设置 `AYTOOL_HOST`（`user@server`）与 `AYTOOL_CDN_PURGE`（你的 CDN 刷新 API curl 命令）后 `make deploy`。
5. **CDN**：回源到 nginx，确认含东南亚/海外边缘节点；上线后菲律宾侧拨测 TTFB < 400ms（可用在线拨测工具选马尼拉/宿务节点）。
6. **GA4**：创建 GA4 属性，把 measurement ID 填入 `site.config.ts` 的 `ga4Id` 后重建部署；在 GA4 后台建 AI 渠道分组，referrer 正则：`chatgpt\.com|chat\.openai\.com|perplexity\.ai|copilot\.microsoft\.com|gemini\.google\.com`。
7. **GSC**：验证域名 → 提交 `https://aytool.com/sitemap-index.xml`。
8. **Bing Webmaster Tools**：用「从 GSC 导入」一键导入站点与 sitemap。
9. **Uptime**：UptimeRobot 免费档，监控 `/` 与 `/sss-contribution-table/`，邮件告警。
10. **logrotate**：确认 `/var/log/nginx/aytool.*.log` 在 logrotate 配置内；每月跑一次 nginx-aytool.conf 尾部注释里的 AI bot 统计命令。
11. **回滚演练**：`make rollback` 切回上一版再 `make deploy` 切回来（验收 8.9）。
12. **日历提醒**（验收 8.10）：完整节点与动作见 [docs/ops-calendar.md](../docs/ops-calendar.md)；双击导入 [aytool-ops-calendar.ics](aytool-ops-calendar.ics) 即可把全部年度循环提醒加进 Apple/Google 日历。

## 年度数据更新流程

1. 在 `src/data/<agency>/` 新建次年 JSON（SSS 用 `scripts/generate-sss-2026.mjs` 复制改参数）。
2. 更新页面引用与 Title 年份、`last_verified`。
3. `make deploy`（自动跑单测——数字对不上会挡住部署）。
