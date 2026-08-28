export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

﻿import { getRequestConfig } from 'next-intl/server';
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
  
  return defaultLocale;
}

/**
 * Resolve a dot-notation path into a nested object value.
 * e.g., resolvePath({ seo: { defaultTitle: "Book" } }, "seo.defaultTitle") => "Book"
 */
export function resolvePath(obj: Record<string, any>, path: string): string {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null) return '';
    current = current[part];
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
