# 00 · 经营运营总览（BC-OPS-20261118）

- run_id：`BC-OPS-20261118`
- 执行：BookConv 项目 AI CEO（WorkBuddy 单会话长任务）｜时点：2026-11-17 08:47–(+08:00)
- 承接：BCGOV-20261117 / BC-EXEC-20261117 / BC-VERIFY-20261118
- Git 快照：HEAD=origin/main=`0e8f3c1a2412ae8900a4983062342223884549f1`；26 处 dirty 全保留；本轮零 commit/push/生产变更。

## 本轮结果一览

| # | 事项 | 结论 | 证据 |
|---|---|---|---|
| P0 | Vercel 假绿根因 | secret 无效 token + continue-on-error + curl 不校验 ⇒ 失败被吞显示 success；生产真实链路=Vercel GitHub Integration（40/40 vercel[bot]） | 01 / evidence/rt01-deploy-evidence.md |
| P0 | 修复方案 | **CEO 推荐 B**：集成通道为唯一生产部署，GHA 改为只读验证 job（零重复部署、零 token、$0）；diff 草稿+测试+回滚就绪，未实施 | 03 / 04 |
| P1 | M14-1 观察 | 基线复核一致（Bing 11-13 桶 0 点击/4 展/位 3）；GSC 延迟至 11-14，上线后数据不存在 ⇒ 全 UNKNOWN；检查点 11-24/12-01/12-15 沿用 | 05 / evidence/rt05-gsc-observe-1117.json |
| — | M14-2 冻结 | LOCAL_READY/NOT_PUBLISHED 成立（线上 404/sitemap 0/llms.txt 0）；台账滞后措辞已修正，状态保持 blocked | 06 |
| — | 产品稳定性 | 7 天终态成功率 82%（CI≈[74.6%,87.9%]）；M14-5 未复发（PUT:NETWORK 仅 11-10×2，后 6 天零新增）；Failed to fetch 窗口 8 次后近两日归零 | 07 |
| — | 增长机会 | Top5 排序：①发布 M14-2 ②/es convert 页 CTR ③kindle-formats CTR ④azw3-vs-mobi CTR ⑤lit-to-mobi 观察；不建新页 | 08 |

## 最终问题回答（任务书要求）

1. **假绿如何发生**：见 01 §1 一句话根因与 §3 缺陷链条。
2. **真实生产链路**：push main → Vercel GitHub Integration → vercel[bot] Deployment → Vercel 构建（GHA 通道从未生效）。
3. **保留/修复/下线**：GHA 部署 step 下线，改验证任务（方案 B）；集成通道保留。
4. **最小化修复**：单文件 workflow 替换，diff 草稿在 03，测试/回滚在 04。
5. **M14-1 可验证变化**：**无**（数据尚不存在，UNKNOWN；D+7=2026-11-24 首个检查点）。
6. **产品稳定性**：稳定运行，无 P0 信号；详见 07。
7. **三个最值得投入的增长机会**：发布 M14-2、西语 convert 页 CTR 优化、kindle-formats 页 CTR 优化（08 排序 #1–#3）。

## 交付清单

00 总览｜01 根因｜02 架构与证据矩阵｜03 修复方案｜04 测试与回滚｜05 M14-1 基线｜06 M14-2 冻结｜07 稳定性｜08 机会排序｜09 独立验收（独立 Agent）｜10 残余与决策｜11 EXECUTION-LOG｜evidence/（rt00 快照、rt01 部署证据、rt05 GSC JSON 等）

红队：L2 · 裁定 通过（P0 根因与方案经对照组实验与负对照验证；N2 方案与 N4 关闭回执见 10/11）· 回执 10_残余风险与CEO决策.md §红队回执
