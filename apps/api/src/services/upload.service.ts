import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { env } from '../config/env.js';

const useS3 = Boolean(env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);
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

export async function storeUpload(input: {
  ownerId: string;
  contentId: string;
  buffer: Buffer;
  mimeType: string;
  extension: string;
}) {
  const storageKey = `${input.ownerId}/${input.contentId}/${crypto.randomUUID()}${input.extension}`;

  if (s3 && env.S3_BUCKET) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
      }),
    );
    return { storageKey, storageLocation: `s3://${env.S3_BUCKET}/${storageKey}` };
  }

  const filePath = path.join(uploadRoot, storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, input.buffer);
  return { storageKey: `local://${storageKey}`, storageLocation: filePath };
}
