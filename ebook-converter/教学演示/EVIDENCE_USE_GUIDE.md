# Evidence Use Guide — 证据使用速查卡

## 一句话定位

> 用可验证的数据，证明 GEO/SEO 能力。

---

## 证据分级速查

| 级别 | 含义 | 可用场景 | 必须标注 |
|---|---|---|---|
| **A** | 口径清晰、前后可比 | Proposal / Profile / 公开案例 | 数据来源 + 时间范围 |
| **B** | 有价值但需 caveat | Portfolio / 深度说明 | 数据来源 + caveat |
| **C** | 单点或不可比 | 仅内部参考 | 不建议对外使用 |

---

## 常用证据 ID 速查

### GEO 案例（Bing AI）
| ID | 内容 | 分级 |
|---|---|---|
| EV-01 | Bing AI citations 首现 (8/8, 0→4) | A |
| EV-02 | 单日最大跳升 +109 (8/25, 38→147) | A |
| EV-07 | Query citation share 翻倍 (19.35%→46.02%) | B |
| EV-09 | 单页引用 +472 (best-ebook-reader-apps) | B |
| EV-10 | 双源证据：引用+收录 (sync-reading-across-devices) | B |

### SEO 案例（Google/Bing）
| ID | 内容 | 分级 |
|---|---|---|
| EV-37 | Google query "mobi to epub" 首现 | B |
| EV-41 | Bing 词覆盖 119→233 (+114) | B |
| EV-18 | 发布当天收录 (lag=0) | B |

### Automation 案例（意图系统）
| ID | 内容 | 分级 |
|---|---|---|
| SYSTEM-1 | 267 questions / 131 monitors / 129 citations | A |

---

## 提案写作检查清单

写 Proposal 时对照此表：

- [ ] 只引用 A 级和 B 级证据
- [ ] 每条证据标注来源文件（source_files）
- [ ] 不声明因果（只用"伴随"/"同期"/"基于"）
- [ ] B 级证据带 caveat 声明
- [ ] 数字与原始记录一致（不四舍五入）
- [ ] 未使用 C 级证据作为核心论点

---

## 常见错误

❌ **错误**："这篇文章被 AI 引用了 519 次，证明了内容质量"
✅ **正确**："报告中该页出现 519 次 citation（AIPageStatsReport，8/28→9/7 快照）"

❌ **错误**："Google 自然流量增长 366%"
✅ **正确**："GSC UI 导出显示首页展示从 6 增至 272（8/10→8/30）⚠️ 回看窗口不同，不可直接比较趋势"

❌ **错误**："Bing AI citations 持续增长"
✅ **正确**："日级序列显示 8/25 达到峰值 147（+109），9/4 达到更高值 219，系列存在波动"

---

## 数据位置

| 用途 | 文件路径 |
|---|---|
| 全量证据（溯源） | `bookconv_data_asset/events/growth_evidence.csv` |
| 策展报告 | `bookconv_data_asset/reports/GROWTH_EVIDENCE_MINING.md` |
| Top 10 素材 | `海外接单/TOP_10_PROOF_POINTS.md` |
| 教学注释版 | `教学演示/evidence_for_training.md` |
| 方法论 | `教学演示/methodology.md` |
| 写作模板 | `教学演示/case_study_template.md` |

---

*版本：v1 | 更新：2026-09-08*
