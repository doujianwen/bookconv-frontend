// src/lib/cloudconvert.ts
//
// CloudConvert API v2 客户端 —— 作为 Vercel Serverless 上 Calibre 不可用时的
// 转换后端替代方案（覆盖 epub→pdf / mobi / azw3 / docx 等 25 个 Calibre 依赖格式）。
//
// 真实 API 流程（CloudConvert v2）：
//   1. POST /v2/jobs       —— 创建 job，tasks 对象含 import/upload + convert + export/url
//   2. 取 import/upload 任务的 result.form（S3 签名 URL + AWS 参数），把文件 multipart 上传到该 URL
//   3. GET  /v2/jobs/{id}  —— 轮询直到 status = finished / error
//   4. 从 export/url task 的 result.files[0].url 下载结果（签名临时 URL，无需鉴权）
//
// 文档: https://developers.cloudconvert.com/api/v2

const API_BASE = 'https://api.cloudconvert.com/v2';
const API_KEY = process.env.CLOUD_CONVERT_API_KEY;
const MAX_POLL_ATTEMPTS = 55; // 55 * 2s = 110s，适配大文件（50+页EPUB→PDF需Calibre渲染60-90s）；route maxDuration=120s，留10s给创建job+上传+下载开销
const POLL_INTERVAL_MS = 2000;

/**
 * Calibre 引擎能够读取的输入格式（白名单 = Calibre ebook-convert 的 INPUT 全集，
 * 不含 DjVu / PDF 这类扫描图或排版容器）。
 *
 * 2026-10-04 事故：djvu → pdf 全程硬写 engine:'calibre'，Calibre 读不了 DjVu
 * ⇒ CloudConvert job 落到 error。白名单之外的输入格式改省 engine，交给
 * CloudConvert 自动选引擎（其官网 djvu-to-pdf 转换器走的正是默认引擎）。
 * 白名单内的格式行为完全不变，既有成功路径零风险。
 */
const CALIBRE_INPUT_FORMATS = new Set([
  'azw3',
  'azw4',
  'cbz',
  'docx',
  'epub',
  'html',
  'htmlz',
  'kepub',
  'lit',
  'lrf',
  'mobi',
  'oeb',
  'pdb',
  'rb',
  'rtf',
  'shtml',
  'txt',
  'txtz',
  'zip',
]);

/** 该输入格式是否交给 Calibre 引擎处理（决定 job 里是否带 engine:'calibre'） */
function isCalibreInput(sourceFormat: string): boolean {
  return CALIBRE_INPUT_FORMATS.has(String(sourceFormat || '').toLowerCase());
}

/** 检查 API Key 是否已配置（决定是否启用 CloudConvert 降级） */
export function isCloudConvertConfigured(): boolean {
  return !!API_KEY;
}

/** 带重试的 CloudConvert API 请求（5xx 重试，4xx 直接抛错） */
async function ccRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  retries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        let msg = text;
        try {
          msg = (JSON.parse(text) as { message?: string })?.message || text;
        } catch {
          /* keep raw text */
        }
        // 429 = 请求频率限流，瞬态，值得退避重试。
        // 402 = **账户转换额度耗尽**（CloudConvert 原文 "Your account has run out of
        // conversion credits"，2026-10-04 飞书告警坐实）—— 退避重试毫无意义，
        // 只会让每次失败白等 10-18 秒并多打两次 API，因此直接上抛。
        if (res.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
          continue;
        }
        // 其他 4xx：配置/参数错误，不重试
        if (res.status >= 400 && res.status < 500) {
          throw new Error(`CloudConvert client error ${res.status}: ${msg}`);
        }
        // 5xx：服务端错误，重试
        if (attempt === retries) {
          throw new Error(`CloudConvert server error ${res.status}: ${msg}`);
        }
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      // 已经是格式化过的 CloudConvert 错误，直接上抛
      const errMsg = err instanceof Error ? err.message : undefined;
      if (typeof errMsg === 'string' && errMsg.startsWith('CloudConvert')) throw err;
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error('CloudConvert request failed after retries');
}

/**
 * 从 CloudConvert job 提取可读的失败原因。
 *
 * 覆盖全部已知的错误载体（2026-10-04 实测：只读 task.result 会拿到空的
 * "no failure detail"，真实原因可能挂在 task 自身、job.result 或 job.error 上）：
 *   ① 失败 task 的 result.message / code / error，以及 task 自身的 message / code / error；
 *   ② job 级 result 与 job 级 error 两种形态；
 *   ③ 都缺时给出 job status + task 状态摘要，保证告警永远有信息量。
 */
function describeJobFailure(job: CCJobResponse): string {
  const tasks = (job && job.data && job.data.tasks) || [];
  const failed = tasks.find((t) => t.status === 'error');
  const asRec = (v: unknown): Record<string, unknown> | undefined =>
    v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
  const pick = (...vals: unknown[]): string | undefined => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (v && typeof v === 'object') {
        const nested = pick((v as Record<string, unknown>).message, (v as Record<string, unknown>).code);
        if (nested) return nested;
      }
    }
    return undefined;
  };

  const ft = asRec(failed);
  const fr = asRec(ft ? ft.result : undefined);
  const fromTask = pick(fr?.message, fr?.code, fr?.error, ft?.message, ft?.code, ft?.error);
  if (fromTask) return fromTask;

  const jd = asRec(job ? (job.data as unknown) : undefined);
  const jr = asRec(jd ? jd.result : undefined);
  const je = asRec(jd ? jd.error : undefined);
  const fromJob = pick(jr?.message, jr?.code, jr?.error, je?.message, je?.code, je?.error);
  if (fromJob) return fromJob;

  const summary = tasks.map((t) => `${t.operation || '?'}:${t.status || '?'}`).join(', ');
  return `no failure detail (job=${(jd ? jd.status : undefined) || 'unknown'}, tasks: ${summary || 'none'})`;
}

interface CCJobResponse {
  data: {
    id: string;
    status: string;
    tasks: Array<{
      id: string;
      name: string;
      operation: string;
      status: string;
      result?: {
        id?: string;
        message?: string;
        code?: string;
        files?: Array<{ filename: string; url: string; size?: number }>;
        form?: {
          url: string;
          parameters: Record<string, string>;
        };
      };
    }>;
  };
}

/**
 * 一次尝试失败时携带「失败是否发生在 convert 任务」的标记。
 * 只有 convert 任务失败才值得换引擎重试；参数/配额/上传类失败重试无意义。
 */
class CloudConvertJobFailure extends Error {
  readonly convertTaskFailed: boolean;
  constructor(message: string, convertTaskFailed: boolean) {
    super(message);
    this.name = 'CloudConvertJobFailure';
    this.convertTaskFailed = convertTaskFailed;
  }
}

/** 创建 job。useCalibre=true 时指定 calibre 引擎；false 时省略 engine，交给 CloudConvert 自动选引擎。 */
async function createJob(
  sourceFormat: string,
  targetFormat: string,
  useCalibre: boolean,
): Promise<CCJobResponse> {
  return ccRequest<CCJobResponse>('POST', '/jobs', {
    tasks: {
      'import-file': { operation: 'import/upload' },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        input_format: sourceFormat,
        output_format: targetFormat,
        // Calibre 读不了 DjVu / PDF 等扫描图或排版类输入（省 engine 让默认引擎接管），
        // 同时它的输出格式白名单也不含 docx（见 convertWithCloudConvert 的降级重试）。
        ...(useCalibre ? { engine: 'calibre' } : {}),
      },
      'export-file': { operation: 'export/url', input: 'convert-file' },
    },
  });
}

/** 把文件上传到 import/upload 任务的签名表单（S3 直传，不是 /v2/uploads） */
async function uploadToJob(
  job: CCJobResponse,
  inputBase64: string,
  sourceFormat: string,
  originalFilename?: string,
): Promise<void> {
  const importTask = job.data.tasks.find((t) => t.operation === 'import/upload');
  if (!importTask) {
    throw new CloudConvertJobFailure(
      'CloudConvert: import/upload task not found in job response',
      false,
    );
  }
  const uploadForm = importTask.result?.form;
  if (!uploadForm?.url || !uploadForm.parameters) {
    throw new CloudConvertJobFailure(
      'CloudConvert: upload form not available in import task result',
      false,
    );
  }
  const fd = new FormData();
  for (const [k, v] of Object.entries(uploadForm.parameters)) {
    fd.append(k, String(v));
  }
  // key 参数里含 ${filename} 占位符，S3 会用 file 字段的实际文件名替换它
  fd.append(
    'file',
    new Blob([Buffer.from(inputBase64, 'base64')], { type: 'application/octet-stream' }),
    originalFilename || `input.${sourceFormat}`,
  );
  const upRes = await fetch(uploadForm.url, { method: 'POST', body: fd });
  // success_action_status=201 → 成功时返回 201
  if (upRes.status !== 201 && upRes.status !== 200 && upRes.status !== 204) {
    const t = await upRes.text().catch(() => '');
    throw new CloudConvertJobFailure(
      `CloudConvert upload failed ${upRes.status}: ${t.slice(0, 200)}`,
      false,
    );
  }
}

/** 轮询 job 直到 finished；job 级 error 时抛 CloudConvertJobFailure（convertTaskFailed 标记是否发生在 convert 任务） */
async function pollUntilDone(job: CCJobResponse): Promise<CCJobResponse> {
  let finished: CCJobResponse = job;
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    finished = await ccRequest<CCJobResponse>('GET', `/jobs/${job.data.id}`);
    if (finished.data.status === 'finished') return finished;
    if (finished.data.status === 'error') {
      const failed = finished.data.tasks.find((t) => t.status === 'error');
      const detail = describeJobFailure(finished);
      // 服务端日志：把失败任务的完整内容打出来，便于在 Vercel 函数日志里定位真实原因
      console.error(
        '[CloudConvert] job failed. detail=',
        detail,
        '| failedTask=',
        JSON.stringify(failed ?? null),
        '| allTasks=',
        JSON.stringify(
          finished.data.tasks.map((t) => ({
            op: t.operation,
            name: t.name,
            status: t.status,
            result: t.result,
          })),
        ),
      );
      throw new CloudConvertJobFailure(
        `CloudConvert job failed: ${detail}`,
        failed?.operation === 'convert',
      );
    }
  }
  throw new CloudConvertJobFailure(
    `CloudConvert job did not finish in time (status: ${finished.data.status})`,
    false,
  );
}

/** 从已完成的 job 里取 export URL 并下载结果（签名临时 URL，无需鉴权） */
async function downloadResult(
  finished: CCJobResponse,
  targetFormat: string,
): Promise<{ base64Data: string; mimeType: string; filename: string; fileSize: number }> {
  const exportTask = finished.data.tasks.find((t) => t.operation === 'export/url');
  const file = exportTask?.result?.files?.[0];
  if (!file?.url) {
    throw new CloudConvertJobFailure('CloudConvert: no export file URL in job result', false);
  }
  const dlRes = await fetch(file.url);
  if (!dlRes.ok) {
    throw new CloudConvertJobFailure(`CloudConvert download failed: ${dlRes.status}`, false);
  }
  const buffer = Buffer.from(await dlRes.arrayBuffer());
  const mimeType = dlRes.headers.get('content-type') || 'application/octet-stream';
  const cd = dlRes.headers.get('content-disposition') || '';
  const filenameMatch = cd.match(/filename[^;=\n]*=((['\"]).*?\2|[^;\n]*)/);
  const filename =
    (filenameMatch?.[1]?.replace(/['\"]/g, '') || file.filename) ||
    `output.${targetFormat}`;

  return { base64Data: buffer.toString('base64'), mimeType, filename, fileSize: buffer.length };
}

/**
 * 完整转换流程：创建 job → 上传文件 → 轮询 → 下载
 *
 * 引擎降级重试（2026-10-04 新增）：calibre 引擎**只覆盖输入，不覆盖全部输出**。
 * 实测 epub→pdf、epub→mobi 成功，而 epub→docx、html→docx、txt→docx 全部失败
 * ⇒ CloudConvert 的 calibre 引擎不支持 docx 作为输出格式（与输入格式无关）。
 * 因此 convert 任务失败时，自动**省掉 engine 重试一次**并让 CloudConvert 自选引擎；
 * 两次都失败才抛错，错误里同时带两次尝试的引擎与原因，便于一眼定位。
 */
export async function convertWithCloudConvert(
  sourceFormat: string,
  targetFormat: string,
  inputBase64: string,
  originalFilename?: string,
): Promise<{
  base64Data: string;
  mimeType: string;
  filename: string;
  fileSize: number;
}> {
  if (!API_KEY) {
    throw new Error('CloudConvert API key is not configured');
  }

  // 只有首选 calibre 的组合才值得降级重试（白名单外的输入本来就用默认引擎）
  const calibreFirst = isCalibreInput(sourceFormat);
  const maxAttempts = calibreFirst ? 2 : 1;
  const trail: string[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const useCalibre = attempt === 0 && calibreFirst;
    const label = useCalibre ? 'engine=calibre' : 'engine=auto';
    try {
      const job = await createJob(sourceFormat, targetFormat, useCalibre);
      await uploadToJob(job, inputBase64, sourceFormat, originalFilename);
      const finished = await pollUntilDone(job);
      return await downloadResult(finished, targetFormat);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      trail.push(`${label}: ${msg}`);
      const retryable =
        err instanceof CloudConvertJobFailure && err.convertTaskFailed && attempt < maxAttempts - 1;
      if (!retryable) break;
      console.warn('[CloudConvert] convert task failed; retrying without engine', {
        sourceFormat,
        targetFormat,
        firstAttempt: msg,
      });
    }
  }

  throw new CloudConvertJobFailure(
    `CloudConvert job failed after ${trail.length} attempt(s) | ${trail.join(' || ')}`,
    false,
  );
}


