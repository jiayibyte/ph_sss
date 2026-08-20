#!/usr/bin/env bash
# 向 AyTool Facebook 主页发一张图卡帖。
# 用法: ./post-to-page.sh <图片路径> <文案文件路径>
# 依赖: /etc/aytool/fb.env 内含 FB_PAGE_ID 与 FB_PAGE_TOKEN（长效 Page Access Token）
set -euo pipefail

ENV_FILE="${FB_ENV_FILE:-/etc/aytool/fb.env}"
[ -f "$ENV_FILE" ] && source "$ENV_FILE"
: "${FB_PAGE_ID:?缺少 FB_PAGE_ID（见 infra/fb/README.md）}"
: "${FB_PAGE_TOKEN:?缺少 FB_PAGE_TOKEN}"

IMG="$1"
CAPTION_FILE="$2"
[ -f "$IMG" ] || { echo "图片不存在: $IMG"; exit 1; }
[ -f "$CAPTION_FILE" ] || { echo "文案不存在: $CAPTION_FILE"; exit 1; }

resp=$(curl -sf -X POST "https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos" \
  -F "source=@${IMG}" \
  -F "message=$(cat "$CAPTION_FILE")" \
  -F "access_token=${FB_PAGE_TOKEN}")
echo "$resp"
echo "$resp" | grep -q '"id"' && echo "✅ 已发布" || { echo "❌ 发布失败"; exit 1; }
