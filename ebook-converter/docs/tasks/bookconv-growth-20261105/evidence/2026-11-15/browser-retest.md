# M8-17 浏览器复测证据（2026-11-15）

执行方式：Playwright 1.62.1 + chromium（headless），从沙箱经代理真实访问生产 `https://www.bookconv.com`，真实上传夹具 → 真实转换 → **真实下载输出并校验文件魔数**。未修改任何生产数据；直传夹具落 R2 `uploads/2026-11-15/` 临时前缀（生命周期自动清理）。

脚本：`_wb_tmp/m8-17-retest.mjs`（只读式；不进库）。原始结果 JSON 见本目录 `m8-17-retest-*.json`。

## 复测矩阵与结果

| # | 路线 | 夹具(字节) | 路由路径 | presign PUT | /api/convert | 输出字节 | 输出魔数 | 裁定 |
|---|---|---|---|---:|---:|---:|---|---|
| 1 | EPUB→MOBI | owned-small.epub (1840) | multipart | n/a | 200 | 9840 | MOBI/PalmDB(BOOKMOBI) | ✅ PASS |
| 2 | EPUB→MOBI | **owned-4MiB-above.epub (4194305)** | **R2 直传** | **200** | 200 | 9840 | MOBI/PalmDB | ✅ PASS |
| 3 | EPUB→MOBI | owned-4MiB-at.epub (4194304) | multipart(边界) | n/a | 200 | 9840 | MOBI/PalmDB | ✅ PASS |
| 4 | PDF→EPUB | owned-small.pdf (616) | multipart | n/a | 200 | 73310 | ZIP/EPUB(PK..mimetype) | ✅ PASS |
| 5 | MOBI→PDF | 生成 MOBI (9840) | multipart | n/a | 200 | 20449 | PDF(%PDF-1.4) | ✅ PASS |

- **#2 是 P0 核心**：4MiB+1 触发 presign→R2 PUT→convert 全链路；`uploadHost=ebook-temp.…r2.cloudflarestorage.com`，PUT=200，输出为有效 MOBI。这是 11-06 修复后首次**真实浏览器 >4MB 端到端成功**的直接证据（非 GA4 推断）。
- **#3 验证边界**：恰好 4MiB（不 > 阈值）走 multipart 且成功，未撞 edge 上限。
- 全部输出经离线复核：MOBI 头含 `BOOKMOBI`、EPUB 头 `PK\x03\x04`+mimetype、PDF 头 `%PDF-1.4`。

## 数据面（权威门禁）

`node scripts/verify-closure-gates.mjs --no-live` → **exit 0，无假关闭**；F19/R2 均「连续达标」（2026-11-14:0 / 11-13:0 / 11-12:0）。F15/F26 仍 UNKNOWN（无自动 gate，需人工）。

## 异常与残余（诚实披露）

1. **PUT 记录出现 `net::ERR_ABORTED`（#2）**：同一 PUT 先返回 RES 200，随后又记一条 requestfailed ERR_ABORTED。判定为 Playwright 对"响应已被客户端消费后连接关闭"的记录假象——决定性反证是 PUT=200 + convert=200 + 输出为有效 MOBI；若 PUT 真失败则 Calibre 无输入、不可能产出有效文件。**不据此判失败**。
2. **presign URL 含 `x-amz-checksum-crc32=AAAAAA==`（CRC32=0）**：R2 以 UNSIGNED-PAYLOAD 接受（200）且文件正确转换。当前不构成缺陷；但若换用强制校验的存储，PUT 可能被拒——登记为潜在隐患（P3，非本轮修）。
3. **AZW3→PDF 未测**：无合法 AZW3 夹具（M8-17.md 明文"待 11/12 生成，不把 EPUB 改后缀顶替"）→ UNKNOWN，不伪造。
4. **100MiB 边界未测**：按 M8-17.md 不生成无意义 100MB 请求；上限拒绝逻辑另有 `/api/upload/presign` 的 maxBytes=104857600 声明佐证，未做真实 100MB PUT。
5. **GA4 侧 >4MB 真实用户成功流量**：GA4 成功侧无 `file_size` 维度 → 仍 UNKNOWN；但 #2 已提供一次真实 >4MB 端到端成功作为直接反证（测试流量，非自然用户）。

## 结论

M8-17 的 **11/11 修复 + 11/12 浏览器及输出验收缺口已被本轮真实浏览器复测闭环**：R2 直传在 >4MiB 真实文件、真实生产环境成功，4 条代表路线输出均可下载且魔数正确。**建议将 M8-17 由 doing → 关闭**（残余 #3/#4/#5 为 UNKNOWN/未测，非 P0 阻断；F15/F26 仍需人工核验）。关闭动作须 owner 确认后执行，并重跑关闭门禁。
