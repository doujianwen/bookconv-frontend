/**
 * 单一权威点：构建 canonical + hreflang alternate 语言组。
 *
 * 设计原则：仅已验收的 ESP_STATIC_PATHS 及 hasEsVersion 详情页输出双向语言组。
 * 未开放的列表或未翻译详情不发 es 关联。西语首页规范路径为 /es。
 *
 * 为什么是单一权威点：未来新增一页只调一次 helper，不会再出现各 page 各自实现不一致的 bug。
 *
 * @param opts.locale 当前路由的 locale（'en' | 'es'）
 * @param opts.slugPath 不带 locale 前缀的路径，如 '/convert/epub-to-mobi'
 * @param opts.pageType 页面类型：'home' | 'list' | 'leaf'
 * @param opts.hasEsVersion 仅 leaf page 用，true = 该 leaf 有真西语译本（默认 false）
 */
import { ESP_STATIC_PATHS } from '@/lib/es-routes';

export function buildAlternates(opts: {
  locale: string;
  slugPath: string;
  pageType: 'home' | 'list' | 'leaf';
  hasEsVersion?: boolean;
}): { canonical: string; languages: Record<string, string> } {
  const baseUrl = 'https://www.bookconv.com';
  const isEs = opts.locale === 'es';
  const prefix = isEs ? '/es' : '';
  const canonical = `${baseUrl}${prefix}${opts.slugPath === '/' ? '' : opts.slugPath}`;

  if ((opts.pageType === 'leaf' && opts.hasEsVersion === true) || ESP_STATIC_PATHS.includes(opts.slugPath)) {
    // 三件套：en ↔ es 双向 + x-default 指回英文版（Google 官方推荐 x-default 指向主力语言）
    return {
      canonical,
      languages: {
        en: `${baseUrl}${opts.slugPath === '/' ? '' : opts.slugPath}`,
        es: `${baseUrl}/es${opts.slugPath === '/' ? '' : opts.slugPath}`,
        'x-default': `${baseUrl}${opts.slugPath === '/' ? '' : opts.slugPath}`,
      },
    };
  }

  // home / list / 无 es leaf：只输出 en + x-default
  return {
    canonical,
    languages: {
      en: `${baseUrl}${opts.slugPath === '/' ? '' : opts.slugPath}`,
      'x-default': `${baseUrl}${opts.slugPath === '/' ? '' : opts.slugPath}`,
    },
  };
}
