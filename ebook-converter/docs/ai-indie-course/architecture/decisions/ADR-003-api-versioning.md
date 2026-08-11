# ADR-003: API 版本前缀「存量不改，新增遵循」

## Status
Accepted (2026-08-10)

## Background
专家团 API 规范要求所有端点带 `/api/v1/` 版本前缀。

核查 bookconv 现状：**全部 13 条现有路由均无版本前缀**。
```
src/app/api/auth/{login,logout,me,register}/route.ts
src/app/api/convert/route.ts
src/app/api/convert/[jobId]/{status,result}/route.ts
src/app/api/convert-internal/route.ts
src/app/api/payments/{checkout,webhook}/route.ts
src/app/api/download/route.ts
src/app/api/health/route.ts
src/app/api/test-post/route.ts
```

存在冲突：课程要教规范，但案例项目本身不符合规范。回避会让学员困惑，全量重构则代价过大。

## Decision
采取「存量不改，新增遵循」：

1. 现有 13 条路由**保持原样**，不为教学目的重构线上接口。
2. 课程演示产物新增的任何接口，一律使用 `/api/v1/` 前缀。
3. 在第 5 章**公开讲这个偏差**，把它作为「技术债如何判断该不该还」的真实案例。

## Rationale
- `/api/payments/webhook` 的 URL 已注册在支付服务商后台，改路径需同步改外部配置，属跨系统变更，风险与收益不成比例。
- 前端调用点分散，全量改动会引入回归风险，而收益仅是「好看」。
- MVP 阶段只有一个版本，版本前缀的实际价值要到出现不兼容变更时才兑现。现在没有第二个版本。
- 教学上，「承认偏差并解释为什么不改」比「假装项目很规范」更有价值。独立开发者天天面对这种取舍。

## Alternatives Considered
| 方案 | 否决理由 |
|------|----------|
| 全量重构加 v1 前缀 | 需同步改支付商 webhook 配置 + 前端全部调用点，回归风险高，收益低 |
| 加 rewrite 让 `/api/v1/*` 与 `/api/*` 并存 | 制造两套等价 URL，SEO 与缓存层都会变复杂，且掩盖问题而非解决 |
| 课程中回避此话题 | 学员对照真实仓库会立刻发现矛盾，损害课程可信度 |

## Consequences

**正面**
- 零改动风险，线上不受影响。
- 得到一个真实的技术债决策案例，比虚构的更有说服力。

**负面**
- 仓库内部长期存在两种 URL 风格（存量无前缀 / 新增有前缀），新人需要看到本 ADR 才理解。
- 若未来真要统一，迁移成本会比现在更高。需在 `README` 显式标注本 ADR 位置。

## Related ADRs
ADR-002（演示产物选型）— 演示产物的新增接口适用「新增遵循」条款。
