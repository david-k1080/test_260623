#!/usr/bin/env python3
"""페이지 본문을 저장하고 규격으로 보이는 줄만 출력한다. 사용: extract_specs.py ID URL"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from guide_check import fetch, normalize_html
gid, url = sys.argv[1], sys.argv[2]
st, final, h, body = fetch(url, 60)
text = normalize_html(body)
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "candidates"); os.makedirs(d, exist_ok=True)
open(os.path.join(d, gid + ".txt"), "w", encoding="utf-8").write(text)
pat = re.compile(r"(px|픽셀|pixel|MB|KB|GB|해상도|resolution|비율|ratio|\d+:\d+|초|second|sec|글자|자 |character|파일|file|format|형식|길이|length|duration|fps|코덱|codec|H\.264|MP4|PNG|JPG)", re.I)
n = 0
for l in text.split("\n"):
    if pat.search(l) and 6 < len(l) < 260:
        print(l); n += 1
        if n >= int(os.environ.get("MAXL", "45")): break
