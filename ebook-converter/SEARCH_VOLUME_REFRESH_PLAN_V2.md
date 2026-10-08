# Search Volume Refresh Plan V2（SEARCH_VOLUME_REFRESH_PLAN_V2）

> 阶段: Phase 1.2 · READ ONLY · 禁止直接采用 constants.ts 数字

## 一、当前数据盘点

### 1.1 constants.ts 现状

| 指标 | 值 |
|---|---|
| 总条目 | 51（live 29 / planned 21）|
| searchVolume 字段 | 全部 51 条有值 |
| **fetchedAt 字段** | **0 存在** |
| lastFetched 字段 | 0 存在 |
| 注释提及日期 | 无明确采集日期 |
| 注释提及准确度 | "prior values were inflated 30-70 pts" |

### 1.2 可信度判定

> ### `U3 = UNKNOWN`

| 条件 | 现状 |
|---|---|
| 数据新鲜度 | **UNKNOWN**（无 fetchedAt）|
| 数据准确度 | **HISTORICAL**（注释自述虚高 30-70 pts）|
| 数据来源 | 历史采集（来源不明）|
| 是否可复用 | **不可作为 VERIFIED 数据** |

### 1.3 分类结果

| 状态 | 数量 | 说明 |
|---|---|---|
| VERIFIED | **0** | 无 fetchedAt 字段，无法验证 |
| HISTORICAL | **29** | live 条目，注释自述虚高 |
| UNKNOWN | **21** | planned 条目，无实测数据 |

---

## 二、Search Volume 的正确用途

**禁止解释为**：
- `monthly search volume = expected traffic`
- 唯一 REMOVE / MERGE 依据
- 页面价值判断的充分条件

**允许作为**：
- **Demand Evidence**（需求证据）
- 与其他证据联合使用

### 联合证据链

| 证据类型 | 来源 | 作用 |
|---|---|---|
| GSC Impressions | API 实时 | 真实搜索曝光 |
| GSC Position | API 实时 | 排名表现 |
| Index Status | URL Inspection API | 是否可展示 |
| Search Volume | constants.ts（HISTORICAL）| 需求规模参考 |
| Page Intent | 页面内容分析 | 意图匹配度 |
| Existing Clicks | GSC | 转化潜力 |
| Query Distribution | GSC query 数据 | 实际词分布 |

---

## 三、重新获取真实 Search Volume 的方案

### 方案 A: Google Ads Keyword Planner（推荐）

| 项目 | 说明 |
|---|---|
| 成本 | 免费（需 Google Ads 账号）|
| 准确度 | 官方数据 |
| 频率 | 手动更新 |
| 覆盖 | 可查所有 keyword |
| 限制 | 需要广告账户，可能触发验证 |

### 方案 B: GSC Query 数据反推

| 项目 | 说明 |
|---|---|
| 成本 | 免费 |
| 准确度 | 实际曝光量，非搜索量 |
| 局限 | 只反映已有曝光的词，不反映潜在需求 |
| 用途 | 验证现有页面的实际 query 分布 |

### 方案 C: 第三方工具

| 工具 | 成本 | 准确度 | 推荐度 |
|---|---|---|---|
| Ahrefs Webmaster Tools | 免费版有限 | 高 | ⭐⭐⭐ |
| Semrush | 付费 | 高 | ⭐⭐ |
| Ubersuggest | 免费版有限 | 中 | ⭐ |
| Bing Webmaster Tools | 免费 | 中 | ⭐⭐ |

---

## 四、临时替代方案

**在 U3 解决前，使用 GSC Query 数据作为替代证据**：

```
GSC Impressions by Query → 证明哪些 keyword 有真实搜索
GSC Position → 证明排名表现
→ 两者结合 = 实际 Demand Evidence
```

**优势**：
- 免费
- 实时
- 来自 Google 官方
- 反映真实用户行为

**劣势**：
- 只覆盖已有曝光的 query
- 不反映零曝光页面的潜在需求

---

## 五、行动计划

### 短期（本轮）
- [ ] 不修改生产文件
- [ ] 记录 U3 = UNKNOWN
- [ ] 使用 GSC query 数据作为临时替代证据

### 中期（Phase 1.2 完成后）
- [ ] 用户决定是否需要引入第三方工具
- [ ] 若引入 Ahrefs/Semrush，建立 monthly refresh 流程

### 长期
- [ ] 在 constants.ts 添加 `fetchedAt` 字段
- [ ] 建立 search volume refresh 自动化流程

---

## 六、决策规则

**Search Volume 不可用于以下决策**：
- ❌ 单独决定 REMOVE 页面
- ❌ 单独决定 MERGE 页面
- ❌ 单独决定 NOINDEX 页面

**Search Volume 可作为以下决策的参考**：
- ✅ 优先级排序（结合 GSC impressions）
- ✅ 内容扩展方向（结合 query distribution）
- ✅ A/B 实验选样（结合 position 区间）
