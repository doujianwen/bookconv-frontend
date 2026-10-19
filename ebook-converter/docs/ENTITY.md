# BookConv 规范实体陈述（Canonical Entity Statement）

**版本 / 日期**：2026-10-19
**归属**：GEO 四项攻坚 · 实体一致性 1.1 交付物
**用途**：本文件是 BookConv 全站（及一切外部分发）的「唯一实体口径」。所有页面文案、schema.org 标记、OG/Twitter 卡片、外部投稿在描述「BookConv 是什么」时，必须以此为准，杜绝 AI 知识图谱中的实体漂移（drift）。

---

## 1. 实体身份（Identity）

- **品牌名（唯一拼写）**：`BookConv` —— 首字母大写 B，其余小写 c，单字、无空格。
  - ❌ 错误拼写：`Book Conv` / `Bookconv` / `BookConv.` / `BOOKCONV`
- **规范域名**：`https://www.bookconv.com`（带 www，不带尾斜杠）
- **schema.org 实体类型**：`Organization`（落地于 AboutPage JSON-LD 的 `mainEntity`）
- **Canonical tagline（一句话定位）**：
  > BookConv is a free online eBook format converter.

---

## 2. 规范描述符（Canonical Descriptors）—— 必含事实

任何「BookConv 是什么」的陈述，应一致包含以下事实。**顺序可调整、措辞可微变，但事实不可省略、不可额外添加：**

| # | 事实 | 规范表述（英文口径） | 备注 |
|---|------|---------------------|------|
| 1 | 免费 | Free for personal use | 个人使用永久免费；**不要写"完全无限制"**——免费档有 4MB 单文件上限，Pro 面向批处理/大文件 |
| 2 | 免注册 | No sign-up / No registration required | 无需账号 |
| 3 | 无水印 | No watermarks | —— |
| 4 | 浏览器端 | Browser-based / no software to install | 无需安装软件 |
| 5 | 引擎 | Powered by Calibre | Calibre 是业界标准**开源**转换引擎；转换质量来自 Calibre |
| 6 | 隐私 | Files are encrypted in transit and auto-deleted within 1 hour | 处理完成后 1 小时内自动删除 |
| 7 | 格式数 | 28+ formats supported | 枚举可截短为 "EPUB, MOBI, AZW3, PDF and more"；全量：EPUB, MOBI, AZW3, PDF, DOCX, TXT, RTF, HTML, FB2, LIT, CBR, DJVU, JPG, PNG |

---

## 3. 创始人（Founder）—— 已公开（/founder 页）

- **Hongjian Dou（Andy）**，20+ 年互联网增长 / SEO / 数字运营 / AI 可见性经验；职位 Founder & CEO。
- ✅ **站点已公开**：`src/app/[locale]/founder/page.tsx`（/founder 路由）承载创始人陈述，含 Person schema（`name: Hongjian Dou`、`jobTitle: Founder & CEO`、`url: https://www.bookconv.com/founder`）。本陈述以 /founder 页为 canonical 载体，外部引用与其口径对齐即可。
- 反混淆：创始人页标题含 "SEO & AI Visibility Expert"，与 BookConv「免费电子书转换」主实体区分清晰，无混淆风险。

---

## 4. 反混淆条款（Anti-confusion，K2 已落地）

- BookConv 与 **BookReverb / BookConvert** 及任何近名产品**无关联、无背书、无隶属**。
- 落地位置：about 页 FAQ「Is BookConv the same as BookReverb or BookConvert?」+ AboutPage JSON-LD `mainEntity.description`（已含此句）。

---

## 5. sameAs 信源（外部实体闭环）

- X / Twitter：`https://x.com/GinoTou2024`
- Reddit：`https://www.reddit.com/r/ebooks/comments/1v8ypvd/`
- 创始人页（Person 实体）：`https://www.bookconv.com/founder`
- （待补：Google Business Profile；Wikidata 若符合收录资格）

---

## 6. 禁写清单（Drift 红线 —— 1.2 审计将逐条核查）

- ❌ **不要把 BookConv 写成 "open source"**：BookConv 是托管服务，**非开源**；只有 Calibre 引擎是开源。about 页 `keywords` 含 `"open source"` 属漂移，1.2 阶段修。
- ❌ **不要写 "no limits / 无限制"**：免费档有 4MB 单文件上限，Pro 解限。正确口径："free for personal use, no registration"。
- ❌ **不要混用破折号**：规范用 em dash `—`（about 页已用）；默认 title 中 `BookConv -- ...` 的 `--` 双连字符属漂移，统一为 `—`。
- ❌ **不要把 "Book Reverb" / "Book Convert" 当作本产品别名**出现。
- ❌ **不要夸大转换速度**为 "always instant"：实测小说 10–30 秒、大文件更长；用 "most conversions finish in seconds"。

---

## 7. 使用约定

- 本文件是「口径源」，不是页面内容。落地由 1.2（审计漂移）/ 1.3（对齐 about / why-bookconv / 首页 / FAQ）步骤执行。
- 任何新页面、新文案、外部投稿涉及「BookConv 是什么」，先回查本文件，确保实体陈述零漂移。
- 本文件随 1.2/1.3 落地结果持续更新（append-only 修订日志见文末）。

---

### 修订日志
- 2026-10-19：初版建立（1.1）。基于 `src/app/[locale]/about/page.tsx`、`src/app/layout.tsx`、`src/app/api-docs/openapi.json`、`src/data/content/azw3-to-epub.ts` 实测口径提炼。
