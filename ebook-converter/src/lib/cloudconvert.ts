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
const MAX_POLL_ATTEMPTS = 25; // 25 * 2s = 50s，给上传+下载留余量（route maxDuration=120）
const POLL_INTERVAL_MS = 2000;

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
          msg = (JSON.parse(text) as any)?.message || text;
        } catch {
          /* keep raw text */
        }
        // 402 (too many jobs at once) / 429 (rate limit) 是瞬态限流，需退避重试
        if ((res.status === 402 || res.status === 429) && attempt < retries) {
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
    } catch (err: any) {
      // 已经是格式化过的 CloudConvert 错误，直接上抛
      if (typeof err?.message === 'string' && err.message.startsWith('CloudConvert')) throw err;
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error('CloudConvert request failed after retries');
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
 * 完整转换流程：创建 job → 上传文件 → 轮询 → 下载
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

  // 1. 创建 job
  const job = await ccRequest<CCJobResponse>('POST', '/jobs', {
    tasks: {
      'import-file': { operation: 'import/upload' },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        input_format: sourceFormat,
        output_format: targetFormat,
        engine: 'calibre',
      },
      'export-file': { operation: 'export/url', input: 'convert-file' },
    },
  });

  const importTask = job.data.tasks.find((t) => t.operation === 'import/upload');
  if (!importTask) {
    throw new Error('CloudConvert: import/upload task not found in job response');
  }

  // 2. 上传文件到 import/upload 任务给出的签名 URL（S3 直传，不是 /v2/uploads）
  const uploadForm = importTask.result?.form;
  if (!uploadForm?.url || !uploadForm.parameters) {
    throw new Error('CloudConvert: upload form not available in import task result');
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
    throw new Error(`CloudConvert upload failed ${upRes.status}: ${t.slice(0, 200)}`);
  }

  // 3. 轮询 job 状态
  let finished: CCJobResponse = job;
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    finished = await ccRequest<CCJobResponse>('GET', `/jobs/${job.data.id}`);
    if (finished.data.status === 'finished') break;
    if (finished.data.status === 'error') {
      const failed = finished.data.tasks.find((t) => t.status === 'error');
      const detail =
        failed?.result?.message || failed?.result?.code || 'unknown failure';
      throw new Error(`CloudConvert job failed: ${detail}`);
    }
  }

  if (finished.data.status !== 'finished') {
    throw new Error(
      `CloudConvert job did not finish in time (status: ${finished.data.status})`,
    );
  }

  // 4. 取 export URL
  const exportTask = finished.data.tasks.find((t) => t.operation === 'export/url');
  const file = exportTask?.result?.files?.[0];
  if (!file?.url) {
    throw new Error('CloudConvert: no export file URL in job result');
  }

  // 5. 下载结果（签名临时 URL，无需 Authorization）
  const dlRes = await fetch(file.url);
  if (!dlRes.ok) {
    throw new Error(`CloudConvert download failed: ${dlRes.status}`);
  }
  const buffer = Buffer.from(await dlRes.arrayBuffer());
  const mimeType = dlRes.headers.get('content-type') || 'application/octet-stream';
  const cd = dlRes.headers.get('content-disposition') || '';
  const filenameMatch = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename =
    (filenameMatch?.[1]?.replace(/['"]/g, '') || file.filename) ||
    `output.${targetFormat}`;

  return {
    base64Data: buffer.toString('base64'),
    mimeType,
    filename,
    fileSize: buffer.length,
  };
}
