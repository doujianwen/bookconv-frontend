export const slug = 'ebook-formats-explained';
export const title = '电子书格式全解析：EPUB、AZW3、MOBI 怎么选？';
export const date = '2026-07-12';
export const author = 'Admin';
export const tags = ['电子书格式', '科普', '对比'];

export const content = {
  intro: 市面上有几十种电子书格式，每种都有自己的特点和适用场景。本指南将为你详细解析最常见的三种格式：EPUB、AZW3 和 MOBI，帮助你选择最适合的格式。,
  sections: [
    {
      heading: 'EPUB - 通用标准',
      body: EPUB（Electronic Publication）是由国际数字出版论坛（IDPF）制定的开放标准，是目前最通用的电子书格式。\\n\\n**优点：**\\n- 跨平台支持（iOS、Android、Kindle、电脑）\\n- 流式布局，可调节字体大小\\n- 支持嵌入字体和 CSS 样式\\n- 文件体积小（ZIP 压缩）\\n\\n**缺点：**\\n- 部分老款 Kindle 设备不支持\\n- 排版复杂时可能出现问题,
    },
    {
      heading: 'AZW3 - Kindle 原生格式',
      body: AZW3（Kindle Format 8）是亚马逊为 Kindle 设备开发的高级电子书格式，于 2011 年发布。\\n\\n**优点：**\\n- Kindle 原生支持，排版效果最佳\\n- 支持更好的字体渲染和表格显示\\n- 保留复杂的 CSS 样式\\n\\n**缺点：**\\n- 仅限 Kindle 设备和 App 使用\\n- 兼容性不如 EPUB,
    },
    {
      heading: 'MOBI - 经典老格式',
      body: MOBI（Mobipocket）是最早被 Kindle 支持的格式，早在 2000 年代初就广泛使用。\\n\\n**优点：**\\n- 几乎所有 Kindle 设备都支持\\n- 文件体积小\\n\\n**缺点：**\\n- 不支持复杂的排版和字体\\n- 功能有限，已被 AZW3 取代\\n- 仅建议老款 Kindle 用户使用,
    },
  ],
};
