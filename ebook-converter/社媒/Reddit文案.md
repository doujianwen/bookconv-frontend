# Reddit 发布文案 · 做站实战

> 平台调性：价值先行、长篇、诚实数字、分享"我学到的"、链接克制（Reddit 反自我推销极严）。
> 全部英文（r/SideProject、r/SEO、r/webdev、r/IndieHackers 均为英文社区）。
> 发布纪律见文末「Reddit 反自我推销须知」——**正文不塞链接、不出现裸域名，链接放评论或个人页**。

> **【内容战略定位 · 2026-08-14】所有帖围绕「展示用 AI 建站的真实过程」展开，为后续 AI 实战开发课程铺信任 / 引流。技术性对目标受众（想学 AI 建站者）是卖点，不必为去术语牺牲真实过程。**
> **【AI 叙事三层 · 每条必含】** ① AI 做了什么 ② AI 坑了什么 ③ 人补了什么。禁止隐去 AI 写成普通 solo-dev 日记；诚实的「AI 翻车 + 人补位」是最佳课程广告。下方四个 sub 范本**已按新标准刷新（每条含 AI 三层 + 正文零域名零链接 + 结尾问句）**，可作范本直接复用。

---

## 一、r/SideProject
**标题**：I built an ebook converter with AI writing most of the code (15 formats, 26 pairs) — 3 weeks in, the honest breakdown

**正文**：
I'm a solo dev and I had AI write most of an ebook converter I launched ~3 weeks ago: converts between ebook formats (epub, mobi, azw3, pdf, txt, docx…), 15 formats, 26 pairs.

Since this sub likes unfiltered build logs, here's where it actually stands:

**What AI did**
Scaffolded the whole thing fast — Next.js frontend on Vercel, Calibre engine, pure-JS for the easy formats, CloudConvert for the hard ones, even 87 content pages of blog/guide copy.

**Where AI failed (and I paid)**
1. AI suggested BullMQ + Redis + a worker for conversions. "Proper" architecture. In prod, 100% of Calibre conversions 500'd — serverless never ran the worker. Dead code, shipped.
2. AI wrote the sitemap and page params as two separate files. They drifted; phantom pages returned 200 instead of 404. Google stalled indexing for a week.
3. AI's conversion API returned 200 on a garbled file.

**What I had to fix**
- Killed the queue, convert synchronously in-request now (reliability up, infra ~zero).
- Merged sitemap + params into one CONVERSION_MAP so unknown pairs 404 correctly. Indexation recovered in days.
- Added a "critic" layer: after each convert, checks magic bytes, lost text, mojibake, missing images.

**The numbers (honest, new-site reality)**
As of Aug 10: 287 impressions, 79 keywords ranking, 0 clicks. I pull GSC daily and the ranked-keyword curve is climbing, but it's early.

**What I'd tell past-me**
AI builds fast, but "AI wrote it" is not "it works in prod." Verify the output, read your own dashboard, and don't trust the green deploy button.

Happy to answer anything about the Calibre/serverless bit or the SEO fix. What would you have done differently?

---

## 二、r/SEO
**标题**：Technical SEO mistake that blocked my new site from indexing for a week — and it was AI-generated code (soft-404 + sitemap)

**正文**：
Sharing a self-inflicted SEO wound in case it saves someone a week.

**Site**: a small Next.js converter site I launched with heavy AI help, late July. Brand-new domain, so I watched indexation closely in GSC.

**What AI did**
Wrote the sitemap and the dynamic page params as two separate files — looked clean, passed review.

**Where AI failed**
They drifted. For unsupported format pairs the page still rendered and returned HTTP 200 with a "not supported" message instead of a real 404. Google crawled a bunch of these thin/duplicate 200s, judged the site low-quality, and throttled the rest. I shipped the bug without noticing.

**What I fixed**
1. One source of truth — a CONVERSION_MAP of supported pairs.
2. generateStaticParams derives from that map; dynamicParams = false so unknown pairs 404.
3. Sitemap generated from the same map (no hand-maintained URL list to drift).
4. Middleware 301s legacy slugs.

Valid pages started indexing within days.

**Lesson**
On a new site, soft-404s don't just waste crawl budget — they signal low quality and can stall the whole domain. And yes: AI will happily write two configs that disagree. Audit your "not found" states before chasing backlinks.

Anyone else had AI generate SEO-breaking code you only caught in GSC?

---

## 三、r/webdev
**标题**：I let AI pick my background-job architecture and 100% of conversions failed in prod (serverless lesson)

**正文**：
Small war story for anyone putting background jobs on serverless — and a note on trusting AI suggestions.

**What AI did**
Suggested the "proper" setup for my Next.js/Vercel converter: BullMQ + Redis + a long-running worker, jobs enqueued from the API route. Sounded right, I approved it.

**Where AI failed**
In production, 100% of Calibre conversions failed. The worker never ran — serverless functions don't keep a process alive, and the "worker" was just dead code in the request lifecycle. AI optimized for textbook correctness, not for where the code actually runs.

**What I shipped instead**
- API route converts synchronously, in-request (~60s on Pro, enough for most files).
- Heavy formats delegate to a Calibre box via CONVERSION_BACKEND_URL, only when set; pure-JS paths never leave Vercel.
- A verification step after each conversion (magic bytes, content loss, mojibake, missing images) so a 200 can't lie.

Reliability up, infra ~zero, and I deleted code I was proud of but didn't need.

**Takeaway**
On serverless, "do it now, in the request, or delegate to something that actually runs" beats "enqueue and hope a worker is alive." AI doesn't know your runtime constraints unless you tell it. Curious where others draw the line — at what duration do you reach for a queue?

---

## 四、r/IndieHackers
**标题**：1 person, 3 weeks, 87 (mostly AI-written) content pages, 0 paying users yet — the real solo-build numbers

**正文**：
Building an ebook converter solo, with AI writing most of the code and copy. Sharing the unglamorous early numbers because IH tends to show only wins.

**What AI did**
Wrote ~most of it: the Next.js frontend, the Calibre integration, 87 content pages (36 blog + 21 guides + 30 conversion pages), even the payment wiring (Lemon Squeezy) and a daily GSC pull.

**Where AI failed**
1. Its "proper" queue architecture 500'd every conversion in prod — I had to rip it out.
2. Its two drifted SEO configs stalled indexing for a week — I had to merge them.
3. Its conversion API returned 200 on a broken file — I added a verifier.

**The truth**
- GSC as of Aug 10: 287 impressions, 79 keywords, 0 clicks.
- 0 paying users.
- One architecture rewrite, one SEO fix, a lot of late nights reviewing AI output.

**What I'm betting on**
Content + technical SEO is a compounding game, not a launch spike. The real skill wasn't prompting AI — it was catching what AI got wrong before users did.

For those further along: when did your first real traffic/paid user show up, and was the lever content, SEO, or paid?

---

## 五、Reddit 反自我推销须知（务必遵守）
1. **正文零链接、零裸域名（最高优先级）**：Reddit 的 AutoMod 会按 `domain` / 关键词过滤——不仅删超链接，**连正文中出现裸域名（如 bookconv.com 纯文字）也会触发自动删帖**（2026 实测）。正文一律用 "my converter / my site" 代称，真实链接**只放评论区**或个人 profile。域名一旦被某 sub 或全站拉黑，所有链接永久删除且需 60+ 天书面申诉才恢复——域名是资产，正文绝不可出现。
2. **先给后取**：每条都提供真实经验/代码/数字，结尾用问句引出讨论（"what would you do differently?"），而非"去用我的产品"。
3. **选对 sub 并读版规**：r/SideProject 允许展示作品（可带链接但克制）；r/SEO、r/webdev 偏技术讨论（链接放评论）；r/IndieHackers 接受建站复盘。
4. **账号养号**：新号直接发易被判 spam；先用主号或养一段时间的号，互动为主、发布为辅。
5. **GEO 红利**：Reddit 是 AI 训练语料重镇，真实技术叙事会被 ChatGPT/Claude 引用，等于免费品牌权威（GEO），比一次性引流更值钱。
6. **不刷赞**：买赞/小号顶帖会被 Shadowban，得不偿失。
7. **账号门槛（发链接前必看）**：多数技术 sub（r/SideProject、r/SEO、r/webdev、r/IndieHackers）对带链帖要求 30–90 天账号龄 + 100+ karma；新号直接发带链帖必被过滤。本规范所有 Reddit 正文已不含任何链接/域名，故即使新号也安全；若需在评论区放链接，先养号（评论为主、发布为辅）。

---

## 六、生成后自检清单（每次发帖前必跑 · 流程红线）

> 帖子写完（草稿生成）后，**必须立即逐项核验并打勾**，结果写入草稿文件末尾 `# 生成后自检` 区块。任一红线 ❌ 须当场修复重跑。
> 可用 `社媒/self-check.py <草稿路径>` 脚本实扫裸域名/链接与结尾问句，不靠目测。

- [ ] **零链接**：正文（标题+正文）无 http/https 链接
- [ ] **零裸域名**：正文无 `bookconv.com` / `www.` 等纯文字域名（AutoMod 按 domain 过滤，静默删帖，已实测踩坑）
- [ ] **AI 三层**：每条显式含「AI 做了 / AI 坑了 / 人补了」
- [ ] **结尾问句**：正文最后一句以 `?` 结尾
- [ ] **价值先行**：开头即分享经验/数字，不先推产品
- [ ] **数字真实**：所有数据来自日志，无数据标 unknown，未编造
- [ ] **账号安全**：因正文零链接零域名，新号亦可安全发；若评论区放链接需先养号（30–90 天 + 100+ karma）
