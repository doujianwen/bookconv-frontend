# DEPRECATED: Standalone Worker

This directory contained a standalone BullMQ worker (`worker/src/index.ts`) that competed
with the embedded worker in `src/lib/queue.ts` for the same `ebook-conversions` queue.

## Why deprecated

The embedded worker in `src/lib/queue.ts` is now the single source of truth for job processing.
It auto-starts in production (`NODE_ENV=production`) and the Dockerfile installs Calibre,
so the standalone worker is unnecessary and causes duplicate consumption in multi-instance deployments.

## What to do instead

- Use the embedded worker: `src/lib/queue.ts` handles everything.
- For debugging, run the app locally with `npm run dev` — the worker starts automatically.
- For production, the Docker image includes Calibre and the worker starts with the app.

## Timeline

- **2026-07-19**: Marked as deprecated (EBO-31~44 batch improvement)
- Future: May be removed in a future cleanup if no remaining references.
