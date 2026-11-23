# P2 设计：强制推送参数级拦截（R2）

设计时间：2026-11-21 11:52 CST。状态：DESIGN_FROZEN。

## 0. 现状事实（先判断，避免重复造轮子）
1. `scripts/hooks/pre-push` 已含"main 非快进即拦截"（`git merge-base --is-ancestor remote_sha local_sha`，失败 exit 1）——这是**结果级**拦截：force push 若造成非快进会被拦；快进型 force push 无害也不拦。已挂载生效（verify-hook-mount PASS）。
2. `scripts/safe-push`(Python) **允许** `--force`（用 force-with-lease）且在受保护分支 main 直接 ABORT——与 nightly-sync 需推 origin/main 的实际需求冲突，**现状未被使用**，不能作为本次拦截入口。
3. `automation 2e8c6c27` nightly-sync prompt 第 9/11 步"禁止 --force/-f"是**纯文字约束**，无参数级代码拦截。

## 1. 为什么需要参数级守卫
git hook 的 stdin 只有 ref 更新（local/remote sha），**拿不到 push 命令行参数**，因此"检测 --force/-f 参数"无法在 hook 内实现，必须在**调用 git push 的脚本入口**做。本次新增一个可复用守卫：解析 push 参数 → 识别强制标志 → 命中即拒绝；非强制放行。

## 2. 最小变更方案
- 新增 `scripts/force-push-guard.mjs`：
  - 导出纯函数 `classifyPushArgs(args)`：识别 `--force`、`-f`、`--force-with-lease`、`--force-if-includes`、`--delete`、refspec 前缀 `+`（等价强制更新）、`--receive-pack=...` 等；返回 `{allowed, reason}`。
  - CLI：`node scripts/force-push-guard.mjs --check-only <args...>` 只判定不执行（安全，用于测试/接线前验证）；`node scripts/force-push-guard.mjs <args...>` 判定通过后 `execFileSync('git', ['push', ...args])` 执行真实 push（本任务**不调用此模式**，仅提供能力）。
  - 非快进防护：真实模式推送前用 `git fetch` + `git merge-base --is-ancestor` 复核，非快进即 exit 1、保留工作区、不 rebase/reset。
- 新增 `tests/unit/force-push-guard.test.ts`：纯函数单测 + 负对照。
- **不修改** nightly-sync 自动化 prompt（生产调度配置，R8 停止）；在验收文档给出接线建议（把 prompt 第9步改为经守卫调用），标 BLOCKED 待授权。

## 3. 影响面
仅新增 2 个文件（守卫脚本 + 单测），不改任何现有脚本/hook/自动化配置；不改正常快进推送流程（守卫放行时参数原样传给 git push）。

## 4. 回滚
新增文件直接删除即可；无对现有文件的修改。

## 5. 失败条件（R8）
- 任何测试触及真实 push / 生产远端 / 凭证 → 立即停止（本次只用 `--check-only`，永不执行真实 push）。
- 守卫误判（把正常快进参数判为强制，或漏判 `--force`）→ 修复单测后再继续。

## 6. 验收
- 强制标志全覆盖测试通过；正常快进参数放行通过；负对照通过。
- 隔离测试脚本在临时 git 仓库验证"非快进冲突安全退出且工作区无损"（如可执行，不涉及真实远端）。
