# 改动记录：azw3-vs-mobi 标题与描述优化

> **改动时间**：2026-10-25 15:57
> **改动文件**：`src/data/blog/azw3-vs-mobi.ts`（3 处，纯元数据，未动正文）
> **触发依据**：`诊断_SERP竞品实测_可攻性评估_2026-10-25.md`
> **状态**：已改代码，**未部署**

---

## 一、改动内容

### 1.1 SERP 标题（metaTitle）

```diff
- MOBI vs AZW3 for Kindle: Which Format Wins?
+ AZW3 vs MOBI: The Difference & Which to Use on Kindle
```

### 1.2 H1（title）

```diff
- MOBI vs AZW3: Which Kindle Format Should You Use?
+ AZW3 vs MOBI: Which Kindle Format Should You Use?
```

### 1.3 首段（intro，同时作为 meta description 来源）

```diff
- MOBI vs AZW3 and AZW3 vs MOBI — the answer depends on your Kindle's year.
- AZW3 wins for any Kindle from 2015 onward; MOBI only matters for pre-2015
- hardware. Get the clear pick — plus a one-click, no-install way to convert
- either direction without losing your formatting.
+ AZW3 wins on any Kindle from 2015 onward; MOBI only matters for pre-2015
+ hardware. Here's the difference — and a clean way to convert either direction.
```

---

## 二、改动后的实际渲染（已本地模拟验证）

```
标题 (64 字符)：
  AZW3 vs MOBI: The Difference & Which to Use on Kindle | BookConv

描述 (151 字符)：
  AZW3 wins on any Kindle from 2015 onward; MOBI only matters for
  pre-2015 hardware. Here's the difference — and a clean way to convert
  either direction.

H1：
  AZW3 vs MOBI: Which Kindle Format Should You Use?
```

校验结果：6/6 PASS（标题 ≤60、描述 120–158、含主查询、含 difference、描述给出答案）。

---

## 三、改动依据

### 3.1 词序对齐主查询

GSC 90 天数据显示，该页的主查询是 **`azw3 vs mobi`**（29 曝光）和 **`mobi vs azw3`**（16 曝光），两者都有。但原 SERP 标题以 `MOBI vs AZW3` 开头，与曝光量最大的那个词序相反。

### 3.2 SERP 前 9 名的标题意图分析

| 排名 | 标题 | 意图词 |
|---|---|---|
| 1 | `.AZW3 vs .MOBI? Why is AZW3 better than MOBI?` | better |
| 2 | `What is the difference between MOBI and AZW3 files?` | **difference** |
| 4 | `What is the Difference Between MOBI and AZW3` | **difference** |
| 5 | `EPUB vs MOBI vs AZW3: Which Ebook Format is Best?` | which / best |
| 9 | `Is there any benefit to using azw3 vs mobi?` | benefit |

前 9 名里有 2 个直接用 "difference" 作标题核心词，说明这是该查询的主意图。原标题 `Which Format Wins?` 没有覆盖这个词。

### 3.3 描述原本没有给出答案

原 intro 第一句是：

> MOBI vs AZW3 and AZW3 vs MOBI — the answer depends on your Kindle's year.

`clampMetaDescription` 会在第一个句号处截断（74 字符），所以**用户看到的描述停在"取决于年份"，没有结论**。这既浪费了 158 字符的额度，也缺少点击动机。

新描述直接给出答案（2015 分界），并保留了"如何转换"的钩子。

---

## 四、必须承认的不确定性

**这次改动不是由 CTR 数据驱动的，理由是"SERP 标题写法对比"，不是"这个标题点击率低"。**

原因：90 次曝光、0 次点击这个数据**在统计上不构成证据**。

- 若真实 CTR 为 2%，90 次曝光出现 0 点击的概率是 `0.98^90 ≈ 16%`
- 若真实 CTR 为 1%，概率是 `0.99^90 ≈ 40%`

也就是说，**0 点击完全可能是小样本的正常波动**，不能反推"标题没有吸引力"。上一轮报告里"29 曝光 0 点击 = 标题问题"的表述，属于过度解读，此处更正。

**这次改动的真实性质是「对齐已知的搜索意图写法」，属于低风险优化，不是「修复一个已证实的故障」。**

---

## 五、预期与失败条件（按纪律预设）

| 项 | 内容 |
|---|---|
| **改了什么** | SERP 标题词序 + 加入 difference + 描述改为直接给答案 |
| **预期影响** | 该页 CTR（间接影响点击量） |
| **观测窗口** | 部署后 4 周 |
| **数据门槛** | 累计曝光 ≥100 次才做判断（当前 90 天 90 次，需再累积） |
| **成功判据** | CTR ≥ 2%（即 100 曝光对应 ≥2 次点击） |
| **失败判据** | 4 周后累计曝光 ≥100 且点击仍为 0 |
| **若失败** | 说明问题不在标题，而在排名位置（9–11 名本身 CTR 就低）或 SERP 被 AI Overview 分流，届时不再在标题上继续投入 |

---

## 六、回滚方法

单文件、3 处纯字符串改动，回滚只需还原：

```bash
git checkout -- src/data/blog/azw3-vs-mobi.ts
```

无数据结构变更、无路由变更、无依赖变更，不影响其他页面。

---

## 七、本次未处理的相邻问题

### 7.1 西语页分流英语查询（已核实，结论修正）

GSC 90 天数据显示，英语查询词的曝光大多落在西语页：

| 查询词 | 曝光 | 落地页 |
|---|---|---|
| azw3 vs mobi | 29 | `/es/blog/azw3-vs-mobi` |
| mobi vs azw3 | 16 | `/es/blog/azw3-vs-mobi` |
| azw3 or mobi for kindle | 3 | `/es/blog/azw3-vs-mobi` |
| azw3 vs mobi | 4 | `/blog/azw3-vs-mobi`（英语页） |

**已于 2026-10-25 16:02 用 URL Inspection API 核实，结论与初判相反：**

| URL | Coverage State |
|---|---|
| `/blog/azw3-vs-mobi`（英语） | **Submitted and indexed** ✅ |
| `/es/blog/azw3-vs-mobi`（西语） | **Crawled - currently not indexed** ❌ |

**西语页当前没有索引资格，不参与排名竞争。** 那 65 次曝光是 8 月中旬前后的历史遗留（两页最后一次抓取均为 8 月中旬，此后无抓取记录）。

**因此本改动记录 7.1 原结论「本次改动只影响 4 次曝光份额、效果上限受限」撤销。** 英语页是当前唯一的展示位，改标题方向正确，上限高于初判。

详细核实过程见：`诊断_西语页索引状态核实_2026-10-25.md`

### 7.2 西语页没有西语对比类需求

GSC 全站 13 个西语查询词里，**全部是转换类**（epub para doc、epub para txt、converter mobi para epub），没有一个是 `azw3 vs mobi` 的西班牙语对应词。

所以**没有对西语页做标题优化** —— 改了也没有西语需求可承接，且可能加剧英语词落到西语页的问题。

### 7.3 建议的后续动作

西语页分流英语词这个问题，需要单独诊断，可能的方向：

1. 检查西语页是否被更多内链指向（权重差异）
2. 检查西语页的正文内容深度是否超过英语页
3. 考虑对无西语需求的内容页，`/es/` 版本是否应该 noindex（需评估 hreflang 影响）

**这是独立议题，不在本次改动范围内。**

---

## 八、部署提醒

本次只改了源码，**未部署**。需要：

```bash
git add src/data/blog/azw3-vs-mobi.ts
git commit -m "seo(blog): align azw3-vs-mobi title with primary query and surface the answer in description"
git push
```

Vercel 会自动构建。部署后建议用 GSC URL 检查确认新标题已被抓取。
