// src/app/api/db-probe/route.ts
// TEMPORARY — list all auth_users rows + delete test rows, then self.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    // 1) List all current rows (read-only, to discover exact emails)
    const list = await pool.query(
      `SELECT email, created_at FROM auth_users ORDER BY created_at`,
    );

    // 2) Delete test-row patterns: verify-table-empty-* and 3 previous known test accounts
    const del = await pool.query(
      `DELETE FROM auth_users
       WHERE email LIKE 'verify-table-empty-%'
          OR email IN ('probe-dou-test@example.com','test-pg@bookconv.com','test-confirm@bookconv.com')
       RETURNING email`,
    );

    // 3) Final state after delete
    const after = await pool.query(`SELECT email FROM auth_users ORDER BY created_at`);
    await pool.end();

    return NextResponse.json({
      ok: true,
      before: list.rows,
      deleted: del.rows.length,
      deletedEmails: del.rows.map((r) => r.email),
      remaining: after.rows.map((r) => r.email),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
