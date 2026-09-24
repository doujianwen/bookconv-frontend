// src/lib/auth/user-store-postgres.ts
// Postgres-backed user store. Activated automatically when DATABASE_URL is set
// (works with Supabase, Neon, Vercel Postgres, RDS, or any Postgres instance).
// Table is created on first use; scrypt hashes are identical in format to the
// memory store, so users can migrate between stores without re-registration.
import type { StoredUser, UserStore } from './user-store';
import { hashPassword, verifyPassword } from './user-store';

const TABLE = 'auth_users';

let pool: import('pg').Pool | null = null;
let initPromise: Promise<void> | null = null;

async function getPool(): Promise<import('pg').Pool> {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Serverless-friendly: keep the pool small
      max: 5,
      ssl: /supabase|neon|render|amazonaws/i.test(process.env.DATABASE_URL || '')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return pool;
}

async function ensureTable(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const client = await getPool();
      await client.query(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (
           email TEXT PRIMARY KEY,
           password_hash TEXT NOT NULL,
           created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
         )`
      );
    })().catch((err) => {
      // Reset so a transient startup failure is retried on the next call
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

function toUser(row: { email: string; password_hash: string }): StoredUser {
  return { email: row.email, passwordHash: row.password_hash };
}

export const postgresUserStore: UserStore = {
  async registerUser(email, password) {
    await ensureTable();
    const key = email.toLowerCase();
    const client = await getPool();
    const result = await client.query(
      `INSERT INTO ${TABLE} (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING email, password_hash`,
      [key, hashPassword(password)]
    );
    if (result.rowCount === 0) {
      return { success: false, error: 'Email already registered' };
    }
    return { success: true };
  },

  async authenticate(email, password) {
    await ensureTable();
    const client = await getPool();
    const result = await client.query(
      `SELECT email, password_hash FROM ${TABLE} WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }
    const user = toUser(result.rows[0]);
    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid email or password' };
    }
    return { success: true };
  },

  async getUser(email) {
    await ensureTable();
    const client = await getPool();
    const result = await client.query(
      `SELECT email, password_hash FROM ${TABLE} WHERE email = $1`,
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? toUser(result.rows[0]) : null;
  },

  async userExists(email) {
    await ensureTable();
    const client = await getPool();
    const result = await client.query(
      `SELECT 1 FROM ${TABLE} WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },
};
