export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'es'] as const;
type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export async function getLocale(): Promise<Locale> {
  // 2026-11-03 M12-3 静态化：locale 只来自 URL 路由参数（next/root-params，
  // [locale] 是根布局路径上的动态段）。不再读 headers()/cookies()——渲染树里
  // 任何动态 API 都会把页面钉死在动态渲染，Vercel 强制 no-store ⇒ 边缘缓存
  // 失效（M12-3 线上实测根因）。middleware 的 x-bookconv-locale 头保留但不再
  // 是渲染依据（path 驱动语义不变：/→en、/es/→es，已实测）。
  // 非 [locale] 树（auth/api-docs）无该参数、Route Handler/Jest 不支持
  // root-params ⇒ 回退 defaultLocale（与旧行为无 cookie 时一致）。
  try {
    const mod = (await import('next/root-params')) as { locale?: () => unknown };
    if (typeof mod.locale === 'function') {
      const value = await mod.locale();
      if (typeof value === 'string' && (locales as readonly string[]).includes(value)) {
        return value as Locale;
      }
    }
  } catch {
    // 非渲染上下文（Route Handler / 测试）⇒ 回退
  }
  return defaultLocale;
}

/**
 * Resolve a dot-notation path into a nested object value.
 * e.g., resolvePath({ seo: { defaultTitle: "Book" } }, "seo.defaultTitle") => "Book"
 */
export function resolvePath(obj: Record<string, unknown>, path: string): string {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : '';
}

export async function getMessage(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../messages/en.json`)).default;
  }
}

export default getRequestConfig(async () => {
  const locale = await getLocale();
  return {
    locale,
    messages: await getMessage(locale),
  };
});