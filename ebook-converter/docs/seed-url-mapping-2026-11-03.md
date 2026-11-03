# 11 个旧种子承接 URL 映射登记 · 2026-11-03

> 来源：`geo/topic-portfolio-questions.json`（id 101–111，历史 11 词测量种子集）。
> 实测方法：`curl -sIL` 取 FINAL_STATUS / REDIRECTS；sitemap 枚举现有页面；页面 `<title>/<h1>` 反证内容命中。
> 配套动作：106/110/111 三个 kindle 对比种子的 `target_slug` 由空补为 `kindle-vs-kobo`（页面已实测存在且内容命中）。

## 一、11 行映射登记

| id | 种子词 | intent | 配置 target_slug | 实际承接 URL | HTTP | 跳转 | 上线证据 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 101 | open epub file | intercept | (空) | 无 | — | — | sitemap 无 reader/open 类 guide 页 | 映射缺失 + 无专门承接页 |
| 102 | send to kindle | intercept | how-to-send-epub-to-kindle | /guide/how-to-send-epub-to-kindle | 200 | 无 | curl 200 + title 命中 | 已映射·已上线 ✅ |
| 103 | epub reader online | intercept | (空) | 无 | — | — | 无 reader 页 | 映射缺失 + 无专门承接页 |
| 104 | amazon send to kindle | intercept | how-to-send-epub-to-kindle | /guide/how-to-send-epub-to-kindle | 200 | 无 | 同 102 | 已映射·已上线 ✅ |
| 105 | epub reader | intercept | how-to-read-epub-on-kindle | /guide/how-to-read-epub-on-kindle | 200 | 无 | curl 200 + title 命中 | 已映射·已上线 ✅ |
| 106 | kindle vs kobo | intercept | **kindle-vs-kobo(补)** | /guide/kindle-vs-kobo | 200 | 无 | sitemap 有 + curl 200 + title 命中 | 已补映射·已上线 ✅ |
| 107 | kindle epub | intercept | kindle-formats | /guide/kindle-formats | 200 | 无 | curl 200 + title 命中 | 已映射·已上线 ✅ |
| 108 | e-reader buying considerations | ai-feed | (空) | 无 | — | — | ai-feed 意图（喂内容非落地页） | 映射缺失·非落地页意图 |
| 109 | epub online reader | intercept | (空) | 无 | — | — | 无 reader 页 | 映射缺失 + 无专门承接页 |
| 110 | kobo vs kindle | intercept | **kindle-vs-kobo(补)** | /guide/kindle-vs-kobo | 200 | 无 | 同 106 | 已补映射·已上线 ✅ |
| 111 | kindle vs kobo, which is the best | intercept | **kindle-vs-kobo(补)** | /guide/kindle-vs-kobo | 200 | 无 | 同 106 | 已补映射·已上线 ✅ |

汇总：已映射/已上线 **7 条**（102/104/105/106/107/110/111）；映射缺失 **4 条**（101/103/108/109）。其中 106/110/111 为"页面存在但未配"已修复；101/103/109 为 reader 类真实无承接页；108 为 ai-feed 内容意图，非落地页。

## 二、Gemini 跳转解析检查

全部 4 个原映射页 + `kindle-vs-kobo` 实测 `REDIRECTS=0`、`FINAL_STATUS=200`、无 301/302。
→ 站点侧无重定向，Gemini/测量解析拿到的即规范 URL，无需跳转解包（`google.com/goto?url=` 类包装属 Gemini 返回层，非本站问题，本轮不涉及）。

## 三、红队审计（11/3 测量修复）

**断言**
1. 4 个原映射种子承接页线上存活（200、无跳）。
2. 106/110/111 存在承接页 `/guide/kindle-vs-kobo` 且内容命中，补映射合理。
3. 站点无重定向，Gemini 跳转解析无碍。
4. 改 `target_slug` 不破坏测量哈希锁。

**攻击 / 反证**
- A1（URL 命中≠内容命中）：已用 `<title>/<h1>` 反证 4 页内容均匹配意图（kindle-vs-kobo 页 title 即对比主题，kobo 提及 206 次）；推翻"同名占位页"假设。✅ 已证伪风险。
- A2（sitemap 收了但页面 noindex/404）：已 `curl -sIL` 实测 200，非 404/软 200。✅
- A3（改 target_slug 破坏测量）：核查 `scripts/topic-portfolio-measure.mjs` 哈希锁只取 `q.id`+`q.question`（line 53/55/66），`target_slug` 非锁对象；历史 measurement JSON 按 seedId 存，不受影响。✅ 不破坏。
- A4（106/110/111 应各自独立页而非共用）：同一对比主题共用一页合理；计划 §22 明确禁止"拆同义词建多页"。✅ 不拆。

**裁定**：通过（映射修正合理，实测证据充分）。
**证据**：curl FINAL_STATUS/REDIRECTS；sitemap 枚举；`<title>/<h1>` 文本；脚本哈希锁源码 line 53–66。
**残余**
- R1：101/103/109（reader 类意图）无承接页属真实内容缺口，非映射层可解，需后续内容决策（建 reader 页 or 明确不做的理由），不在本次映射修复范围。
- R2：108 ai-feed 意图按设计不强制配落地页，标记为"非落地页意图"，不误判为故障。
- R3：补映射后需在下轮测量（周一联合评审）确认报告无回归、承接 URL 正确落表。
