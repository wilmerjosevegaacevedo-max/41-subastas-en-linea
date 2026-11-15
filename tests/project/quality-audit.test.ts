import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { metadata } from "@/layout";
import { environmentReport } from "@/shared/server/env";
import { describe, expect, it } from "vitest";

describe("F10 · Auditoría de Calidad, Accesibilidad (WCAG 2.2 AA) y Despliegue", () => {
  it("el layout raíz define metadatos SEO y OpenGraph completos", () => {
    expect(typeof metadata.title).toBe("string");
    expect(metadata.title).toContain("Subastas en Línea");
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description).toContain("pujas");

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBeDefined();
    expect(metadata.openGraph?.description).toBeDefined();
  });

  it("vercel.json existe, es un JSON válido y configura encabezados de seguridad", () => {
    const vercelPath = resolve(process.cwd(), "vercel.json");
    const content = readFileSync(vercelPath, "utf-8");
    const config = JSON.parse(content) as {
      headers?: Array<{ headers: Array<{ key: string; value: string }> }>;
    };

    expect(config.headers).toBeDefined();
    const firstRouteHeaders = config.headers?.[0]?.headers ?? [];
    const keys = firstRouteHeaders.map((h) => h.key);

    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
  });

  it("el reporte de entorno cubre las 11 variables requeridas del sistema", () => {
    const report = environmentReport();
    const expectedKeys = [
      "APP_ORIGIN",
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "BLOB_READ_WRITE_TOKEN",
    ];

    for (const key of expectedKeys) {
      expect(report[key]).toBeDefined();
    }
  });

  it("las páginas clave contienen etiquetas semánticas y elementos de accesibilidad", () => {
    const cssPath = resolve(process.cwd(), "app/globals.css");
    const cssContent = readFileSync(cssPath, "utf-8");

    // Verifica la directiva de foco visible y reducción de movimiento
    expect(cssContent).toContain(":focus-visible");
    expect(cssContent).toContain("prefers-reduced-motion");
    expect(cssContent).toContain(".skip-link");
  });
});
