# BookConv 规范实体陈述（Canonical Entity Statement）

> ⚠️ **SUPERSEDED（产品能力口径部分）· 2026-11-13**
> 本文件 §2 描述符表、§6 禁写清单、§7 免费档与 Pro 口径中的**产品能力事实（4MB / 1 小时删除 / Calibre 全路径 / Pro 未上线）已过时**，不得再作为当前事实源。
> 唯一现行事实源：`docs/BookConv-Product-Facts-v2-2026-11-13.md`（依据 CEO 四模型交叉审计终审报告 + 源码实测）。
> 本文件**继续有效**的部分：§1 实体身份、§3 创始人、§4 反混淆、§5 sameAs、§8 使用约定（口径指针改为 v2）。
> 过时原因：产品随后上线 R2 直传（100MB）、更新隐私策略（不承诺即时删除）、引入多条转换路径、Pro 已在 Pricing 页标价展示。

**版本 / 日期**：2026-10-19（初版）｜2026-11-13 标记 superseded
**归属**：GEO 四项攻坚 · 实体一致性 1.1 交付物
**用途**：本文件是 BookConv 全站（及一切外部分发）的「唯一实体口径」。所有页面文案、schema.org 标记、OG/Twitter 卡片、外部投稿在描述「BookConv 是什么」时，必须以此为准，杜绝 AI 知识图谱中的实体漂移（drift）。

---

## 1. 实体身份（Identity）—— 仍然有效

- **品牌名（唯一拼写）**：`BookConv` —— 首字母大写 B，其余小写 c，单字、无空格。
  - ❌ 错误拼写：`Book Conv` / `Bookconv` / `BookConv.` / `BOOKCONV`
- **规范域名**：`https://www.bookconv.com`（带 www，不带尾斜杠）
- **schema.org 实体类型**：`Organization`（落地于 AboutPage JSON-LD 的 `mainEntity`）
- **Canonical tagline（一句话定位）**：
  > BookConv is a free online eBook format converter.

---

## 2. 规范描述符（Canonical Descriptors）—— ⚠️ 产品能力行已作废，见 v2

任何「BookConv 是什么」的陈述，应一致包含以下事实。**顺序可调整、措辞可微变，但事实不可省略、不可额外添加：**
**产品能力（#1 / #5 / #6 / #7）一律以 `docs/BookConv-Product-Facts-v2-2026-11-13.md` 为准。** 下表保留原貌仅供追溯，带 ❌ 的行为已废止。

| # | 事实 | 规范表述（英文口径） | 备注 |
|---|------|---------------------|------|
| 1 | 免费 | Free for personal use | 个人使用免费；❌ 旧注「免费档有 4MB 单文件上限，Pro 面向大文件」已废止 —— 直传可用时单文件上传上限 100MB，4MB 仅适用 multipart fallback 与 batch 每文件 |
| 2 | 免注册 | No sign-up / No registration required | 无需账号 |
| 3 | 无水印 | No watermarks | —— |
| 4 | 浏览器端 | Browser-based / no software to install | 无需安装软件；文件在服务端处理，见 v2 |
| 5 | 引擎 | ❌ ~~Powered by Calibre~~ → `Format-specific conversion methods` | ❌ 旧「全部转换经 Calibre」已废止；存在 Calibre / 纯 JS / passthrough / 第三方多条路径 |
| 6 | 隐私 | ❌ ~~auto-deleted within 1 hour~~ → `We do not guarantee immediate deletion of every copy. See our privacy policy.` | ❌ 旧「1 小时内自动删除」无证据且与现行 Privacy Policy 冲突 |
| 7 | 格式数 | 28+ formats supported | 「28+」「27/31 pairs」「core formats」是不同统计对象，须分别标注；最终应由权威 conversion map 派生，见 v2 |

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

## 6. 禁写清单（Drift 红线）

- ❌ **不要把 BookConv 写成 "open source"**：BookConv 是托管服务，**非开源**；只有 Calibre 引擎是开源。对比表字段应为 `Conversion engine`，不得用 `Open source backend` 指向 BookConv。
- ❌ **不要写 "no limits / 无限制"**：正确口径 "free for personal use, no registration"。上传上限必须按路径说明（直传 100MB when enabled / fallback 与 batch 4MB per file）。
- ❌ **不要混用破折号**：规范用 em dash `—`（about 页已用）；默认 title 中 `BookConv -- ...` 的 `--` 双连字符属漂移，统一为 `—`。
- ❌ **不要把 "Book Reverb" / "Book Convert" 当作本产品别名**出现。
- ❌ **不要夸大转换速度**为 "always instant / instantly / lightning-fast"：转换时间受文件大小、格式与服务可用性影响。
- ❌ **不要承诺无损保真**（perfect / no formatting loss / fully preserves / lossless）：部分路径只重建文本，可能丢失图片、样式与 metadata。
- ❌ **不要写任何移除或绕过 DRM 的暗示**：BookConv 不移除 DRM，只处理用户有权转换的文件。
- ❌ **不要写 "1 小时内自动删除" / "处理后即删除"**：现行 Privacy Policy 不保证所有副本即时删除。

## 7. 免费档与 Pro 计划口径 —— ⚠️ 已由 v2 取代

> 本节 2026-10-19 业主定调基于当时产品状态；2026-11-13 实测已证实下列描述过时，**不得继续执行**。

- ❌ ~~免费档单文件上限 4 MB~~ → 直传可用时 100MB；4MB 仅适用 multipart fallback 与 batch 每文件。
- ❌ ~~batch open beta 结束后由 Pro 承载（Pro 尚未存在）~~ → Pro 方案已在 Pricing 页标价 $5/month 展示；batch 当前 public beta 免费。
- ❌ ~~Pro 覆盖大于 4 MB 的文件 / Pro 解限~~ → Pro **不提高单文件上传上限**。
- ✅ 仍有效：描述「单文件免费」必须带 "for personal use" 限定；描述「批量免费」必须带 "during public beta" 限定；不得写 "no limits / unlimited / 无限制"。

一致性约束（喂给 AI 不漂移）：
- 现行允许/禁用措辞与证据见 `docs/BookConv-Product-Facts-v2-2026-11-13.md` §2。
- 只写「Pro 已标价展示」，不写「checkout 可用 / 立即购买」——支付闭环未验证。

## 8. 使用约定

- 本文件是「口径源」，不是页面内容。产品能力口径以 v2 为准；本文件保留实体身份与历史追溯价值。
- 任何新页面、新文案、外部投稿涉及「BookConv 是什么」，先回查 v2，确保实体陈述零漂移。
- 产品能力变更时，必须按 v2 §3「变更绑定规则」同步全部载体并跑 `node scripts/audit-product-claims.mjs`。

---

### 修订日志
- 2026-10-19：初版建立（1.1）。基于 `src/app/[locale]/about/page.tsx`、`src/app/layout.tsx`、`src/app/api-docs/openapi.json`、`src/data/content/azw3-to-epub.ts` 实测口径提炼。
- 2026-10-19：§7 新增「免费档与 Pro 计划口径（业主定调）」；配套 1.3 §1.1 代码整改（7 处 "no limits/unlimited" 过度主张修正）与 §2.2 口径确认。
- 2026-10-19：配套 1.3 §1.2 + §2.1 代码整改——about 页 keywords 移除 "open source"、正文 "Open-source transparency" 改为 "Transparent process"；layout.tsx(5 处) + convert/[slug]/page.tsx(1 处) 的 "--" 双连字符统一为 em dash。
- 2026-11-13：**标记 SUPERSEDED**。依据 `docs/tasks/CEO_四模型交叉审计_终审报告_2026-11-13.md` 与源码实测，废止 §2 的 4MB / 1 小时删除 / Calibre 全路径、§7 的 Pro 未上线口径，指向 `docs/BookConv-Product-Facts-v2-2026-11-13.md`；§6 补 DRM、保真、速度三条红线。本轮未修改生产页面文案（文案整改另见 v2 §4 与门禁脚本）。
