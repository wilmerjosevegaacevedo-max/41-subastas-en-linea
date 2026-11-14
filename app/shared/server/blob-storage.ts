import { put } from "@vercel/blob";

export interface BlobUploadResult {
  url: string;
  sizeBytes: number;
  contentType: string;
}

export interface BlobStoragePort {
  upload(pathname: string, body: Buffer, contentType: string): Promise<BlobUploadResult>;
}

export class MemoryBlobStorage implements BlobStoragePort {
  private readonly files: Map<string, { buffer: Buffer; contentType: string }> = new Map();

  async upload(pathname: string, body: Buffer, contentType: string): Promise<BlobUploadResult> {
    const cleanPath = pathname.replace(/^\/+/, "");
    this.files.set(cleanPath, { buffer: body, contentType });
    const fakeUrl = `https://blob.subastas.local/${cleanPath}`;
    return {
      url: fakeUrl,
      sizeBytes: body.byteLength,
      contentType,
    };
  }
}

export class VercelBlobStorage implements BlobStoragePort {
  async upload(pathname: string, body: Buffer, contentType: string): Promise<BlobUploadResult> {
    const blob = await put(pathname, body, {
      access: "public",
      contentType,
    });
    return {
      url: blob.url,
      sizeBytes: body.byteLength,
      contentType,
    };
  }
}

let blobStorageInstance: BlobStoragePort | null = null;

export function getBlobStorage(): BlobStoragePort {
  if (blobStorageInstance !== null) {
    return blobStorageInstance;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN !== undefined && process.env.NODE_ENV === "production") {
    blobStorageInstance = new VercelBlobStorage();
  } else {
    blobStorageInstance = new MemoryBlobStorage();
  }

  return blobStorageInstance;
}

export function setBlobStorage(instance: BlobStoragePort | null): void {
  blobStorageInstance = instance;
}
