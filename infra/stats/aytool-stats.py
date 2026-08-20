#!/usr/bin/env python3
"""AyTool 流量看板生成器。

解析 nginx access log（含 logrotate 归档），区分真人 / 已知爬虫 / 扫描器，
输出静态 HTML 到 /var/www/aytool-stats/index.html（由 nginx /stats/ 提供，
Basic Auth 保护）。由 cron 每 10 分钟执行一次。

真人判定：UA 形似浏览器、非已知 bot，且同一 IP 加载过 /_astro/ JS 资源
（只有真实浏览器会渲染页面并拉 JS；扫描器只抓 HTML 即走）。
"""
import glob
import gzip
import html
import re
from collections import Counter, defaultdict
from datetime import datetime

LOG_FILES = sorted(glob.glob('/var/log/nginx/aytool.access.log*'))
OUT = '/var/www/aytool-stats/index.html'

LINE_RE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+)[^"]*" '
    r'(?P<status>\d{3}) (?P<bytes>\S+) "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"'
)

# 顺序敏感：前面的先匹配
BOT_PATTERNS = [
    ('Googlebot', re.compile(r'Googlebot|Google-InspectionTool|APIs-Google|AdsBot', re.I)),
    ('Googlebot-Image', re.compile(r'Googlebot-Image', re.I)),
    ('Bingbot', re.compile(r'bingbot|BingPreview', re.I)),
    ('GPTBot (OpenAI 训练)', re.compile(r'GPTBot', re.I)),
    ('OAI-SearchBot (ChatGPT搜索)', re.compile(r'OAI-SearchBot', re.I)),
    ('ChatGPT-User (用户实时引用)', re.compile(r'ChatGPT-User', re.I)),
    ('ClaudeBot (Anthropic)', re.compile(r'ClaudeBot|claude-web|anthropic-ai', re.I)),
    ('PerplexityBot', re.compile(r'PerplexityBot|Perplexity-User', re.I)),
    ('Meta/Facebook', re.compile(r'facebookexternalhit|meta-externalagent|facebookcatalog', re.I)),
    ('Applebot', re.compile(r'Applebot', re.I)),
    ('DuckDuckBot', re.compile(r'DuckDuckBot|DuckDuckGo', re.I)),
    ('YandexBot', re.compile(r'YandexBot', re.I)),
    ('Bytespider (字节)', re.compile(r'Bytespider', re.I)),
    ('SEO工具 (Ahrefs/Semrush/MJ12等)', re.compile(r'AhrefsBot|SemrushBot|MJ12bot|DotBot|DataForSeoBot|BLEXBot|serpstatbot|Majestic', re.I)),
    ('Uptime监控', re.compile(r'UptimeRobot|Site24x7|Pingdom|StatusCake', re.I)),
    ('其他已知bot', re.compile(r'bot|spider|crawl|slurp|python-requests|python-httpx|Go-http-client|curl|wget|libwww|HeadlessChrome|Expanse|CensysInspect|zgrab|masscan|nmap', re.I)),
]

ASSET_RE = re.compile(r'\.(js|css|png|jpg|svg|ico|xml|txt|webmanifest|gz|map|woff2?)($|\?)|^/_astro/|^/~partytown/')
# 真实渲染证据：只有真实浏览器渲染页面才会加载构建产物 JS。
# 不能用 ASSET_RE 代替——扫描器也抓 robots.txt/favicon.ico，会把扫描器误判成真人。
RENDER_RE = re.compile(r'^/_astro/|^/~partytown/')
BROWSERISH_RE = re.compile(r'Mozilla/')

AI_BOTS = {'GPTBot (OpenAI 训练)', 'OAI-SearchBot (ChatGPT搜索)', 'ChatGPT-User (用户实时引用)',
           'ClaudeBot (Anthropic)', 'PerplexityBot', 'Bytespider (字节)'}
SEARCH_BOTS = {'Googlebot', 'Googlebot-Image', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot'}


def open_log(path):
    return gzip.open(path, 'rt', errors='replace') if path.endswith('.gz') else open(path, errors='replace')


def classify_bot(ua):
    for name, pat in BOT_PATTERNS:
        if pat.search(ua):
            return name
    return None


def parse_time(s):
    # 19/Aug/2026:18:05:19 +0800
    return datetime.strptime(s.split(' ')[0], '%d/%b/%Y:%H:%M:%S')


def main():
    rows = []
    asset_loaders = set()
    for f in LOG_FILES:
        try:
            with open_log(f) as fh:
                for line in fh:
                    m = LINE_RE.match(line)
                    if not m:
                        continue
                    d = m.groupdict()
                    rows.append(d)
                    if RENDER_RE.search(d['path']) and BROWSERISH_RE.search(d['ua']) and not classify_bot(d['ua']):
                        asset_loaders.add(d['ip'])
        except OSError:
            continue

    bot_stats = defaultdict(lambda: {'req': 0, 'pages': set(), 'last': ''})
    human_hits = []           # 真人页面访问
    scanner_req = 0
    day_counts = defaultdict(lambda: Counter())
    human_pages = Counter()
    human_ips = set()
    referrers = Counter()

    for d in rows:
        t = parse_time(d['time'])
        day = t.strftime('%m-%d')
        bot = classify_bot(d['ua'])
        is_asset = bool(ASSET_RE.search(d['path']))
        if bot:
            s = bot_stats[bot]
            s['req'] += 1
            if not is_asset:
                s['pages'].add(d['path'])
            s['last'] = max(s['last'], t.strftime('%m-%d %H:%M'))
            day_counts[day]['bot'] += 1
        elif BROWSERISH_RE.search(d['ua']) and d['ip'] in asset_loaders:
            day_counts[day]['human'] += 1
            human_ips.add(d['ip'])
            if not is_asset and d['status'] == '200':
                human_pages[d['path']] += 1
                human_hits.append(d | {'dt': t})
                ref = d['ref']
                if ref and ref != '-' and 'aytool.com' not in ref and '43.160.196.139' not in ref:
                    referrers[ref] += 1
        else:
            scanner_req += 1
            day_counts[day]['scanner'] += 1

    days = sorted(day_counts.keys())[-14:]
    maxday = max((sum(day_counts[d].values()) for d in days), default=1)

    ai_req = sum(v['req'] for k, v in bot_stats.items() if k in AI_BOTS)
    search_req = sum(v['req'] for k, v in bot_stats.items() if k in SEARCH_BOTS)

    e = html.escape
    now = datetime.now().strftime('%Y-%m-%d %H:%M')

    def card(label, value, note=''):
        return (f'<div class="card"><div class="v">{value}</div><div class="l">{e(label)}</div>'
                f'{f"<div class=n>{e(note)}</div>" if note else ""}</div>')

    trend_rows = ''
    for d in days:
        c = day_counts[d]
        total = sum(c.values())
        hw = int(c["human"] / maxday * 100)
        bw = int(c["bot"] / maxday * 100)
        sw = int(c["scanner"] / maxday * 100)
        trend_rows += (
            f'<tr><td class="dt">{d}</td><td class="bar">'
            f'<span class="h" style="width:{hw}%"></span>'
            f'<span class="b" style="width:{bw}%"></span>'
            f'<span class="s" style="width:{sw}%"></span></td>'
            f'<td class="num">{c["human"]}</td><td class="num">{c["bot"]}</td>'
            f'<td class="num">{c["scanner"]}</td><td class="num">{total}</td></tr>')

    bots_rows = ''
    for name, s in sorted(bot_stats.items(), key=lambda kv: -kv[1]['req']):
        tag = ' <em class="ai">AI</em>' if name in AI_BOTS else (' <em class="se">搜索</em>' if name in SEARCH_BOTS else '')
        bots_rows += (f'<tr><td>{e(name)}{tag}</td><td class="num">{s["req"]}</td>'
                      f'<td class="num">{len(s["pages"])}</td><td class="num">{s["last"]}</td></tr>')

    pages_rows = ''.join(
        f'<tr><td>{e(p)}</td><td class="num">{c}</td></tr>' for p, c in human_pages.most_common(20))

    recent_rows = ''
    for d in sorted(human_hits, key=lambda x: x['dt'], reverse=True)[:30]:
        ref = d['ref'] if d['ref'] not in ('-', '') else ''
        recent_rows += (f'<tr><td class="num">{d["dt"].strftime("%m-%d %H:%M")}</td>'
                        f'<td>{e(d["ip"])}</td><td>{e(d["path"])}</td><td class="ref">{e(ref[:60])}</td></tr>')

    ref_rows = ''.join(
        f'<tr><td>{e(r[:70])}</td><td class="num">{c}</td></tr>' for r, c in referrers.most_common(15)) \
        or '<tr><td colspan="2" class="empty">暂无外部来源（还没开始分发，正常）</td></tr>'

    page = f'''<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>AyTool 流量看板</title>
<style>
 body{{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f6f8fa;color:#1c2733}}
 .wrap{{max-width:960px;margin:0 auto;padding:24px 16px}}
 h1{{font-size:20px}} h2{{font-size:15px;margin:28px 0 8px}}
 .meta{{color:#5b6b7b;font-size:12px}}
 .cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}}
 .card{{background:#fff;border:1px solid #e3e8ee;border-radius:10px;padding:12px}}
 .card .v{{font-size:26px;font-weight:700;color:#0f766e}}
 .card .l{{font-size:12px;color:#5b6b7b;margin-top:2px}} .card .n{{font-size:11px;color:#8a97a5}}
 table{{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e3e8ee;border-radius:10px;overflow:hidden;font-size:13px}}
 th{{background:#eef2f5;text-align:left;padding:7px 10px;font-size:12px}}
 td{{border-top:1px solid #eef2f5;padding:6px 10px;word-break:break-all}}
 .num{{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}}
 .dt{{white-space:nowrap}} .ref{{color:#5b6b7b;font-size:12px}}
 .bar{{width:45%}} .bar span{{display:inline-block;height:10px;border-radius:2px}}
 .h{{background:#0f766e}} .b{{background:#93b8b4}} .s{{background:#dde4ea}}
 em.ai{{background:#eef;color:#4338ca;font-style:normal;font-size:10px;padding:1px 5px;border-radius:8px}}
 em.se{{background:#e6f6f3;color:#0f766e;font-style:normal;font-size:10px;padding:1px 5px;border-radius:8px}}
 .legend{{font-size:11px;color:#5b6b7b;margin:6px 0}}
 .legend i{{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 10px;vertical-align:-1px}}
 .empty{{color:#8a97a5;text-align:center}}
</style></head><body><div class="wrap">
<h1>AyTool 流量看板</h1>
<p class="meta">生成于 {now}（每 10 分钟自动更新）· 数据源：nginx 访问日志（含归档，约 14 天窗口）</p>
<div class="cards">
{card('真人访客 (独立IP)', len(human_ips), '加载过JS的真实浏览器')}
{card('真人页面浏览', sum(human_pages.values()))}
{card('搜索引擎爬虫请求', search_req, 'Google/Bing/Apple等')}
{card('AI 爬虫请求', ai_req, 'GPTBot/Claude/Perplexity等')}
{card('扫描器噪音请求', scanner_req, '伪装UA、不加载资源')}
{card('总请求数', len(rows))}
</div>
<h2>每日趋势</h2>
<div class="legend">图例：<i class="h" style="background:#0f766e"></i>真人 <i style="background:#93b8b4"></i>爬虫 <i style="background:#dde4ea"></i>扫描器</div>
<table><tr><th>日期</th><th>分布</th><th class="num">真人</th><th class="num">爬虫</th><th class="num">扫描器</th><th class="num">合计</th></tr>{trend_rows}</table>
<h2>爬虫明细（AI 爬虫抓取量是被 AI 引用的前置信号）</h2>
<table><tr><th>爬虫</th><th class="num">请求数</th><th class="num">抓取页面数</th><th class="num">最近来访</th></tr>{bots_rows}</table>
<h2>真人访问的页面 Top 20</h2>
<table><tr><th>页面</th><th class="num">浏览次数</th></tr>{pages_rows}</table>
<h2>外部流量来源（referrer）</h2>
<table><tr><th>来源</th><th class="num">次数</th></tr>{ref_rows}</table>
<h2>最近 30 次真人访问</h2>
<table><tr><th>时间</th><th>IP</th><th>页面</th><th>来源</th></tr>{recent_rows}</table>
<p class="meta">判定口径：真人 = 浏览器 UA 且该 IP 加载过 /_astro/ JS；已知爬虫按 UA 归类；其余为扫描器。
本页仅统计服务器日志，与 GA4 相互印证（GA4 看不到爬虫，日志看不到用户行为细节）。</p>
</div></body></html>'''

    import os
    import tempfile
    os.makedirs('/var/www/aytool-stats', exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir='/var/www/aytool-stats')
    with os.fdopen(fd, 'w') as fh:
        fh.write(page)
    os.chmod(tmp, 0o644)
    os.replace(tmp, OUT)


if __name__ == '__main__':
    main()
