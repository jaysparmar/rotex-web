import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION ?? "us-east-1";
const BUCKET = process.env.AWS_S3_BUCKET;
const PUBLIC_URL_BASE =
  process.env.AWS_S3_PUBLIC_URL_BASE ?? `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

let client: S3Client | undefined;
function getClient(): S3Client {
  return (client ??= new S3Client({ region: REGION }));
}

export function publicUrlFor(key: string): string {
  return `${PUBLIC_URL_BASE}/${key}`;
}

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not configured");
  await getClient().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return publicUrlFor(key);
}
