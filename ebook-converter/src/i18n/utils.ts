export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es'] as const;
type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export async function getLocale() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('locale')?.value as Locale | undefined;

  if (localeFromCookie && locales.includes(localeFromCookie)) {
    return localeFromCookie;
  }

  // M5-6（2026-10-22）：cookie 未设时从 middleware 注入的请求头取 locale。
  // 根因：根 layout（<html lang> / Header / 页脚 chrome）靠本函数取 locale，而直访
  // /es/guide/* 时 cookie 尚未写入（Set-Cookie 只对下一请求生效）⇒ 回退 en ⇒
  // 西语页出现「正文西语、导航英文」且 lang="en" 的错配（slug 页读 params 判 es
  // 是对的，错的是 layout 侧）。
  // middleware 对放行的 /es 路径用 NextResponse.next({ request: { headers } })
  // 注入 x-bookconv-locale，同请求下游渲染可读（Next 官方机制）。
  // 优先级：cookie（用户显式切换）> URL 前缀请求头 > defaultLocale；英文路径行为不变。
  try {
    const { headers } = await import('next/headers');
    const headerStore = await headers();
    const fromUrl = headerStore.get('x-bookconv-locale') as Locale | undefined;
    if (fromUrl && locales.includes(fromUrl)) {
      return fromUrl;
    }
  } catch {
    // 静态渲染 / 无 headers 场景 ⇒ 静默回退 defaultLocale
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