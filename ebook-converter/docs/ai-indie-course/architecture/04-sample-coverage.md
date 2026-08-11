# Project Gutenberg 样本书格式覆盖度分析

> 用途：回答 PM 的 AC-6 闸门问题——Gutenberg 书目能否支撑首批 30 页转换对的多样性。
> 数据来源：Project Gutenberg 官方目录 API（gutendex.com），非二手记忆。
> 取样：book #11（Alice in Wonderland）、#1342（Pride and Prejudice），两者格式集一致。

## 一、Project Gutenberg 实际提供的格式

经 API 实测，Gutenberg 每本书稳定提供以下下载格式：

| MIME 类型 | 扩展名 | bookconv 中的对应源格式 |
|-----------|--------|------------------------|
| `application/epub+zip` | `.epub3.images` | **epub**（直接可用） |
| `application/x-mobipocket-ebook` | `.kf8.images` | **azw3**（KF8 即 AZW3 内部格式，Calibre 按 azw3 读取） |
| `text/html` | `.html.images` | **html**（直接可用） |
| `text/plain; charset=utf-8` | `.txt.utf-8` | **txt**（直接可用） |
| `application/octet-stream` | `-h.zip` | zipped html（可解出 html） |

**Gutenberg 不提供**：PDF、RTF、DOCX、DOC、FB2、LIT、CBR、DJVU、CHM、AZW（旧版）。
（PDF 曾有，现代 Gutenberg 已停止生成；取样两本均无 PDF。）

## 二、bookconv 30 个转换对 × 样本可得性矩阵

### A. Gutenberg 直接提供源样本（16 对，首批主力）

| 转换对 | 源格式 | Gutenberg 源 |
|--------|--------|-------------|
| epub-to-azw3 | epub | epub3 ✓ |
| epub-to-rtf | epub | epub3 ✓ |
| epub-to-jpg | epub | epub3 ✓ |
| epub-to-html | epub | epub3 ✓ |
| epub-to-doc | epub | epub3 ✓ |
| epub-to-pdf | epub | epub3 ✓ |
| epub-to-png | epub | epub3 ✓ |
| epub-to-mobi | epub | epub3 ✓ |
| epub-to-txt | epub | epub3 ✓ |
| epub-to-word | epub | epub3 ✓ |
| epub-to-zip | epub | epub3 ✓ |
| azw3-to-epub | azw3 | kf8 ✓（KF8=AZW3） |
| azw3-to-mobi | azw3 | kf8 ✓ |
| azw3-to-pdf | azw3 | kf8 ✓ |
| html-to-epub | html | html ✓ |
| txt-to-epub | txt | txt ✓ |

> 11 个 epub 源对全部直接覆盖。这是流量最大的部分，与 SEO 选品天然契合。

### B. 需引导生成样本（9 对，可用但需注意数据完整性）

用 bookconv/Calibre 先把 Gutenberg 的 epub 转成目标源格式，再用该产物作输入样本。

| 转换对 | 引导路径 | 数据完整性风险 |
|--------|----------|----------------|
| rtf-to-epub | epub→rtf→样本 | 低（rtf 保真度高） |
| docx-to-epub | epub→docx→样本 | 低 |
| doc-to-epub | epub→docx→样本 | 低（doc≈docx） |
| pdf-to-epub | epub→pdf→样本 | **中**（pdf 是有损排版容器，引导产物可能丢结构） |
| mobi-to-txt | kf8→mobi→样本 | 低 |
| mobi-to-epub | kf8→mobi→样本 | 低 |
| mobi-to-pdf | kf8→mobi→样本 | 低 |
| lit-to-epub | epub→lit→样本 | 中（lit 已停产，转换器维护度低） |
| lit-to-mobi | epub→lit→样本 | 中 |
| fb2-to-epub | epub→fb2→样本 | 低 |

**风险点**：引导样本是「转换的产物」，本身可能带转换瑕疵。若输入已退化，`verifyConversion` 测的是「垃圾进、垃圾出」的往返，报告结论可信度下降。
**缓解**：首批优先用 A 类直接样本；B 类仅选低风险的（rtf/docx/mobi），跳过 pdf-to-epub 这种双向都有损的对。

### C. Gutenberg 无法提供，需其他公共领域来源或排除（4 对）

| 转换对 | 源格式 | 为什么 Gutenberg 没有 |
|--------|--------|----------------------|
| cbr-to-pdf | cbr | CBR 是漫画压缩包，Gutenberg 以文字书为主，无漫画 |
| djvu-to-pdf | djvu | DjVu 面向扫描文档，Gutenberg 不生成 |
| chm-to-mobi | chm | CHM 是 Windows 编译帮助，小众 |
| azw-to-mobi | azw | 旧版 Amazon 格式，Gutenberg 只提供新版 kf8 |

**处置**：首批 30 页**排除**这 4 对。它们本就是低搜索量长尾，不影响首批质量；后续如需覆盖，cbr/djvu 可找 Internet Archive 的公共领域扫描本，chm/azw 优先级最低。

## 三、结论：AC-6 闸门可启动

**Gutenberg 样本覆盖度足以支撑首批 30 页，且无需触碰版权红线。**

可用的转换对池 = A 类 16 对（直接）+ B 类 9 对（引导，选低风险约 6 对）= **22 对**，超过 30 页所需的格式对多样性（每对可用多本样本书生成不同内容的页面，轻松凑满 30 页）。

**首批选品建议**：
1. 优先全选 A 类 16 对——直接样本、零引导风险、流量最大。
2. 从 B 类选 6 个低风险对补足到 22 对（rtf-to-epub、docx-to-epub、doc-to-epub、mobi-to-txt、mobi-to-epub、fb2-to-epub）。
3. 每对至少 2 本不同样本书（如有图/无图、长篇/短篇），保证页面内容不雷同。
4. 排除 C 类 4 对与 B 类中 pdf-to-epub、lit-to-* 等高引导风险对。

**给 PM 的口径**：AC-6 闸门的「样本书清单」可全部从 Gutenberg 获取，无需任何外部来源；首批 30 页的格式对多样性由 22 个可用对覆盖，绰绰有余。

## 四、一个架构层面的提醒（非阻塞）

`verifyConversion()` 的设计前提是「输入是干净的原始样本」。当我们用引导样本（B 类）时，输入已经过一次转换，实测结论反映的是「往返转换」而非「原始格式→目标格式」的单程质量。

建议：兼容性报告页应**标注样本来源**（`sample.source` 字段已在 openapi.yaml 里定义为 `Project Gutenberg #N`），并对引导样本额外标注 `sample.bootstrapped: true` 与引导路径。这样报告数据可追溯，也方便后续若有原始格式样本时替换复测。

这一条写进 `openapi.yaml` 的 schema 扩展即可，不影响 AC-6 启动。
