'use client';

import Link from 'next/link';
import { FileDown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chrome } from '@/lib/ui-chrome';

interface BatchConversionGuideProps {
  sourceFormat: string;
  targetFormat: string;
  /** M5-6：西语页 chrome 本地化开关 */
  isEs?: boolean;
}

export function BatchConversionGuide({ sourceFormat, targetFormat, isEs = false }: BatchConversionGuideProps) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
          <FileDown className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">
              {isEs ? `Convierte ${sourceFormat} a ${targetFormat} por lotes` : `Convert ${sourceFormat} to ${targetFormat} in bulk`}
            </h3>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {isEs ? (
              <>
                Sube hasta <strong>20 archivos</strong> a la vez y conviértelos todos a {targetFormat}.
                Perfecto para crear toda tu biblioteca de ebooks.
              </>
            ) : (
              <>
                Upload up to <strong>20 files</strong> at once and convert them all to {targetFormat}.
                Perfect for building your entire ebook library.
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> {chrome('batchUpTo20', isEs)}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> {chrome('zipDownload', isEs)}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> {chrome('progressTracking', isEs)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link href="/batch">
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Sparkles className="h-4 w-4" />
              {chrome('upgradePro', isEs)}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">
            {chrome('startFree', isEs)}
          </p>
        </div>
      </div>
    </section>
  );
}
