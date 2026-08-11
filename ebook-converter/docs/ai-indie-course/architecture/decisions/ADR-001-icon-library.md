# ADR-001: 锁定 lucide-react 1.24.0 为全项目唯一图标来源

## Status
Accepted (2026-08-10)

## Background
团队 P0 绝对规则禁止使用 emoji 作为功能图标，要求 Spec 锁定一套 SVG 图标库。
需要确认：主站现状是什么，课程演示产物应当选什么。

核查结果：
- `lucide-react@1.24.0` 已安装，且已在 **23 个源文件**中实际使用。
- 同时，**12 个源文件仍混用 emoji / 符号字符**（`✅` `❌` `✓`），处于违规状态。

即选型问题已被历史决策部分回答，真正待决的是「是否沿用」与「如何收口」。

## Decision
沿用 `lucide-react`，版本锁定在 **1.24.0**，作为全项目唯一图标来源。

配套约定：
1. 不引入第二套图标库。需要品牌 logo 时用 `public/` 下本地 SVG（Lucide 1.x 已移除 brand icons）。
2. 根布局使用 `LucideProvider` 统一 `size` / `strokeWidth` / `color` 默认值。
3. 语义性图标必须显式 `aria-label`；装饰性图标依赖 Lucide 1.0 起默认的 `aria-hidden="true"`。
4. 存量 12 处 emoji 违规在课程第 6 章现场整改，整改后由 CI 脚本 `scripts/check-no-emoji.sh` 阻止回潮。

## Alternatives Considered
| 方案 | 否决理由 |
|------|----------|
| 保持 emoji | 违反 P0；且跨平台字形不一致、无法着色、无法 tree-shake、屏幕阅读器行为不可控 |
| 换 Heroicons | 图标数量少于 Lucide，且需改写 23 个已有文件，无收益 |
| 换 react-icons | 聚合包体积大，多套图标风格混杂，与「统一视觉」目标冲突 |
| 升级到 lucide-react 1.26.0 | 课程需版本稳定；1.x 内部仍有图标重命名，升级会让录屏与代码对不上。留待课程录制完成后再评估 |

## Consequences

**正面**
- 零迁移成本，23 个文件不动。
- 演示产物与主站视觉天然一致。
- P0 规则从「靠记性」变成「靠 CI」。

**负面**
- 版本锁死意味着录制期间不能享受上游新图标。
- Lucide 1.x 移除品牌图标，若后续需要平台 logo 需自行维护本地 SVG 资产。
- 存量 12 处违规的整改会产生一次跨 12 文件的改动，需与其他并行改动协调避免冲突。

## Related ADRs
ADR-002（演示产物选型）— 演示产物沿用同一图标约束。
