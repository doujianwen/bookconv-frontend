# GA4 自定义维度注册（转化失败细查）

> 用途：让 `scripts/fetch-ga4-daily.mjs` / 失败归因查询能从 GA4 Data API 拉到
> `conversion_failed` 的**精确错误文本**与**文件大小**，而不是只有 47 次“失败”计数。
>
> 背景：2026-10-05/07/08 出现转化失败爆发（14/13/9 次），但 CloudConvert 后台 0 failed，
> 说明失败发生在到达 CloudConvert 之前。根因定位为 **Vercel Hobby 边缘 4.5MB 请求体硬限**
> （见 `src/lib/file-size-limit.ts`）。注册以下维度后，可对每个失败事件做格式对 / 错误 / 大小下钻。

## 代码侧现状（✅ 已完成）

前端事件**已在发送**以下参数，无需改代码，只需在 GA4 后台注册成自定义维度：

| 事件 | 参数名 | 类型 | 发送位置 |
|------|--------|------|----------|
| `conversion_failed` | `error` | 文本 | `BatchUpload.tsx:330,383`、`ToolPageClient.tsx:161` |
| `conversion_failed` | `file_size` | 数值(字节) | `BatchUpload.tsx:333,384`、`ToolPageClient.tsx:162` |
| `file_upload` | `file_size` | 数值(字节) | `BatchUpload.tsx:351`、`ToolPageClient.tsx:124` |
| `conversion_complete` | `file_size` | 数值(字节) | `BatchUpload.tsx:350` |

`source_format` / `target_format` 已注册（查询可用，证明 API 通）。

## 必须在 GA4 后台手动注册（服务账号是 Viewer，无创建权限）

1. 打开 GA4 媒体资源 **547131052**（bookconv）
   → Admin（管理）→ **自定义定义（Custom definitions）** → **创建自定义维度（Create custom dimension）**
2. 按表建两条（参数名必须**逐字符一致**）：

   | 维度名称（自定义，随意） | 范围 Scope | 事件参数（必须填） |
   |---|---|---|
   | Conversion Error | 事件 Event | `error` |
   | Upload File Size | 事件 Event | `file_size` |

3. 保存后等 **24–48 小时**数据回填（新维度不回溯历史，但之后实时生效）。

> 若想用服务账号 API 自动注册，需把 `bookconv-gsc-reader@...` 在服务账号的
> OAuth scope 从 `analytics.readonly` 换成 `analytics.edit` 并授予媒体资源 **Editor** 角色——
> 当前为 Viewer，无法创建维度。建议直接在 UI 操作。

## 注册后验证（API 查询）

```js
// 失败事件按 error 参数分布
runReport({
  dateRanges: [{ startDate: '2026-10-02', endDate: '2026-10-08' }],
  dimensions: [{ name: 'customEvent:error' }],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: { filter: { fieldName: 'eventName',
    stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
  orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
})
// 失败事件按 file_size 分布（数值维度按区间需自行分桶）
runReport({
  dateRanges: [{ startDate: '2026-10-02', endDate: '2026-10-08' }],
  dimensions: [{ name: 'customEvent:file_size' }],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: { filter: { fieldName: 'eventName',
    stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
  orderBys: [{ metric: { metricName: 'eventCount' }, desc: true } ],
})
```

注册前这两个查询返回 `400 Unknown dimension name customEvent:error`；
注册后返回真实分布，可直接定位“是不是 size>4MB 那一档”。

## 关联门禁

`scripts/ga-inspection.mjs` 的转化失败率门禁（失败>完成 或 成功率<50%）已生效。
维度注册后，可把“失败主要来自某一 error 值/某一文件大小档”写进飞书异常归因文案，
进一步缩短 MTTR。
