#!/usr/bin/env python3
"""공식 가이드 URL 일일 변경 감지.

사용: python3 guide_check.py [--registry guide-registry.csv] [--data data] [--only ID ...]
- 레지스트리의 status가 active인 행만 확인한다.
- method: etag(ETag/Last-Modified 우선, 없으면 본문 해시), text(정규화 텍스트 해시),
          pdf(파일 해시), render(헤드리스 브라우저 렌더 후 텍스트 해시, node+playwright 필요)
- 변경은 2회 연속 같은 새 해시가 관찰될 때만 확정한다(오탐 방지).
- 결과: data/state.json, data/snapshots/<guide_id>/<UTC날짜>.txt, reports/<UTC날짜>.md
표준 라이브러리만 사용한다. 프록시와 CA는 HTTPS_PROXY, SSL_CERT_FILE 환경변수를 따른다.
"""
import argparse, csv, hashlib, html, json, os, re, subprocess, sys, time, urllib.request, urllib.error, urllib.parse, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (compatible; GuideRegistryMonitor/0.1)"


def fetch(url, timeout=40):
    url = urllib.parse.quote(url, safe=":/?&=%#@+,;~-._!$'()*[]")  # 한글 URL 인코딩
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), dict(r.headers), r.read()


def normalize_html(raw: bytes) -> str:
    s = raw.decode("utf-8", "ignore")
    s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", s)
    s = re.sub(r"(?s)<[^>]+>", "\n", s)
    s = html.unescape(s)
    lines = [re.sub(r"\s+", " ", l).strip() for l in s.split("\n")]
    # 동적 토큰(긴 숫자만 있는 줄) 제거
    lines = [l for l in lines if l and not re.fullmatch(r"\d{12,}", l)]
    return "\n".join(lines)


def sha(b):
    if isinstance(b, str):
        b = b.encode("utf-8")
    return hashlib.sha256(b).hexdigest()[:16]


def check_one(row):
    """return dict(fingerprint, text|None, info)"""
    method, url = row["method"], row["url"]
    if method == "render":
        out = os.path.join(HERE, "data", "_render_tmp.txt")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        node_path = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
        env = dict(os.environ, NODE_PATH=node_path)
        p = subprocess.run(["node", os.path.join(HERE, "render.js"), url, out], capture_output=True, text=True, env=env, timeout=150)
        if p.returncode != 0:
            raise RuntimeError("render 실패: " + (p.stderr.strip() or p.stdout.strip())[:200])
        text = open(out, encoding="utf-8").read()
        # 규격 블록만 비교한다(CTA 버튼 목록 등은 순서가 매번 달라 잡음이 된다)
        i, j = text.find("디자인 추천 사항"), text.find("노출 위치 선택하기")
        if i >= 0 and j > i:
            text = text[i:j]
        return {"fp": sha(text), "text": text, "info": f"render {len(text)}자"}
    status, final, hdr, body = fetch(url)
    h = {k.lower(): v for k, v in hdr.items()}
    if method == "pdf":
        fp = sha(body)
        return {"fp": fp, "text": None, "info": f"{status} {len(body)}B etag={h.get('etag','-')} lm={h.get('last-modified','-')}"}
    text = normalize_html(body)
    if method == "etag" and h.get("etag"):
        return {"fp": "etag:" + h["etag"].strip('"'), "text": text, "info": f"{status} etag {h['etag']}"}
    return {"fp": sha(text), "text": text, "info": f"{status} 텍스트 {len(text)}자"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--registry", default=os.path.join(HERE, "guide-registry.csv"))
    ap.add_argument("--data", default=os.path.join(HERE, "data"))
    ap.add_argument("--reports", default=os.path.join(HERE, "reports"))
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    os.makedirs(a.data, exist_ok=True)
    os.makedirs(a.reports, exist_ok=True)
    state_path = os.path.join(a.data, "state.json")
    state = json.load(open(state_path, encoding="utf-8")) if os.path.exists(state_path) else {}
    rows = [r for r in csv.DictReader(open(a.registry, encoding="utf-8")) if r["status"] == "active"]
    if a.only:
        rows = [r for r in rows if r["guide_id"] in a.only]
    res = {"new": [], "changed": [], "pending": [], "same": [], "error": []}
    for r in rows:
        gid = r["guide_id"]
        st = state.setdefault(gid, {"current": None, "pending": None, "history": []})
        try:
            c = check_one(r)
        except Exception as e:  # 네트워크 오류, 403 등
            res["error"].append((gid, f"{type(e).__name__}: {e}"))
            st["last_error"] = str(e)[:200]
            continue
        st.pop("last_error", None)
        st["last_checked"] = today
        fp = c["fp"]
        if st["current"] is None:
            st["current"] = fp
            st["history"].append({"date": today, "fp": fp})
            res["new"].append((gid, c["info"]))
        elif fp == st["current"]:
            st["pending"] = None
            res["same"].append((gid, c["info"]))
        elif st["pending"] == fp:  # 2회 연속 관찰: 변경 확정
            st["current"] = fp
            st["pending"] = None
            st["history"].append({"date": today, "fp": fp})
            res["changed"].append((gid, c["info"]))
        else:
            st["pending"] = fp
            res["pending"].append((gid, c["info"]))
        if c["text"] and fp != "":
            d = os.path.join(a.data, "snapshots", gid)
            os.makedirs(d, exist_ok=True)
            if st["current"] == fp:
                open(os.path.join(d, today + ".txt"), "w", encoding="utf-8").write(c["text"])
        time.sleep(1.0)  # 사이트 부담 완화
    json.dump(state, open(state_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    lines = [f"# 가이드 변경 감지 리포트 {today}", ""]
    for key, title in [("changed", "변경 확정"), ("pending", "변경 후보(다음 확인에서 같으면 확정)"), ("error", "오류"), ("new", "신규 기준선"), ("same", "변경 없음")]:
        lines.append(f"## {title} ({len(res[key])})")
        lines += [f"- `{g}` {i}" for g, i in res[key]] or ["- 없음"]
        lines.append("")
    rp = os.path.join(a.reports, today + ".md")
    open(rp, "w", encoding="utf-8").write("\n".join(lines))
    print("\n".join(lines))
    sys.exit(1 if res["error"] else 0)


if __name__ == "__main__":
    main()
