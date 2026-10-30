import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const PUBLIC_URL_BASE = (
  process.env.AWS_S3_PUBLIC_URL_BASE ?? (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "")
).replace(/\/+$/, "");

let client: S3Client | undefined;
function getClient(): S3Client {
  return (client ??= new S3Client({ region: REGION }));
}

function assertConfigured(): void {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not configured");
  if (!REGION) throw new Error("AWS_REGION not configured");
}

export function publicUrlFor(key: string): string {
  assertConfigured();
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${PUBLIC_URL_BASE}/${encodedKey}`;
}

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  assertConfigured();
  await getClient().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return publicUrlFor(key);
}
