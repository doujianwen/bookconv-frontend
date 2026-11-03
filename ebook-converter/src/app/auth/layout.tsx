// /auth 根布局（多根布局改造 2026-11-03）。
// /auth 被 middleware matcher 排除、页面 force-dynamic（登录页绝不缓存/入索引）。
// 本树独立根布局，locale 固定 en：auth/page.tsx 本就 getMessage('en')，
// 旧根布局在无 middleware header 时也回退 en；lang="en" 语义不变。
import type { Metadata } from 'next'
import { getMessage } from '@/i18n/utils'
import { RootHead, RootBodyShell, buildSiteMetadata } from '@/components/layout/RootChrome'
import '../globals.css'

export async function generateMetadata(): Promise<Metadata> {
  // 保留旧根布局的 metadataBase + title 模板（auth/page.tsx 的页面级 metadata 会覆盖）
  return buildSiteMetadata('en')
}

export default async function AuthRootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessage('en')
  return (
    <html lang='en' dir='ltr'>
      <RootHead locale='en' messages={messages} />
      <body className='min-h-screen bg-gray-50 font-sans text-gray-900 antialiased'>
        <RootBodyShell locale='en' messages={messages}>
          {children}
        </RootBodyShell>
      </body>
    </html>
  )
}
