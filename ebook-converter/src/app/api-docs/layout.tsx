// /api-docs 根布局（多根布局改造 2026-11-03）。
// /api-docs 被 middleware matcher 排除（api 前缀），本树独立根布局，
// locale 固定 en（开发者文档，无西语版）。
import type { Metadata } from "next";
import { getMessage } from "@/i18n/utils";
import { clampMetaDescription } from "@/lib/seo/meta-description";
import { RootHead, RootBodyShell, buildSiteMetadata } from "@/components/layout/RootChrome";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const base = await buildSiteMetadata("en");
  return {
    ...base,
    // 旧链（根布局 title 模板 + 本布局 title 字符串）渲染为
    // "API Documentation | BookConv"，用 absolute 逐字保留。
    title: { absolute: "API Documentation | BookConv" },
    description: clampMetaDescription("BookConv API reference documentation with OpenAPI 3.0 spec. Learn how to integrate ebook conversion into your application."),
    alternates: {
      canonical: "https://www.bookconv.com/api-docs",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ApiDocsRootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessage("en");
  return (
    <html lang="en" dir="ltr">
      <RootHead locale="en" messages={messages} />
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <RootBodyShell locale="en" messages={messages}>
          {children}
        </RootBodyShell>
      </body>
    </html>
  );
}
