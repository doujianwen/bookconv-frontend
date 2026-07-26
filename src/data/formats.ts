export interface FormatInfo {
  name: string
  description: string
  pros: string[]
  cons: string[]
  useCases: string[]
  recommendedConverters: Array<{ label: string; href: string }>
}

const formatMap: Record<string, Omit<FormatInfo, 'recommendedConverters'>> = {
  epub: {
    name: 'EPUB',
    description: 'EPUB（Electronic Publication）是由国际数字出版论坛（IDPF）制定的开放标准，是目前最通用的电子书格式。它基于 ZIP、HTML 和 CSS，支持流式布局和自适应排版。',
    pros: ['跨平台支持（iOS、Android、Kobo、电脑等）', '流式布局，可调节字体大小和行间距', '支持嵌入字体和 CSS 样式', '文件体积小（基于 ZIP 压缩）', '开源标准，社区活跃'],
    cons: ['部分老款 Kindle 设备不支持', '排版复杂时可能出现显示问题', '不支持 DRM 的标准化实现'],
    useCases: ['通用电子书分发', '图书馆借阅（OverDrive 等）', '个人阅读（手机/平板/电纸书）'],
  },
  pdf: {
    name: 'PDF',
    description: 'PDF（Portable Document Format）由 Adobe 开发，是一种固定版式的文档格式。它能在任何设备上保持一致的排版效果，是学术文献和商业文档的首选格式。',
    pros: ['跨平台显示一致，排版不变形', '支持嵌入字体、图片、矢量图形', '适合打印和正式文档分发', '广泛支持，几乎所有设备都能打开', '支持表单、注释和数字签名'],
    cons: ['固定布局，不适合小屏幕阅读', '无法自适应调整文字大小', '文件体积通常较大', '编辑困难，不适合内容修改'],
    useCases: ['学术论文和技术文档', '商业报告和法律合同', '印刷出版物'],
  },
  mobi: {
    name: 'MOBI',
    description: 'MOBI（Mobipocket）是最早被 Kindle 支持的电子书格式之一。虽然已被 AZW3 逐步取代，但仍然是许多老款 Kindle 设备的标准格式。',
    pros: ['几乎所有 Kindle 设备都原生支持', '文件体积相对较小', '兼容性好，广泛流传'],
    cons: ['不支持复杂的排版和高级字体功能', '功能有限，已被 AZW3 取代', '不支持 EPUB 级别的 CSS 样式', '仅建议老款 Kindle 用户使用'],
    useCases: ['老款 Kindle 设备阅读', '简单的纯文本电子书', 'Kindle 经典款用户'],
  },
  azw3: {
    name: 'AZW3',
    description: 'AZW3（Kindle Format 8）是亚马逊为 Kindle 设备开发的高级电子书格式，于 2011 年发布。它支持更好的排版效果和字体渲染，是 Kindle 生态中的主流格式。',
    pros: ['Kindle 原生支持，排版效果最佳', '支持更好的字体渲染和表格显示', '保留复杂的 CSS 样式', '支持书签、笔记和高亮'],
    cons: ['仅限 Kindle 设备和 App 使用', '兼容性不如 EPUB', '非开源标准'],
    useCases: ['Kindle Paperwhite / Oasis 阅读', '需要精细排版的小说', 'Kindle Unlimited 内容'],
  },
  txt: {
    name: 'TXT',
    description: 'TXT 是最简单、最基础的纯文本格式。它不包含任何格式化信息，只存储原始文字内容，是所有格式中最通用的一种。',
    pros: ['Universal 兼容性，任何设备都能打开', '文件体积极小', '易于编辑和处理', '无编码问题（ASCII/UTF-8）'],
    cons: ['不支持任何格式（粗体、斜体等）', '没有元数据（标题、作者等）', '无法保存排版信息', '不适合有复杂结构的文档'],
    useCases: ['纯文本小说', '代码和脚本文件', '快速笔记和备忘录'],
  },
  docx: {
    name: 'DOCX',
    description: 'DOCX 是 Microsoft Word 2007 及以后版本使用的默认文件格式。它是一种基于 XML 的开放格式，广泛用于办公文档和电子书创作。',
    pros: ['Microsoft Word 原生支持', '强大的格式编辑功能', '支持嵌入图片、表格、样式', '易于协作和修订'],
    cons: ['不是专门的电子书格式', '在不同阅读器中可能显示不一致', '文件体积相对较大', '需要额外转换才能用于电子书阅读器'],
    useCases: ['电子书初稿编写', '学术论文和报告', '需要协作编辑的文档'],
  },
  rtf: {
    name: 'RTF',
    description: 'RTF（Rich Text Format）是一种跨平台的富文本格式，由 Microsoft 在 1987 年推出。它支持基本的文本格式化，如粗体、斜体和下划线，同时保持较好的兼容性。',
    pros: ['跨平台兼容性好', '支持基本文本格式化', '几乎所有文字处理器都能打开', '文件体积适中'],
    cons: ['不支持复杂排版和高级格式', '图片支持有限', '已逐渐被 DOCX 取代', '编码问题可能导致乱码'],
    useCases: ['简单的富文本交换', '旧系统数据迁移', '邮件附件文档'],
  },
  jpg: {
    name: 'JPG/JPEG',
    description: 'JPG（JPEG）是一种广泛使用的有损图像压缩格式。在电子书领域，它常用于将书籍页面转换为图像格式，适合不需要文字搜索的场景。',
    pros: ['极高的压缩率，文件体积小', '所有设备都能显示', '适合照片和复杂图像', '支持 24 位色彩'],
    cons: ['有损压缩，多次保存后质量下降', '不支持透明背景', '不适合纯文本或线条图', '无法进行文字搜索和复制'],
    useCases: ['扫描件转图像', '图片型电子书', '无法提取文字的老旧文献'],
  },
  png: {
    name: 'PNG',
    description: 'PNG（Portable Network Graphics）是一种无损图像压缩格式，支持透明背景和 24 位色彩。在电子书中常用于高质量图像保存。',
    pros: ['无损压缩，质量不损失', '支持透明背景', '适合线条图和截图', '广泛的浏览器和设备支持'],
    cons: ['文件体积比 JPG 大', '不支持动画', '不适合照片类内容', '不支持 32 位色彩'],
    useCases: ['高质量图像保存', '带透明背景的素材', '技术文档截图'],
  },
  html: {
    name: 'HTML',
    description: 'HTML 是万维网的基础标记语言。作为电子书格式，它可以直接用浏览器打开，适合需要保留网页结构和样式的场景。',
    pros: ['直接用浏览器打开，无需专用软件', '易于编辑和修改', '支持超链接和多媒体', '与 Web 技术完全兼容'],
    cons: ['不是专用电子书格式', '缺乏 DRM 保护', '在不同浏览器中显示可能有差异', '不适合离线阅读'],
    useCases: ['在线文档和知识库', '技术手册', '网页内容存档'],
  },
  fb2: {
    name: 'FB2',
    description: 'FB2（FictionBook）是一种专为俄语区设计的电子书格式，基于 XML。它在俄罗斯和前苏联国家非常流行，特别适合小说和文学作品。',
    pros: ['专为小说设计，排版优美', '基于 XML，结构清晰', '支持元数据和封面', '俄语区广泛支持'],
    cons: ['主要在俄语区流行', '西方设备支持有限', '不支持复杂排版', '社区规模较小'],
    useCases: ['俄语小说和文学', '前苏联地区阅读', 'XML 格式电子书'],
  },
  lit: {
    name: 'LIT',
    description: 'LIT 是微软为 Windows Mobile 和 Pocket PC 开发的电子书格式。它是早期移动阅读的重要格式，现已被更现代的标准取代。',
    pros: ['Windows Mobile 原生支持', '支持基本的 DRM 保护', '文件体积适中'],
    cons: ['已停止维护，仅支持老旧设备', '兼容性差', '功能有限', '已被 EPUB 取代'],
    useCases: ['老款 Windows Mobile 设备', '历史文献存档', 'Legacy 系统兼容'],
  },
  cbr: {
    name: 'CBR',
    description: 'CBR（Comic Book RAR）是一种用于漫画和图像的电子书格式，实际上就是 RAR 压缩包重命名。它按页存储漫画图像，是漫画读者的常用格式。',
    pros: ['天然适合漫画连载', 'RAR 压缩率高', '广泛支持漫画阅读器', '支持彩色漫画'],
    cons: ['不支持文字搜索', '需要漫画专用阅读器', '文件体积可能较大', '非标准电子书格式'],
    useCases: ['漫画和图像小说', '连环画存档', '漫画连载阅读'],
  },
  djvu: {
    name: 'DJVU',
    description: 'DJVU 是一种专为扫描文档优化的图像压缩格式，由 AT&T 开发。它的压缩率远高于 PDF，特别适合大量扫描页面的文档。',
    pros: ['极高的压缩率，远优于 PDF', '适合大量扫描页面', '保持清晰的文字渲染', '支持多层图像'],
    cons: ['兼容性较差', '需要专用阅读器', '编辑困难', '社区支持有限'],
    useCases: ['古籍和文献扫描', '大量扫描文档', '档案保存'],
  },
  doc: {
    name: 'DOC',
    description: 'DOC 是 Microsoft Word 97-2003 版本的默认文件格式。虽然已被 DOCX 取代，但在许多旧系统中仍然广泛使用。',
    pros: ['广泛存在于历史文档中', '几乎所有文字处理器都能打开', '支持基本格式化'],
    cons: ['已停止更新，安全性较低', '不支持现代排版功能', '文件体积较大', '跨平台兼容性不如 DOCX'],
    useCases: ['历史文档读取', '旧系统兼容', '法律和政府文档'],
  },
  word: {
    name: 'Word (DOCX)',
    description: 'Word 文档（DOCX）是当今最常用的办公文档格式，由 Microsoft Office 套件使用。它是电子书创作和协作的标准起点。',
    pros: ['全球最流行的文档格式', '强大的编辑功能', '丰富的模板和样式', '云协作支持好'],
    cons: ['不是电子书专用格式', '需要转换才能用于阅读器', '不同版本间兼容性问题'],
    useCases: ['电子书创作起点', '协作编辑', '正式文档'],
  },
  text: {
    name: 'Text',
    description: '纯文本格式（Text/TXT）是最基础的文档格式，不包含任何格式信息。它是所有文本处理的基础格式。',
    pros: ['最简单的格式', '零兼容性障碍', '最小的文件体积', '易于程序化处理'],
    cons: ['无格式支持', '无元数据', '无结构化能力'],
    useCases: ['代码文件', '日志文件', '纯文本笔记'],
  },
}

// Generate recommended converters dynamically based on format relationships
function getRecommendedConverters(slug: string): Array<{ label: string; href: string }> {
  const converters: Record<string, Array<{ label: string; href: string }>> = {
    epub: [
      { label: 'PDF → EPUB', href: '/convert/pdf-to-epub' },
      { label: 'MOBI → EPUB', href: '/convert/mobi-to-epub' },
      { label: 'AZW3 → EPUB', href: '/convert/azw3-to-epub' },
      { label: 'DOCX → EPUB', href: '/convert/docx-to-epub' },
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
    ],
    pdf: [
      { label: 'EPUB → PDF', href: '/convert/epub-to-pdf' },
      { label: 'AZW3 → PDF', href: '/convert/azw3-to-pdf' },
      { label: 'MOBI → PDF', href: '/convert/mobi-to-pdf' },
      { label: 'DJVU → PDF', href: '/convert/djvu-to-pdf' },
    ],
    mobi: [
      { label: 'EPUB → MOBI', href: '/convert/epub-to-mobi' },
      { label: 'AZW3 → MOBI', href: '/convert/azw3-to-mobi' },
      { label: 'MOBI → TXT', href: '/convert/mobi-to-txt' },
      { label: 'MOBI → EPUB', href: '/convert/mobi-to-epub' },
    ],
    azw3: [
      { label: 'EPUB → AZW3', href: '/convert/epub-to-azw3' },
      { label: 'AZW3 → EPUB', href: '/convert/azw3-to-epub' },
      { label: 'AZW3 → PDF', href: '/convert/azw3-to-pdf' },
      { label: 'AZW3 → MOBI', href: '/convert/azw3-to-mobi' },
    ],
    txt: [
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
      { label: 'MOBI → TXT', href: '/convert/mobi-to-txt' },
      { label: 'EPUB → TXT', href: '/convert/epub-to-txt' },
    ],
    docx: [
      { label: 'DOCX → EPUB', href: '/convert/docx-to-epub' },
      { label: 'EPUB → Word (DOCX)', href: '/convert/epub-word' },
    ],
    rtf: [
      { label: 'RTF → EPUB', href: '/convert/rtf-to-epub' },
      { label: 'EPUB → RTF', href: '/convert/epub-to-rtf' },
    ],
    jpg: [
      { label: 'EPUB → JPG', href: '/convert/epub-to-jpg' },
      { label: 'EPUB → PNG', href: '/convert/epub-to-png' },
    ],
    png: [
      { label: 'EPUB → PNG', href: '/convert/epub-to-png' },
      { label: 'EPUB → JPG', href: '/convert/epub-to-jpg' },
    ],
    html: [
      { label: 'HTML → EPUB', href: '/convert/html-to-epub' },
      { label: 'EPUB → HTML', href: '/convert/epub-to-html' },
    ],
    fb2: [
      { label: 'FB2 → EPUB', href: '/convert/fb2-to-epub' },
      { label: 'EPUB → FB2', href: '/convert/epub-to-fb2' },
    ],
    lit: [
      { label: 'LIT → EPUB', href: '/convert/lit-to-epub' },
      { label: 'EPUB → LIT', href: '/convert/epub-to-lit' },
    ],
    cbr: [
      { label: 'CBR → PDF', href: '/convert/cbr-to-pdf' },
    ],
    djvu: [
      { label: 'DJVU → PDF', href: '/convert/djvu-to-pdf' },
    ],
    doc: [
      { label: 'DOC → EPUB', href: '/convert/doc-to-epub' },
    ],
    word: [
      { label: 'EPUB → Word', href: '/convert/epub-word' },
    ],
    text: [
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
    ],
  }
  return converters[slug] || []
}

export const FORMAT_DATA: Record<string, FormatInfo> = {}
for (const [slug, data] of Object.entries(formatMap)) {
  FORMAT_DATA[slug] = {
    ...data,
    recommendedConverters: getRecommendedConverters(slug),
  }
}

export function getFormatData(slug: string): FormatInfo | undefined {
  return FORMAT_DATA[slug.toLowerCase()]
}

export const SUPPORTED_FORMAT_SLUGS = Object.keys(FORMAT_DATA)