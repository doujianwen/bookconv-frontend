# 历史西语 URL 恢复交付

日期：2026-11-02（Asia/Shanghai）。本轮方案独立红队复审及候选终审已完成，无新增发布阻断。源码基线 f59c1e753ee3366dbb48b380481abd0f893fcc05；并发经营数据与其他任务文件保留，不纳入提交。

## 内容与路由决定

恢复200：/es、/es/convert、/es/privacy、/es/blog、/es/blog/txt-to-epub、/es/convert/html-to-epub、/es/blog/tag/epub。前6页可索引；EPUB标签沿用既有noindex、排除sitemap，仅恢复真实西语集合导航。

FB2/workflow标签保持404，当前没有真实西语集合或明确等价迁移目标；清除英文标签页指向不存在西语页的hreflang。没有新增301，没有全局放开/es，没有批量noindex。

西语首页改为单独服务端内容，避免重用未经证实的速度、用户数、全Calibre等旧承诺。英文首页移至HomePageClient，内容不变。转换目录依实际内容和能力筛选，DOC仅限制说明。博客及标签先筛选完整真实译文再分页，卡片/结构化数据/语言链接一致。静态路由资格与sitemap共享清单，语言helper按资格输出英西双向关系，统一/es规范URL。修复语言切换404及旧cookie优先导致URL语言失配；英文和西语middleware都覆盖可信语言头。

## 验证证据

- 本地生产构建通过，TypeScript通过，tracked lint通过；完整43套433项测试通过。
- SEO critic 0 critical / 0 warn；内容完整性0错误/0警告；代码与GEO审计见本目录日志，不以零阻断冒充零存量警告。
- 本地20URL检查，加内链、sitemap、meta、语言信号、相反cookie及请求头，共85断言通过（local/results.json）。
- 真实生产接口6个小样本：复杂HTML与UTF8 TXT走local-js成功；HTM和伪HTML文本走backend成功；空HTML与旧编码TXT500。下载产物与原始响应见runtime/results.json。
- HTML fallback保留西语文字/重音，丢弃图片/CSS/链接目标/脚本，单文档导航；TXT fallback只生成一个正文文档和一条导航，非自动多章目录。内部默认标题Converted Document、语言en问题已在西语内容中披露。小样本不证明大文件或所有文档成功。

## 未决接口风险

空HTML、旧编码TXT的500仍待专项修复；本轮未改转换引擎或接口错误处理，未宣称全功能测试通过。页面正文明确使用非空UTF8、检查输出；后续应将无效输入转为可解释4xx，并复测各执行路径。fallback默认语言/标题及文本简化亦非本轮引擎修复范围。

## 文件来源与回滚

用户要求唯一资料来源：此前workspace outputs/bookconv-governance整体迁至本项目docs/tasks/bookconv-special-20261102/evidence；原zip迁入同级目录。证据在本地项目保存，经营数据不推公共GitHub。旧源码备份的.ts/.tsx增加.source.txt后缀以免被项目编译，内容未改，映射见evidence-relocation.json。旧清单保留为历史证据，迁移清单另存。新增报告、红队记录、脚本、样本、测试日志及今天工作日志均只在本项目保存。

回滚用revert本轮提交或回退上一验收部署，禁止reset/clean整个并发工作区；新恢复URL500、错误canonical/语言、核心转换回归时回滚本轮修复，再复测原英文PDF/Word及西语工具。

28/56天观察以本轮实际发布日期D0计；如11/2发布则11/30和12/28，GSC final数据齐全后再评估。Page/Query分开、HTTP与Google历史索引分开。9URL原始21展示0点击，仅小样本，不宣称稳定排名或增长因果。

## 发布与线上验收

待实际提交/发布后追加，当前文档不提前宣称发布成功。
