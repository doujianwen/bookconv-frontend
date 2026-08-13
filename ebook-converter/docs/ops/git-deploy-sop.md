# Git 部署 SOP（含远程一致性硬验证）

> 沉淀于 2026-08-13。起因：多次 `git push` 后只看 `behind=0` 误判已同步，实则远程 main 是 7/26 孤儿分支（与本地 215 提交**不相交历史**），造成"线上对但 git 错"的盲区，且无法被现有 content/code critic 捕获。本次先打 backup tag 再强推修正，并固化本 SOP 防止复发。

## 0. 环境前提（一次性 / 每次接手新机）

- remote 必须是 SSH：`git remote -v` 应显示 `ssh://git@github.com/...` 或 `git@github.com:...`。
- **排查 insteadOf 改写**（2026-08-13 真踩的坑）：
  ```bash
  git config --global --get-regexp 'url\.'
  ```
  若含 `url.https://github.com/.insteadof git@github.com:` → 它会把 SSH **偷偷改回 HTTPS**，导致 `git push origin` 走 HTTPS 报 TLS 错、`remote -v` 显示 https 误导判断。移除：
  ```bash
  git config --global --unset url.https://github.com/.insteadof
  ```
- 推送前置排除代理：`env -u HTTP_PROXY -u HTTPS_PROXY`（Git Bash）。

## 1. 标准部署流程（每次 push 必走）

1. 本地门禁通过：`tsc --noEmit`=0、`node scripts/seo-critic.mjs`=0、`NODE_OPTIONS="--use-system-ca" npx next build --webpack`=0。
2. 提交：`git commit`。
3. 推送：
   ```bash
   env -u HTTP_PROXY -u HTTPS_PROXY git push origin main
   ```
4. **硬验证（不可省略）**：
   ```bash
   node scripts/git-sync-check.mjs
   ```
   - `PASS` = 远程 main SHA == 本地 HEAD，真同步。
   - `FAIL` = 没推上。**绝不信任** "Everything up-to-date" / `behind=0`，重新推送后重跑本步。
5. 部署验证：等 75~90s 后用 Node fetch（剥离 `<script>` 块）断言关键页 200 / 正文真渲染 / 门禁状态。

## 2. 不相交历史 / 需要强推时（特殊情形，非默认）

仅当 `git merge-base HEAD FETCH_HEAD` 为空（本地与远程无共同祖先）且确认远程是孤儿/误建分支时：

1. **先打 backup tag 指向远程当前 tip**（保留可找回）：
   ```bash
   git fetch ssh://git@github.com/doujianwen/bookconv-frontend.git main
   git tag pre-rebase-backup FETCH_HEAD
   git push ssh://git@github.com/doujianwen/bookconv-frontend.git pre-rebase-backup
   ```
2. 确认无人新提交后强推：
   ```bash
   git push ssh://git@github.com/doujianwen/bookconv-frontend.git HEAD:main --force
   ```
3. 硬验证：`node scripts/git-sync-check.mjs`（应 PASS）。
4. 线上验证：sitemap URL 数不变、关键页 200、门禁仍在。

> 2026-08-13 实践：远程 main 曾是 7/26 `88a8d0e`+`f9fcee1` 孤儿分支（无父提交、与本地不相交），强推后远程 main 对齐到本地 `0fbab83`，backup tag `pre-rebase-backup` 保留旧提交在 GitHub 可找回。强推对线上内容/SEO 零影响（线上早已跑最新代码，sitemap 177 URL 不变）。

## 3. 为什么不能只看 behind=0（根因复盘）

`git rev-list HEAD..origin/main` 的 behind/ahead 依赖**本地 tracking branch** `origin/main`。Windows 下该 ref 可能因 packed-refs / reftable 机制**写不进磁盘**（fetch 报 `[new branch] main -> origin/main` 却落不了盘，show-ref 为空），产出 **FALSE behind=0 假象**——看起来同步了，实则远程是 forked 历史。

唯一真相来源是 `git ls-remote` **直接问远程**。脚本 `scripts/git-sync-check.mjs` 封装了这一步，不经过本地 tracking。

## 4. 配套工具

- `scripts/git-sync-check.mjs`：push 后硬验证，exit 0/1。默认 `git ls-remote ssh://git@github.com/doujianwen/bookconv-frontend.git main` 比对 SHA，不依赖本地 tracking。用法：`node scripts/git-sync-check.mjs [remote] [branch]`。
- 配套自动化「Pro 链路门禁健康检查」（每周一）：仅读 `/batch` 确认门禁在线与安全态，不验证付费闭环（那需人工跑 Upstash 清单）。

## 5. 纠错职责边界

内容/代码 critic（seo-critic、code-critic、conversion-verifier）只覆盖"内容质量 / 转换输出"，**不覆盖"git 远程一致性 / 部署是否真落地"**。这一环由本 SOP 第 1.4 步的 `git-sync-check.mjs` 兜底——任何 push 后未跑此脚本 = 交付未完成。
