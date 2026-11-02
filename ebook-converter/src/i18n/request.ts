import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

const locales = ['en', 'es'] as const;
type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export async function getLocale() {
  // URL locale (injected by middleware as x-bookconv-locale) is authoritative
  // and path-driven — critical for cookie-independent rendering so responses
  // stay cacheable at the edge (M12-3). Falls back to cookie, then default.
  try {
    const { headers } = await import('next/headers');
    const headerStore = await headers();
    const fromUrl = headerStore.get('x-bookconv-locale') as Locale | undefined;
    if (fromUrl && locales.includes(fromUrl)) {
      return fromUrl;
    }
  } catch {
    // 静态渲染 / 无 headers 场景 ⇒ 继续回退 cookie / defaultLocale
  }

  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('locale')?.value as Locale | undefined;

  if (localeFromCookie && locales.includes(localeFromCookie)) {
    return localeFromCookie;
  }

  return defaultLocale;
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
