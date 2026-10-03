// src/app/auth/page.tsx
//
// 英文登录入口（无前缀）。UI 实现在 src/components/auth/AuthForm.tsx，
// 与 /es/auth 共用同一份表单——此前本文件是唯一实现，导致 /es/auth 404。
//
// 保持本文件为极薄 wrapper：任何文案/逻辑变更都改 AuthForm，
// 避免两处副本漂移（本站已因 FAQSection 有两份实现而吃过亏）。
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessage } from '@/i18n/utils';
import AuthForm from '@/components/auth/AuthForm';

export const dynamic = 'force-dynamic';

// 认证页绝不入索引：noindex + 独立 canonical，避免与 /es/auth 争同一实体。
export const metadata: Metadata = {
  title: 'Sign In · BookConv',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/auth' },
};

export default async function AuthPage() {
  const messages = await getMessage('en');
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <AuthForm />
    </NextIntlClientProvider>
  );
}
