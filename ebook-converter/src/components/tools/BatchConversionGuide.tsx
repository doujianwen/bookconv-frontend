'use client';

import Link from 'next/link';
import { FileDown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BatchConversionGuideProps {
  sourceFormat: string;
  targetFormat: string;
}

export function BatchConversionGuide({ sourceFormat, targetFormat }: BatchConversionGuideProps) {
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
              Convert {sourceFormat} to {targetFormat} in bulk
            </h3>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Upload up to <strong>20 files</strong> at once and convert them all to {targetFormat}.
            Perfect for building your entire ebook library.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Up to 20 files per batch
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> ZIP download
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Progress tracking
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link href="/batch">
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro — $5/mo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">
            Start free · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
