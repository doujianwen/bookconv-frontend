# 证据目录与发布范围

日期：2026-11-01。原始分析与修复验收分开保存。

已随仓库归档的小型验收材料：

- `production-release-check.json`：117个公开URL首跳复核，采用redirect=manual，包含状态、Location与检查标志。
- `local-release-check.json`：本地生产服务验收摘要，不能替代生产结果。
- `production-conversion-smoke.json`：自撰样本TXT→EPUB→TXT代表路线，含hash、响应与首尾文本检查，不包含用户书籍。
- `dataset-download-check.json`：3个公开数据集下载的HTTP状态、行数和字段核对。

完整分析期GSC返回、页面图、用户CSV和188份HTML属于本地证据，不在公共仓库发布；01—05报告中的相对证据链接在原工作目录可用，远程克隆可能缺少这些原始文件。完整资料仍在本目录本地保存，未删除。

分析期`manifest.json`的read-only scope、116个200及canonical差异是当时跟随跳转后的口径。4个旧别名的final字段指向规范目标，不证明首跳200。修复后结果以production-release-check.json的时间和首跳字段为准。Google索引状态不能由HTTP结果推断。
