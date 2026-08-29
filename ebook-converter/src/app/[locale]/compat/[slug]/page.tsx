// src/app/[locale]/compat/[slug]/page.tsx
//
// 兼容性实测报告展示页（课程 M6 演示产物）。
// - 纯静态数据，build 期由 generateStaticParams 取 COMPAT_MAP。
// - 仅 en（localePrefix as-needed，en 无前缀）。
// - 无 emoji / 无紫粉渐变 / 无模板味文案（P0 三禁）。
// - 图标唯一来源 lucide-react（P0 规则 1）。

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Cpu,
  FileText,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import { COMPAT_MAP, getCompatReport } from "@/data/compat";

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(COMPAT_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = getCompatReport(slug);
  if (!report) return {};
  const title = `${report.sourceFormat.toUpperCase()} to ${report.targetFormat.toUpperCase()} — compatibility report`;
  const passed = report.checks.filter((c) => c.passed).length;
  const description = `Real-world conversion test: ${report.sourceFormat} to ${report.targetFormat} using ${report.engineVersion}. ${passed}/${report.checks.length} integrity checks passed.`;
  const url = `https://www.bookconv.com/compat/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "BookConv",
    },
  };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

const VERDICT_BADGE: Record<string, { label: string; cls: string }> = {
  pass: { label: "All checks passed", cls: "bg-green-50 text-green-700 ring-green-600/20" },
  warn: { label: "Passed with warnings", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  critical: { label: "Failed verification", cls: "bg-red-50 text-red-700 ring-red-600/20" },
};

export default async function CompatPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const report = getCompatReport(slug);
  if (!report) notFound();

  const badge = VERDICT_BADGE[report.verdict];
  const passed = report.checks.filter((c) => c.passed).length;
  const converterHref = `/convert/${report.sourceFormat}-to-${report.targetFormat}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/compat" className="hover:text-gray-700">Compatibility reports</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{report.sourceFormat} to {report.targetFormat}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Verified conversion test
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          {report.sourceFormat.toUpperCase()} to {report.targetFormat.toUpperCase()} compatibility
        </h1>
        <p className="mt-2 text-gray-600">
          Every claim on this page comes from a real machine-run of{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">{report.engineVersion}</code>{" "}
          through our verification layer. No estimates, no generated copy.
        </p>
        <span
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${badge.cls}`}
        >
          {badge.label}
        </span>
        {report.device && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
            <MonitorSmartphone className="h-4 w-4" aria-hidden />
            Tailored for {report.device}
          </p>
        )}
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<Cpu className="h-5 w-5" aria-hidden />} label="Engine" value={report.engineVersion} />
        <Stat icon={<BookOpen className="h-5 w-5" aria-hidden />} label="Sample" value={report.sample.title} />
        <Stat icon={<FileText className="h-5 w-5" aria-hidden />} label="Sample size" value={formatBytes(report.sample.sizeBytes)} />
        <Stat icon={<FileText className="h-5 w-5" aria-hidden />} label="Output size" value={formatBytes(report.outputSizeBytes)} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Integrity checks</h2>
        <p className="mt-1 text-sm text-gray-500">
          {passed} of {report.checks.length} passed
        </p>
        <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {report.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 px-4 py-3">
              {c.passed ? (
                <Check className="mt-0.5 h-5 w-5 flex-none text-green-600" aria-hidden />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" aria-hidden />
              )}
              <div>
                <p className="font-medium text-gray-900">{c.label}</p>
                {c.detail && <p className="mt-0.5 text-sm text-gray-500">{c.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Run this conversion yourself</h2>
        <p className="mt-1 text-gray-600">
          The report above is a fixed test result. To convert your own file, use the live tool.
        </p>
        <Link
          href={converterHref}
          className="mt-4 inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Open {report.sourceFormat} to {report.targetFormat} converter
        </Link>
      </section>

      <footer className="mt-10 border-t border-gray-100 pt-4 text-xs text-gray-500">
        Tested at {report.testedAt}. Sample source: {report.sample.source}.
      </footer>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-gray-900" title={value}>
        {value}
      </p>
    </div>
  );
}
