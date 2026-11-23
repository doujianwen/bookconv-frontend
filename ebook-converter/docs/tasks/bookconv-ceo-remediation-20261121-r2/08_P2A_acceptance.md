# P2-A 强制推送守卫接入 · 验收与接线方案（2026-11-21 round2）

状态：**代码层 DONE；自动化接线 BLOCKED（需授权改生产调度）**

## 1. 实际代码差异

### `scripts/force-push-guard.mjs`
Round1 已有 `classifyPushArgs`（拦 --force/-f/+refspec 带冒号/--delete/--receive-pack）。Round2 补全 4 类漏判：
- L`FORCE_FLAG_VALUE`：`--force=true`、`--force-with-lease=main`、`--force-if-includes=true`（git 接受 `=` 形式，round1 只匹配裸标志 → 可绕过）
- `FORCE_REFSPEC` 放宽：`+main`、`+HEAD`（裸 `+` 强制 refspec，round1 要求含冒号 → 漏判）
- `MIRROR_PUSH`：`--mirror`（强推所有 ref）
- `isFastForward(remoteRef, localRef, remoteName)` + 新 `resolvePushTarget(args)`：FF 检查的 ref 从**实际 push 参数**解析（round1 硬编码 origin/main，推其他分支会查错 ref = 假门禁）；参数不可解析时 fail-closed。

### `tests/unit/force-push-guard.test.ts`
- 新增 8 个拦截用例（3 个 `=` 形式 + 2 个裸 `+` + --mirror + reason 分类 + 负对照 `feature+2`）
- 新增 `resolvePushTarget` 5 个用例（origin main / main:main / HEAD:refs/heads/main / URL remote / 歧义 fail-closed）
- 结果：29/29 通过（round1 为 16/16）

## 2. 测试原始输出（独立通道）

- Jest：`tests/unit/force-push-guard.test.ts` → `Test Suites: 1 passed; Tests: 29 passed, 29 total; EXIT=0`
- 隔离 CLI `--check-only`（不执行 push）：`--force=true` exit 1 / FORCE_FLAG_VALUE；`+main` exit 1 / FORCE_REFSPEC；`--mirror` exit 1 / MIRROR_PUSH；正常参数 exit 0；HEAD 仍 73c06a8，工作区仅本轮预期改动。
- 隔离 git 仓库（临时 bare+work，**无真实远端**）live mode 三场景：
  - 正常快进 → exit 0，远端更新
  - `--force` → exit 1 / FORCE_FLAG，远端不变，工作区无损
  - 真实非快进分歧（remote ahead）→ exit 1「非快进冲突或目标无法判定：安全退出」，远端不变（442099b），工作区 status=0、HEAD 未变
- 全程未执行真实生产 push。

## 3. nightly-sync 接线方案（未执行 —— 改生产调度需授权）

自动化 `2e8c6c27-7bc9-4229-8adf-1129e4de299d`「夜间同步（每日 22:00）」当前第 9 步：
```
9. 推送：git push git@github-old:doujianwen/bookconv-frontend.git main（...禁止使用 --force / -f）。
```

### 最小变更（建议）
把第 9 步的裸 `git push` 改为经 guard 调用（保留同一 remote/分支/时段）：
```
9. 推送（经强制推送守卫，参数级拦截 --force/-f/--force-with-lease/裸 +refspec/--mirror）：
   node scripts/force-push-guard.mjs git@github-old:doujianwen/bookconv-frontend.git main
   - exit 0 = 守卫判定安全且快进、已执行 push，继续第 10 步
   - exit 1 = 命中强制标志或非快进冲突，守卫已安全退出、工作区保留；禁止绕过守卫裸推，记录错误 exit 1
```
第 11 步"非快进禁止强推"文字约束保留（与守卫形成双保险）。**rrule `FREQ=DAILY;BYHOUR=22;BYMINUTE=0`、cwd、status=ACTIVE 全部不变**。

### 回滚方案（一行恢复）
将第 9 步替换回原文本：
```
9. 推送：git push git@github-old:doujianwen/bookconv-frontend.git main（...禁止使用 --force / -f）。
```
guard 脚本与测试保留不影响回滚（未被调用即无行为）。

### 非生产验证（接线前必须完成）
`automation_update` 是生产调度接口，本轮**未调用 update**。接线授权后，先在隔离临时 git 仓库用完全相同的 guard 命令验证（已在 §2 完成三场景），再改 prompt，改后立即 `automation_update view` 回读确认 prompt 与时段未漂移。

## 4. 未解决 / 残余
- nightly-sync 仍走裸 `git push`（文字禁 force），代码级 guard 尚未被自动化调用 → **BLOCKED，需授权改 prompt**。
- `scripts/safe-push`（Python）仍允许 `--force-with-lease` 且在 main 上直接拒推，与 nightly-sync 需求冲突，本轮未改（不在授权范围）。

## 5. 红队回执
- L2：发现 round1 guard 的 4 类绕过 + isFastForward 硬编码假门禁，均已实测证伪并修复；`+` 负对照（feature+2）确认无过度拦截。
- L3 独立通道：Jest 单测 + 隔离 CLI + 隔离 git 仓库 live mode（三场景）独立于执行者的输出；远端不可达/工作区变化检查通过。
