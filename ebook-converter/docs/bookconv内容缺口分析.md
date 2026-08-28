# BookConv 决策旅程内容缺口分析

> 创建：2026-08-15
> 依据：`docs/bookconv用户决策旅程.md`（60 个场景）× 现有 87 页内容矩阵

---

## 一、现有内容覆盖评估

### 1.1 现有页面清单（按阶段分类）

| 阶段 | 现有页面 | 覆盖场景数 | 覆盖率 |
|---|---|---|---|
| **TOFU** | 36 博客 + 6 指南 | ~45 场景 | **90%** |
| **MOFU** | 4 指南 + 2 博客 + /pricing + /privacy | ~20 场景 | **80%** |
| **BOFU** | 30 转换页 + /batch + /tutorial | ~15 场景 | **60%** |
| **POST** | 2 博客（troubleshoot）+ 无 /help 页面 | ~5 场景 | **20%** |

> **关键结论**：POST 阶段内容严重薄弱，是最大缺口。

### 1.2 各阶段详细覆盖表

#### TOFU（认知）— 覆盖率 90%

| Persona | 场景 | 对应现有页面 | 状态 |
|---|---|---|---|
| A | A-T1/T2/T3 | `why-ebook-wont-open-kindle.ts` ✅<br>`can-kindle-read-azw3.ts` ✅<br>`mobi-to-kobo.ts` ✅ | 已覆盖 |
| B | B-T1/T2/T3 | `calibre-alternative.ts` ✅<br>`calibre-vs-online-converter.ts` ✅ | 已覆盖 |
| C | C-T1/T2/T3 | `kindle-formats.ts` ✅<br>`docx-to-epub-self-publish.ts` ✅ | 已覆盖 |
| D | D-T1/D-T2/D-T3 | `ai-ebook-converter.ts` ✅<br>`epub-to-txt-extract.ts` ✅ | 已覆盖 |
| E | E-T1/E-T2/E-T3 | `read-epub-on-any-device.ts` ✅<br>`ebook-formats-explained.ts` ✅ | 已覆盖 |

**缺口**：无重大缺口，仅需优化现有页面标题/描述以提升 CTR。

#### MOFU（考虑）— 覆盖率 80%

| Persona | 场景 | 对应现有页面 | 状态 |
|---|---|---|---|
| A | A-M1/M2/M3 | `epub-vs-mobi.ts` ✅<br>`azw3-vs-mobi.ts` ✅ | 已覆盖 |
| B | B-M1/M2/M3 | `calibre-vs-online-converter.ts` ✅<br>/privacy 页面 ✅ | 已覆盖 |
| C | C-M1/M2/M3 | `best-ebook-converter.ts` ✅ | 部分覆盖（缺「封面/目录丢失」专项） |
| D | D-M1/D-M2/D-M3 | `epub-to-txt-extract.ts` ✅ | 已覆盖 |
| E | E-M1/E-M2/E-M3 | `read-epub-on-any-device.ts` ✅ | 已覆盖 |

**缺口**：
- **C-M2「封面/目录丢失」**：无专项指南
- **B-M2「工具对比汇总」**：分散在多篇，缺一篇综合对比

#### BOFU（决策）— 覆盖率 60%

| Persona | 场景 | 对应现有页面 | 状态 |
|---|---|---|---|
| A | A-B1/A-B2/A-B3 | /convert/mobi-to-epub ✅<br>缺「大文件」专项说明 | 部分覆盖 |
| B | B-B1/B-B2/B-B3 | /convert/* 系列 ✅<br>/pricing ✅ | 已覆盖 |
| C | C-B1/C-B2/C-B3 | `batch-converter.ts` ✅<br>缺「批量多格式导出」专项 | 部分覆盖 |
| D | D-B1/D-B2/D-B3 | /convert/epub-to-txt ✅<br>缺「隐私保障」强化 | 部分覆盖 |
| E | E-B1/E-B2/E-B3 | `ebook-formats-explained.ts` ✅ | 已覆盖 |

**缺口**：
- **A-B2「大文件转换」**：无专项说明
- **C-B2「批量多格式导出」**：缺专项指南
- **D-B3「隐私保障强化」**：/privacy 页面存在但转换页缺信任信号

#### POST（使用/售后）— 覆盖率 20% 🔴

| Persona | 场景 | 对应现有页面 | 状态 |
|---|---|---|---|
| A | A-P1/A-P2/A-P3 | 无 /help 页面 ❌<br>无 FAQ 汇总 ❌ | **严重缺失** |
| B | B-P1/B-P2/B-P3 | `download-troubleshooting.ts` ✅<br>其他无 ❌ | 部分缺失 |
| C | C-P1/C-P2/C-P3 | 无专项指南 ❌ | **严重缺失** |
| D | D-P1/D-P2/D-P3 | 无专项指南 ❌ | **严重缺失** |
| E | E-P1/E-P2/E-P3 | 无专项指南 ❌ | **严重缺失** |

**缺口**：
- 🔴 **全站无 /help 或 /faq 聚合页面**
- 🔴 **无「转换失败原因排查」指南**
- 🔴 **无「转换后文件质量检查」指南**
- 🔴 **无「文件过期/重新下载」说明**

---

## 二、内容缺口优先级矩阵

### P0 — 必须立即填补（直接影响转化）

| # | 缺口类型 | 对应场景 | 建议内容 | 预计工作量 |
|---|---|---|---|---|
| 1 | 🔴 无 /help 聚合页 | A-P1~E-P3（全部 POST 场景） | 新建 `/help` 页面，汇总常见错误+解决方案 | 中（新页面） |
| 2 | 🔴 无「转换失败排查」指南 | B-P1、A-P1、C-P1 | 新建博客 `/blog/conversion-failed-what-to-do` | 小（新博客） |
| 3 | 🔴 无「文件过期/重新下载」说明 | B-P3、E-P3 | 在 /help 或 /pricing 补充说明 | 小（编辑现有页） |

### P1 — 高价值缺口（提升信任+减少客服）

| # | 缺口类型 | 对应场景 | 建议内容 | 预计工作量 |
|---|---|---|---|---|
| 4 | 无「大文件转换」专项 | A-B2、C-B2 | 新建 `/guides/large-file-conversion` | 小（新指南） |
| 5 | 无「批量多格式导出」专项 | C-B1、C-B2 | 强化 /batch 页面 + 新建指南 | 中（编辑+新内容） |
| 6 | 转换页缺信任信号 | D-B3、B-M1 | 在 /convert/* 页添加隐私/质量保障卡片 | 小（组件改造） |

### P2 — 中价值缺口（长期优化）

| # | 缺口类型 | 对应场景 | 建议内容 | 预计工作量 |
|---|---|---|---|---|
| 7 | 无「转换后文件质量检查」指南 | A-P3、C-P2 | 新建 `/blog/check-converted-file-quality` | 小（新博客） |
| 8 | 无「多平台阅读同步」专项 | E-P1 | 新建 `/blog/sync-reading-across-devices` | 小（新博客） |
| 9 | 无「AI 工具格式推荐」专项 | D-P2 | 强化 `ai-ebook-converter.ts` 内容 | 小（编辑现有） |

---

## 三、实施路线图

### 第一阶段（本周）— 填补 POST 缺口

**目标**：解决用户「转完遇到问题无处求助」的核心痛点

1. **新建 `/help` 聚合页**（组件化，分章节）
   - 章节 1：「转换失败了怎么办？」→ 链接到排查指南
   - 章节 2：「文件过期了怎么办？」→ 说明 1 小时自动删除政策
   - 章节 3：「转换后文件打不开」→ 常见原因+解决方案
   - 章节 4：「联系方式」→ 邮箱/反馈表单

2. **新建博客 `/blog/conversion-failed-what-to-do`**
   - 覆盖：上传失败、转换超时、下载失败、文件损坏
   - 结构化 FAQ（发 FAQPage JSON-LD）

3. **编辑 /pricing 页面**
   - 添加「文件安全与隐私」板块
   - 明确说明：加密传输、1 小时自动删除、不存储

### 第二阶段（下周）— 强化 BOFU 信任信号

**目标**：提升决策阶段的转化率

1. **新建指南 `/guides/large-file-conversion`**
   - 说明文件大小限制（免费 10MB / Pro 50MB）
   - 提供压缩 EPUB 的 DIY 方法（作为免费替代）

2. **改造转换页组件**
   - 在 /convert/* 页添加「隐私保障」卡片（SSL/自动删除/不存储）
   - 在上传前显示文件限制提示

3. **强化 /batch 页面**
   - 添加「批量转换常见错误」FAQ

### 第三阶段（下月）— 长期内容资产

**目标**：建立完整的 SEO 内容矩阵

1. 新建 3-5 篇博客（P2 缺口）
2. 优化现有页面标题/描述（提升 CTR）
3. 建立「用户反馈→内容更新」闭环

---

## 四、关键指标

| 指标 | 当前 | 目标（30 天后） |
|---|---|---|
| POST 阶段内容覆盖率 | 20% | 60% |
| /help 页面 UV | 0（不存在） | >100 |
| 转换失败率 | 未知 | <5% |
| FAQ 相关客服咨询 | 未知 | -50% |

---

## 五、附录：场景→页面映射完整表

> 完整映射表见下方，按 Persona × 阶段 × 场景编号排列。

### Persona A · Kindle 迁移者

| 场景 | 阶段 | 现有覆盖 | 缺口 |
|---|---|---|---|
| A-T1 | TOFU | `why-ebook-wont-open-kindle.ts` ✅ | — |
| A-T2 | TOFU | `can-kindle-read-azw3.ts` ✅ | — |
| A-T3 | TOFU | `mobi-to-kobo.ts` ✅ | — |
| A-M1 | MOFU | `epub-vs-mobi.ts` ✅ | — |
| A-M2 | MOFU | `azw3-vs-mobi.ts` ✅ | — |
| A-M3 | MOFU | `kindle-formats.ts` ✅ | — |
| A-B1 | BOFU | `/convert/mobi-to-epub` ✅ | — |
| A-B2 | BOFU | 无专项 ❌ | 🔴 P1 |
| A-B3 | BOFU | `/batch` ✅ | — |
| A-P1 | POST | 无 /help ❌ | 🔴 P0 |
| A-P2 | POST | 无专项 ❌ | 🔴 P0 |
| A-P3 | POST | 无专项 ❌ | P2 |

### Persona B · Calibre 拒绝者

| 场景 | 阶段 | 现有覆盖 | 缺口 |
|---|---|---|---|
| B-T1 | TOFU | `calibre-alternative.ts` ✅ | — |
| B-T2 | TOFU | `calibre-vs-online-converter.ts` ✅ | — |
| B-T3 | TOFU | 转换页 ✅ | — |
| B-M1 | MOFU | /privacy ✅ | — |
| B-M2 | MOFU | 分散多篇 ❌ | P1 |
| B-M3 | MOFU | 无汇总 ❌ | P1 |
| B-B1 | BOFU | /convert/* ✅ | — |
| B-B2 | BOFU | /convert/* ✅ | — |
| B-B3 | BOFU | /pricing ✅ | — |
| B-P1 | POST | `download-troubleshooting.ts` ✅ | — |
| B-P2 | POST | 无专项 ❌ | 🔴 P0 |
| B-P3 | POST | 无说明 ❌ | 🔴 P0 |

### Persona C · 自出版作者

| 场景 | 阶段 | 现有覆盖 | 缺口 |
|---|---|---|---|
| C-T1 | TOFU | `kindle-formats.ts` ✅ | — |
| C-T2 | TOFU | `docx-to-epub-self-publish.ts` ✅ | — |
| C-T3 | TOFU | 无专项 ❌ | P2 |
| C-M1 | MOFU | `best-ebook-converter.ts` ✅ | — |
| C-M2 | MOFU | 无专项 ❌ | P1 |
| C-M3 | MOFU | 无专项 ❌ | P2 |
| C-B1 | BOFU | /batch ✅ | — |
| C-B2 | BOFU | 无专项 ❌ | 🔴 P1 |
| C-B3 | BOFU | /convert/* ✅ | — |
| C-P1 | POST | 无专项 ❌ | 🔴 P0 |
| C-P2 | POST | 无专项 ❌ | 🔴 P0 |
| C-P3 | POST | 无专项 ❌ | P2 |

### Persona D · AI 工具使用者

| 场景 | 阶段 | 现有覆盖 | 缺口 |
|---|---|---|---|
| D-T1 | TOFU | `ai-ebook-converter.ts` ✅ | — |
| D-T2 | TOFU | `epub-to-txt-extract.ts` ✅ | — |
| D-T3 | TOFU | 无专项 ❌ | P2 |
| D-M1 | MOFU | `epub-to-txt-extract.ts` ✅ | — |
| D-M2 | MOFU | 无专项 ❌ | P2 |
| D-M3 | MOFU | 无专项 ❌ | P2 |
| D-B1 | BOFU | /convert/epub-to-txt ✅ | — |
| D-B2 | BOFU | 无批量 ❌ | P2 |
| D-B3 | BOFU | /privacy ✅ | — |
| D-P1 | POST | 无专项 ❌ | 🔴 P0 |
| D-P2 | POST | 无专项 ❌ | P2 |
| D-P3 | POST | 无专项 ❌ | P2 |

### Persona E · 多平台同步读者

| 场景 | 阶段 | 现有覆盖 | 缺口 |
|---|---|---|---|
| E-T1 | TOFU | `read-epub-on-any-device.ts` ✅ | — |
| E-T2 | TOFU | `ebook-formats-explained.ts` ✅ | — |
| E-T3 | TOFU | 无专项 ❌ | P2 |
| E-M1 | MOFU | `read-epub-on-any-device.ts` ✅ | — |
| E-M2 | MOFU | 无专项 ❌ | P2 |
| E-M3 | MOFU | 无专项 ❌ | P2 |
| E-B1 | BOFU | `ebook-formats-explained.ts` ✅ | — |
| E-B2 | BOFU | /batch ✅ | — |
| E-B3 | BOFU | /pricing ✅ | — |
| E-P1 | POST | 无专项 ❌ | P2 |
| E-P2 | POST | 无专项 ❌ | P2 |
| E-P3 | POST | 无专项 ❌ | P2 |
