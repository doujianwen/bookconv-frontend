// src/app/api/db-probe/route.ts
// TEMPORARY read-only probe — DO NOT keep in production.
// Purpose: verify how many real users exist in auth_users on Neon Postgres.
// This route is pushed only for this one-shot query, then deleted + re-deployed.
import { NextResponse } from 'next/server';

// Dynamic so it runs fresh every request (no build-time cache).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { Pool } = await import('pg');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json(
        { ok: false, error: 'DATABASE_URL not set on this runtime' },
        { status: 503 },
      );
    }

    const pool = new Pool({
      connectionString,
      max: 2,
      ssl: /supabase|neon|render|amazonaws/i.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    });

    // 1) Does the table exist yet? (lazy-created on first real register call)
    const t = await pool.query(`SELECT to_regclass('auth_users') AS tbl`);
    if (!t.rows[0].tbl) {
      await pool.end();
      return NextResponse.json({
        ok: true,
        table: 'auth_users',
        exists: false,
        note: 'auth_users table not created yet — zero registrations so far',
      });
    }

    // 2) Count + first/last registration
    const summary = await pool.query(
      `SELECT COUNT(*)::int AS n,
              MIN(created_at) AS first_user,
              MAX(created_at) AS last_user,
              ARRAY_TO_JSON(ARRAY(SELECT email FROM auth_users ORDER BY email)) AS emails
       FROM auth_users`,
    );
    const row = summary.rows[0];

    // 3) Per-user created_at, ordered, so we can see the real timeline
    const users = await pool.query(
      `SELECT email, created_at FROM auth_users ORDER BY created_at`,
    );

    await pool.end();

    return NextResponse.json({
      ok: true,
      table: 'auth_users',
      exists: true,
      total: row.n,
      firstUser: row.first_user,
      lastUser: row.last_user,
      emails: row.emails,
      users: users.rows,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
