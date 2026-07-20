// src/lib/logger.ts
// Lightweight structured logger with request tracing.
//
// Usage:
//   import { logger } from '@/lib/logger';
//   logger.info('conversion started', { jobId, sourceFormat, targetFormat });
//   logger.error('conversion failed', { jobId, error: err.message });
//
// Environment:
//   LOG_LEVEL      — debug | info | warn | error (default: info)
//   DEBUG_NAMESPACE — comma-separated namespaces to always show (e.g. "queue,batch")
//   NODE_ENV=production → JSON output
//   NODE_ENV!=production → human-readable colored output

// ── Types ────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  requestId?: string;
  namespace: string;
  message: string;
  meta?: Record<string, unknown>;
}

// ── Config ───────────────────────────────────────────────────────

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const configuredLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
const baseThreshold = LOG_LEVELS[configuredLevel] ?? LOG_LEVELS.info;

const debugNamespaces = new Set(
  (process.env.DEBUG_NAMESPACE || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

const isProduction = process.env.NODE_ENV === 'production';

// ── Request ID tracking ──────────────────────────────────────────

let currentRequestId: string | undefined;

/**
 * Set the request ID for the current request context.
 * Call this at the start of each API request.
 */
export function setRequestId(id: string): void {
  currentRequestId = id;
}

/** Get the current request ID (undefined if not set). */
export function getRequestId(): string | undefined {
  return currentRequestId;
}

// ── Namespace factory ────────────────────────────────────────────

interface LoggerNamespace {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

function createNamespace(namespace: string): LoggerNamespace {
  return {
    debug: (message, meta) => _log('debug', namespace, message, meta),
    info: (message, meta) => _log('info', namespace, message, meta),
    warn: (message, meta) => _log('warn', namespace, message, meta),
    error: (message, meta) => _log('error', namespace, message, meta),
  };
}

// ── Core logger ──────────────────────────────────────────────────

function _log(
  level: LogLevel,
  namespace: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const levelVal = LOG_LEVELS[level];
  if (levelVal < baseThreshold) return;

  // Debug level is always shown for explicitly requested namespaces
  if (level === 'debug' && !debugNamespaces.has(namespace)) return;

  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    requestId: currentRequestId,
    namespace,
    message,
    meta,
  };

  if (isProduction) {
    // JSON output for log aggregation (Datadog, CloudWatch, etc.)
    console.log(JSON.stringify(entry));
  } else {
    // Human-readable output for development
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${namespace}]`;
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const colorCodes: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    process.stdout.write(`${colorCodes[level]}${prefix}${reset}${metaStr}\n`);
  }
}

// ── Export ───────────────────────────────────────────────────────

/** Root logger — use namespace-specific loggers for clarity. */
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => _log('debug', 'root', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => _log('info', 'root', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => _log('warn', 'root', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => _log('error', 'root', message, meta),
};

/** Pre-configured namespace loggers for common subsystems. */
export const loggers = {
  queue: createNamespace('queue'),
  batch: createNamespace('batch'),
  rateLimit: createNamespace('rate-limit'),
  webhook: createNamespace('webhook'),
  subscription: createNamespace('subscription'),
  auth: createNamespace('auth'),
  download: createNamespace('download'),
  storage: createNamespace('storage'),
  redis: createNamespace('redis'),
  api: createNamespace('api'),
  conversion: createNamespace('conversion'),
} as const;
