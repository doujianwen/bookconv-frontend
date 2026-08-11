# AI 独立开发实战课 · 设计规范（DESIGN.md）

> 项目设计契约源文件。任何页面开工前先读本文件；页面级差异写入 `design-system/pages/<page>.md`，不整篇重写本文件。
> 版本 v1.0 · 设计负责人：颜好看 · 案例调性参考：bookconv.com

---

## 0. 设计寄存器与三轴刻度（先判定，再动手）

本产品是**双寄存器混合体**，两套寄存器共用同一套 Token，但设计策略不同：

| 区域 | 寄存器 | 标杆 | 策略 |
|---|---|---|---|
| 课程 Landing / 定价 / 讲师页 | **Brand**（设计即产品） | 独特性优先 | 允许非对称、真实截图为主视觉、一次编排好的入场动效 |
| 章节列表 / 播放页 / 学习工作台 | **Product**（设计服务内容） | 赢得熟悉感（Linear / Notion / Frontend Masters 级） | 克制、功能性动效、数据密度优先、零装饰 |

平台正交轴：**web**（响应式，移动端同权，不做独立 App）。

### 三轴刻度

| 参数 | Landing | 学习端（列表/播放页） | 说明 |
|---|---|---|---|
| `DESIGN_VARIANCE` | **7** | **4** | Landing 禁止居中 Hero，强制非对称分栏；学习端保持可预测栅格 |
| `MOTION_INTENSITY` | **4** | **3** | 学习场景注意力是稀缺资源，动效只做状态确认，禁止持续微动画 |
| `VISUAL_DENSITY` | **4** | **6** | 章节列表走 divide-y 行式密集布局，禁止通用卡片网格 |

---

## 1. Visual Theme & Atmosphere

**品牌声音三词（物理对象词，非形容词）：**
> **工程手册 · 车间台灯 · 蓝晒图纸**

- 一本被翻旧的工程手册：有编号、有页码、有清单，可被反复查阅而不是被一次性观看
- 车间台灯：暖光只打在正在动手的那一小块区域上，其余留在暗处
- 蓝晒图纸：结构先于装饰，线是功能线不是装饰线

**氛围描述：**
这不是一门"发布会式"的课。视觉必须传达"这是一份可执行的施工图，不是一场演讲"。因此：
- 主视觉是**真实产物证据**（真实站点截图、真实 Cursor 对话、真实 Vercel 部署记录），不是抽象 3D / 插画 / 光效
- 背景纹理是 **1px 蓝晒网格线（opacity 0.04，40px 栅格）**，不是渐变光晕
- 深色是学习端默认（与学员 IDE 环境连续），浅色是营销端默认（与 bookconv.com 的 SEO 站调性连续）

**明确拒绝的氛围：** 未来感霓虹渐变、发布会 keynote 感、粒子光效、毛玻璃堆叠、庆祝式插画。

---

## 2. Color Palette & Roles

### 主色决策说明（为什么不是默认蓝紫）

强调色取 **蓝晒图普鲁士蓝 `#14489C`**，不是 Tailwind Indigo `#6366F1`。二者色相相差约 40°，`#14489C` 无紫向偏移，配合琥珀次色形成"图纸 + 台灯"的双色关系。**Indigo→Pink 渐变、发光边框、毛玻璃三件套在本项目全域禁止。**

### Light 主题（默认：Landing / 章节列表 / 文档）

| Token | 值 | 层级 | 用途 |
|---|---|---|---|
| `--bg` | `#F7F8FA` | A1 | 页面背景（冷中性，非奶油色带） |
| `--surface` | `#FFFFFF` | A1 | 卡片 / 容器 |
| `--surface-warm` | `#EFF1F5` | B-slot | 三级表面：代码块底、提示块底 |
| `--fg` | `#15181D` | A1 | 主文本（石墨黑，非纯黑） |
| `--fg-2` | `#333941` | B-slot | 次级文本 |
| `--muted` | `#545C68` | A1 | 副文本 / 说明 |
| `--meta` | `#666E7B` | B-slot | 时长、序号、元数据 |
| `--border` | `#DFE3E9` | A1 | 默认边框 |
| `--border-soft` | `#EDEFF3` | B-slot | 行分隔线（纯装饰，豁免对比度） |
| `--border-strong` | `#838C99` | B-slot | **交互控件边界**（输入框/Secondary 按钮），对 bg 3.20:1 满足 WCAG 1.4.11 |
| `--accent` | `#14489C` | A1 | 品牌强调 —— **每屏可见使用 ≤2 处** |
| `--accent-on` | `#FFFFFF` | A2 | accent 底上的前景 |
| `--accent-hover` | `#0F3A81` | A2 | 悬停 |
| `--accent-active` | `#0B2E68` | A2 | 激活 |
| `--accent-wash` | `#EBF1FB` | C-ext | accent 8% 极浅底（高亮行、选中行） |

### Dark 主题（默认：单节播放页 / 代码密集页）

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#0E1116` | 页面背景（非纯黑，避免 halation） |
| `--surface` | `#161A21` | 卡片 |
| `--surface-warm` | `#1E232B` | 三级表面 |
| `--fg` | `#E8ECF2` | 主文本 |
| `--fg-2` | `#C3CAD4` | 次级文本 |
| `--muted` | `#9AA4B2` | 副文本 |
| `--meta` | `#828D9B` | 元数据 |
| `--border` | `#262C36` | 边框 |
| `--border-soft` | `rgba(255,255,255,0.06)` | 分隔线（纯装饰） |
| `--border-strong` | `#606A79` | 交互控件边界，3.45:1 |
| `--accent` | `#5B9BFF` | 强调（深色下提亮，饱和度降 12%） |
| `--accent-on` | `#06101F` | accent 底上的前景 |
| `--accent-hover` | `#7BAEFF` | 悬停 |
| `--accent-active` | `#4A88EA` | 激活 |
| `--accent-wash` | `#141C2B` | 高亮行底 |

**深色层级靠亮度递进表达，不靠阴影：** `#0E1116 → #161A21 → #1E232B → #262C36`

### 语义色（A2）

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--success` | `#147D4B` | `#3FBF7F` | 已完成、测试通过 |
| `--warn` | `#B45309` | `#F0A94C` | 踩坑提示、动手实战标记（琥珀=车间台灯） |
| `--danger` | `#C0342B` | `#F2685C` | 报错、破坏性操作 |

### 课程专属语义（C-extension）

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--track-video` | `#14489C` | `#5B9BFF` | 视频节标记 |
| `--track-doc` | `#545C68` | `#9AA4B2` | 图文节标记（中性，不抢眼） |
| `--track-practice` | `#B45309` | `#F0A94C` | 动手实战节标记 |
| `--progress-fill` | `#14489C` | `#5B9BFF` | 进度条已完成段 |
| `--progress-rail` | `#EDEFF3` | `rgba(255,255,255,0.08)` | 进度条底轨 |
| `--grid-line` | `rgba(21,24,29,0.04)` | `rgba(255,255,255,0.035)` | 蓝晒网格背景线 |

### 色彩配比铁律

- 中性色 **82%** / accent **≤10%** / 语义色 **≤6%** / 效果色 **<1%**
- **每屏可见的 accent 使用不超过 2 处**（主 CTA 1 处 + 当前状态 1 处）。章节列表里 20 个"已完成"图标一律用 `--success` 且尺寸 16px，不算 accent 配额，但整屏 success 图标必须同色同尺寸，禁止彩色泛滥
- 禁止任何位置出现裸 hex，唯一例外 `#fff` / `#000`（仅限 SVG 内部 fill 计算）

---

## 3. Typography Rules

### 字体锁定（4 族，职责不重叠）

| Token | 字体栈 | 职责 | 加载策略 |
|---|---|---|---|
| `--font-display` | `"Archivo", "Noto Sans SC", system-ui, sans-serif` | 拉丁展示字（≥28px 标题、数字、模块编号） | variable weight 单文件，latin subset only |
| `--font-body` | `"Inter", "Noto Sans SC", system-ui, sans-serif` | 全站正文与 UI | Inter variable，latin subset |
| `--font-cn` | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` | 中文全场景（正文 + 标题） | 仅 400/500/700 三档，按 unicode-range 分片子集化 |
| `--font-mono` | `"JetBrains Mono", "SFMono-Regular", Consolas, monospace` | 代码、时间码、时长、行号 | 400/500 两档 |

**为什么是 Archivo 而不是 Inter 当展示字：** Archivo 源自 grotesque 报刊标题体，字腔紧、笔画有测量刻度感，大字号下呈现"设备铭牌 / 机器面板标签"的物理质感，正对应"工程手册"声音词。Inter 作为展示字缺乏个性且是 AI 默认值。

**为什么等宽锁 JetBrains Mono：** 视频里学员看到的 IDE 用它，课程网页的代码块也用它 —— **视频 ↔ 网页视觉连续性**是本项目的语义正确选择，不是随便挑的。

**明确拒绝的字体（AI 默认值，本项目禁用）：** Playfair Display、Fraunces、Lora、Crimson、Cormorant、Syne、Space Grotesk、Space Mono、IBM Plex 全族、DM Sans、Outfit、Plus Jakarta Sans、Instrument Sans/Serif。

### 字号层级（8 级）

| Token | 值 | 用途 |
|---|---|---|
| `--text-xs` | `12px` | 标签、角标 |
| `--text-sm` | `14px` | 元数据、时长、辅助说明 |
| `--text-base` | `16px` | UI 正文、按钮、列表行 |
| `--text-lg` | `17px` | **阅读正文（中文长文专用）** |
| `--text-xl` | `20px` | 小标题 |
| `--text-2xl` | `24px` | 区块标题 |
| `--text-3xl` | `32px` | 页面主标题 |
| `--text-4xl` | `40px` | 章节大标题 |
| `--text-display` | `clamp(36px, 5.2vw, 60px)` | 仅 Landing Hero |

### 行高 / 字距

| 场景 | 行高 | 字距 |
|---|---|---|
| 中文阅读正文 17px | `1.75` | `0` |
| UI 正文 16px | `1.6` | `0` |
| 小字 12-14px | `1.5` | `0.01em` |
| 标题 24-40px | `1.25` | `-0.01em` |
| Display ≥48px | `1.1` | `-0.02em` |
| ALL CAPS 标签 | `1.4` | **`0.08em`（强制）** |
| 代码 14px | `1.7` | `0` |

### 字重（三级）

- **400 Read** — 正文、描述
- **510 Emphasize** — 小标题、列表行主文、按钮
- **590 Announce** — 页面标题、CTA、模块名

中文使用 Noto Sans SC 时映射为 400 / 500 / 700。

### 数字规则

所有时长、进度、序号、时间码使用 `--font-mono` + `font-variant-numeric: tabular-nums`，保证列表纵向对齐。

---

## 4. Component Stylings

### 按钮

| 类型 | 背景 | 文字 | 边框 | 圆角 | 内边距 | 用途 |
|---|---|---|---|---|---|---|
| Primary | `--accent` | `--accent-on` | 无 | `--radius-sm` | `12px 20px` | 主 CTA，每屏 1 个 |
| Secondary | 透明 | `--fg` | `1px --border-strong` | `--radius-sm` | `12px 20px` | 次要操作 |
| Ghost | 透明 | `--muted` | 无 | `--radius-sm` | `10px 14px` | 列表行内操作 |
| Danger | 透明 | `--danger` | `1px` danger 30% | `--radius-sm` | `10px 16px` | 破坏性操作 |

- 高度：桌面 44px / 移动 48px（触摸目标 ≥44×44px）
- Focus：`box-shadow: var(--focus-ring)`，**禁止 `outline: none` 后不补焦点态**
- Loading：文字不消失，左侧插入 16px `loader-circle` 旋转（1s linear infinite），按钮宽度锁定不抖动
- Disabled：`opacity: 0.45; cursor: not-allowed`，不改色相

### 卡片

```
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--radius-md);   /* 10px，上限 14px */
box-shadow: none;                   /* 默认无阴影 */
padding: var(--space-5);            /* 20px */
```

- **禁止**：彩色左边框强调、1px 边框与 blur≥16px 阴影同时出现（幽灵卡片）、圆角 ≥24px
- hover 态：`border-color: var(--accent)`，**不加位移、不加阴影**

### 输入框

```
background: var(--surface);
border: 1px solid var(--border-strong);   /* 交互控件必须用 border-strong，>=3:1 */
border-radius: var(--radius-sm);
height: 44px;
padding: 0 14px;
```

- Focus：`border-color: var(--accent)` + `--focus-ring`
- Error：`border-color: var(--danger)` + 字段下方 13px danger 文字 + `triangle-alert` 14px 图标
- **label 永远可见**，禁止用 placeholder 当 label

### 章节行（Lesson Row）—— 本项目核心组件

```
height: 56px (desktop) / 64px (mobile)
display: grid; grid-template-columns: 20px 1fr auto auto;
gap: 12px; padding: 0 20px;
border-bottom: 1px solid var(--border-soft);
background: transparent;
```

- hover：`background: var(--surface-warm)`，右端淡入 "继续" ghost 按钮（140ms）
- current：`background: var(--accent-wash)` + 左侧 20px 图标换 `circle-dot` accent 色
- 状态图标：`circle-check`(success) / `circle-dot`(accent) / `circle`(meta) / `lock`(meta)
- 类型标签：1px 边框 pill，`--text-xs`，字距 `0.02em`，**不填色**，颜色取对应 `--track-*`

### 类型标签（Track Pill）

| 类型 | 文案 | 图标 | 颜色 |
|---|---|---|---|
| 视频 | `视频` | `play-circle` 14px | `--track-video` |
| 图文 | `图文` | `file-text` 14px | `--track-doc` |
| 实战 | `实战` | `square-terminal` 14px | `--track-practice` |

### 代码块

```
background: var(--surface-warm);
border: 1px solid var(--border);
border-radius: var(--radius-sm);
font: 400 14px/1.7 var(--font-mono);
```

- 顶栏 36px：左侧文件名（mono 13px, `--meta`）+ 语言标签，右侧 `copy` 图标按钮 16px
- 行号列：`--meta`，`tabular-nums`，`user-select: none`
- **高亮行**：整行底色 `--accent-wash` + 该行行号变 `--accent`。**不使用左侧彩色边框**（避免侧条纹反模式）
- 代码高亮主题与录屏 IDE 主题保持同一色系（GitHub Dark Default 派生）

### 提示词块（Prompt Block）—— AI 课独有组件

```
background: var(--surface-warm);
border: 1px solid var(--border);
border-radius: var(--radius-md);
padding: 16px 20px;
```

- 头部一行：`message-square-code` 20px（`--accent`）+ 标题「给 AI 的指令」（510 字重 14px）+ 右侧 `copy` 按钮
- 内容：`--font-mono` 14px，`--fg-2`，行高 1.7，可换行不横向滚动
- 变量占位用 `[方括号]` 且着 `--accent` 色，提示学员替换

### 踩坑块（Pitfall Block）

```
background: color-mix(in srgb, var(--warn) 8%, var(--surface));
border: 1px solid color-mix(in srgb, var(--warn) 25%, transparent);
border-radius: var(--radius-md);
padding: 16px 20px;
```

- 头部：`triangle-alert` 20px（`--warn`）+ 标题「这里会卡住」
- 正文用常规 `--fg-2`，不用 warn 色（避免整块刺眼）

### 进度条

```
height: 2px; border-radius: 0;
background: var(--progress-rail);
```
填充段 `--progress-fill`，宽度变化 `320ms var(--ease-out-soft)`。**不显示百分比数字**（除非用户悬停），避免数字噪音。

---

## 5. Layout Principles

### 栅格

| 断点 | 列数 | 沟槽 | 容器边距 |
|---|---|---|---|
| ≥1280px | 12 | 24px | auto（max 1200px） |
| 1024–1279px | 12 | 24px | 32px |
| 768–1023px | 8 | 20px | 24px |
| <768px | 4 | 16px | 16px |

- `--container-max`: **1200px**（Landing / 文档）
- `--container-app`: **1440px**（学习端工作台，三栏布局需要更宽）
- `--measure`: **68ch**（阅读正文最大行宽，中文约 34 字/行）

### 节区节奏

| 断点 | 值 |
|---|---|
| Desktop | `96px` |
| Tablet | `56px` |
| Phone | `40px` |

### 学习端三栏骨架（播放页）

```
≥1280px:  [ 280px 章节导航 ][ 1fr 主内容 ][ 260px 大纲+资源 ]
1024-1279: [ 280px 章节导航 ][ 1fr 主内容 ]  右栏折叠为浮动按钮
768-1023:  [ 1fr 主内容 ]  左栏变抽屉
<768px:    单列，播放器 sticky，导航变底部抽屉
```

### Hero 规则

- 高度 **不超过 60vh**，内容顶部偏移（`padding-top: 88px`），**不垂直居中**
- `DESIGN_VARIANCE=7`：Hero 强制非对称 —— 左栏 7/12 文字左对齐，右栏 5/12 且 `margin-top: 40px` 制造错位

---

## 6. Depth & Elevation

三级，只有三级：

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--elev-flat` | `none` | `none` | 默认，绝大多数元素 |
| `--elev-ring` | `0 0 0 1px var(--border)` | `0 0 0 1px var(--border)` | 卡片、输入框 |
| `--elev-raised` | `0 1px 2px rgba(21,24,29,.04), 0 6px 16px rgba(21,24,29,.06)` | `none`（改用 `--surface-warm` 提亮） | 仅 Dropdown / Modal / Toast |

**深色模式禁止使用阴影表达层级**，一律用背景亮度递进。

---

## 7. Do's and Don'ts

### Do（允许）

- Hero 主视觉用**真实截图**：bookconv.com 真实页面 / 真实 Cursor 会话 / 真实 Vercel Deployment 面板
- 数据用真实值（`bookconv.com 上线 47 天，自然流量 3,182 次`），宁可不放也不编造
- 章节列表用 `divide-y` 行式布局，不用卡片网格
- 每个 section 用中文实义标题直接起（如「你会亲手做出这两个上线的站」）
- 所有图标来自 **Lucide**，stroke-width 锁定，尺寸只用 16/20/24
- 时长/序号/时间码一律 mono + tabular-nums

### Don't（禁止 · 出现即重写）

1. **任何 emoji 作为功能图标** —— （含 U+1F300–1F9FF、U+2600–26FF、U+2700–27BF 全部码位）一律禁止，UGC 学员评论除外
2. Indigo→Pink 渐变、`background-clip: text` 渐变文字
3. 卡片彩色左边框（`border-left: 3px solid accent`）
4. 每个 section 上方的小型大写追踪标签（`CURRICULUM` / `PRICING`）
5. 编号 section 标记（`01 · 关于` / `02 · 课程`）
6. 「Welcome to」「开启你的 AI 之旅」「解锁无限可能」等空洞文案
7. 相同尺寸卡片 + 图标 + 标题 + 三行文字的无限重复网格
8. 装饰性毛玻璃 / 发光边框 / 粒子背景
9. 卡片圆角 ≥ 24px
10. 虚构指标（「10,000+ 学员信赖」「99.9% 好评」）
11. 1px 边框 + blur≥16px 阴影同时出现在同一元素
12. 奶油/米色背景（OKLCH L 0.84–0.97、C<0.06、hue 40–100 色带）—— 温暖感由琥珀强调色传达，不靠背景

---

## 8. Responsive Behavior

| 断点 | 导航 | 章节列表 | 播放页 |
|---|---|---|---|
| <640px | 顶部 sticky 条 + 底部抽屉 | 单列，行高 64px，类型标签换行到第二行 | 播放器 sticky 顶部；滚动 >200px 缩为右下 mini player（宽 40vw，16:9，可拖） |
| 640–1023px | 顶部条 + 汉堡抽屉 | 单列，行高 60px | 播放器全宽，章节导航为抽屉 |
| 1024–1279px | 顶部条 + 左侧栏 | 左 240px 信息栏 + 右主区 | 双栏 |
| ≥1280px | 顶部条 + 左侧栏 | 左 240px + 右主区 | 三栏 |

- 触摸目标 ≥ **44×44px**，相邻按钮间距 ≥ 8px
- `viewport` 允许缩放（`maximum-scale` 不设限）
- `DESIGN_VARIANCE=7` 的非对称布局在 <768px 一律回退单列

### 无障碍底线

- 正文对比 ≥ 4.5:1，UI 元件 ≥ 3:1。全色对已实测（见下表），**最弱一档 `--meta` 在三种表面上均 ≥ 4.5:1**

| 角色 | Light（on bg / surface / surface-warm） | Dark（on bg / surface / surface-warm） |
|---|---|---|
| `--fg` | 16.74 / — / — | 15.95 / 14.71 / — |
| `--fg-2` | 10.96 | 11.45 |
| `--muted` | 6.36 / 6.71 / 5.98 | 7.50 / 6.92 / 6.26 |
| `--meta` | 4.84 / 5.15 / 4.55 | 5.61 / 5.18 / 4.68 |
| `--accent` | 8.11（白字在 accent 上 8.62） | 6.82（accent-on 在 accent 上 6.88） |
| `--success` / `--warn` / `--danger` | 4.86 / 4.73 / 5.25 | 8.08 / 9.44 / 6.22 |
| `--border-strong` | 3.20 | 3.45 |
| `--border` | 1.21（纯装饰分隔线，WCAG 1.4.11 豁免；**任何交互控件边界必须用 `--border-strong`**） | 1.35（同上） |

- `:focus-visible` 全局 `--focus-ring`，**任何组件不得移除焦点环**
- 所有仅图标按钮必须有 `aria-label`
- 视频必须配字幕轨（.vtt）+ 全文图文版（本课的图文文档同时是无障碍替代文本）
- `prefers-reduced-motion: reduce` → 所有 transition/animation 降至 `0.01ms`，播放器 seek 不做平滑滚动
- 完成状态不能只靠颜色 —— `circle-check` 图标 + 文字状态双通道

---

## 9. Agent Prompt Guide（给前端 Agent 的实现提示）

1. **Token 引用方式**：`import tokens from '@/design/design-tokens.json'` 或直接引 `tokens.css` 的 CSS 变量。组件内**不得出现裸 hex**，ESLint 加 `no-hardcoded-color` 规则拦截。
2. **主题切换**：`<html data-theme="light|dark">`，Landing 默认 light，`/learn/*` 路由默认 dark，读 `localStorage` 用户偏好覆盖，SSR 阶段用内联脚本防闪烁（FOUC）。
3. **字体加载**（Next.js）：`next/font/google` 引 Archivo / Inter / JetBrains Mono（`subsets: ['latin']`，`display: 'swap'`）；Noto Sans SC 用 `next/font/local` + `unicode-range` 分片自托管，**首屏只加载常用 3500 字子集**，其余按需。禁止 4 个字族全量加载（会拖垮 LCP，与 bookconv.com 的性能基线冲突）。
4. **图标**：`lucide-react`，全局封装 `<Icon name size />`，`strokeWidth` 由 size 推导（16/20 → 1.75，24 → 1.5）。**CI 加 emoji 正则扫描**：`/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u` 命中 `src/**/*.tsx` 即 fail（`content/**` UGC 目录白名单）。
5. **状态九态**：任何异步组件必须实现 Default/Hover/Focus/Active/Disabled/Loading/Error/Empty/Success。列表 Loading 用 skeleton 行（复用真实行高，防 CLS），**不用居中 spinner**。
6. **动效**：只允许 `transform` / `opacity` / `background-color` / `border-color` 过渡，禁止动画 `width` / `height` / `top` / `left`。全局包一层 `@media (prefers-reduced-motion: reduce)`。
7. **CLS 防护**：播放器容器用 `aspect-ratio: 16/9` 预留；章节行固定高度；图片全部带 `width`/`height`。目标 CLS < 0.1。
8. **SEO（继承 bookconv.com 打法）**：Landing 与每节图文页均为 SSG，`Course` / `VideoObject` / `FAQPage` 结构化数据齐全，图文版正文是可被索引的真实 HTML（不是视频的附属品）。

---

## 附录 A · 录屏视觉规范（视频与网页的视觉连续性契约）

> 这是本课交付物的核心。录屏是"另一块屏幕"，必须和网页同属一套设计系统，否则学员会感到割裂。

### A.1 录制参数

| 项 | 锁定值 |
|---|---|
| 分辨率 | 1920×1080（不录 4K，压缩后无差别且拖慢流程） |
| 帧率 | 30fps |
| 码率 | 8 Mbps（屏幕内容压缩率高，无需更高） |
| 编码 | H.264 / MP4 |
| 音轨 | 麦克风与系统音**分轨**录制 |
| 单节时长 | **≤ 12 分钟**（零基础受众注意力上限），超了拆节 |

### A.2 IDE 环境锁定（Cursor / VS Code）

```jsonc
{
  "editor.fontSize": 18,
  "editor.lineHeight": 28,
  "editor.fontFamily": "JetBrains Mono",
  "editor.minimap.enabled": false,
  "editor.lineNumbers": "on",
  "breadcrumbs.enabled": false,
  "terminal.integrated.fontSize": 16,
  "terminal.integrated.fontFamily": "JetBrains Mono",
  "workbench.colorTheme": "GitHub Dark Default"
}
```

- 主题锁 **GitHub Dark Default** —— 它与网站 Dark 主题 `#0E1116 / #161A21` 同色系，视频切到网页不跳色
- 关闭：minimap、GitLens inline blame、Error Lens、所有通知、面包屑
- 单显示器录制；桌面壁纸纯 `#0E1116`，无任何图标

### A.3 三档固定布局（不随意切换，学员建立肌肉记忆）

| 档位 | 分屏 | 用途 |
|---|---|---|
| **A 档 · 读写代码** | 编辑器全屏（侧栏 `Cmd+B` 收起） | 讲解与编写代码 |
| **B 档 · 写-跑** | 编辑器 70% / 终端 30%（上下分割） | 装依赖、跑构建、看报错 |
| **C 档 · 验效果** | 编辑器 50% / 浏览器 50%（左右分割） | 前端效果验证、Vercel 部署 |

窗口之间**不得重叠**。切档时给 1 秒静默，便于剪辑。

### A.4 重点标注规范（关键：这是最容易做出 AI 模板味的地方）

- **唯一允许的标注形式**：`--accent` 色 **2px 描边圆角矩形**（radius 6px），0.6s 淡入、保持 2–3s、0.4s 淡出。框内不放文字
- 需要文字时：画面**左下角**一条 32px 高的标签条，背景 `--accent`，文字 `--accent-on`，Noto Sans SC 500 / 16px，**最多 12 个字**
- 缩放：读代码 **2×–3×**，读 UI **1.25×**，指认单个字符 **4×**；缩放动画 300ms `ease-out-soft`
- **禁止**：箭头贴纸、手绘圈、闪烁高亮、放大镜光标特效、彩色马克笔涂抹、任何 emoji 贴纸

### A.5 窗口包装（防 Screen Studio 模板味）

2024–2026 最典型的 AI/模板录屏特征是「彩色渐变背景 + 超大圆角 + 巨大投影」的窗口包装。**本项目明确禁止**。

替代方案：
```
画布背景：纯 #0E1116（无渐变）
窗口圆角：10px
窗口边框：1px rgba(255,255,255,0.06)
窗口阴影：无
四周留白：32px
```

### A.6 片头 / 片尾

- **片头 2 秒静帧卡**：深色底 + 蓝晒网格线（opacity 0.035）+ 节标题（Noto Sans SC 700 / 48px）+ 上方一行 mono meta「模块 03 · 第 2 节 · 09:24」。**无音效、无动效、无 Logo 弹跳**
- **片尾 3 秒**：本节 3 条要点（`list-checks` 图标 + 三行文字）+ 下一节标题。不放订阅引导动画

### A.7 录制习惯（服务后期与图文版生成）

- 每个逻辑步骤结束**停顿 3–5 秒**（给剪辑留切点，也是网页时间轴锚点的来源）
- **高频提交**：每个逻辑步骤一个 commit，commit message 即图文版小标题的草稿
- 变量与文件名写成自解释的（`generateCoverPrompt.ts` 而非 `utils.ts`），视频与图文版共用这套命名
- 摄像头（可选）：右下角 240×180，圆角 10px，1px `--border-soft`，**只在讲思路时出现，写代码时隐藏**

### A.8 视频 ↔ 网页的锚点契约

每节录制完成后必须产出一份 `lesson-XX.chapters.json`：

```json
[
  { "t": 134, "label": "初始化 Next.js 项目", "type": "step" },
  { "t": 460, "label": "写第一条 Cursor 指令", "type": "prompt" },
  { "t": 902, "label": "这里会卡住：环境变量没生效", "type": "pitfall" },
  { "t": 1204, "label": "部署到 Vercel", "type": "step" }
]
```

网页播放页据此渲染「关键节点时间轴」，`type` 决定图标：`step` → `circle-dot`，`prompt` → `message-square-code`，`pitfall` → `triangle-alert`。**这份 JSON 是视频与图文双形态的唯一连接点。**
