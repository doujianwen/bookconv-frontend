# BookConv 11/12 SEO/GEO 增长动作：EPUB→DOC 线上事实冲突审计
状态：DONE（研究交付）/ BLOCKED（页面修复与上线）/ OBSERVE（搜索效果）
责任：M1+M2+M3；CEO 验收。未修改源码、未 push。
## 基线
2026-11-02 已记录非品牌查询 epub para doc：25 impressions、0 clicks、平均排名 45.7（巴西）；不是 11/12 实时数据。11/12 GSC 117 URL 固定样本已收录 3/117；非本页排名证据。
线上 https://www.bookconv.com/convert/epub-to-doc 读取显示：顶部“Conversion is not available”且推荐 DOCX；但标题、H1、How-to 第 77-80 行、FAQ 第 179-188 行仍宣称能输出 .doc，批量模块也宣称 convert to doc。存在同页相互否定的功能承诺，损害用户意图匹配与信任。在线文本抓取不是浏览器功能测试。
## 实际动作
完成 Live 文本审计并生成定点修订验收标准；本轮不改代码，因为必须先核对模板共用与后端能力，且 Batch4 每天仅允许首个待执行行。建议：统一为“DOC legacy unavailable, use EPUB→DOCX”并删去/改写所有可下载 .doc、批量 DOC、成功案例、步骤和 FAQ 中的虚假承诺；如果保留 URL，标题与描述应反映 DOC 不可用并提供 DOCX 路径。不得直接把不存在的 .doc 转换标为支持。
## 验收和复测
修复前：逐句事实审计 + 真实后端路由检查；改动≤3页且遵守 Batch4 首行规则；内容审计、重复标题检查、npm build 全部 0 error；本地页面渲染+线上 HTTP/DOM 验收，需单独发布授权。复测日期：2026-11-18；GSC Query×Page 数据按实际延迟重新读取，不把无数据当零。不得把本研究交付当作 SEO 排名增长。
## 红队 L2
断言1：线上存在相互矛盾的 DOC 功能承诺；攻击：文本抓取可能包含旧缓存；裁定：修正为“已观察到的线上 HTML 文本冲突”，待浏览器与版本对照。
断言2：应立即改标题；攻击：可能误伤现有查询，且排期首行/共用模板未知；裁定：暂不改代码，先做精准范围检查。
断言3：修正能提升点击；攻击：无对照实验、低样本；裁定：仅提出假设，OBSERVE。
证据：https://www.bookconv.com/convert/epub-to-doc；项目数据 11/02 GSC 记录；本文件。
残余：真实转换功能未复测、页面源代码差异与部署状态未验。
