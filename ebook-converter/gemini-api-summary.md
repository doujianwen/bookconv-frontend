# Gemini API 实测结果（2026-11-06 补测）

## 背景
原实测（2026-11-06 11:08-11:30）通过浏览器 UI 测试 Gemini 时，所有问题均卡在「正在搜索网络」。经诊断确认为账号/网络层面的故障，非问题本身难度导致。

本次改用 Gemini API 直接测试，验证 Gemini 对该网站的真实可见性。

## 测试结果

| 问题 | 模型 | 联网搜索 | 来源数 | BookConv提及 |
|---|---|---|---:|---:|
| azw3 vs mobi which is better for kindle | gemini-2.5-flash | ✅ | 12 | ❌ |
| best free online ebook converter | gemini-2.5-flash | ✅ | 3 | ❌ |
| how to convert lit to epub | gemini-2.5-flash | ✅ | 7 | ❌ |
| convert epub to zip file online free | gemini-2.5-flash | ✅ | 6 | ❌ |
| epub to word converter online free | gemini-2.5-flash | ✅ | 10 | ❌ |
| kfx vs azw3 which format should i use for kindle | gemini-2.5-flash | ✅ | 20 | ❌ |
| convertir epub a doc online gratis | gemini-2.5-flash | ✅ | 13 | ❌ |

## 关键结论

1. **Gemini API 完全可用**：7/7 问题成功触发联网搜索，返回完整答案
2. **BookConv 在 Gemini 中零提及**：所有 7 个问题均未出现 bookconv.com
3. **这与浏览器端故障不同**：浏览器端的「未产出」是技术故障，API 端的「零提及」是真实可见性结果
4. **Gemini 不是「未验证区」，而是「已确认未推荐」**

## 建议
- 将 Gemini 的判定从 UNKNOWN 改为「明确未提及」
- 分析为什么 ChatGPT/Perplexity 能推荐我们，但 Gemini 不能
- 这可能与我们在 Google 搜索生态中的位置有关（Gemini 基于 Google Search grounding）
