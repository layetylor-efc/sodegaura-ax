#!/usr/bin/env python3
"""Inject a persistent, plainly visible unofficial-service notice in published HTML."""
import re
import sys
from pathlib import Path

NOTICE = "本サイトは個人の実験的・非公式プロトタイプであり、袖ケ浦市および各官公庁とは一切関係ありません"
CSS = """<style id="independent-civic-notice-style">
#independent-civic-notice{box-sizing:border-box!important;position:fixed!important;inset:0 0 auto!important;top:env(safe-area-inset-top,0px)!important;z-index:2147483647!important;padding:8px 12px!important;margin:0!important;background:#fff1f2!important;color:#7f1d1d!important;border:0!important;border-bottom:3px solid #b91c1c!important;box-shadow:0 4px 14px rgba(65,5,12,.25)!important;font:800 clamp(11px,2.7vw,14px)/1.45 system-ui,-apple-system,"Noto Sans JP",sans-serif!important;text-align:center!important;visibility:visible!important;opacity:1!important;transform:none!important;pointer-events:auto!important}
#independent-civic-notice strong{color:#991b1b!important;white-space:nowrap}
@media print{#independent-civic-notice{position:static!important;box-shadow:none!important}}
</style>"""
HTML = f'<div id="independent-civic-notice" role="note" aria-label="非公式サイトのお知らせ"><strong>【非公式】</strong> {NOTICE}</div>'

def add_notice(text):
    if 'id="independent-civic-notice"' in text:
        return text
    if not re.search(r'</head\s*>', text, flags=re.I) or not re.search(r'<body\b[^>]*>', text, flags=re.I):
        raise ValueError("Unexpected HTML document: missing head/body tags")
    text = re.sub(r'</head\s*>', lambda match: CSS + "\n" + match.group(), text, count=1, flags=re.I)
    return re.sub(r'<body\b[^>]*>', lambda match: match.group() + "\n" + HTML + "\n", text, count=1, flags=re.I)

def main():
    site = Path(sys.argv[1]) if len(sys.argv)>1 else Path("_site")
    count = 0
    for path in site.rglob("*.html"):
        data = path.read_text(encoding="utf-8")
        new_data = add_notice(data)
        if data != new_data:
            path.write_text(new_data, encoding="utf-8")
            count += 1
    print(f"Injected unofficial notice into {count} HTML documents")
    if count == 0:
        raise SystemExit("No HTML documents changed; check deploy artifact")

if __name__ == "__main__":
    main()
