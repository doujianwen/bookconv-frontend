#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_vi_classify.py — VI 判据自检（daily_vi.classify + direction）

为什么存在（2026-10-05 红队审计建议 #6）:
  `daily_vi.classify()` 曾只判正向 —— `vi < 10 -> "无信号"`。
  于是 Google VI = **-27.5%** 被判成「无信号」，即
  **「下降 27.5%」这个重大恶化信号被读成「没变化」**。
  修复后若无人守护，未来任何把 classify 改回单方向判断的改动都不会被发现。
  ⇒ 本文件把「负 VI 绝不能判无信号」变成**可执行断言**。

判据本身也要被验证（纪律 5 反向验证）:
  1. 先跑一批已知 (vi, 方向, 幅度档) 的用例，测「同输入必同输出」；
  2. 再跑**真实事故条件**（负 VI），断言它抓得住；
  3. 任一失败 ⇒ exit 1，门禁红。

退出码:
  0 = 全部通过
  1 = 有用例失败（门禁必须红）
  2 = daily_vi.py 不可导入（判据无法执行 ⇒ 不可判定，不报 FAIL）
"""

import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(HERE, "daily_vi.py")

# (vi, 期望方向, 期望判定关键词)
CASES = [
    # ── 本轮真实读数 ──
    (-27.5, "down", "信号成立"),    # Google 实测 -27.5%（旧版误判「无信号」）
    (26.1, "up", "信号成立"),       # Bing Web 实测 +26.1%
    (-9.99, "down", "无信号"),      # Bing AI 实测：显示 -10.0%，浮点实际 -9.99…（边界）
    # ── 边界 ──
    (0.0, "flat", "无信号"),
    (None, "unknown", "N/A"),
    (20.0, "up", "信号成立"),
    (-20.0, "down", "信号成立"),
    (19.9, "up", "弱信号"),
    (-19.9, "down", "弱信号"),
    (10.0, "up", "弱信号"),
    (-10.0, "down", "弱信号"),
    (9.9, "up", "无信号"),
    (-9.9, "down", "无信号"),
    (-100.0, "down", "信号成立"),
]

# 🔴 真实事故条件：这些值在旧版会被判「无信号」
ACCIDENT_VALUES = [-27.5, -89.8, -100.0, -20.0, -25.0, -33.3]

# 🔴 阈值边界用例：(vi, 期望 near_threshold) —— 边界值的档位归类由浮点决定，必须显式标记
THRESHOLD_CASES = [
    (-9.99, True),   # 本轮 Bing AI 实测值，恰在 10% 边界
    (-10.0, True),
    (10.0, True),
    (9.96, True),    # 10% 边界 −0.04（在 eps=0.05 内）
    (20.0, True),
    (19.97, True),
    (-20.0, True),
    (9.9, False),    # 距 10% 边界 0.1 > eps
    (19.9, False),
    (5.0, False),
    (-27.5, False),
    (26.1, False),
    (0.0, False),
    (None, False),
]


def load_target():
    if not os.path.exists(TARGET):
        print(f"ERROR: 找不到 {TARGET}", file=sys.stderr)
        sys.exit(2)  # 判据无法执行 = 不可判定，不报 FAIL
    spec = importlib.util.spec_from_file_location("daily_vi", TARGET)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for fn in ("classify", "direction", "near_threshold"):
        if not hasattr(mod, fn):
            print(f"ERROR: daily_vi 缺少 {fn}() —— 判据被移除或改名", file=sys.stderr)
            sys.exit(2)
    return mod


def main():
    m = load_target()
    failures = []

    print("=== 用例自检 ===")
    for vi, exp_dir, exp_kw in CASES:
        got_cls = m.classify(vi)
        got_dir = m.direction(vi)
        ok = (got_dir == exp_dir) and (exp_kw in got_cls)
        if not ok:
            failures.append(f"vi={vi}: dir={got_dir}(期望 {exp_dir}) class={got_cls}(期望含 {exp_kw})")
        print(f"  {'OK  ' if ok else 'FAIL'} vi={str(vi):8} dir={got_dir:8} class={got_cls}")

    print("\n=== 反向验证：真实事故条件（负 VI 绝不能判「无信号」）===")
    for vi in ACCIDENT_VALUES:
        cls = m.classify(vi)
        caught = "无信号" not in cls
        if not caught:
            failures.append(f"事故未抓住: vi={vi} -> {cls}")
        print(f"  {'OK  ' if caught else 'FAIL'} vi={vi:8} -> {cls}")

    print("\n=== 阈值边界标记（near_threshold）===")
    for vi, exp in THRESHOLD_CASES:
        got = m.near_threshold(vi)
        ok = got == exp
        if not ok:
            failures.append(f"near_threshold({vi}) = {got}，期望 {exp}")
        print(f"  {'OK  ' if ok else 'FAIL'} vi={str(vi):8} near_threshold={got}")

    print(f"\n用例 {len(CASES)}｜事故断言 {len(ACCIDENT_VALUES)} 条｜边界 {len(THRESHOLD_CASES)} 条")
    if failures:
        print(f"\n🔴 门禁失败（{len(failures)} 项）：")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("✅ VI 判据自检全绿")
    sys.exit(0)


if __name__ == "__main__":
    main()
