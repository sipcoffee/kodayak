import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// R2 client configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = `photos/${filename}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Extract the R2 key from a full URL
 */
export function getKeyFromUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL)) {
    return null;
  }
  return url.replace(`${PUBLIC_URL}/`, "");
}
