#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
daily_vi.py — Bing AI 可见性指数 (VI v1.0) 固定 7v7 计算器

背景 / 铁律 (来自 数据分析/可见性指数-统一度量衡-2026-09-18.md 与项目记忆):
  - VI_ch = (V_recent7 - V_prev7) / V_prev7 x 100%
  - 必须用「变化率」跨渠道对比，绝不用绝对值。
  - 固定 7v7 窗口：recent7 = 最新连续 7 天之和，prev7 = 其前 7 天之和。
  - 阈值：<10% = 无信号(禁说"上升")；10–20% = 弱信号("可能")；>=20% = 信号成立。
  - 唯一权威「日均」分母 = recent7 / 7（近7天日均），严禁用 70.4(÷47日历天) 等口径。
  - VI(近期 7v7) 与 事件窗口(历史 14v14) 是两套数，禁止互引。
  - Overview CSV 的 Citations 列 = 当日引用数（逐日求和 = 全量累计，如 6,137）。

用法:
  python3 daily_vi.py <AIPerformanceOverviewStats_*.csv>
  python3 daily_vi.py  # 不传参则自动取 bookconv_data_asset/bing 下最新的 Overview 文件

输出: 结构化文本 + 末尾一行 JSON，便于脚本/agent 解析。

退出码:
  0 = 计算成功
  2 = 数据不足 14 天（无法构成 7v7）
  1 = 文件/解析错误
"""

import csv
import json
import glob
import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BING_DIR = os.path.join(HERE, "..", "bing")  # bookconv_data_asset/bing


def find_latest_overview():
    pat = os.path.join(BING_DIR, "*AIPerformanceOverviewStats*.csv")
    files = glob.glob(pat)
    if not files:
        return None
    return max(files, key=os.path.getmtime)


def parse_date(s):
    s = (s or "").strip().strip("\ufeff").strip('"')
    if not s:
        return None
    # 真实格式: "2026/7/27 上午12:00:00" 或 "2026-07-27"
    # 只取空格前的日期部分，避免中英文时间后缀干扰
    date_part = s.split()[0] if s.split() else s
    for fmt in ("%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_part, fmt)
        except ValueError:
            continue
    return None


def load_rows(path):
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        rows = list(reader)
    if not rows:
        raise ValueError("空文件")
    header = [h.strip().strip("\ufeff") for h in rows[0]]
    # 定位 日期 / Citations 列
    date_i = next((i for i, h in enumerate(header) if "日期" in h or "date" in h.lower()), 0)
    cit_i = next((i for i, h in enumerate(header) if "citation" in h.lower() or "引用" in h), None)
    if cit_i is None:
        # 退而求其次：第二列
        cit_i = 1 if date_i == 0 else 0

    data = []
    for r in rows[1:]:
        if len(r) <= max(date_i, cit_i):
            continue
        d = parse_date(r[date_i])
        cit_raw = (r[cit_i] or "").strip().replace(",", "").replace("%", "")
        if d is None:
            continue  # 跳过空日期汇总行
        try:
            cit = float(cit_raw)
        except ValueError:
            continue  # 跳过非数字（如汇总行）
        data.append((d, cit))
    # 按日期升序、去重（同日多条取首条）
    data.sort(key=lambda x: x[0])
    dedup = {}
    for d, c in data:
        if d not in dedup:
            dedup[d] = c
    return [(d, dedup[d]) for d in sorted(dedup)]


def classify(vi):
    """方向感知的信号判定。

    🔴 2026-10-05 修正：旧版只判正向 `vi < 10 → 无信号`，导致 **-27.5% 被判「无信号」**——
    下降 27.5% 是重大恶化信号，却被当成「没变化」。这是判据方向性缺陷（假失败的一种，
    比假通过更隐蔽：报告读者会以为一切正常）。现按 |vi| 判幅度、单独标方向。
    阈值口径不变（VI v1.0）：|VI|<10% 无信号 / 10–20% 弱信号 / >=20% 信号成立。

    🔴 2026-10-05 二次修正（阈值边界）：实测出现 **vi = -10.0%** 恰好落在门槛上，
    且其浮点实际值为 -9.99…%（略小于 10）⇒ 判「无信号」。这暴露两个问题：
      1. 「无信号」会被读成「没变化」，但它只意味着「未达 20% 结论门槛」；
      2. 恰在 10% / 20% 边界上的值，其归类由浮点表示决定，不稳定。
    ⇒ 故在 near_threshold 标记中显式暴露边界值，并在文案中禁止把「无信号」读成「无变化」。
    """
    if vi is None:
        return "N/A"
    a = abs(vi)
    if a < 10:
        return "无信号(|VI|<10% 禁说上升也禁说下降；注:无信号≠无变化)"
    if a < 20:
        return "弱信号(10-20% 只能说可能变化)"
    return "信号成立(|VI|>=20%)"


def near_threshold(vi, eps=0.05):
    """True when |vi| sits within eps of the 10% / 20% decision boundaries.

    边界上的值归类由浮点表示决定（实测 -10.0% 实际是 -9.99…%），因此必须显式标记，
    提醒报告作者：该读数的档位归类不稳定，措辞须更保守。
    """
    if vi is None:
        return False
    a = abs(vi)
    return any(abs(a - b) <= eps for b in (10.0, 20.0))


def direction(vi):
    """单独返回方向标签，避免「信号成立」被读成利好。"""
    if vi is None:
        return "unknown"
    if vi > 0:
        return "up"
    if vi < 0:
        return "down"
    return "flat"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else find_latest_overview()
    if not path or not os.path.exists(path):
        print("ERROR: 找不到 AIPerformanceOverviewStats CSV。请先手动导出 Bing AI 数据。", file=sys.stderr)
        sys.exit(1)

    try:
        data = load_rows(path)
    except Exception as e:
        print(f"ERROR: 解析失败: {e}", file=sys.stderr)
        sys.exit(1)

    n = len(data)
    print(f"文件: {os.path.basename(path)}")
    print(f"有效日记录: {n} 天")

    if n < 14:
        print(f"⚠️ 数据不足 14 天（仅 {n} 天），无法构成 7v7 → 跳过 VI，仅给累计。")
        total = sum(c for _, c in data)
        print(f"全量累计引用(逐日求和): {int(total)}")
        print(json.dumps({"ok": False, "reason": "insufficient_days", "days": n, "total_citations": int(total)}, ensure_ascii=False))
        sys.exit(2)

    recent7 = data[-7:]
    prev7 = data[-14:-7]
    recent_sum = sum(c for _, c in recent7)
    prev_sum = sum(c for _, c in prev7)
    vi = (recent_sum - prev_sum) / prev_sum * 100.0 if prev_sum else None
    daily_avg = recent_sum / 7.0

    print(f"\n=== VI v1.0 固定 7v7 ===")
    print(f"recent7 窗口: {recent7[0][0].date()} ~ {recent7[-1][0].date()}  和={int(recent_sum)}  日均={daily_avg:.1f}")
    print(f"prev7   窗口: {prev7[0][0].date()} ~ {prev7[-1][0].date()}  和={int(prev_sum)}")
    print(f"VI = ({int(recent_sum)} - {int(prev_sum)}) / {int(prev_sum)} x 100% = {vi:+.1f}%")
    print(f"方向: {direction(vi)}")
    print(f"判定: {classify(vi)}")
    if near_threshold(vi):
        print("⚠️ 阈值边界: |VI| 落在 10%/20% 门槛附近（±0.05）⇒ 档位归类由浮点表示决定，"
              "措辞须更保守，且「无信号」不等于「无变化」。")
    print(f"全量累计(逐日求和): {int(sum(c for _, c in data))}")

    out = {
        "ok": True,
        "recent7_start": str(recent7[0][0].date()),
        "recent7_end": str(recent7[-1][0].date()),
        "recent7_sum": int(recent_sum),
        "recent7_daily_avg": round(daily_avg, 1),
        "prev7_sum": int(prev_sum),
        "vi_pct": round(vi, 1) if vi is not None else None,
        "vi_class": classify(vi),
        "vi_direction": direction(vi),
        "vi_near_threshold": near_threshold(vi),
        "total_citations": int(sum(c for _, c in data)),
    }
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
