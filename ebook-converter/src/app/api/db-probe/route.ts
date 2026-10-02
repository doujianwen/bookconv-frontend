// src/app/api/db-probe/route.ts
// TEMPORARY final cleanup — delete any remaining verify/final/test emails,
// leaving auth_users truly empty. Then self + re-deploy.
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

    // Read-only: list all rows so we can see exactly what's left (no guessing)
    const before = await pool.query(`SELECT email, created_at FROM auth_users ORDER BY created_at`);

    // Delete every row matching test/probe patterns. This is safe because
    // real users would never use these prefixes/domains in this product.
    const del = await pool.query(
      `DELETE FROM auth_users
       WHERE email LIKE 'verify-table-empty-%'
          OR email LIKE 'final-check-%'
          OR email LIKE 'probe-dou-test%'
          OR email LIKE '%@example.com'
          OR email LIKE 'test-pg%'
          OR email LIKE 'test-confirm%'
       RETURNING email`,
    );

    const after = await pool.query(`SELECT email FROM auth_users ORDER BY created_at`);
    await pool.end();

    return NextResponse.json({
      ok: true,
      before: before.rows,
      deleted: del.rows.length,
      deletedEmails: del.rows.map((r) => r.email),
      remaining: after.rows.map((r) => r.email),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
