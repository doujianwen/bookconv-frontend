// src/lib/cloudconvert.ts
//
// CloudConvert API v2 客户端
// 作为 Calibre 不可用时的转换后端替代方案
//
// API 文档: https://developers.cloudconvert.com/api/2/create-task

const API_BASE = 'https://api.cloudconvert.com/2.0';
const API_KEY = process.env.CLOUD_CONVERT_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/** CloudConvert API 错误类型 */
export type CloudConvertError = {
  type: 'config_error' | 'api_error' | 'timeout' | 'task_failed' | 'unknown';
  message: string;
  details?: any;
};

/** 任务状态 */
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/** 任务响应数据 */
export interface TaskData {
  id: string;
  status: TaskStatus;
  result?: {
    download?: string;
    files?: Array<{
      id: string;
      url?: string;
      filename?: string;
      mime_type?: string;
      size?: number;
    }>;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * 检查 API Key 是否已配置
 */
export function isCloudConvertConfigured(): boolean {
  return !!API_KEY;
}

/**
 * 带重试的 API 请求
 */
async function apiRequest<T>(
  method: string,
  path: string,
  body?: any,
  retries = MAX_RETRIES,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${API_BASE}${path}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        let parsedError: any = null;
        try {
          parsedError = JSON.parse(errorText);
        } catch {}

        const errorMessage = parsedError?.message || errorText || response.statusText;

        // 4xx 错误不重试
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`CloudConvert API error: ${response.status} - ${errorMessage}`);
        }

        // 5xx 错误重试
        if (attempt === retries) {
          throw new Error(`CloudConvert API error (after ${retries} retries): ${response.status} - ${errorMessage}`);
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        continue;
      }

      return await response.json() as T;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  throw new Error('Unexpected retry exhaustion');
}

/**
 * 上传文件到 CloudConvert
 * 返回文件 ID
 */
export async function uploadFile(
  filename: string,
  contentBase64: string,
): Promise<{ fileId: string }> {
  // CloudConvert v2 使用 uploads endpoint
  const response = await apiRequest<{ data: { id: string } }>(
    'POST',
    '/uploads',
    {
      filename,
      content_type: 'application/octet-stream',
      data: contentBase64,
    },
  );

  if (!response?.data?.id) {
    throw new Error('CloudConvert upload did not return a file ID');
  }

  return { fileId: response.data.id };
}

/**
 * 创建转换任务
 */
export async function createConversionTask(
  fileId: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<{ taskId: string }> {
  const response = await apiRequest<{ data: TaskData }>(
    'POST',
    '/tasks',
    {
      input: 'default',
      output: 'result',
      tasks: [
        {
          input: 'default',
          converter: 'calibre',
          inputformat: sourceFormat,
          outputformat: targetFormat,
          files: [fileId],
        },
      ],
    },
  );

  if (!response?.data?.id) {
    throw new Error('CloudConvert API did not return a task ID');
  }

  return { taskId: response.data.id };
}

/**
 * 获取任务状态
 */
export async function getTaskStatus(taskId: string): Promise<TaskData> {
  const response = await apiRequest<{ data: TaskData }>(
    'GET',
    `/tasks/${taskId}`,
  );

  return response.data;
}

/**
 * 轮询任务状态直到完成或失败
 */
export async function pollTaskStatus(
  taskId: string,
  maxAttempts: number = 60,
  delayMs: number = 2000,
): Promise<{ status: 'completed' | 'failed'; result?: TaskData['result']; error?: CloudConvertError }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    try {
      const task = await getTaskStatus(taskId);

      if (task.status === 'completed') {
        return { status: 'completed', result: task.result };
      }

      if (task.status === 'failed') {
        return {
          status: 'failed',
          error: {
            type: 'task_failed',
            message: task.error?.message || 'Task failed',
            details: task.error,
          },
        };
      }

      // pending / processing: continue polling
      if (attempt === maxAttempts - 1) {
        return {
          status: 'failed',
          error: {
            type: 'timeout',
            message: `Task ${taskId} did not complete within ${maxAttempts * delayMs / 1000}s`,
          },
        };
      }
    } catch (err: any) {
      // API error during polling
      if (attempt === maxAttempts - 1) {
        return {
          status: 'failed',
          error: {
            type: 'api_error',
            message: err.message,
          },
        };
      }
    }
  }

  return {
    status: 'failed',
    error: {
      type: 'timeout',
      message: 'Polling limit reached',
    },
  };
}

/**
 * 下载转换结果
 */
export async function downloadResult(downloadUrl: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
}> {
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download result: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'application/octet-stream';
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filename = (contentDisposition
    ? contentDisposition.match(/filename[^;=\n]*=((['"]).\2|[^;\n]*)/)
      ?.[1]
      ?.replace(/['"]/g, '')
    : null) || 'converted-file';

  return { buffer, mimeType, filename };
}

/**
 * 完整的转换流程：上传文件 → 创建任务 → 轮询 → 下载
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

  // Step 1: Upload file
  const uploadFilename = originalFilename || `input.${sourceFormat}`;
  const { fileId } = await uploadFile(uploadFilename, inputBase64);

  // Step 2: Create conversion task
  const { taskId } = await createConversionTask(fileId, sourceFormat, targetFormat);

  // Step 3: Poll for completion
  const pollResult = await pollTaskStatus(taskId);

  if (pollResult.status === 'failed') {
    throw new Error(`CloudConvert task failed: ${pollResult.error?.message || 'Unknown error'}`);
  }

  // Step 4: Download result
  if (!pollResult.result?.download) {
    throw new Error('CloudConvert task completed but no download URL available');
  }

  const { buffer, mimeType, filename: resultFilename } = await downloadResult(pollResult.result.download);

  return {
    base64Data: buffer.toString('base64'),
    mimeType,
    filename: resultFilename,
    fileSize: buffer.length,
  };
}
