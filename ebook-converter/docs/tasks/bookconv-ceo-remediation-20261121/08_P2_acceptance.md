# P2 交付：强制推送参数级拦截

完成时间：2026-11-21 11:56 CST。状态：**PARTIAL**（代码守卫 + 隔离验证 DONE；nightly-sync 自动化 prompt 接线 BLOCKED，属生产调度配置，R8 停止）。

## 1. 状态：PARTIAL
- DONE：参数级守卫脚本（纯函数 + CLI）、16 项单测、CLI 隔离验证、临时 git 仓库非快进/工作区无损验证。
- BLOCKED：把守卫接入 `automation 2e8c6c27` nightly-sync prompt（生产调度配置变更），需 CEO 授权；本次不擅自修改。

## 2. 修改文件
| 文件 | 类型 | 摘要 |
|---|---|---|
| `scripts/force-push-guard.mjs` | A | `classifyPushArgs` 纯函数（检测 --force/-f/--force-with-lease/--force-if-includes/--delete/+refspec/--receive-pack=）+ `isFastForward` + CLI（`--check-only` 不执行 push） |
| `tests/unit/force-push-guard.test.ts` | A | 16 项单测（9 强制形式拦截 + 5 正常放行 + 负对照 + 空参数） |
| `docs/tasks/bookconv-ceo-remediation-20261121/07_P2-force-push-design.md` | A | R2 设计 |

未改任何现有脚本/hook/自动化配置；不改正常快进推送流程。

## 3. 现状事实（为何这样设计）
- `scripts/hooks/pre-push` 已有结果级拦截（main 非快进即 exit 1），且已挂载生效——这是**已有防线**，不重复。
- git hook 的 stdin 不含 push 命令行参数，**无法在 hook 内检测 --force 标志**，故参数级守卫必须放在调用入口。
- 现有 `scripts/safe-push`(Python) 允许 `--force`（force-with-lease）且在 main 直接 ABORT，与 nightly-sync 推 origin/main 的需求冲突，**现状未被使用**，不作为拦截入口。
- `automation 2e8c6c27` prompt 第 9/11 步"禁止 --force/-f"是纯文字约束，无代码拦截。

## 4. 测试命令与结果
| 命令 | 结果 |
|---|---|
| `jest tests/unit/force-push-guard.test.ts` | 16/16 PASS，EXIT=0 |
| `node scripts/force-push-guard.mjs --check-only origin main --force` | EXIT=1（FORCE_FLAG），工作区无损 |
| `node scripts/force-push-guard.mjs --check-only -f origin main` | EXIT=1（FORCE_SHORT） |
| `node scripts/force-push-guard.mjs --check-only origin main` | EXIT=0（OK，未执行 push） |
| 临时 git 仓库 `+main:main` 强制 refspec | EXIT=1，HEAD 不变、status 0 变化（无损） |

**反向验证（R3）**：首版正则 `/^-[^-].*f/` 漏判组合短标志 `-fu`，测试注入该用例后 FAIL（1/16 failed）——证明测试判据有效、不是自欺；修正为 `/^-[^-]*f/` 后 16/16 PASS。此过程本身即"注入事故→测试抓到→修复"的反向验证证据。

## 5. 未触及生产边界
- 所有验证用 `--check-only` 或临时 bare 仓库；**未执行任何真实 git push**、未连生产远端、未用生产凭证。
- 未修改 `automation 2e8c6c27`；未暂停/删除/重建任何自动化。

## 6. 残余与接线建议（BLOCKED 解阻）
授权后可一行接线：把 nightly-sync prompt 第 9 步改为
`node ebook-converter/scripts/force-push-guard.mjs origin main`（去掉原 `--force/-f` 文字约束，改为代码守卫），并在非 0 时按第 11 步保留工作区退出。
接线前需在 GA4/生产凭证可用的非生产窗口做一次完整 dry-run（不 push）确认。

## 7. Git 工作区保护
本任务期间清理了两个本轮误建的工作树外文件/临时脚本（`E:/一人公司/ebook-converter/` 下的孤立测试、工作树内 `_wb_tmp_g1_check.mjs`）；当前工作区仅含 P0/P1/P2 预期新增与修改 + 受保护的 `bookconv-correlation-release/`（1799 文件完好）。HEAD 仍为 73c06a8，无 commit/push。

红队：L2 · 裁定 修正（正则漏判 -fu 被测试推翻并修复；识别 safe-push 允许 force 的陷阱）· 回执 本文档 §4/§5。
