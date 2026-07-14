import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

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
