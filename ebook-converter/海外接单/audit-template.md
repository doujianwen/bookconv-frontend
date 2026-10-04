# AI Search Visibility Diagnostic — Delivery Template

> **English template, ready to send.** Fill every `{{PLACEHOLDER}}`.
> Chinese operating notes are at the bottom — **delete that section before sending**.
> Every finding must carry a confidence tag and, where possible, a counter-example. A finding with no counter-example is a hypothesis, and must be labelled as one.

---

## Report header

```
AI Search Visibility Diagnostic
Prepared for:      {{CLIENT_NAME}}
Property:          {{GSC_PROPERTY_URL}}
Reporting window:  {{START_DATE}} → {{END_DATE}}  ({{N}} days)
Data pulled:       {{PULL_TIMESTAMP}} ({{TIMEZONE}})
Prepared by:       {{YOUR_NAME}}
Report version:    v1
```

---

## 1. Executive summary

Five bullets, hard rules:

- Bullet 1 = the single most important measured number
- Bullet 2 = the biggest finding, stated as correlation not cause
- Bullet 3 = the biggest thing I could NOT determine
- Bullet 4 = the highest-leverage action
- Bullet 5 = when we re-test and what would change the conclusion

```
• {{SITE}} recorded {{X}} AI citations across {{Y}} pages in {{N}} days.
• Citation rate differs {{Z}}x by page type: {{TYPE_A}} {{A}}% vs {{TYPE_B}} {{B}}%.
  This is correlation — {{NAME_THE_CONFOUND}} — not a proven cause.
• I could not determine {{UNKNOWN}}. Here is why, and here is what would answer it.
• Highest-leverage single action: {{ACTION}}.
• Re-test on {{DATE}}. I would change this conclusion if {{FALSIFICATION_CRITERION}}.
```

---

## 2. Data provenance

Non-negotiable. If the client cannot reproduce it, it does not go in the report.

| Source | Endpoint / report | Window | Pulled via |
|---|---|---|---|
| Google Search Console | `searchAnalytics.query` | {{START}} → {{END}} | Service account, API v3 |
| Bing Webmaster Tools | AI Performance — Overview | {{START}} → {{END}} | Manual CSV export |
| Bing Webmaster Tools | AI Performance — Page stats | — | Manual CSV export |
| Bing Webmaster Tools | AI Performance — Grounding queries | — | Manual CSV export |
| Bing Webmaster Tools | Keyword report / Page traffic | — | Manual CSV export |

**Known limitations, stated up front:**

- The Search Analytics API does **not** expose Google's generative AI report. That data is UI-only and must be exported by hand. If it is absent from this report, say so here.
- Google's generative AI impressions are **not incremental** — they are a filtered view of data already inside the Web search type. Never add them to total impressions.
- Bing AI page-level data is a top-page report, so page totals can be lower than overview totals. When two sources disagree, **report the smaller number and say which one you used.**
- GSC `date + query` only covers roughly 30–65% of `date`-dimension impressions. **Never mix dimensions in one calculation.**

---

## 3. Baseline — Google organic

| Metric | Value | Window |
|---|---:|---|
| Impressions | {{N}} | {{WINDOW}} |
| Clicks | {{N}} | |
| Unique queries | {{N}} | |
| Average position | {{N}} | |
| Desktop / mobile split | {{D}}% / {{M}}% | |

Trend: {{ONE_PARAGRAPH}}. If there is a step change, date it and give the attribution in section 6.

---

## 4. Baseline — AI visibility

| Metric | Value |
|---|---:|
| AI citations (conservative, top-page report) | {{N}} |
| Pages cited | {{N}} |
| Peak day / peak pages | {{N}} / {{N}} |
| Grounding queries recorded | {{N}} |
| Highest citation share on a single query | {{N}}% |

Top 5 grounding queries:

| Query | Citations | Share |
|---|---:|---:|
| {{Q1}} | {{N}} | {{N}}% |
| {{Q2}} | {{N}} | {{N}}% |
| {{Q3}} | {{N}} | {{N}}% |
| {{Q4}} | {{N}} | {{N}}% |
| {{Q5}} | {{N}} | {{N}}% |

---

## 5. Zero-citation audit — the core deliverable

**Always publish the denominator.** Citation counts alone are meaningless without it.

| Page type | Published | Cited | **Citation rate** | Share of citations |
|---|---:|---:|---:|---:|
| {{TYPE_A}} | {{N}} | {{N}} | {{N}}% | {{N}}% |
| {{TYPE_B}} | {{N}} | {{N}} | {{N}}% | {{N}}% |
| {{TYPE_C}} | {{N}} | {{N}} | {{N}}% | {{N}}% |

Denominator source: {{WHERE_YOU_COUNTED_IT — e.g. "sitemap", "CMS export", "data layer"}}. Counted on {{DATE}}.

If two types differ sharply, check for **type confounding** before writing a conclusion: compare like against like (type A vs type A), or stratify. Do not compare an absolute count across groups with different type mixes.

---

## 6. Findings

Use this block once per finding. No exceptions.

### F{{N}}. {{FINDING_TITLE}}

- **Observation:** {{WHAT_THE_DATA_SHOWS}}
- **Evidence:** {{NUMBERS, WINDOW, SOURCE}}
- **Counter-example / what weakens this:** {{THE_STRONGEST_THING_THAT_COULD_MAKE_THIS_WRONG}}
- **Confidence:** {{High / Medium-high / Medium / Low}} — {{ONE-LINE REASON}}
- **Alternative explanations not ruled out:** {{LIST}}
- **So what:** {{WHAT_THE_CLIENT_SHOULD_DO_ABOUT_IT}}

> If a finding has no counter-example, you have not looked hard enough. Write "none found yet" rather than leaving it blank.

---

## 7. What I could not determine

This section is why clients trust the rest of the report.

| Question | Why it is unresolved | What would answer it |
|---|---|---|
| {{Q1}} | {{REASON}} | {{DATA_OR_TEST_NEEDED}} |
| {{Q2}} | {{REASON}} | {{DATA_OR_TEST_NEEDED}} |

Rules:
- Never write "N/A". If something is unknown, say unknown.
- If a data source was throttled or incomplete, say so here and state the sample size.
- If a sample is biased (e.g. throttling cut one page type out entirely), **state it and re-run on the full set** before drawing any conclusion from it.

---

## 8. Prioritized actions

| # | Action | Rationale | Effort | Priority |
|---|---|---|---|---|
| 1 | {{ACTION}} | {{LINKED_FINDING}} | {{S/M/L}} | P0 |
| 2 | {{ACTION}} | {{LINKED_FINDING}} | {{S/M/L}} | P0 |
| 3 | {{ACTION}} | {{LINKED_FINDING}} | {{S/M/L}} | P1 |

Rules:
- Every action traces to a numbered finding. No orphan recommendations.
- No promises. Write "increases the probability of being cited", never "will get you X citations".
- Never recommend deleting or merging pages during an active algorithm rollout.

---

## 9. Re-test criteria

Agree the criteria **before** acting, not after.

```
Re-test date:        {{DATE}}
Metric:              {{METRIC}}
Threshold:           {{SPECIFIC_NUMBER}}
If met:              {{ACTION}}
If not met:          {{ACTION}}
What would falsify
this diagnostic:     {{CRITERION}}
```

---

## 10. Appendix

Attach raw exports. Keep the file list in the report so the client can re-open them.

```
{{FILE_1}}.csv
{{FILE_2}}.csv
{{PULL_SCRIPT}}.py
```

---

---

# 操作说明（发送前删除本段）

## 执行顺序（照做，别跳）

| # | 动作 | 产出 |
|---|---|---|
| 1 | 要客户给 GSC 只读权限 + Bing WMT 导出 CSV | 数据源 |
| 2 | 跑 GSC：date / query / page / country / device 五维度 | 基线 |
| 3 | 清洗 Bing CSV：**先剔空 URL 汇总行** | 干净表 |
| 4 | 按类型拆被引情况，**配真实分母** | 第 5 节 |
| 5 | 每个结论配反例 + 置信度 | 第 6 节 |
| 6 | 写「无法确定」清单 | 第 7 节 |
| 7 | 定复测判据（先于行动） | 第 9 节 |
| 8 | 附原始文件 | 附录 |

## 三条不可违反

1. **分母必须写。** 只给引用数不给分母 = 无可证伪性 = 跟竞品没区别。
2. **两源冲突取小值。** Bing Overview vs PageStats 有 14% 差异，永远报小的并注明。
3. **限流砍范围后必须用全集重算。** 抽样里缺了某个页面类型，据此下的结论全部作废。

## 复用脚本

| 用途 | 脚本 |
|---|---|
| GSC 五维度拉取 | `数据分析/_fetch_gsc_dims_0905.py`（country/device/searchAppearance） |
| GSC 逐日 query + page | `数据分析/_fetch_gsc_query_0904.py` |
| Bing URL 提交（含体检） | `数据分析/bing-submit-urls.mjs` |
| Bing GetUrlInfo 批量（需 `--resume`） | `数据分析/bing-geturlinfo-batch.mjs` |

## 时间预算

- 首次做全：约 5–6 小时
- 熟练后：约 3–4 小时
- 前 3 个免费做，**唯一目的是换 testimonial + 授权公开数据**，不开票也要拿到书面许可
