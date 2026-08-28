"use client";

import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('localeSwitcher');

  function onSelectChange(value: string) {
    document.cookie = `locale=${value};path=/;max-age=31536000`;
    if (locale === value) return;
    
    const newPath = value === 'en'
      ? pathname.replace(/\/(en|es)/, '').replace(/^\/\//, '/') || '/'
      : '/' + value + pathname.replace(/^\/(en|es)/, '');
    
    router.push(newPath);
  }

  return (
    <select
      value={locale}
      onChange={(e) => onSelectChange(e.target.value)}
      className="h-8 px-2 text-xs border border-gray-200 rounded bg-white cursor-pointer"
      aria-label={t('language')}
    >
      <option value="en">{t('english')}</option>
      <option value="es">{t('spanish')}</option>
    </select>
  );
}
