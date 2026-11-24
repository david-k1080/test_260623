#!/usr/bin/env python3
"""candidate 행을 접속해 status/probed_at/notes를 갱신한다. 사용: python3 -I probe_candidates.py [--promote]"""
import csv, os, sys, time, datetime, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from guide_check import fetch, normalize_html
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, "guide-registry.csv")
today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
rows = list(csv.DictReader(open(P, encoding="utf-8")))
promote = "--promote" in sys.argv
for r in rows:
    if r["status"] != "candidate":
        continue
    try:
        st, final, h, body = fetch(r["url"], 40)
        text = normalize_html(body) if r["method"] != "pdf" else ""
        ok = st == 200 and (r["method"] == "pdf" or len(text) > 400)
        res = ("OK" if ok else "THIN") + f" {st} {len(body)}B text={len(text)}" + ("" if final == r["url"] else " -> " + final[:80])
        if promote and ok:
            r["status"] = "active"
    except urllib.error.HTTPError as e:
        res = f"HTTP {e.code}"
    except Exception as e:
        res = f"ERR {type(e).__name__} {str(e)[:60]}"
    r["probed_at"] = today
    print(f"{r['guide_id']:34s} {res}")
    time.sleep(1.0)
w = csv.DictWriter(open(P, "w", encoding="utf-8", newline=""), fieldnames=list(rows[0].keys()))
w.writeheader(); w.writerows(rows)
