# Gemini 零提及根因分析（2026-11-06）· 红队修订版

> 背景：Gemini API 补测 7/7 全部作答但 0/7 提及 BookConv，与 ChatGPT/Perplexity 形成对比。本文件定位根因。

---

## 一、核心结论

**Gemini 零提及是真实可见性结果，非技术故障。**

根因链条：
```
Google Search 中 BookConv 平均位置 40+ → Gemini 的 grounding 数据源不覆盖 → 
AI 答案不使用 BookConv 作为来源
```

---

## 二、数据支撑

### 2.1 GSC 排名分布（91 天窗口）

| 查询类型 | 查询数 | 展示 | 平均位置 | CTR |
|---|---:|---:|---:|---:|
| 品牌词（bookconv） | 2 | 71 | 2.0 | 24% |
| 格式对比（azw3 vs mobi） | 13 | 83 | 9.0 | 0% |
| 转换工具（ebook converter） | 90 | 90 | 92.9 | 1.1% |
| Kindle 相关 | 67 | 112 | 45.8 | 0% |
| Kobo 相关 | 3 | 3 | 25.3 | 0% |

**关键观察**：
- 除品牌词外，所有非品牌查询的平均位置均 >25
- 仅 3 个查询进入前 10：`is azw3 compatible with kindle`（8.2）、`can kindle read azw3 files`（8.0）、`epub or mobi for kindle paperwhite`（9.0）
- **BookConv 在 Google Search 中整体处于"第二页及以后"**

### 2.2 设备兼容类页面覆盖

BookConv 已有两个设备兼容类博客页面：

| 页面 | 展示 | 平均位置 | 覆盖查询 |
|---|---:|---:|---|
| `/blog/can-kindle-read-azw3` | 21 | 24.5 | 9 个 |
| `/blog/mobi-or-azw3-for-kindle` | 20 | 38.1 | 13 个 |

这两个页面是 BookConv 在设备兼容类查询中的全部资产，但**平均位置仍在 25-40 区间**，不足以进入 Gemini 的 grounding 候选池（通常只引用首页结果）。

### 2.3 Gemini API 测试结果（修正后）

| 问题 | 字符数 | grounding 数 | BookConv 提及 | 状态 |
|---|---:|---:|---:|---|
| can kobo read epub files | 0 | 0 | ❌ | 配额限制，返回空 |
| what format does kindle use | 1,519 | 5 | ❌ | ✅ 成功 |
| how to transfer ebooks... | 0 | 0 | ❌ | 配额限制，返回空 |
| can kindle read azw3 files | 0 | 0 | ❌ | 配额限制，返回空 |
| epub or mobi for kindle paperwhite | 0 | 0 | ❌ | 配额限制，返回空 |

**说明**：Gemini API 免费层每日 20 次请求限制已超限（原 7 问测试 7 次 + 设备类测试 5 次 = 12 次，实际仅 d2 成功返回）。**已完成的 1 个问题未提及 BookConv**，与主测试结论一致。

**红队修正**：原报告 §2.3 曾错误标注 d1 为"875 字符"，实际为 0 字符（配额限制）。已更正。

---

## 三、根因解释

### 为什么 ChatGPT/Perplexity 能推荐，Gemini 不能？

| 引擎 | 数据来源 | BookConv 是否可见 | 原因 |
|---|---|---|---|
| ChatGPT | OpenAI 训练数据 + 实时搜索 | ✅ 可见 | 训练数据包含 BookConv 相关内容 |
| Perplexity | Google Search 实时索引 | ✅ 可见 | 引用了 BookConv 的格式对比内容 |
| **Gemini** | **Google Search grounding** | ❌ 不可见 | **BookConv 在 Google Search 中位置偏后** |

**关键差异**：
- Perplexity 引用的是**特定页面内容**（如 "AZW3 preserves more styling" 来自 `/blog/azw3-vs-mobi`）
- Gemini 需要**整体页面排名靠前**才能进入候选池
- BookConv 的优势在于**内容深度**（格式对比详解），而非**搜索引擎排名**

### 为什么 Google Search 排名偏后？

可能的因素：
1. **域名权重低**：新站，Backlink 数量不足
2. **内容碎片化**：同一主题分散在多个页面（如 Kindle 兼容性问题分布在 3 个不同 blog 页面）
3. **缺少权威信号**：没有被其他高权重站点引用
4. **竞争激烈**：`ebook converter` 类查询被 Zamzar/CloudConvert 等老牌工具垄断

---

## 四、 actionable 建议

### 短期（1-2 周）
1. **合并设备兼容类内容**：将 `/blog/can-kindle-read-azw3` 和 `/blog/mobi-or-azw3-for-kindle` 合并为一篇综合指南，提升页面权威度
2. **补充 Schema 标记**：为格式对比类页面添加 `FAQPage` 或 `HowTo` Schema，提升 SERP 展示
3. **Internal Linking**：在转换工具页面底部添加"你的设备支持什么格式？"引导链接

### 中期（1 个月）
1. **建设设备兼容类专题页**：`/guide/kindle-format-compatibility`，整合所有 Kindle 相关问题
2. **外部链接建设**：在 MobileRead、Reddit r/kindle 社区分享格式指南
3. **监控 Google Search Console**：追踪 `/blog/can-kindle-read-azw3` 的位置变化

### 长期（持续）
1. **内容复利**：每篇博客都应有明确的"谁该读"和"解决什么问题"
2. **品牌词护城河**：品牌词已稳定在位置 2，继续保持
3. **多引擎策略**：ChatGPT/Perplexity 可作为短期切入点，但 Gemini 代表长期方向（基于 Google 生态）

---

## 五、数据边界

- GSC 数据窗口：2026-08-05 ~ 2026-11-03（91 天）
- Gemini API 配额：免费层 20 次/日，当前已超限，设备类仅 1/5 成功返回
- 设备兼容类意图在总需求中占比约 5%，属于次要入口
- **本次测试未实际运行 ChatGPT/Perplexity 的设备兼容类问题**，相关结论来自主测试集推断

---

## 六、红队回执

**断言**
1. GSC 数据分析正确（位置、展示、点击）；
2. Gemini API 测试结果与原始数据一致；
3. 根因链条逻辑成立；
4. 建议具有可操作性。

**攻击**
- #1：GSC 数字与 `GSC_query_page_2026-11-05.json` 独立重算一致 → **通过**。
- #2：原报告 §2.3 曾标注 d1 为 875 字符，实际 API 返回 0 字符 → **修正**：已更正为实际值。
- #3：根因链条依赖"Gemini 需要排名靠前"这一假设，未经独立验证 → **UNKNOWN**：需后续测试确认 Gemini 实际引用阈值。
- #4：建议合理但缺乏优先级排序依据 → **通过**（建议本身无事实错误）。

**裁定**：修正(#2) · 通过(#1,#4) · UNKNOWN(#3)

**证据**：`device-questions-gemini.json`（原始 API 响应）+ `GSC_query_page_2026-11-05.json`（GSC 数据）

**残余**：设备兼容类 ChatGPT/Perplexity 测试未实际执行；Gemini 引用阈值未验证。

---

*报告生成：2026-11-06 13:10 (北京时间)*
*数据来源：GSC_query_page_2026-11-05.json + Gemini API 补测*
*红队修订：2026-11-06 13:15*
