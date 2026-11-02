# BookConv 专项治理｜CP0–CP2 冻结记录｜2026-11-02

状态：方案冻结，允许进入最小源码治理；并非已修复/已发布。
执行者：ChatGPT Work 主代理持续编排 WebCodex 单步执行。真实启动证据：AGENTS.md、治理协议、日志、源码读取及 _wb_tmp/bookconv-special-20261102/baseline.json。
基线 HEAD：320f5eabdd7b2c113b40186767016841640ef636。用户现有 dirty 文件与未跟踪测试保留、不纳入本轮提交。源文件原始字节备份在同目录 backup/。
用户已明确授权本轮必要安全发布，覆盖旧项目规则中须人工 push 的流程；不增加成本、不处理凭据/不可逆操作。

## CP0 原始数据
上传原件与本地原件 SHA256 一致：
- Page：6c9c1749fb576a4506c9fb68afda14c897e799017583abcc32efc32116cb0218；39行/39唯一URL，305展示/11点击，CTR 3.6066%。
- Query：40a32d0a527f49bdec2eec4089f6a2e419e9dfc13751d2a9b6fbbd17a9e183b4；33行/33唯一查询，150展示/10点击，CTR 6.6667%。
- 西语边界 path==/es 或 startsWith('/es/')：14 URL、28展示、0点击；仅匹配 /es/ 会漏掉首页5展示，得到13/23。非重复行问题。
- 请求日期10月1–31日含首尾31天，windowDays=30标签与日期跨度不一致。不能凭标签称标准30天、不能无每日数据断言实际数据截止10月29日。
- Query与Page是独立聚合；不能建立query→page归属，不能将25展示的epub para doc与30展示的epub-to-doc一一匹配；para亦不能单独证明西语用户或国家。需要query,page,country,date联合数据后再细分。查询返回的10点击均为bookconv，不能由此推出全站所有11点击皆品牌。

## CP1 第一轮只读红队 L2
| 断言 | 攻击与证据 | 裁定/级别 |
| --- | --- | --- |
| DOC页已经有拦截所以承诺一致 | API/disabled有拦截，但meta/hero/正文/FAQ/Quick Answer/HowTo仍说能产出DOC | 推翻，P0承诺冲突 |
| DOCX替代链接可用 | live 301 docx→word→blog；CONTENT_MAP未登记word，底层epubToDocx真实存在 | 推翻，P0路径失效 |
| DOCX保留图片和标题样式 | buildDocxFromText仅w:p/w:r/w:t，无media/styles，需输出结构实测 | 推翻，P1 |
| PDF页面仍宣称内置OCR | 当前页明确无OCR，旧诊断过时；但仍有智能表格、多栏恢复、保证图片、100MB所有路径及2分钟等无证据承诺 | 修正，P1 |
| 100MB与4MB必然矛盾 | 单文件R2直传100MB（when enabled）与fallback/batch4MB不同；live capability GET200，真正PUT成功尚未验证 | 修正；不得降低真实直传上限 |
| 批量50/20冲突仍存在 | 现有UI为EPUB→TXT/ZIP20，其余3，每个4MB，public beta免费；旧50项说法未命中当前范围 | 不重复修复 |
| 所有14个ES URL都应重建 | 9个当前历史路径404、5个真实译文200；快照只证明访问不证明索引。无需求和译文证据不恢复/删除/批量重定向 | 否决扩大范围 |
| ES sitemap已单一来源 | es-routes有白名单，但sitemap内又定义同名convert数组；Schema语言/URL固定英文 | 修正，P1一致性 |

## CP2 冻结方案与N2/N3回执
1. b1：保留已有DOC英文/西语URL、200、自指canonical、双向hreflang和既有索引策略，将其改为能力限制与DOCX替代说明；移除不能兑现的直接DOC操作文案。恢复既有 /convert/epub-to-word 真实DOCX工具，/convert/epub-to-docx 单跳301至工具；替代href直接指工具。b1共3个内容URL。
2. b2：PDF→EPUB保留标题与URL，改正文为文本PDF优先、无内置OCR、结果需检查、额度/时限可能失败；明确R2单文件与fallback/batch上限区别。Word博客保留URL/标题但纠正图片/格式/多版本/无条件100MB并接到工具。b2共2个内容URL。
3. 共享渲染：unsupported Quick Answer用真实限制和替代；不展示unsupported批量CTA；JSON-LD不再给unsupported HowTo/可用软件承诺；按locale生成真实URL/inLanguage。支持路径保留既有Schema形态。
4. sitemap使用现有ESP_CONVERT_SLUGS权威数组；登记恢复工具并更新实际改动日期；不增加无译文/es工具。
5. 对既有已完成任务M2-14做补充治理记录，不虚改他人正在改的任务数据/执行计划。新状态放本轮目录并关联既有任务。
6. 运行实际DOCX输出测试、路由/Schema/content防回归、内容完整性/重复标题/tsc/lint/build；独立CP8红队，安全提交仅本轮白名单；fetch后确认远程基线和发布路径。发布前失败不提交；线上逐URL及转换实测失败不宣称解决。
7. 备份与回滚：仅还原本轮文件或revert本轮commit，重部署上一已验收版本；不reset/clean/stash整个dirty树，不带入未授权并发修改。

断言攻击：恢复工具是否吃掉博客排名？工具与博客均保留自指，工具回答操作，博客回答说明，不删除/改跳博客。是否把100MB假改4MB？只区分上传路径，不改配置。是否借SEO修转换引擎？不改引擎/额度/收费。是否误配查询语言？不做语言归因、不新增语言页。共享Schema影响面用现有及新测试锁定。
裁定：冻结以上范围；CP0原文完整读取仍BLOCKED：当前工具目录及WebCodex manifest均无read_thread，Personal Context不是原文替代。此阻塞只影响原文完备性，不阻止执行当前用户完整明确授权。
残余：GSC联合映射、Google索引状态及28/56日增长效果需后续真实数据；当前不承诺排名、CTR提升或转换成功率。

