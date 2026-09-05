/**
 * 单一权威点：构建 canonical + hreflang alternate 语言组。
 *
 * 设计原则：
 * - 首页 / 列表页（homepage / list）：永远只输出 en + x-default，不输出 es
 *   （伪翻译没有意义，输出 es: 是错误信号，会让 Google 误以为存在双向语言对）
 * - convert / guide leaf page：当且仅当 hasEsVersion=true 时才输出完整三件套
 *   （目前只有 3 个 convert 页有真实 es 翻译；guide 全部无 es）
 * - blog leaf page：条件输出——真西语 blog（5 篇）输出三件套，其余 54 篇只输出 en + x-default
 *
 * 为什么是单一权威点：未来新增一页只调一次 helper，不会再出现各 page 各自实现不一致的 bug。
 *
 * @param opts.locale 当前路由的 locale（'en' | 'es'）
 * @param opts.slugPath 不带 locale 前缀的路径，如 '/convert/epub-to-mobi'
 * @param opts.pageType 页面类型：'home' | 'list' | 'leaf'
 * @param opts.hasEsVersion 仅 leaf page 用，true = 该 leaf 有真西语译本（默认 false）
 */
export function buildAlternates(opts: {
  locale: string;
  slugPath: string;
  pageType: 'home' | 'list' | 'leaf';
  hasEsVersion?: boolean;
}): { canonical: string; languages: Record<string, string> } {
  const baseUrl = 'https://www.bookconv.com';
  const isEs = opts.locale === 'es';
  const prefix = isEs ? '/es' : '';
  const canonical = `${baseUrl}${prefix}${opts.slugPath}`;

  if (opts.pageType === 'leaf' && opts.hasEsVersion === true) {
    // 三件套：en ↔ es 双向 + x-default 指回英文版（Google 官方推荐 x-default 指向主力语言）
    return {
      canonical,
      languages: {
        en: `${baseUrl}${opts.slugPath}`,
        es: `${baseUrl}/es${opts.slugPath}`,
        'x-default': `${baseUrl}${opts.slugPath}`,
      },
    };
  }

  // home / list / 无 es leaf：只输出 en + x-default
  return {
    canonical,
    languages: {
      en: `${baseUrl}${opts.slugPath}`,
      'x-default': `${baseUrl}${opts.slugPath}`,
    },
  };
}
