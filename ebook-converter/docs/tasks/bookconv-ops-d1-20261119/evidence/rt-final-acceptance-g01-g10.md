# 独立验收报告（G01–G10）· 独立 Agent 原文存档

验收者：独立验收 Agent（非执行者）｜时点：2026-11-17｜整改 commit：5e02b30c84e1a46b82630fe515c927e9433a59e0（origin/main）
全部证据为本轮亲自重跑，未复用执行者结论；全程只读。

## 逐项判定

| 项 | 判定 | 关键实测证据 |
|---|---|---|
| G01 部署事件对应矩阵 | PASS | git log 证实 3 行抽查区间（11-15T05:08 含 7 commits/before=70c8266；11-14T09:34=8990285；11-17T00:05=0e8f3c1）；Deployments API 完整 SHA 查询逐条命中 7798884416/7785697299/7839990987/7681547086，与矩阵一致 |
| G02 生产部署唯一通道 | PASS | deployments?per_page=5 实测 5 条全部 Production/vercel[bot] |
| G03 Actions 无第二条部署 | PASS | git show origin/main:…vercel-deploy.yml：无 api.vercel.com、无 secrets. 引用、只读 permissions、无 continue-on-error；全仓唯一 continue-on-error 在 ci.yml outdated-packages（非部署） |
| G04 验证脚本判据 | PASS | env/sha/creator/success+HTTP200→0、inactive→2、failure→1、queued 超时→3、SHA 非法→4，分支齐全 |
| G05 正常测试重跑 | PASS | VPD_MOCK=normal exit=0，日志 PASS + live HTTP 200 |
| G06 反向注入套件 | PASS | 全量重跑 exit=0，12/12；T9 单跑 exit=1（SHA_MISMATCH） |
| G07 API 错误/超时分支 | PASS | T5→1、T6b→3、T7→1、T8→3 |
| G08 Secret 审计 | PASS | vercel-deploy.yml 0 secrets 引用；VERCEL_DEPLOY_TOKEN 仅存历史记载；INDEXNOW_KEY 死配置属实 |
| G09 M14-2 冻结未发布 | PASS | 三文件 sha256 与预期一致；cat-file exit 128；线上 404；sitemap/llms.txt 计数 0 |
| G10 生产部署证据闭合 | PASS | deployments?sha=5e02b30c… 恰 1 条（7841469158/Production/vercel[bot]）；statuses=success；Actions run「Verify Production Deployment (push to main)」head_sha=5e02b30c conclusion=success；生产首页 200 |

## 遗留项（不阻塞）
1. P2 孤儿 secret VERCEL_DEPLOY_TOKEN 待 Owner 删（D3 禁删）。
2. P2 INDEXNOW 死配置待 Owner 决策。
3. UNKNOWN（低风险）：7681547086 statuses 为空。
4. 方法局限：secret 实际全集需 admin 权限枚举。

## 小备注（非缺陷）
- deployments?sha= 需完整 40 位 SHA（短 SHA 返回空）；矩阵数据无误差。
- 脚本对 environment 大小写归一比较正确。

## 总体结论：PASS（10/10）
