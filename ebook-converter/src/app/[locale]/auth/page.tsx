// src/app/[locale]/auth/page.tsx
//
// 本地化登录入口。此前只有根路径 /auth 一份实现，挂在无 locale 段，
// 于是 /es/auth 落到 middleware 的「其他 /es/* → 404」分支：
// 运营台在 /es/admin 之下，运营者在西语站点上按惯例找 /es/auth 却 404，
// 属真实可达性缺口（2026-10-03 实测确认）。
//
// UI 与 /auth 共用 AuthForm，本文件只负责：取 locale、注入 intl 上下文、
// 声明 noindex。canonical 指回 /auth——同一认证实体不因语言前缀分裂成
// 两个可索引 URL，与站内 en 用无前缀、es 用前缀的整体策略一致。
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessage } from '@/i18n/utils';
import AuthForm from '@/components/auth/AuthForm';

const LOCALES = ['en', 'es'];

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In · BookConv',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/auth' },
};

export default async function LocaleAuthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  const messages = await getMessage(locale);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthForm />
    </NextIntlClientProvider>
  );
}
