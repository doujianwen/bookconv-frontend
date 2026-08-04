# Chat Context Judge — 使用示例

## 概述

chat-context-judge 是一个纯纠错型前置拦截层 Skill，在 Codex CLI 每次收到用户消息时运行，扫描聊天上下文中的错误模式，输出一份结构化 verdict，供主 Agent 决定是否继续执行。

---

## 运行方式

当 Codex CLI 收到用户消息时，自动加载此 Skill 并在主 Agent 执行前运行。

### 触发条件（满足任一即触发完整扫描）

1. 请求中包含格式名称（pdf、epub、mobi 等）
2. 请求中包含文件路径或文件名
3. 多轮对话中的第 2 轮及以后（执行 CJ-02 上下文一致性检查）
4. 请求中出现模糊术语（优化、压缩、修复 等）

---

## 示例 1：格式组合不合法

**用户输入：**
> 帮我把 mobi 文件转成 azw3

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:00:00Z\",
  \"blocked\": true,
  \"verdicts\": [
    {
      \"id\": \"CJ-01-A\",
      \"severity\": \"critical\",
      \"message\": \"格式组合 'mobi→azw3' 不在 supported 矩阵中\",
      \"context_ref\": \"用户请求：'把 mobi 文件转成 azw3'\"
    }
  ],
  \"clean_input\": null,
  \"notes\": \"mobi 和 azw3 同属 Kindle 格式生态，格式相似度极高，转换无实际意义。\"
}
`

**主 Agent 行为：** 收到 locked: true，不执行转换，返回错误提示用户。

---

## 示例 2：路径穿越攻击信号

**用户输入：**
> 转换 E:\\uploads\\../admin/config.txt 为 pdf

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:05:00Z\",
  \"blocked\": true,
  \"verdicts\": [
    {
      \"id\": \"CJ-03-A\",
      \"severity\": \"critical\",
      \"message\": \"检测到路径穿越模式 '..\\\\' 出现在文件路径中\",
      \"context_ref\": \"用户请求中的文件路径：'E:\\\\uploads\\\\../admin/config.txt'\"
    }
  ],
  \"clean_input\": null,
  \"notes\": \"路径穿越攻击信号，拒绝执行。\"
}
`

---

## 示例 3：上下文不一致（多轮对话）

**对话历史：**
1. 用户：\"把 book.pdf 转成 epub\" → 已执行，输出 ook.epub
2. 用户：\"再转一次，这次转成 pdf\"

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:10:00Z\",
  \"blocked\": false,
  \"verdicts\": [
    {
      \"id\": \"CJ-02-A\",
      \"severity\": \"warning\",
      \"message\": \"上下文不一致：上一轮输出为 epub，但本轮目标格式为 pdf，需确认是否对 epub 再转换\",
      \"context_ref\": \"第1轮输出：book.epub | 第2轮输入：'转成 pdf'\"
    }
  ],
  \"clean_input\": \"把 book.epub 转成 pdf\",
  \"notes\": \"已自动修正输入，将文件引用从原始 pdf 更新为上轮输出 epub。\"
}
`

**主 Agent 行为：** locked: false，继续执行，但使用修正后的 clean_input。

---

## 示例 4：已知高风险格式对

**用户输入：**
> 把这本 kindle 电子书转成 pdf

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:15:00Z\",
  \"blocked\": false,
  \"verdicts\": [
    {
      \"id\": \"CJ-04-B\",
      \"severity\": \"warning\",
      \"message\": \"检测到 'kindle' 关键词，可能为 DRM 保护文件，转换可能失败\",
      \"context_ref\": \"用户请求：'把这本 kindle 电子书转成 pdf'\"
    },
    {
      \"id\": \"CJ-04-A\",
      \"severity\": \"warning\",
      \"message\": \"mobi/azw3→pdf 是已知高风险格式对，排版可能丢失\",
      \"context_ref\": \"用户请求：'kindle 电子书转成 pdf'\"
    }
  ],
  \"clean_input\": \"把这本 kindle 电子书转成 pdf\",
  \"notes\": \"两个 WARNING 级问题，主 Agent 可继续执行但应提示用户风险。\"
}
`

---

## 示例 5：模糊术语

**用户输入：**
> 帮我优化一下这本书

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:20:00Z\",
  \"blocked\": false,
  \"verdicts\": [
    {
      \"id\": \"CJ-05-A\",
      \"severity\": \"warning\",
      \"message\": \"请求中出现模糊术语 '优化'，未明确转换目标格式\",
      \"context_ref\": \"用户请求：'帮我优化一下这本书'\"
    }
  ],
  \"clean_input\": null,
  \"notes\": \"无法确定目标格式，主 Agent 应先向用户澄清意图，而非猜测执行。\"
}
`

---

## 示例 6：批量文件模式

**用户输入：**
> 把 file_1.pdf, file_2.pdf, file_3.pdf 都转成 epub

**Chat Context Judge 输出：**
`json
{
  \"agent\": \"chat-context-judge\",
  \"version\": \"1.0.0\",
  \"timestamp\": \"2026-08-03T10:25:00Z\",
  \"blocked\": false,
  \"verdicts\": [
    {
      \"id\": \"CJ-04-C\",
      \"severity\": \"info\",
      \"message\": \"检测到批量文件模式，建议使用 batch 接口以提高效率\",
      \"context_ref\": \"用户请求中的文件列表：'file_1.pdf, file_2.pdf, file_3.pdf'\"
    }
  ],
  \"clean_input\": \"把 file_1.pdf, file_2.pdf, file_3.pdf 转成 epub\",
  \"notes\": \"INFO 级，主 Agent 可正常执行，也可选择提示用户 batch 接口选项。\"
}
`

---

## 文件结构

`
.codex/skills/chat-context-judge/
├── SKILL.md          # 主技能定义（角色、原则、检查清单）
├── checklists.json   # 格式矩阵、安全模式、模糊术语等配置数据
└── README.md         # 本文档
`

---

## 与 ebook-qa-reviewer 的区别

| 维度 | chat-context-judge | ebook-qa-reviewer |
|------|-------------------|-------------------|
| **介入阶段** | 用户输入 → 主 Agent 之前 | 主 Agent 产出 → 部署/合并之前 |
| **检查对象** | 聊天上下文、意图、格式组合 | 代码、PR、配置文件 |
| **检查范围** | CJ-01～CJ-05（5 大类） | A～F（6 大类，技术栈/安全/SEO 等） |
| **是否执行任务** | ❌ 否 | ❌ 否 |
| **阻塞能力** | 可阻塞主 Agent 执行 | 可阻塞 PR 合并 |

两者互补，分别拦截"输入端错误"和"输出端错误"。
