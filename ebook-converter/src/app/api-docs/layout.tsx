import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "BookConv API reference documentation with OpenAPI 3.0 spec. Learn how to integrate ebook conversion into your application.",
  alternates: {
    canonical: "https://www.bookconv.com/api-docs",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
