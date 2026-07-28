import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { env } from '../config/env.js';

export type StorageAdapter = 'supabase' | 'local' | 's3' | 'cloudinary';

export interface UploadResult {
  storageKey: string;
  storageLocation: string;
  adapter: StorageAdapter;
}

// Check Supabase availability
const useSupabase = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = useSupabase
  ? createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!)
  : null;

const useS3 = Boolean(
  env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
);
const useCloudinary = Boolean(env.CLOUDINARY_URL);

const s3 = useS3
  ? new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  : null;

const uploadRoot = path.resolve(env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'));

async function uploadToSupabase(input: {
  storageKey: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<UploadResult> {
  const bucket = env.SUPABASE_STORAGE_BUCKET || 'content-uploads';

  const { data, error } = await supabase!.storage
    .from(bucket)
    .upload(input.storageKey, input.buffer, {
      contentType: input.mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase!.storage.from(bucket).getPublicUrl(input.storageKey);

  return {
    storageKey: input.storageKey,
    storageLocation: publicUrlData.publicUrl,
    adapter: 'supabase',
  };
}

function parseCloudinaryUrl(raw: string): { cloudName: string; apiKey: string; apiSecret: string } {
  const url = new URL(raw);
  return {
    cloudName: url.hostname,
    apiKey: url.username,
    apiSecret: url.password,
  };
}

async function uploadToCloudinary(
  input: { buffer: Buffer; mimeType: string; storageKey: string },
  credentials: { cloudName: string; apiKey: string; apiSecret: string },
): Promise<UploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = path.dirname(input.storageKey).replace(/\\/g, '/');
  const publicId = path.basename(input.storageKey, path.extname(input.storageKey));
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${credentials.apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const body = new FormData();
  body.append('file', new Blob([new Uint8Array(input.buffer)], { type: input.mimeType }));
  body.append('api_key', credentials.apiKey);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('public_id', publicId);
  body.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${credentials.cloudName}/auto/upload`, {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { secure_url?: string; public_id?: string };
  const storageKey = payload.public_id ?? input.storageKey;

  return {
    storageKey: `cloudinary://${storageKey}`,
    storageLocation: payload.secure_url ?? storageKey,
    adapter: 'cloudinary',
  };
}

async function uploadToS3(input: {
  storageKey: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<UploadResult> {
  await s3!.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: input.storageKey,
      Body: input.buffer,
      ContentType: input.mimeType,
    }),
  );

  return {
    storageKey: input.storageKey,
    storageLocation: `s3://${env.S3_BUCKET}/${input.storageKey}`,
    adapter: 's3',
  };
}

async function uploadToLocal(input: {
  storageKey: string;
  buffer: Buffer;
}): Promise<UploadResult> {
  const filePath = path.join(uploadRoot, input.storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, input.buffer);

  return {
    storageKey: `local://${input.storageKey}`,
    storageLocation: filePath,
    adapter: 'local',
  };
}

export async function storeUpload(input: {
  ownerId: string;
  contentId: string;
  buffer: Buffer;
  mimeType: string;
  extension: string;
}): Promise<UploadResult> {
  const storageKey = `${input.ownerId}/${input.contentId}/${crypto.randomUUID()}${input.extension}`;

  // 1. Supabase Storage (Preferred)
  if (useSupabase && supabase) {
    return uploadToSupabase({ storageKey, buffer: input.buffer, mimeType: input.mimeType });
  }

  // 2. Cloudinary
  if (useCloudinary && env.CLOUDINARY_URL) {
    return uploadToCloudinary(
      { buffer: input.buffer, mimeType: input.mimeType, storageKey },
      parseCloudinaryUrl(env.CLOUDINARY_URL),
    );
  }

  // 3. AWS S3
  if (s3 && env.S3_BUCKET) {
    return uploadToS3({ storageKey, buffer: input.buffer, mimeType: input.mimeType });
  }

  // 4. Local fallback
  return uploadToLocal({ storageKey, buffer: input.buffer });
}