# 2026-11-19｜BookConv 转换事件与后端任务日志关联 · 生产闭环验收记录

执行时间：2026-11-19 15:16–15:37（CST）
执行范围：仅发布已审计 commit `56add99` 涉及的 5 个文件；未混入工作区其它未提交改动。

## 一、验收结果

| 验收项目 | 结果 | 证据 |
|---|---|---|
| VPS 状态 | ✅ 正常 | `uptime` 22 天 23 小时；负载 0.00；内存 697Mi/3.6Gi；磁盘 13%；`systemctl --failed` 0 项 |
| 后端健康 | ✅ 正常 | 本机 `http://127.0.0.1:3001/health` → 200；公网 `https://convert.tuozhigeo.com/health` → 200；TLS 证书至 2027-01-25 |
| 后端部署 | ✅ 完成 | `/opt/bookconv-conversion/app/index.js` md5 `fc31189675bbe55a8ec093926692b8b5`（= commit 56add99 字节级一致，13466B）；`bookconv-conversion.service` active |
| 前端部署 | ✅ 完成 | `/api/health` 返回 `commitSha=56add9979ae17adcd26969e2abea73c282bad405`（15:28:30 CST） |
| 真实转换 | ✅ 通过 | 真实 Chrome 157.0.8103.79 访问 `/convert/txt-to-epub`，产出 EPUB 157,413B（magic `50 4b 03 04`），下载成功 |
| Request ID 关联 | ✅ 一致 | 请求头 `x-request-id` = 响应头 `x-conversion-request-id` = GA4 `ep.request_id` |
| Backend Job ID 关联 | ✅ 一致 | 响应头 `x-conversion-job-id` = 后端日志 `job=` = GA4 `ep.backend_job_id` |
| GA4 事件 | ✅ 已接收 | `www.google-analytics.com/g/collect` 命中 `en=conversion_complete`，HTTP 204；参数含 request_id / backend_job_id / conversion_backend |
| 日志一致性 | ✅ 一致 | `START` 与 `CORRELATION_OK` 同 request+job；`bytes=157413` 与下载文件字节数完全相等；该 request 的 `CORRELATION_FAIL` 计数 = 0 |
| 回滚准备 | ✅ 就绪 | 后端备份 `index.js.bak-20261119-152013-pre-deploy`（md5 `8836323b…` = 9cf164f）；前端回滚点 `9cf164fe50743cf4e20f479087f661712d1c075e` |

## 二、关键标识

- 最终前端 commit：`56add9979ae17adcd26969e2abea73c282bad405`
- 最终后端版本：`index.js` md5 `fc31189675bbe55a8ec093926692b8b5`（来源 commit 56add99）
- 验收主样本 request_id：`ecf3dd70-f886-4800-a092-8028451b92c7`
- 对应 backend_job_id：`97485ad7-eeb3-4fc9-b2db-9e3f566eac8d`
- 对应 CORRELATION_OK：
  `[2026-11-19T07:36:53.437Z] CORRELATION_OK job=97485ad7-eeb3-4fc9-b2db-9e3f566eac8d request=ecf3dd70-f886-4800-a092-8028451b92c7 bytes=157413 duration=956ms`
- GA4 验证：`conversion_complete` → `ep.request_id=ecf3dd70-…`、`ep.backend_job_id=97485ad7-…`、`ep.conversion_backend=hit`，采集端点 204。

第二样本（同一发布、独立请求）：
request `4624e517-8c96-4858-b9d4-f7f2a5373875` / job `9a83cbae-7024-4556-91db-82676d75fe17`，
`CORRELATION_OK bytes=50476` 与下载文件 50,476B 一致；GA4 同样收到该 request 的 `conversion_complete`。

后端直连探针（发布后端、发布前端前）：request `probe-backend-direct-20261119152610` / job `79a12c24-12a7-42c4-b787-8c491e8f3858`，响应头与日志一致，产物 191,785B。

## 三、发布过程与验证

1. 代码边界：`git diff --name-status 9cf164f..56add99` 恰为 5 个文件（21 增 2 删）；工作区脏改动未参与发布。
2. 测试复跑（干净工作树 `E:/BookConv-correlation-release`）：后端 mock 17/17；Jest 51 suites / 593 tests 全通过；`tsc --noEmit` 通过。
3. 门禁：`verify-hook-mount.mjs` PASS；`verify-closure-gates.mjs --no-live` exit 0，0 假关闭（2 项 UNKNOWN，与本任务无关）。
4. 后端发布：先备份 → 上传校验 md5 → `install -o bookconv-backend` → 重启单服务（未重启整机）→ 健康 200。
5. 前端发布：`git push origin ai/bookconv-closed-loop-20261119:main`（fast-forward，非强制），pre-push 发布门禁 0 critical 放行，Vercel 自动部署。

## 四、故障说明（本次处理）

- **历史故障复核**：公网健康检查在 15:16、15:20 均为 200，后端服务全程 active；此前“HTTP 空响应 / TLS 握手失败 / SSH 主动断开”在本次复现为**本机网络问题**，非服务器故障。
- **根因**：本机 `sing-tun` 虚拟网卡接管默认路由（metric 0），且 `convert.tuozhigeo.com` 被解析为 fake-IP `198.18.0.183`，导致 TCP 可连接但 HTTP/TLS/SSH 被隧道中断。通过为 `43.129.176.38/32` 增加经以太网直连的显式路由后，HTTPS 200、SSH 恢复正常。
- **服务器侧历史事件**：2026-11-08 16:51 发生一次 `ebook-convert` OOM 被杀（内核日志可查）；2026-11-19 14:19 服务曾被人工重启。本次未重启整机、未改动防火墙、未改 Nginx 配置。

## 五、回滚方案

- 后端：`sudo install -o bookconv-backend -g bookconv-backend -m 644 /opt/bookconv-conversion/app/index.js.bak-20261119-152013-pre-deploy /opt/bookconv-conversion/app/index.js && sudo systemctl restart bookconv-conversion`
- 前端：将 `main` 回退到 `9cf164fe50743cf4e20f479087f661712d1c075e` 并正常推送触发 Vercel 部署。
- 证据保留：`/opt/bookconv-conversion/logs/app.out.log`、Nginx 访问日志、本机 `acceptance-evidence.json`。
