# 项目文档中心

本目录是 BookConv 项目的统一文档中心，按用途分为三个子目录。**2026-08-10 起 `ebook-converter/docs/` 已全部并入本目录**，全项目仅此一个 docs。

## 目录结构

```
docs/
├── README.md              # 本文件：统一入口与索引
├── ops/                    # 外链 / SEO 运营作战中心
├── tech/                   # 技术文档与新人培训
├── content/                # 博客 / 指南内容生产规范
└── submissions/            # ⚠️ 外链提交记录（含账号等敏感信息，已 gitignore，不纳入版本控制）
```

## `ops/` — 外链 / SEO 运营

| 文件 | 用途 |
|------|------|
| `外链推广完整方案_20260804.md` / `外链推广整合方案_20260804.md` | 外链推广总方案 |
| `竞品外链分析与推广计划.md` / `_part1.md` | 竞品外链分析与推广计划 |
| `外链资源完整清单.md` | 外链资源站点清单 |
| `submit_copies.md` / `提交文案.md` | 提交流程与文案模板 |
| `email_templates.md` | 外联邮件模板 |
| `ops-scheduling.md` | 运营排期 |
| `phase1_week1.md` / `phase1_week1b.md` / `phase1_week2-4.md` / `phase2_week5-12.md` / `phase3_week13-20.md` | 分阶段执行计划 |
| `server-recommendations.md` | 服务器 / 基础设施建议 |
| `weekly_checklist.md` | 周度检查清单 |
| `codex-multica-sync.md` | Multica 同步脚本说明 |
| `write_plan.js` | 写作计划辅助脚本 |
| `外链提交报告_20260809.md` | 外链策略与本周执行计划（2026-08-10 自 ebook-converter/docs 并入） |
| `审计-SERP竞品分析方法论-2026-08-09.md` | SERP 竞品分析方法论（2026-08-10 并入） |

## `tech/` — 技术文档与新人培训

| 文件 | 用途 |
|------|------|
| `新人培训-Google-Cloud与GSC授权.md` | GSC / Google Cloud 授权上手 |
| `新人部署上手指南-GitHub到Vercel.md` | GitHub → Vercel 部署流程 |
| `新人指导-内链优化规则.md` | 内链优化规范 |
| `weekly-guide-loop.md` | 周度指南生产循环 SOP |
| `weekly-guide-loop-2026-08-10.md` | 周度指南生产循环 SOP（双轨版，2026-08-10 并入） |
| `upstash-setup-guide.md` | Upstash / Redis 部署指南（2026-08-10 并入） |
| `新人指导-SERP竞品分析与页面优化方法论.md` | SERP 竞品分析新人指导（2026-08-10 并入） |
| `getting-started.md` | 新人入门总览（原 `guides/`） |

## `content/` — 内容生产规范

博客 / 指南写作规范（原 `ebook-converter/docs/blog-guides/`）：

- `background-workers.mdx` — 后台任务写作指南
- `download-troubleshooting.mdx` — 下载排障指南
- `env-variables-setup.mdx` — 环境变量配置指南
- `epub-to-mobi-guide.mdx` — EPUB→MOBI 指南
- `pdf-to-epub-guide.mdx` — PDF→EPUB 指南
- `sitemap-seo-guide.mdx` — sitemap / SEO 指南
- `webhook-integration.mdx` — Webhook 集成指南

内容策略方法论（新人必读）：

- `一页吃整簇策略.md` — 关键词簇合并策略（同意图变体合并成页，含判断标准 + 实战验证）

## 安全说明

`submissions/` 包含外链提交记录（JSON + 截图），其中可能含有账号、提交凭证等敏感信息。**该目录已加入 `.gitignore`，不纳入版本控制**，本地保留仅供运营参考。请勿手动 `git add` 此目录。
