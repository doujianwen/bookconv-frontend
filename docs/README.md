# 项目文档中心

本目录是 BookConv 项目的统一文档中心，按用途分为三个子目录。所有文档统一在此管理，不再分散于 `ebook-converter/docs/` 与根级 `docs/`。

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

## `tech/` — 技术文档与新人培训

| 文件 | 用途 |
|------|------|
| `新人培训-Google-Cloud与GSC授权.md` | GSC / Google Cloud 授权上手 |
| `新人部署上手指南-GitHub到Vercel.md` | GitHub → Vercel 部署流程 |
| `新人指导-内链优化规则.md` | 内链优化规范 |
| `weekly-guide-loop.md` | 周度指南生产循环 SOP |
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

## 安全说明

`submissions/` 包含外链提交记录（JSON + 截图），其中可能含有账号、提交凭证等敏感信息。**该目录已加入 `.gitignore`，不纳入版本控制**，本地保留仅供运营参考。请勿手动 `git add` 此目录。
