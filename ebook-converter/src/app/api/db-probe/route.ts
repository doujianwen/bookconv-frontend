// src/app/api/db-probe/route.ts
// TEMPORARY write-probe — DELETE 3 known test accounts from auth_users.
// Whitelist-limited: only these 3 exact emails can be removed. Never touches
// real user rows. Deleted + re-deployed immediately after use.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED = [
  'probe-dou-test@example.com',
  'test-pg@bookconv.com',
  'test-confirm@bookconv.com',
];

export async function POST() {
  try {
    const { Pool } = await import('pg');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 503 });
    }
    const pool = new Pool({
      connectionString,
      max: 2,
      ssl: /supabase|neon|render|amazonaws/i.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    });

    // Whitelist guard: only delete these exact emails
    const placeholders = ALLOWED.map((_, i) => `$${i + 1}`).join(',');
    const del = await pool.query(
      `DELETE FROM auth_users WHERE email = ANY($1::text[]) RETURNING email`,
      [ALLOWED],
    );
    const remaining = await pool.query(`SELECT COUNT(*)::int AS n FROM auth_users`);
    void placeholders; // keep lint happy
    await pool.end();

    return NextResponse.json({
      ok: true,
      deleted: del.rows.length,
      deletedEmails: del.rows.map((r) => r.email),
      remaining: remaining.rows[0].n,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
