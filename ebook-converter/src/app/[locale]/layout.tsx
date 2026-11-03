import type { Metadata } from 'next'
import { getMessage } from '@/i18n/utils'
import { buildAlternates } from '@/lib/seo/alternates'
import { FeedbackWidget } from '@/components/tools/FeedbackWidget'
import { RootHead, RootBodyShell, buildSiteMetadata } from '@/components/layout/RootChrome'
import '../globals.css'

// 2026-11-03 M12-3 静态化改造：本文件升为 [locale] 树的根布局（原 app/layout.tsx
// 已合并至此并删除）。locale 直接来自路由参数 ⇒ 渲染树不再触碰 headers()/cookies()
// ⇒ 页面可静态化，Vercel 边缘缓存生效（此前动态渲染被强制 no-store，config
// headers() 与 middleware 响应头都盖不过——「本地绿≠线上绿」的根因）。
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const base = await buildSiteMetadata(locale)
  // 每页叶子另有 alternates；主页 canonical/hreflang 由 buildAlternates 给出
  // （比旧根布局的裸 canonical 更全，含 languages），沿用其结果覆盖 base。
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: '/',
    pageType: 'home',
  })
  return {
    ...base,
    alternates: { canonical, languages },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessage(locale)

  return (
    <html lang={locale} dir='ltr'>
      <RootHead locale={locale} messages={messages} />
      <body className='min-h-screen bg-gray-50 font-sans text-gray-900 antialiased'>
        <RootBodyShell locale={locale} messages={messages}>
          {children}
          <FeedbackWidget />
        </RootBodyShell>
      </body>
    </html>
  )
}
