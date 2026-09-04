import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { apiError } from "@/lib/api";

const driver = process.env.STORAGE_DRIVER ?? "local";
const maxBytes = (Number(process.env.MAX_UPLOAD_MB ?? 15)) * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/json": "json",
};

let s3: S3Client | null = null;

function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials:
        process.env.S3_ACCESS_KEY_ID
          ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" }
          : undefined,
      forcePathStyle: true,
    });
  }
  return s3;
}

export interface StoredFile {
  url: string;
  name: string;
  mime: string;
  size: number;
}

export async function storeFile(file: File, folder = "general"): Promise<StoredFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds ${process.env.MAX_UPLOAD_MB ?? 15}MB limit`);
  }
  const mime = file.type.toLowerCase();
  const ext = ALLOWED_MIME[mime];
  if (!ext) {
    throw new Error(`File type ${mime || "unknown"} is not allowed.`);
  }
  const key = `${folder}/${randomUUID()}.${ext}`;

  if (driver === "s3") {
    const bucket = process.env.S3_BUCKET ?? "talentbridge";
    await getS3().send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mime }),
    );
    const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
    return { url: `${publicUrl ?? `https://${bucket}.s3.${process.env.S3_REGION ?? "us-east-1"}.amazonaws.com`}/${key}`, name: file.name, mime, size: buffer.byteLength };
  }

  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "public/uploads");
  const absDir = path.join(uploadDir, folder);
  await fs.mkdir(absDir, { recursive: true });
  const absPath = path.join(absDir, path.basename(key));
  await fs.writeFile(absPath, buffer);
  const url = `/uploads/${folder}/${path.basename(key)}`;
  return { url, name: file.name, mime, size: buffer.byteLength };
}

export function validateUploadInput(file: File | undefined): { file: File; error: null } | { file: null; error: ReturnType<typeof apiError> } {
  if (!file) return { file: null, error: apiError("No file provided. Use field name 'file'.", 400) };
  return { file, error: null };
}
