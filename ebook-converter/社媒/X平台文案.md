# X（Twitter）发布文案 · 做站实战

> 平台调性：钩子先行、短句、emoji 节制、hashtag 1–3 个（精准 > 堆砌）、build-in-public 真实感。
> **⚠️ X 免费用户单帖 280 字符硬限制**（含空格/换行/hashtag）。每条 Post 和 Thread 每条都必须 ≤280 字符。Thread 是一连串推文，每条独立计字符。Premium 用户可忽略此限制。此约束优先级最高——先砍字数再谈内容。
> 全部用英文（X/Reddit 以英文技术受众为主，与 bookconv.com 海外目标市场一致）。需要中文版可另出。
> 数字均来自真实日志（截至 8/10：GSC 287 展示 / 79 词 / 0 点击；15 格式 / 26 转换对；87 内容页）。

> **【内容战略定位 · 2026-08-14】所有帖围绕「展示用 AI 建站的真实过程」展开，为后续 AI 实战开发课程铺信任 / 引流。技术性对目标受众（想学 AI 建站者）是卖点，不必为去术语牺牲真实过程。**
> **【AI 叙事三层 · 每条必含】** ① AI 做了什么 ② AI 坑了什么 ③ 人补了什么。禁止隐去 AI 写成普通 solo-dev 日记；诚实的「AI 翻车 + 人补位」是最佳课程广告。下方 P1–P6 与 Thread **已按新标准刷新（每条含 AI 三层 + ≤280 字符）**，可作范本直接复用。

---

## 一、独立 Post（可每天挑 1 条发，或排期轮流）

**P1 · 上线（Launch）— 275 chars**
AI scaffolded my ebook converter (Next.js + Calibre, 15 formats, 26 pairs) in days.

But AI's deploy config hid a soft-404 that froze Google indexing for a week.

I caught it in GSC, fixed it with one CONVERSION_MAP. AI builds fast; you read the dashboard. #buildinpublic #ai

**P2 · SEO 实战（soft-404 战记）— 226 chars**
AI wrote my sitemap + page params as two files. They drifted — phantom pages returned 200, not 404.

Google stalled my indexing for a week.

I merged them into one map; indexation recovered. "AI-generated" ≠ verified. #seo #ai

**P3 · 架构转折（同步 > 异步）— 266 chars**
AI suggested the "proper" setup: BullMQ + Redis + a worker. In prod 100% of conversions 500'd — serverless never ran it.

AI shipped dead code. I deleted it, convert in-request now.

Reliability up, infra ~zero. AI's "best practice" = dead weight. #buildinpublic #ai

**P4 · Critic Agent（输出验证）— 267 chars**
AI's API returned 200 — but the file was garbled. A 200 can lie.

I had AI write a "critic" layer: checks magic bytes, lost text, mojibake, missing images after each convert.

Silent failures caught before users see them. Output > input validation. #ai #buildinpublic

**P5 · 数据纪律（GSC）— 242 chars**
AI plots my GSC ranked-keyword curve daily. Handy — until I trusted it blindly.

I miscounted visits 2 weeks by summing wrong; busy days looked half-size.

Now I cross-check raw exports. Truth: 287 impressions, 79 keywords, 0 clicks. #seo #ai

**P6 · 一人公司技术栈 — 217 chars**
AI picked my stack and wrote most code: Next.js, Calibre, CloudConvert, Upstash Redis, Lemon Squeezy. 87 pages, mostly AI-written.

The catch: I review every line. AI ships; I confirm it reaches prod. #indiehacker #ai

---

## 二、Thread 模板（7 条，讲完整故事，适合周末发；每条独立 ≤280）

**1/7 — 142 chars**
I'm building an ebook converter mostly with AI — and the last 3 weeks taught me where AI helps and where it lies. 🧵 Here's the unfiltered log.

**2/7 — 139 chars**
AI scaffolded it fast: Next.js + Calibre, 15 formats, 26 pairs, live in days. The win: I skipped weeks of boilerplate. The trap came later.

**3/7 — 167 chars**
AI suggested BullMQ + Redis + a worker (the "proper" architecture). In prod, 100% of conversions 500'd — serverless never ran it. I deleted it, convert in-request now.

**4/7 — 152 chars**
AI wrote my sitemap + params as two files. They drifted; phantom pages returned 200 not 404. Google stalled indexing a week. I merged them into one map.

**5/7 — 152 chars**
AI's API returned 200 on a garbled file. So I had AI write a "critic" layer: checks magic bytes, lost text, mojibake, missing images after each convert.

**6/7 — 161 chars**
AI pulls GSC daily. I misread it 2 weeks (wrong sum hid half my traffic). Now I cross-check. Truth: 287 impressions, 79 keywords, 0 clicks — early, but climbing.

**7/7 — 175 chars**
3 weeks, 87 AI-written pages, one killed architecture, one SEO fix. Lesson: AI builds fast, but you read the dashboard and verify output. Ask me anything. 👇 #buildinpublic #ai

---

## 三、发布建议（SEO / GEO 视角）
- **链接策略**：每周最多 1–2 条带 bookconv.com 主页链接（避免被算法判营销号）；其余靠 bio 引流。Thread 末条带链接最自然。X 不自动删链接，但忌纯广告腔与刷屏。
- **hashtag 纪律**：每帖 ≤3 个，优先 #buildinpublic #indiehacker #seo #ai；不堆 #ebook #converter #free 等弱词。
- **GEO 红利**：X 长文与 Thread 被 AI 检索抓取，真实「AI 建站」叙事会沉淀为品牌信号（与 llms.txt 互补）。
- **排期**：建议"周一上线/架构、周三 SEO、周五数据、周末 Thread"的节奏，与每日日志同步产出。
- **X 免费账户单帖受 280 字符限制**（见顶部），发前用 `社媒/self-check.py` 实算字符数，不靠目测。
- **互动**：发后 30 分钟内回评论区，用真实数据接话，提升曝光。

---

## 四、生成后自检清单（每次发帖前必跑 · 流程红线）

> 帖子写完（草稿生成）后，**必须立即逐项核验并打勾**，结果写入草稿文件末尾 `# 生成后自检` 区块。任一红线 ❌ 须当场修复重跑，不得带着 ❌ 发布。
> 可用 `社媒/self-check.py <草稿路径>` 脚本实算字符数与裸域名扫描，不靠目测。

- [ ] **280 字符**：每条 Post 与 Thread 每条 ≤280 字符（含空格/换行/hashtag；脚本实算优先）
  - ⚠️ **写作目标线 ≤270 留缓冲**（2026-08-20 固化）：目测连续两天低估真实字符数（8/19 低估 24、8/20 低估 16 并直接把一条推顶到 281 超限）。新写帖一律先按 ≤270 写，再用脚本实算确认；余量 <10 的帖视为危险区间，含 emoji 时按 X 加权计数（1 emoji = 2 字符）复核。
- [ ] **AI 三层**：每条显式含「AI 做了 / AI 坑了 / 人补了」信号
- [ ] **英文**：全文英文
- [ ] **hashtag ≤3**：每条不超过 3 个话题标签
- [ ] **钩子前置**：前两行即钩子/痛点，不堆背景
- [ ] **链接克制**：bookconv.com 链接 ≤1–2 条/周，优先 Thread 末条；正文不堆链接
