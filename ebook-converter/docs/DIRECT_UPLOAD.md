# 直传 R2 上传（解除 4MB 上限）· 实施与运维手册

> 2026-10-25 ｜ 代码状态：已实现，**未 commit**（待「发布」指令）
> 相关：`src/lib/upload-presign.ts`、`src/app/api/upload/presign/route.ts`、`src/lib/client/direct-upload.ts`

## 1. 为什么做这件事

4MB 不是产品决策，是 **Vercel Hobby 边缘的 4.5MB 请求体上限**（413 `FUNCTION_PAYLOAD_TOO_LARGE`）泄漏到了 UI 上。

它结构性卡死了三类格式——这些格式的真实文件天然就大：

| 页面 | 真实文件大小 | 4MB 下的结果 | Ahrefs 机会 |
|---|---|---|---|
| `djvu-to-pdf` | DJVU 扫描件 10–100MB | 必然失败 | **5.9K/mo，KD 8** |
| `cbr-to-pdf` | 漫画 CBR/CBZ 50–200MB | 必然失败 | 长尾 |
| `pdf-to-epub` | 扫描 PDF 10–50MB | 大部分失败 | **6.8K/mo，KD 8** |

`djvu-to-pdf` 的正文甚至自己写着「超过 4MB 请用 djvulibre 桌面版」——页面在把用户送走。

## 2. 新链路

```
≤ 4MB  浏览器 ──multipart──> /api/convert ──> 转换        （原路径，完全不变）
> 4MB  浏览器 ──presign───> /api/upload/presign ──> 签名 PUT URL
       浏览器 ──PUT 字节──> R2                          （不经过任何函数）
       浏览器 ──upload_key─> /api/convert ──> 从 R2 取回 ──> 转换 ──> 删除对象
```

设计上刻意让**小文件继续走原路径**：76.9% 成功率的链路一行没动，新链路的爆炸半径只覆盖「原本根本不可能成功」的文件。

## 3. 两个上限必须分开

| 常量 | 默认 | 作用域 | 不能混用的原因 |
|---|---|---|---|
| `MAX_FILE_SIZE_BYTES`（`NEXT_PUBLIC_MAX_FILE_SIZE_MB`） | 4MB | multipart 路径 | 这是边缘硬限制，改大只会让请求在边缘 413 死掉 |
| `MAX_UPLOAD_FILE_SIZE_BYTES`（`NEXT_PUBLIC_MAX_UPLOAD_MB`） | 100MB | 直传路径 | 不经函数，无边缘限制 |

单测里有不变量断言（`tests/unit/upload-presign.test.ts`）：两者一旦相等，功能即退化为空操作。

## 4. 上线前必做的两件手动事（不做则功能不可用）

### 4.1 R2 桶 CORS —— **必须**，否则浏览器 PUT 会被拦

Cloudflare Dashboard → R2 → 桶 → Settings → CORS Policy，加入：

```json
[
  {
    "AllowedOrigins": ["https://bookconv.com", "https://www.bookconv.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

不加这条的后果：预签名签发成功，但浏览器 PUT 被 CORS 拒绝 → 用户看到「Upload to storage failed」。客户端不会静默失败，会报错。

### 4.2 `uploads/` 前缀的生命周期规则 —— 建议

成功转换的对象会被 `after()` 删除。**失败路径刻意不删**（客户端会在重试中复用同一个 key，提前删会打断重试）。因此失败会留下孤儿对象。

R2 → 桶 → Settings → Object Lifecycle Rules：
- 前缀 `uploads/`
- 删除对象：**1 天后**

## 5. 验证清单

| # | 检查 | 方式 |
|---|---|---|
| 1 | 能力探测 | `GET /api/upload/presign` → `{"enabled":true,"maxMB":100}` |
| 2 | 小文件不回归 | 上传 2MB EPUB，响应头 `X-Conversion-Cache` 正常，行为与改动前一致 |
| 3 | 大文件新能力 | 上传 20MB DJVU，Network 里应看到 `PUT https://<account>.r2.cloudflarestorage.com/...` 返回 200 |
| 4 | 非法 key 被拒 | `POST /api/convert` 带 `upload_key=cache/xxx` → 400 `INVALID_UPLOAD_KEY` |
| 5 | 对象被清理 | 转换成功后 R2 `uploads/<日期>/` 下对象消失 |
| 6 | 降级路径 | 把 `R2_ENDPOINT` 清空重启 → `GET /api/upload/presign` 返回 `enabled:false`，>4MB 文件给出明确提示而非静默 413 |

## 6. 回滚

三层独立降级，从轻到重：

1. **关功能**：Vercel 删除 `R2_*` 任一变量 → `isDirectUploadEnabled()` 返回 false → 所有文件回落到 multipart 路径（>4MB 给出明确提示）。**代码无需回滚。**
2. **降上限**：`NEXT_PUBLIC_MAX_UPLOAD_MB=4` → 行为等同改动前。
3. **回滚代码**：`git revert` 本次提交。

## 7. 已知未覆盖

| 项 | 说明 |
|---|---|
| 批量上传（`BatchUpload.tsx`） | 仍走 multipart，仍受 4MB 限制。Pro 的「大文件」卖点只在单文件路径实现 |
| 转换耗时 | 直传解决的是**传输**上限，不解决**函数执行时长**（Hobby 60s）。100MB 扫描件走 Calibre 仍可能超时——需配合路线 B（自托管 Calibre） |
| 进度反馈 | 目前用 `setProgress(20)` 粗粒度占位，没有真实上传百分比。大文件体验待优化 |
| 配额 | 直传不消耗 CloudConvert credit，但转换仍消耗。A2 预算闸门在转换前生效，不变 |

## 8. 测试

```
npx jest tests/unit/upload-presign.test.ts    # 21 passed
npx tsc --noEmit                              # 0 errors
```

覆盖：key 校验（路径穿越 / 绝对路径 / cache 前缀 / 畸形 UUID / 超长）、key 生成（扩展名净化、日期分区、唯一性）、能力门禁（R2 缺失 fail-closed、自托管模式互斥）、上限不变量。
