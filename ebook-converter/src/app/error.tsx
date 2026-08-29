'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    console.error('Application error:', error);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          reset();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [reset]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-blue-600">
        <BookOpen className="h-8 w-8" />
        <span>BookConv</span>
      </Link>

      <div className="max-w-md text-center">
        <div className="mb-6 text-7xl font-bold text-red-500">!</div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mb-6 text-gray-600">
          We encountered an error while processing your request. Please try again.
        </p>

        {error.digest && (
          <p className="mb-4 text-xs text-gray-500 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Try again
        </button>

        <p className="mt-4 text-xs text-gray-500">
          Auto-retrying in {countdown}s...
        </p>
      </div>
    </main>
  );
}
