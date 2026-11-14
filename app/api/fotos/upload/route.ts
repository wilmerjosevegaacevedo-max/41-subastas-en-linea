import { UploadPhotoResponseSchema } from "@/features/auctions/schema";
import { container } from "@/features/container";
import { getBlobStorage } from "@/shared/server/blob-storage";
import { DomainError } from "@/shared/server/errors";
import { errorResponse } from "@/shared/server/http";
import { readSession } from "@/shared/server/session";

const MAX_PHOTO_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request): Promise<Response> {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const session = await readSession(req, container.accountService, isProduction);
    const headerUid = req.headers.get("x-user-uid");

    if (session === null && (headerUid === null || headerUid.trim() === "")) {
      throw new DomainError("UNAUTHENTICATED", "Debes iniciar sesión para subir fotos");
    }

    const formData = await req.formData();
    const file = formData.get("foto");

    if (file === null || !(file instanceof File)) {
      throw new DomainError("VALIDATION_ERROR", "No se proporcionó ningún archivo de foto válido");
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      throw new DomainError("VALIDATION_ERROR", "El tamaño de la foto no puede exceder 4.5 MB");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new DomainError("VALIDATION_ERROR", "Formato no permitido. Solo se admiten imágenes JPEG, PNG y WebP");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const pathname = `subastas/${Date.now()}-${sanitizedName}`;

    const blobStorage = getBlobStorage();
    const uploadResult = await blobStorage.upload(pathname, buffer, file.type);

    const payload = {
      foto_url: uploadResult.url,
      tamano_bytes: uploadResult.sizeBytes,
      tipo_mime: uploadResult.contentType,
    };

    return Response.json(UploadPhotoResponseSchema.parse(payload), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
