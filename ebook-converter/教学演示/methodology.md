# 数据资产化方法论 — BookConv 案例

## 核心原则

**不做结论，只做证据。**

这是本方法的核心纪律。所有产出只记录「可证明的变化」，不解释「为什么变化」。

---

## 阶段一：数据扫描与识别

### 1.1 扫描范围

覆盖以下类型：
- Google Search Console（UI 导出 + API 快照）
- Bing Webmaster Tools（KeywordReport / PageTrafficReport / AI 系列）
- GSC Generative AI Features 导出（如果有）
- 本地内容数据（blog/guide/convert 目录）
- 意图系统数据库（如果有）
- SERP 观测记录
- Reddit / 社区信号

### 1.2 文件级清单

对每个数据文件记录：
- file_path（绝对路径）
- file_type（.csv / .json / .md / .db 等）
- row_count（如果有行数可推断）
- fields（字段名列表）
- source_guess（来源推测：gsc / bing_ai / serp 等）
- notes（备注）

输出：`raw_inventory.csv`

### 1.3 质量标准

每个文件评估：
- **完整**：关键字段齐全
- **部分缺失**：有字段缺失但结构可辨
- **unknown**：无法判断

---

## 阶段二：标准化抽取

### 2.1 统一主键

```
query_key = lowercase(trim(white_space(query_raw)))
page_key = canonical_url(page_raw)
    - https 统一
    - host 小写
    - 去尾斜杠（根路径除外）
    - 去 fragment
    - 保留除 utm_* 外的所有参数
date = ISO 8601 (YYYY-MM-DD)
domain = extracted from page_key
```

### 2.2 数据类型标记

每行必须标记：
- `dimension`：date / query / page / country / device / appearance
- `search_type`：web / generative_ai
- `snapshot_date`：导出/拉取的快照日期（不是事件日期）
- `source_file`：原始文件路径

### 2.3 数值规范

- CTR：百分比转小数（25% → 0.25）
- 不可解析值：保留为空字符串，不补 0
- 未知值：保留为空字符串，不填 "unknown"

### 2.4 Bing AI 与传统搜索分离

- Bing 传统搜索：`bing/normalized_bing_search.csv`
- Bing AI 引用：`ai_search/normalized_bing_ai.csv`
- **永远不合并这两个数据集**

---

## 阶段三：事件挖掘

### 3.1 可证明的事件类型

| 事件类型 | 判定条件 | 证据强度 |
|---|---|---|
| query_first_appeared | query 在 snapshot N 出现，N-1 不存在 | ★★ |
| ai_citation_appeared | daily citations 首次 > 0 | ★★★ |
| ai_citation_increased | 相邻两日差值 > 0 | ★★★ |
| page_citation_grew | 同报告类型两次导出对比 | ★★ |
| url_discovered | discovery_date 非空且非 0001-01-01 | ★★ |
| publish_discovered_lag | publish_date ≤ discovery_date + 1 day | ★★ |

### 3.2 不可推断的事件

以下情况**不记录为事件**：
- 单点数据无法比较（如 GSC UI 不同回看窗口）
- 缺少基准值（只有 after 没有 before）
- 口径不一致（混合了日级与累计值）

### 3.3 快照对比的纪律

当使用快照对（snapshot pair）对比时：
1. 必须标注 `snapshot_date`
2. 必须检查是否为同报告类型
3. 必须在 caveat 中声明「累计窗口未在导出中标注」
4. 不得声称「增长 X%」，只能声称「报告值从 A 变为 B」

---

## 阶段四：证据分级

### 4.1 A 级（可直接对外）

标准：
- [ ] 同口径日级序列（≥3 个时间点）
- [ ] 或系统完整性证据（如数据库全量快照）
- [ ] 明确的时间跨度
- [ ] 有原始来源可追溯
- [ ] 无口径混合问题

### 4.2 B 级（带 caveat 可用）

标准：
- [ ] 快照对比但窗口长度未知
- [ ] 或单类型多时点对比
- [ ] 有明确 caveat 声明
- [ ] 未做因果解释

### 4.3 C 级（仅内部参考）

标准：
- [ ] 单点数据
- [ ] 或窗口不可比的数据
- [ ] 或需要额外上下文才能理解的数据

---

## 阶段五：输出组织

### 5.1 分层存放

```
raw_inventory.csv             # 文件级清单（永远不动）
events/growth_evidence.csv    # 全量事件（可追加）
reports/TOP_N.csv             # 精选证据（提案用）
reports/METHODOLOGY.md        # 方法说明
```

### 5.2 可追溯性

每条证据必须带：
- `source_file`（原始文件路径）
- `snapshot_date`（快照日期）
- `evidence_quality`（强度标记）
- `caveat`（限制说明）

---

## 常见错误清单

### 错误 1：混合口径

❌ 把 GSC UI 导出的「页面展示」与 API 的「单日展示」混用  
✅ 分开保存，分别标注 source_file 中的文件名

### 错误 2：补造数据

❌ 把 missing date 填成 0  
✅ 保留为空字符串

### 错误 3：因果推断

❌ "文章发布导致 citation 增长"  
✅ "文章发布后，citation 报告值增长"

### 错误 4：截面当趋势

❌ "8/10 是 6 次展示，8/30 是 272 次，增长 45 倍"  
✅ "8/10 快照值为 6，8/30 快照值为 272（窗口可能不同）"

### 错误 5：忽略零值日

❌ "8/8 首次出现 4 次引用"（但 8/10、8/13 也是 0）  
✅ "8/8 首次出现 4 次引用；系列中 8/10、8/13、8/14 为零值"

---

## 检查清单

完成每个阶段后核对：

- [ ] 所有原始文件是否已记录在 raw_inventory.csv？
- [ ] 每条标准化记录是否带 source_file？
- [ ] 快照对比是否标注窗口未知？
- [ ] A 级证据是否满足 5 项标准？
- [ ] 是否没有任何因果推断语句？
- [ ] 是否保留了所有 caveat？
