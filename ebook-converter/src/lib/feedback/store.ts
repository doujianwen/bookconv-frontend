// src/lib/feedback/store.ts
//
// 用户反馈持久化（Postgres）。为「反馈趋势看板」提供数据源。
//
// 定位：/api/feedback 在投递飞书的同时把**同一条记录**写入本表，
// 使反馈可检索、可聚合、可绘制趋势——飞书卡片是一等通知，本表是可观测性底座。
//
// 设计约束：
//   - 优雅降级：未配置 DATABASE_URL 或查询失败一律返回 null / false，
//     绝不让存储层故障影响用户反馈主流程（与 alerts.ts 同一纪律）。
//   - 表结构 runtime 自建（CREATE TABLE IF NOT EXISTS），与 user-store-postgres.ts 同法。
//   - 隐私红线：只存 /api/feedback 已裁剪过的元数据，不存文件内容或文件名。

const TABLE = 'user_feedback';

let pool: import('pg').Pool | null = null;
let initPromise: Promise<void> | null = null;

/** 存储是否可用（DATABASE_URL 已配置）。未配置 = 反馈只走飞书，不落库。 */
export function isFeedbackStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

async function getPool(): Promise<import('pg').Pool> {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: /supabase|neon|render|amazonaws/i.test(process.env.DATABASE_URL || '')
        ? { rejectUnauthorized: false }
        : undefined,
      connectionTimeoutMillis: 3000,
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
           id BIGSERIAL PRIMARY KEY,
           created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
           message TEXT NOT NULL,
           email TEXT,
           source_format TEXT,
           target_format TEXT,
           error_code TEXT,
           page_path TEXT,
           delivered BOOLEAN NOT NULL DEFAULT FALSE
         )`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS ${TABLE}_created_at_idx ON ${TABLE} (created_at DESC)`
      );
    })().catch((err) => {
      // 允许下次调用重试（与 user-store-postgres.ts 同一处理）
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export interface FeedbackRecord {
  message: string;
  email?: string | null;
  sourceFormat?: string | null;
  targetFormat?: string | null;
  errorCode?: string | null;
  pagePath?: string | null;
  /** 飞书是否真正送达（来自 notifyUserFeedback 的返回值）。 */
  delivered?: boolean;
}

/** 写入一条反馈。失败返回 false（调用方不应因此改变用户可见结果）。 */
export async function insertFeedback(rec: FeedbackRecord): Promise<boolean> {
  if (!isFeedbackStoreConfigured()) return false;
  try {
    await ensureTable();
    const client = await getPool();
    await client.query(
      `INSERT INTO ${TABLE}
         (message, email, source_format, target_format, error_code, page_path, delivered)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        rec.message,
        rec.email ?? null,
        rec.sourceFormat ?? null,
        rec.targetFormat ?? null,
        rec.errorCode ?? null,
        rec.pagePath ?? null,
        rec.delivered ?? false,
      ]
    );
    return true;
  } catch (err) {
    console.error(
      '[feedback-store] insert failed:',
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}

export interface FeedbackDailyPoint {
  date: string;
  count: number;
}

export interface FeedbackBreakdown {
  label: string;
  count: number;
}

export interface FeedbackRow {
  id: string;
  createdAt: string;
  message: string;
  email: string | null;
  sourceFormat: string | null;
  targetFormat: string | null;
  errorCode: string | null;
  pagePath: string | null;
  delivered: boolean;
}

/**
 * 取「飞书未送达」的反馈记录，按时间正序（最早的先补发）。
 *
 * 用途：反馈通道是**尽力而为**的——webhook 未配置、机器人关键词校验、
 * 网络抖动都会让一条反馈落库却没通知到人。这些记录在运营台上显示为
 * 红点，但不会自己恢复。运营者需要一条受控的补发通道。
 *
 * 排序用 ASC 而非 DESC：补发时先处理最早被漏掉的，符合告警语义。
 */
export async function getUndeliveredFeedback(limit = 20): Promise<FeedbackRow[] | null> {
  if (!isFeedbackStoreConfigured()) return null;
  try {
    await ensureTable();
    const client = await getPool();
    const result = await client.query(
      `SELECT id::text AS id, created_at::text AS created_at, message, email,
              source_format, target_format, error_code, page_path, delivered
         FROM ${TABLE}
        WHERE delivered = FALSE
        ORDER BY created_at ASC
        LIMIT $1`,
      [limit]
    );
    return result.rows.map(toFeedbackRow);
  } catch (err) {
    console.error(
      '[feedback-store] undelivered query failed:',
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

/**
 * 把指定 id 的反馈标记为已送达。
 *
 * 只在**飞书真正返回成功**后调用——这正是本仓库头号失败模式
 * （「静默假成功」）的防线：绝不因为「已尝试发送」就置 delivered=true，
 * 否则重推脚本会把失败的记录标成成功，红点消失但通知从未送达。
 *
 * @returns 实际更新的行数；0 表示 id 不存在或已被标记过。
 */
export async function markFeedbackDelivered(ids: string[]): Promise<number> {
  if (!isFeedbackStoreConfigured() || ids.length === 0) return 0;
  try {
    await ensureTable();
    const client = await getPool();
    const result = await client.query(
      `UPDATE ${TABLE} SET delivered = TRUE WHERE id = ANY($1::bigint[]) AND delivered = FALSE`,
      [ids]
    );
    return result.rowCount ?? 0;
  } catch (err) {
    console.error(
      '[feedback-store] mark delivered failed:',
      err instanceof Error ? err.message : String(err)
    );
    return 0;
  }
}

export interface FeedbackStats {
  total: number;
  last7: number;
  last30: number;
  deliveredCount: number;
  daily: FeedbackDailyPoint[];
  byErrorCode: FeedbackBreakdown[];
  byFormatPair: FeedbackBreakdown[];
  recent: FeedbackRow[];
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** DB 行 → FeedbackRow。getUndeliveredFeedback 与 getFeedbackStats 共用。 */
function toFeedbackRow(r: {
  id: string;
  created_at: string;
  message: string;
  email: string | null;
  source_format: string | null;
  target_format: string | null;
  error_code: string | null;
  page_path: string | null;
  delivered: boolean;
}): FeedbackRow {
  return {
    id: r.id,
    createdAt: r.created_at,
    message: r.message,
    email: r.email,
    sourceFormat: r.source_format,
    targetFormat: r.target_format,
    errorCode: r.error_code,
    pagePath: r.page_path,
    delivered: r.delivered,
  };
}

/**
 * 汇总统计。返回 null 表示存储不可用（看板据此显示「未连接」而非「0 条」——
 * 「没有数据」与「数据源未接」是两件事，不能混淆）。
 */
export async function getFeedbackStats(days = 30): Promise<FeedbackStats | null> {
  if (!isFeedbackStoreConfigured()) return null;
  try {
    await ensureTable();
    const client = await getPool();

    const [totalR, d7R, d30R, deliveredR, dailyR, byErrR, byPairR, recentR] = await Promise.all([
      client.query(`SELECT COUNT(*)::int AS n FROM ${TABLE}`),
      client.query(
        `SELECT COUNT(*)::int AS n FROM ${TABLE} WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      client.query(
        `SELECT COUNT(*)::int AS n FROM ${TABLE} WHERE created_at >= NOW() - INTERVAL '30 days'`
      ),
      client.query(`SELECT COUNT(*)::int AS n FROM ${TABLE} WHERE delivered = TRUE`),
      client.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
           FROM ${TABLE}
          WHERE created_at >= NOW() - ($1 || ' days')::interval
          GROUP BY 1 ORDER BY 1`,
        [String(days)]
      ),
      client.query(
        `SELECT COALESCE(NULLIF(error_code, ''), '(unlabelled)') AS label, COUNT(*)::int AS count
           FROM ${TABLE} GROUP BY 1 ORDER BY count DESC, label ASC LIMIT 12`
      ),
      client.query(
        `SELECT CASE
                  WHEN source_format IS NULL OR target_format IS NULL THEN '(unknown)'
                  ELSE source_format || ' → ' || target_format
                END AS label,
                COUNT(*)::int AS count
           FROM ${TABLE} GROUP BY 1 ORDER BY count DESC, label ASC LIMIT 12`
      ),
      client.query(
        `SELECT id::text AS id, created_at::text AS created_at, message, email,
                source_format, target_format, error_code, page_path, delivered
           FROM ${TABLE} ORDER BY created_at DESC LIMIT 50`
      ),
    ]);

    // 补齐日期序列，让趋势图不因「某天 0 条」而断裂
    const counts = new Map<string, number>(
      dailyR.rows.map((r: { date: string; count: number }) => [r.date, r.count])
    );
    const daily: FeedbackDailyPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = ymd(d);
      daily.push({ date: key, count: counts.get(key) ?? 0 });
    }

    return {
      total: totalR.rows[0]?.n ?? 0,
      last7: d7R.rows[0]?.n ?? 0,
      last30: d30R.rows[0]?.n ?? 0,
      deliveredCount: deliveredR.rows[0]?.n ?? 0,
      daily,
      byErrorCode: byErrR.rows as FeedbackBreakdown[],
      byFormatPair: byPairR.rows as FeedbackBreakdown[],
      recent: recentR.rows.map(toFeedbackRow),
    };
  } catch (err) {
    console.error(
      '[feedback-store] stats failed:',
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}
