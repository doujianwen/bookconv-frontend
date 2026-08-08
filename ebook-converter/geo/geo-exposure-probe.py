#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
geo-exposure-probe.py
======================
自动探测 Gemini / ChatGPT 在回答电子书转换类问题时引用了哪些页面，
直接把你《用户意图作战映射表 §3.2》那张「手工留空」的竞品曝光表变成自动产出。

三种用法
--------
1) 探针模式（曝光监测）：读 questions-seed.json，调 API，抓引用 URL，生成报告。
     python geo-exposure-probe.py probe geo/questions-seed.json
2) 扩词模式（意图挖掘）：给一个关键词，让 Gemini 自动生成 10 条真实 NL 问法。
     python geo-exposure-probe.py expand "epub to pdf" -n 10
    3) 意图挖掘（Google autosuggest，无需 Gemini 配额）：给关键词或 seed 文件，抓「用户还搜什么」。
     python geo-exposure-probe.py suggest "epub to pdf" -n 10
     python geo-exposure-probe.py suggest geo/questions-seed.json -n 10


依赖：仅标准库（urllib）。API key 走环境变量：
     GEMINI_API_KEY   https://aistudio.google.com/app/apikey
     OPENAI_API_KEY   https://platform.openai.com/api-keys

无 key 时可用 --demo 看输出格式：
     python geo-exposure-probe.py probe geo/questions-seed.json --demo
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse
from datetime import datetime, timezone

GEMINI_MODEL = "gemini-2.0-flash"
OPENAI_MODEL = "gpt-4o"
BOOKCONV_DOMAINS = ("bookconv.com",)
COMPETITOR_HINTS = ("cloudconvert", "convertio", "zamzar", "online-convert",
                    "epub2txt", "djvu2pdf", "smallpdf", "reddit", "github")


# ----------------------------------------------------------------------------
# 本地 .env 加载（零依赖；不覆盖已存在的环境变量）
# ----------------------------------------------------------------------------
def load_env_file():
    """从脚本所在目录的 .env / .env.local 载入键值到 os.environ。"""
    here = os.path.dirname(os.path.abspath(__file__))
    for name in (".env.local", ".env"):
        path = os.path.join(here, name)
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v


# ----------------------------------------------------------------------------
# 带退避的 POST（处理 429 限流）
# ----------------------------------------------------------------------------
def _post_json(url: str, body: dict, headers: dict = None, retries: int = 3) -> dict:
    """POST JSON 并解析，内置 429 退避（读 Retry-After）与网络重试。"""
    data = json.dumps(body).encode("utf-8") if body is not None else None
    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data,
                                         headers=headers or {}, method="POST")
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                ra = e.headers.get("Retry-After")
                wait = (float(ra) if (ra and ra.replace(".", "").isdigit())
                        else 2 ** attempt * 8)
                print(f"[429] 限流，等待 {wait:.0f}s 后重试（{attempt+1}/{retries}）",
                      file=sys.stderr)
                time.sleep(wait)
                last_err = e
                continue
            raise
        except urllib.error.URLError as e:
            print(f"[warn] 网络错误（{attempt+1}/{retries}）: {e}", file=sys.stderr)
            time.sleep(2 ** attempt * 3)
            last_err = e
    raise last_err


def _get_json(url: str, headers: dict = None, retries: int = 3) -> dict:
    """GET JSON 并解析，内置 429 退避（读 Retry-After）与网络重试。"""
    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers or {})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                ra = e.headers.get("Retry-After")
                wait = (float(ra) if (ra and ra.replace(".", "").isdigit())
                        else 2 ** attempt * 8)
                print(f"[429] 限流，等待 {wait:.0f}s 后重试（{attempt+1}/{retries}）",
                      file=sys.stderr)
                time.sleep(wait)
                last_err = e
                continue
            raise
        except urllib.error.URLError as e:
            print(f"[warn] 网络错误（{attempt+1}/{retries}）: {e}", file=sys.stderr)
            time.sleep(2 ** attempt * 3)
            last_err = e
    raise last_err


# ----------------------------------------------------------------------------
# API 调用
# ----------------------------------------------------------------------------
def call_gemini(question: str) -> list:
    """Gemini + googleSearch grounding，返回引用 URL 列表。"""
    key = os.environ["GEMINI_API_KEY"]
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{GEMINI_MODEL}:generateContent?key={key}")
    body = {
        "contents": [{"role": "user", "parts": [{"text": question}]}],
        "tools": [{"googleSearch": {}}],
        "systemInstruction": {"parts": [{"text":
            "Answer briefly. When you use web information, your answer is grounded in sources."}]},
    }
    data = _post_json(url, body, headers={"Content-Type": "application/json"})
    chunks = (data.get("candidates", [{}])[0]
              .get("groundingMetadata", {}).get("groundingChunks", []))
    urls = []
    for c in chunks:
        web = c.get("web") or {}
        if web.get("uri"):
            urls.append(web["uri"])
    return urls


def call_chatgpt(question: str) -> list:
    """ChatGPT Responses API + web_search_preview，返回引用 URL 列表。"""
    key = os.environ["OPENAI_API_KEY"]
    url = "https://api.openai.com/v1/responses"
    body = {
        "model": OPENAI_MODEL,
        "tools": [{"type": "web_search_preview"}],
        "input": question,
    }
    data = _post_json(url, body, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}"})
    urls = []
    for item in data.get("output", []):
        # 新版：annotations 在 content[].annotations
        for part in item.get("content", []) or []:
            for ann in part.get("annotations", []) or []:
                if ann.get("url"):
                    urls.append(ann["url"])
        # 兜底：item 顶层 annotations
        for ann in item.get("annotations", []) or []:
            if ann.get("url"):
                urls.append(ann["url"])
    return urls


def call_brave(question: str, count: int = 10) -> list:
    """Brave Web Search，返回 Top 结果 URL（作为 AI 引用面/排名面的代理信号）。"""
    key = os.environ["BRAVE_API_KEY"]
    url = ("https://api.search.brave.com/res/v1/web/search?"
           + urllib.parse.urlencode({"q": question, "count": count}))
    data = _get_json(url, headers={"Accept": "application/json",
                                   "X-Subscription-Token": key})
    urls = []
    for item in (data.get("web") or {}).get("results", []):
        u = item.get("url")
        if u:
            urls.append(u)
    return urls




def call_suggest(query: str, n: int = 10) -> list:
    """Google autosuggest（公开端点，零 key，零 Gemini/OpenAI 配额）。返回建议列表。

    HTTPS 偶发 SSL EOF（沙箱出口代理不稳定）时自动降级到 HTTP 重试，最多 3 轮。
    """
    params = urllib.parse.urlencode({"client": "firefox", "q": query})
    endpoints = [
        "https://suggestqueries.google.com/complete/search?" + params,
        "http://suggestqueries.google.com/complete/search?" + params,
    ]
    last_err = None
    for ep in endpoints:
        for _ in range(3):
            try:
                req = urllib.request.Request(
                    ep, headers={"User-Agent": "Mozilla/5.0", "Connection": "close"})
                with urllib.request.urlopen(req, timeout=15) as r:
                    data = json.loads(r.read().decode("utf-8", "ignore"))
                suggestions = data[1] if isinstance(data, list) and len(data) > 1 else []
                return [s for s in suggestions if isinstance(s, str) and s][:n]
            except Exception as e:
                last_err = e
                time.sleep(1)
    raise last_err
def domain_of(u: str) -> str:
    return urlparse(u).netloc.lower().replace("www.", "")


# ----------------------------------------------------------------------------
# 报告生成
# ----------------------------------------------------------------------------
def build_report(rows: list, questions: list) -> tuple:
    """返回 (md_text, csv_text, gaps)。"""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # ---- Markdown ----
    md = [f"# 竞品 Gemini/ChatGPT 曝光自动监测报告\n", f"> 生成时间：{ts}\n",
          f"> 问题数：{len(questions)} ｜ 引用记录：{len(rows)}\n"]
    md.append("\n## 一、曝光明细（自动填 §3 表）\n")
    md.append("| 序号 | 引擎 | 用户意图提问 | 被引域名 | 被引 URL | 类型 |")
    md.append("|---|---|---|---|---|---|")
    for i, r in enumerate(rows, 1):
        typ = "bookconv" if r["is_bookconv"] else (
            "竞品" if any(h in r["domain"] for h in COMPETITOR_HINTS) else "其他")
        md.append(f"| {i} | {r['engine']} | {r['question'][:60]} | "
                  f"{r['domain']} | {r['url']} | {typ} |")

    # ---- GEO 缺口（竞品被引但 bookconv 未引）----
    md.append("\n## 二、GEO 缺口告警（竞品被引，bookconv 未引 → 待建/增强页）\n")
    gaps = []
    by_q = {}
    for r in rows:
        by_q.setdefault((r["engine"], r["question"]), []).append(r)
    for (engine, q), rs in by_q.items():
        bookconv_hit = any(r["is_bookconv"] for r in rs)
        competitor_hits = [r for r in rs
                           if not r["is_bookconv"]
                           and any(h in r["domain"] for h in COMPETITOR_HINTS)]
        if competitor_hits and not bookconv_hit:
            gaps.append((q, engine, competitor_hits))
    if not gaps:
        md.append("_（本次探测中 bookconv 在竞品被引的问题上均有曝光，无缺口）_\n")
    else:
        md.append("| 用户意图提问 | 引擎 | 被竞品占位的域名 | 建议动作 |")
        md.append("|---|---|---|---|")
        for q, engine, hits in gaps:
            doms = ", ".join(sorted({h["domain"] for h in hits}))
            md.append(f"| {q[:60]} | {engine} | {doms} | "
                      f"补/增强目标页，拦截 {doms} |")

    # ---- CSV ----
    csv = "engine,question,intent,target_slug,domain,url,is_bookconv\n"
    for r in rows:
        csv += (f"{r['engine']},{r['question']},{r.get('intent','')},"
                f"{r.get('target_slug','')},{r['domain']},{r['url']},"
                f"{r['is_bookconv']}\n")
    return "\n".join(md), csv, gaps


# ----------------------------------------------------------------------------
# demo 数据（无 key 时展示格式）
# ----------------------------------------------------------------------------
def demo_rows(questions: list) -> list:
    sample = [
        ("Gemini", "How do I convert EPUB to read on my Kindle Paperwhite without losing formatting?",
         "cloudconvert.com", "https://cloudconvert.com/epub-to-azw3"),
        ("Gemini", "How do I extract text from an EPUB or MOBI book to upload into NotebookLM?",
         "epub2txt.com", "https://epub2txt.com/"),
        ("ChatGPT", "What is the best CloudConvert alternative for ebook conversion?",
         "reddit.com", "https://reddit.com/r/Calibre/"),
        ("Gemini", "I found old Microsoft Reader .lit books from 2005, how do I convert LIT to EPUB?",
         "bookconv.com", "https://bookconv.com/convert/lit-to-epub"),
    ]
    rows = []
    for engine, q, dom, u in sample:
        rows.append({"engine": engine, "question": q, "domain": dom, "url": u,
                     "is_bookconv": dom in BOOKCONV_DOMAINS,
                     "intent": "", "target_slug": ""})
    return rows


# ----------------------------------------------------------------------------
# 扩词（意图挖掘 Layer B）
# ----------------------------------------------------------------------------
def expand_keyword(keyword: str, n: int = 10) -> list:
    key = os.environ["GEMINI_API_KEY"]
    prompt = (f"List {n} realistic natural-language questions a user would ask an AI "
              f"assistant (Gemini/ChatGPT) about '{keyword}'. Use full sentences with "
              f"scenarios, devices, or error cases. Output ONLY a numbered list, one question per line, no extra text.")
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{GEMINI_MODEL}:generateContent?key={key}")
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    data = _post_json(url, body, headers={"Content-Type": "application/json"})
    text = (data.get("candidates", [{}])[0].get("content", {})
            .get("parts", [{}])[0].get("text", ""))
    qs = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        for sep in (". ", ") "):
            if sep in line:
                line = line.split(sep, 1)[1].strip()
                break
        if line:
            qs.append(line)
    return qs


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------
def main():
    load_env_file()
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]

    if cmd == "probe":
        seed_path = sys.argv[2] if len(sys.argv) > 2 else "geo/questions-seed.json"
        demo = "--demo" in sys.argv
        with open(seed_path, encoding="utf-8") as f:
            questions = json.load(f)
        rows = []
        saw_429 = False
        if demo:
            print("[demo] 无 API key，使用样例数据展示格式。", file=sys.stderr)
            rows = demo_rows(questions)
        else:
            have_gemini = bool(os.environ.get("GEMINI_API_KEY"))
            have_openai = bool(os.environ.get("OPENAI_API_KEY"))
            if not (have_gemini or have_openai):
                print("错误：请设置 GEMINI_API_KEY 或 OPENAI_API_KEY 环境变量。", file=sys.stderr)
                sys.exit(1)
            for q in questions:
                question = q["question"]
                engines = []
                if have_gemini:
                    try:
                        engines.append(("Gemini", call_gemini(question)))
                    except Exception as e:
                        if "429" in str(e):
                            saw_429 = True
                        print(f"[warn] Gemini 失败: {question[:40]}... {e}", file=sys.stderr)
                if have_openai:
                    try:
                        engines.append(("ChatGPT", call_chatgpt(question)))
                    except Exception as e:
                        if "429" in str(e):
                            saw_429 = True
                        print(f"[warn] ChatGPT 失败: {question[:40]}... {e}", file=sys.stderr)
                for engine, urls in engines:
                    for u in urls:
                        dom = domain_of(u)
                        rows.append({"engine": engine, "question": question,
                                     "domain": dom, "url": u,
                                     "is_bookconv": dom in BOOKCONV_DOMAINS,
                                     "intent": q.get("intent", ""),
                                     "target_slug": q.get("target_slug", "")})
                time.sleep(2)  # 节流，降低 429 概率
        md, csv, gaps = build_report(rows, questions)
        out_md = "geo/exposure-report.md"
        out_csv = "geo/exposure-report.csv"
        with open(out_md, "w", encoding="utf-8") as f:
            f.write(md)
        with open(out_csv, "w", encoding="utf-8") as f:
            f.write(csv)
        print(f"已生成：{out_md}  {out_csv}  （引用记录 {len(rows)} 条，缺口 {len(gaps)} 个）")
        if saw_429 and not rows:
            print("\n[诊断] 全部请求被 429 限流，且重试后仍失败。常见根因：", file=sys.stderr)
            print("  · Gemini：免费层有每日/每分钟配额，今配额可能已用尽；去 AI Studio 查看额度或等重置。", file=sys.stderr)
            print("  · ChatGPT：web_search_preview 工具仅对付费账户（Tier≥1）开放，免费层会直接 429；需先充值 ≥$5。", file=sys.stderr)
            print("  · 脚本已自动退避重试；若是硬配额/层级限制，退避无效，请先解决账户配额再跑。", file=sys.stderr)

    elif cmd == "brave":
        seed_path = sys.argv[2] if len(sys.argv) > 2 else "geo/questions-seed.json"
        if not os.environ.get("BRAVE_API_KEY"):
            print("错误：brave 模式需要 BRAVE_API_KEY（Brave Search API）。", file=sys.stderr)
            sys.exit(1)
        with open(seed_path, encoding="utf-8") as f:
            questions = json.load(f)
        rows = []
        saw_429 = False
        for q in questions:
            question = q["question"]
            try:
                urls = call_brave(question)
            except Exception as e:
                if "429" in str(e):
                    saw_429 = True
                print(f"[warn] Brave 失败: {question[:40]}... {e}", file=sys.stderr)
                continue
            for u in urls:
                dom = domain_of(u)
                rows.append({"engine": "Brave", "question": question,
                             "domain": dom, "url": u,
                             "is_bookconv": dom in BOOKCONV_DOMAINS,
                             "intent": q.get("intent", ""),
                             "target_slug": q.get("target_slug", "")})
            time.sleep(1)
        md, csv, gaps = build_report(rows, questions)
        out_md = "geo/exposure-report-brave.md"
        out_csv = "geo/exposure-report-brave.csv"
        with open(out_md, "w", encoding="utf-8") as f:
            f.write(md)
        with open(out_csv, "w", encoding="utf-8") as f:
            f.write(csv)
        print(f"已生成：{out_md}  {out_csv}  （结果 {len(rows)} 条，缺口 {len(gaps)} 个）")
        if saw_429 and not rows:
            print("[诊断] Brave 也全 429：检查 BRAVE_API_KEY 配额或等待重置。", file=sys.stderr)

    elif cmd == "suggest":
        arg = sys.argv[2] if len(sys.argv) > 2 else "epub to pdf"
        n = 10
        for i, a in enumerate(sys.argv):
            if a == "-n" and i + 1 < len(sys.argv):
                try:
                    n = int(sys.argv[i + 1])
                except ValueError:
                    pass
        queries = []
        if arg.endswith(".json"):
            with open(arg, encoding="utf-8") as f:
                qs = json.load(f)
            queries = [q["question"] for q in qs if q.get("question")]
        else:
            queries = [arg]
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        md = [f"# 用户意图挖掘报告（Google Autosuggest）\n",
              f"> 生成时间：{ts}\n",
              f"> 查询数：{len(queries)} ｜ 每查询建议上限：{n}\n",
              "> 数据源：Google 公开 autosuggest 端点（零 key，无需 Gemini/OpenAI 配额）\n"]
        total = 0
        for q in queries:
            try:
                sugs = call_suggest(q, n)
            except Exception as e:
                print(f"[warn] suggest 失败: {q[:40]}... {e}", file=sys.stderr)
                sugs = []
            total += len(sugs)
            time.sleep(1)  # 节流，降低 Google SSL EOF/限流概率
            md.append(f"\n## 查询：{q}\n")
            if not sugs:
                md.append("_（无建议返回）_\n")
            else:
                for j, s in enumerate(sugs, 1):
                    md.append(f"{j}. {s}")
        out_md = "geo/suggest-report.md"
        with open(out_md, "w", encoding="utf-8") as f:
            f.write("\n".join(md))
        print(f"已生成：{out_md}  （查询 {len(queries)} 个，建议 {total} 条）")

    elif cmd == "expand":
        keyword = sys.argv[2] if len(sys.argv) > 2 else "epub to pdf"
        n = 10
        for i, a in enumerate(sys.argv):
            if a == "-n" and i + 1 < len(sys.argv):
                n = int(sys.argv[i + 1])
        if not os.environ.get("GEMINI_API_KEY"):
            print("错误：expand 模式需要 GEMINI_API_KEY。", file=sys.stderr)
            sys.exit(1)
        qs = expand_keyword(keyword, n)
        print(f"# 关键词「{keyword}」自动扩词结果：")
        for i, q in enumerate(qs, 1):
            print(f"{i}. {q}")
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
