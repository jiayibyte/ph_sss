# Facebook 主页自动发帖

## 能自动化什么 / 不能自动化什么

| 目标 | 可行性 |
|---|---|
| 给自己的 **主页（Page）** 发帖 | ✅ Graph API 官方支持，本目录脚本实现 |
| 给 **群组（Group）** 发帖 | ❌ Groups API 已于 2024 年下线；浏览器脚本模拟发帖违反 FB 条款会封号。群组分发 = 手动转发主页帖（30 秒） |

## 一次性配置（需要账号所有者做，约 15 分钟）

1. **建主页**：facebook.com → 菜单 → Pages → Create，名称 `AyTool`，类别 Website，About 填 https://aytool.com
2. **建开发者应用**：developers.facebook.com → My Apps → Create App → 类型选 **Business** → 名称随意（如 aytool-poster）
3. **拿 Page Access Token**：
   - 打开 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - 右侧选择你的 App → User or Page 选 **Get Page Access Token** → 选中 AyTool 主页
   - 勾选权限：`pages_manage_posts`、`pages_read_engagement`（给自己主页发帖无需 App Review）
   - Generate Access Token → 复制
4. **换成长效 token**（短效只有 1 小时）：
   ```bash
   # 先用短效 user token 换 60 天长效 user token（appid/secret 在应用设置页）
   curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<短效TOKEN>"
   # 再用长效 user token 取 Page token —— 这样取到的 Page token 不过期
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=<长效USER_TOKEN>"
   # 响应里找到 AyTool 主页的 id 和 access_token
   ```
5. **写到服务器**（只放服务器，不进 git）：
   ```bash
   ssh 139 "mkdir -p /etc/aytool && cat > /etc/aytool/fb.env <<'EOF'
   FB_PAGE_ID=<主页ID>
   FB_PAGE_TOKEN=<不过期的PageToken>
   EOF
   chmod 600 /etc/aytool/fb.env"
   ```

## 发帖

```bash
# 手动发一帖
./infra/fb/post-to-page.sh marketing/fb-cards/2026-08-31-national-heroes-day.png \
                           marketing/fb-cards/2026-08-31-national-heroes-day.caption.txt
```

配好 token 后告诉 Claude，即可把节前发帖挂到服务器 cron（对齐 docs/ops-calendar.md 的节日簇节点），
图卡由 `marketing/fb-cards/` 的 HTML 模板 + 无头 Chrome 生成，数据取自 `src/data/` 已核验 JSON。

## 安全红线

- Token 等同主页控制权：只存服务器 `/etc/aytool/fb.env`（600 权限），**永不进 git**
- 只用官方 Graph API；不用任何浏览器自动化工具碰 Facebook
