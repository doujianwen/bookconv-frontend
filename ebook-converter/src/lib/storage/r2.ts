import { S3Client } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ebook-temp';

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client && R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
    });
  }
  return s3Client!;
}

export function isR2Configured(): boolean {
  return !!(R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY);
}

export async function uploadToR2(key: string, buffer: Buffer): Promise<void> {
  const client = getClient();
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer }));
}

export async function downloadFromR2(key: string): Promise<Buffer> {
  const client = getClient();
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const response = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
