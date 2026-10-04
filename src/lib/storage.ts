import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Image bytes live in an S3-compatible bucket (a Railway bucket in production)
// when S3_BUCKET is set, and in ./.uploads during local development.

const bucket = process.env.S3_BUCKET;
const s3 = bucket
  ? new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
    })
  : null;

const localDir = path.join(process.cwd(), ".uploads");
const safeKey = (key: string) => {
  if (!/^[a-z0-9-]+\.(webp|jpg)$/i.test(key)) throw new Error("Bad storage key");
  return key;
};

export async function putObject(key: string, body: Buffer, contentType: string) {
  safeKey(key);
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    return;
  }
  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, key), body);
}

export async function getObject(key: string): Promise<Buffer | null> {
  safeKey(key);
  try {
    if (s3) {
      const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      return res.Body ? Buffer.from(await res.Body.transformToByteArray()) : null;
    }
    return await readFile(path.join(localDir, key));
  } catch {
    return null;
  }
}

export async function deleteObject(key: string) {
  safeKey(key);
  if (s3) await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  else await rm(path.join(localDir, key), { force: true });
}
