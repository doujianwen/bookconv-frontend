// src/lib/workbench/admin-guard.ts
//
// Access control for the operations workbench (/admin pages + /api/workbench).
//
// The workbench surfaces operational metadata: production env identifiers,
// domain/DNS provider, which quality gate is red, Sentry issue counts, unpushed
// commits, traffic numbers. That is a health report for the whole site — it must
// not be readable by anyone who guesses the path.
//
// ── Design: allowlist, not "any logged-in user" ──────────────────────────────
// The site's auth (src/lib/auth) is CUSTOMER auth: anyone can self-register via
// /api/auth/register. Reusing "has a valid session" as the workbench gate would
// mean any visitor who signs up can read operational data. So the gate is a
// separate, explicit allowlist of operator emails.
//
// ── Design: fail closed ──────────────────────────────────────────────────────
// Two forms of "not configured" must DENY, not allow:
//   1. WORKBENCH_ADMIN_EMAILS unset/empty  → nobody is an operator → deny all.
//      (If we treated "no allowlist" as "allow all", forgetting the env var
//       would silently publish the workbench. That is the classic misconfig.)
//   2. AUTH_SECRET unset → sessions are signed with a public hard-coded default
//      (see src/lib/auth/session.ts), so any forged token verifies. Deny all.
//
// Denials are deliberately indistinguishable from "not found" at the HTTP layer
// (see the routes) so the endpoint does not advertise that it exists.
import { getSession } from '@/lib/auth/session';

export type AccessDenialReason =
  | 'no_allowlist' // WORKBENCH_ADMIN_EMAILS not configured
  | 'weak_secret' // AUTH_SECRET not configured (public default would be used)
  | 'no_session' // no/invalid/expired session cookie
  | 'not_operator'; // authenticated, but not on the allowlist

export interface AccessGranted {
  allowed: true;
  email: string;
}
export interface AccessDenied {
  allowed: false;
  reason: AccessDenialReason;
}
export type WorkbenchAccess = AccessGranted | AccessDenied;

const DEFAULT_SECRET = 'change-me-in-production-use-a-long-random-string';

/**
 * Parse WORKBENCH_ADMIN_EMAILS into a normalised allowlist.
 * Format: comma-separated emails. Whitespace tolerated, case-insensitive,
 * duplicates collapsed. Empty/missing → empty set (callers must deny).
 */
export function parseAllowlist(raw: string | undefined | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
  );
}

/** True when AUTH_SECRET is absent or still the shipped placeholder. */
export function hasUsableSecret(secret: string | undefined | null): boolean {
  return typeof secret === 'string' && secret.length > 0 && secret !== DEFAULT_SECRET;
}

export interface GuardOptions {
  /** Session resolver — injectable so the gate is testable without HTTP. */
  getSessionImpl?: () => Promise<{ email: string } | null>;
  allowlist?: string | null;
  secret?: string | null;
}

/**
 * Decide whether the caller may read the workbench.
 *
 * Order matters for the reason reported (and for what we tell the caller):
 * configuration problems are checked before identity, because with a broken
 * config NO identity can be trusted.
 */
export async function checkWorkbenchAccess(opts: GuardOptions = {}): Promise<WorkbenchAccess> {
  const allowlistRaw = opts.allowlist ?? process.env.WORKBENCH_ADMIN_EMAILS;
  const secret = opts.secret ?? process.env.AUTH_SECRET;

  const allowlist = parseAllowlist(allowlistRaw);
  if (allowlist.size === 0) return { allowed: false, reason: 'no_allowlist' };
  if (!hasUsableSecret(secret)) return { allowed: false, reason: 'weak_secret' };

  const sessionFn = opts.getSessionImpl ?? (async () => {
    const s = await getSession();
    return s ? { email: s.email } : null;
  });

  let session: { email: string } | null = null;
  try {
    session = await sessionFn();
  } catch {
    session = null;
  }
  if (!session?.email) return { allowed: false, reason: 'no_session' };

  const email = session.email.trim().toLowerCase();
  if (!allowlist.has(email)) return { allowed: false, reason: 'not_operator' };

  return { allowed: true, email };
}

/**
 * Convenience wrapper that throws on denial. Import in server components where
 * you want the caller to handle a single "denied" branch.
 */
export async function requireWorkbenchAccess(opts: GuardOptions = {}): Promise<AccessGranted> {
  const verdict = await checkWorkbenchAccess(opts);
  if (!verdict.allowed) {
    throw new WorkbenchAccessError(verdict.reason);
  }
  return verdict;
}

export class WorkbenchAccessError extends Error {
  constructor(public readonly reason: AccessDenialReason) {
    super(`Workbench access denied: ${reason}`);
    this.name = 'WorkbenchAccessError';
  }
}

/**
 * Operator-facing hint for a denial reason. Used on the denial page (shown only
 * to the person who is denied) and in server logs — never sent as an API body
 * for unauthenticated callers, where it would leak configuration state.
 */
export const DENIAL_HINT: Record<AccessDenialReason, string> = {
  no_allowlist:
    'WORKBENCH_ADMIN_EMAILS is not set, so no account is authorised. Set it to a comma-separated list of operator emails.',
  weak_secret:
    'AUTH_SECRET is missing or still the shipped default. Sessions signed with the public default can be forged, so the gate refuses to trust any session.',
  no_session: 'No valid session cookie. Sign in first.',
  not_operator: 'Signed in, but this account is not on the WORKBENCH_ADMIN_EMAILS allowlist.',
};
