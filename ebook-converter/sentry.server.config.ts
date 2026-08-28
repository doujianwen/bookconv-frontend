// Server-side error boundary for Sentry.
import * as Sentry from '@sentry/nextjs';

export async function requestErrorBoundary(error: Error) {
  Sentry.captureException(error);
}
