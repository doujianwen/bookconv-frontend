# BOOKCONV_DATA_ASSET_AUDIT — 历史数据资产盘点执行报告

> 执行日期：2026-09-07。范围：本机全部 BookConv 相关目录。约束：只做发现/识别/抽取/标准化/清单，**无结论、无美化、无补数、无异常值删除**。

## 一、扫描规模

- 扫描根目录 3 个：`E:\一人公司\电子书格式转换站\`、`E:\一人公司\独立站\`、`E:\一人公司\_root_files_quarantine_2026-07-29\ebook-converter-frontend\`（即 bookconv-frontend 隔离副本）。
- 排除：`node_modules / .git / .next / geoflow vendor 框架文件`。
- **发现数据扩展名文件 2,130 个**（.json 548 / .md 1,346 / .csv 96 / .xlsx 10 / .db 5 / .html 33 / .log 13 / .txt 77 / .sql 2）；剔除框架/备份噪音后实质相关文件 **752 个**。
- 机器可读数据集实际入库：GSC 8 类、Bing 4 类、SERP 4 来源、Reddit 1、意图系统 14 表、内容 109 页、事件 996 条。资产总大小 3.1 MB。
- 全量清单：`raw_inventory.csv`（含 file_path / file_type / file_size / row_count / fields / source_guess）。

## 二、各渠道数据覆盖

| 问题 | 答案 |
|---|---|
| Google 数据覆盖多久 | **2026-07-23 → 2026-09-04**（日级序列；站点 7/26 上线，前 3 天为 GSC 报告窗口起点）。UI 快照导出仅 8/10、8/11、8/13、8/30、9/5(GenAI) 五个时点 |
| Bing（传统）数据覆盖多久 | 日级 overview **7/26 → 9/5**；KeywordReport / PageTrafficReport 仅 **8/30、9/3、9/7 三个快照** |
| Bing AI 数据覆盖多久 | citations 日级 **7/27 → 9/5**（7 个快照导出合并）；AIPageStats / AISearchQueries 为 8/28~9/7 七个快照 |
| SERP 数据覆盖多久 | **无时间序列**：4 个时点（7/9 Ahrefs、8/1 Brave、8/9 人工四批、8/11 审计） |
| Reddit 数据覆盖多久 | 17 条信号，**原始数据无日期字段** |
| User Intent 数据多少条 | questions 267 / clusters 20 / question_cluster 267 / monitors 131 / briefs 18 / personas 9 / scenarios 63 / products 2 / entities 20 / prompts 10 / keywords 41（含 0 命中的 keyword_hits 表） |
| Content 数据多少条 | 109 页（blog 58 / guide 21 / convert 30），56 页有显式发布日期 |
| Citation 数据多少条 | 意图系统人工 citations 129 条（三态：cited / brand_only / not_found 均有实例）+ Bing AI 机器记录 829 行 |
| Monitoring 数据多少条 | 131 个 monitor（target_engines=ChatGPT,Gemini,Claude,Perplexity；weekly） |

## 三、数据完整性 / 重复 / 断层

- **重复数据（已识别、未删除）**：
  - `数据分析/bing_archive/` 内 4 个文件与主目录 9/3 导出完全同构（标准化行带 `note=archive_dup`）。
  - 主目录 4 个 `(2)` 后缀文件为同名重复导出（`note=filename_dup`）。
  - 各数据集文件内完全重复行 = 0（见 `reports/data_quality.csv`）。
- **明显时间断层**：
  1. GSC query×date 逐日数据仅存在于 9/3、9/4 两次 API 快照（覆盖 7/26 起）；此前日期只有总量与 Top 行。
  2. GSC UI 快照只有 5 个时点，且散落导出（`查询数.csv` 等）无导出日期（snapshot_date=unknown）。
  3. Bing 关键词/页面两报告仅 3 个快照，不能构成趋势。
  4. GA4 **无原始数据**，仅 10 份 md 分析报告。
  5. 8/13~8/17 GSC 官方 logging error 期间数据可靠性受限（项目已知，标注于分析文档，本库未改动数值）。
- **空值说明**：`data_quality.csv` 的 null_* 为「该列对某些维度不适用」的结构性空值（如 query 维度行的 page_key 为空），非数据缺失。

## 四、数据用途适配（基于数据形态，非业务判断）

| 用途 | 最适配的数据 | 理由 |
|---|---|---|
| SEO 案例 | `google/` 日级序列 + `events/` + Bing URL 索引状态 | 有 7/26→9/4 连续日级序列、8/18 前后窗口、页面级索引状态证据链 |
| GEO 案例 | `ai_search/`（Bing AI citations 日级 + 查询级 Citation Share）+ GSC GenAI 展示导出 + 意图系统 citations 三态 | 双引擎（Bing AI / Google GenAI）引用时序 + 人工监测记录互补 |
| AI Automation 案例 | `user_intent/`（131 monitors + 129 citations + 267 questions + 18 briefs）+ `events/`（996 条可追溯事件） | 完整的「意图→监测→引用→内容」自动化管线记录 |
| Upwork Portfolio | content 109 页 + ai_search citation share + serp 竞品数据 | 有产出物（URL 可验证）、有分页引用份额、有竞争格局证据 |
| 需继续积累 | GA4 原始导出、Bing 关键词/页面报告（固定周期导出）、SERP 定时快照、Reddit 信号日期 | 当前均无时间序列或无原始数据 |

## 五、可追溯性

- 每条标准化记录带 `source_file`（绝对路径）+ `snapshot_date`（如原始文件有）。
- 抽取过程全程日志：`reports/extraction_log.txt`（含每个写出的文件、行数、跳过原因）。
- 全部脚本可复跑：`_scripts/scan_files.py → extract_all.py → extract_overview.py`。
- 质量统计：`reports/data_quality.csv`（12 个数据集 × row_count / date_min / date_max / unique / null / duplicate）。

## 六、本库未做的事（红线遵守情况）

- 未做业务结论、未写营销文案、未挑选数据。
- 未猜测/补造任何缺失值（缺失=空）。
- 未删除任何异常值或重复行（重复仅标注）。
- 未把 citation 换算成 visit、impression 换算成 click、AI 引用并入传统搜索（两数据集物理分离）。
- 未修改任何原始文件。
