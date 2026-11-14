import { POST } from "@/api/fotos/upload/route";
import { ErrorResponseSchema } from "@/shared/schema";
import { MemoryBlobStorage } from "@/shared/server/blob-storage";
import { describe, expect, it } from "vitest";
import { UploadPhotoResponseSchema } from "../schema";

describe("F9 · Subida de Fotos con Vercel Blob y Cuotas", () => {
  it("MemoryBlobStorage guarda buffers y genera URLs seguras", async () => {
    const storage = new MemoryBlobStorage();
    const fakeBuffer = Buffer.from("contenido de imagen de prueba");
    const result = await storage.upload("subastas/foto-test.webp", fakeBuffer, "image/webp");

    expect(result.url).toContain("subastas/foto-test.webp");
    expect(result.sizeBytes).toBe(fakeBuffer.byteLength);
    expect(result.contentType).toBe("image/webp");
  });

  it("POST /api/fotos/upload sube exitosamente una foto válida", async () => {
    const fakeFileContent = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]); // Encabezado JPEG
    const file = new File([fakeFileContent], "camara-vintage.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("foto", file);

    const req = new Request("http://localhost:3000/api/fotos/upload", {
      method: "POST",
      headers: {
        "x-user-uid": "vendedor-demo-01",
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = UploadPhotoResponseSchema.parse(await res.json());
    expect(json.foto_url).toContain("subastas/");
    expect(json.tipo_mime).toBe("image/jpeg");
    expect(json.tamano_bytes).toBe(4);
  });

  it("POST /api/fotos/upload rechaza con 401 si el usuario no tiene sesión", async () => {
    const file = new File(["fake"], "foto.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("foto", file);

    const req = new Request("http://localhost:3000/api/fotos/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("UNAUTHENTICATED");
  });

  it("POST /api/fotos/upload rechaza con 400 formatos no permitidos (ej: PDF)", async () => {
    const file = new File(["fake-pdf"], "documento.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("foto", file);

    const req = new Request("http://localhost:3000/api/fotos/upload", {
      method: "POST",
      headers: {
        "x-user-uid": "vendedor-demo-01",
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toContain("Formato no permitido");
  });

  it("POST /api/fotos/upload rechaza archivos que exceden la cuota de 4.5 MB", async () => {
    // 5 MB = 5 * 1024 * 1024 bytes
    const largeContent = new Uint8Array(5 * 1024 * 1024);
    const file = new File([largeContent], "foto-pesada.webp", {
      type: "image/webp",
    });
    const formData = new FormData();
    formData.append("foto", file);

    const req = new Request("http://localhost:3000/api/fotos/upload", {
      method: "POST",
      headers: {
        "x-user-uid": "vendedor-demo-01",
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = ErrorResponseSchema.parse(await res.json());
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toContain("4.5 MB");
  });
});
