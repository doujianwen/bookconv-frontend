'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
          <div className="mb-8 text-7xl font-bold text-red-500">!</div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-6 text-gray-600">
            A critical error occurred. Please refresh the page to try again.
          </p>

          {error.digest && (
            <p className="mb-4 text-xs text-gray-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Refresh page
          </button>
        </main>
      </body>
    </html>
  );
}
