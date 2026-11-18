/**
 * Script de seed para Firestore.
 * Puebla la base de datos con subastas demo activas y cuentas demo.
 *
 * Uso:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Variables de entorno requeridas (en .env.local):
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import type { App, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function getEnv(key: string): string {
  const val = process.env[key];
  if (val === undefined || val.trim() === "") {
    throw new Error(`Variable de entorno requerida: ${key}`);
  }
  return val;
}

function logError<T>(error: T): void {
  console.error("❌ Error en seed:", error);
}

function initFirebase(): App {
  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (getApps().length > 0) {
    const existing = getApps()[0];
    if (existing === undefined) {
      throw new Error("No se pudo obtener la app de Firebase");
    }
    return existing;
  }

  const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
  return initializeApp({ credential: cert(serviceAccount) });
}

interface AccountSeed {
  uid: string;
  email: string;
  nombre: string;
  rol: string;
  password_hash: string;
}

function buildAccounts(): AccountSeed[] {
  return [
    {
      uid: "comprador-demo-01",
      email: "comprador@demo.subastas.com",
      nombre: "Carlos Comprador",
      rol: "COMPRADOR",
      password_hash: hashPassword("demo123"),
    },
    {
      uid: "vendedor-demo-01",
      email: "vendedor@demo.subastas.com",
      nombre: "Valeria Vendedora",
      rol: "VENDEDOR",
      password_hash: hashPassword("demo123"),
    },
  ];
}

interface AuctionSeed {
  id: string;
  titulo: string;
  descripcion: string;
  fotos: string[];
  precio_inicial_centavos: number;
  incremento_centavos: number;
  puja_actual_centavos: number;
  vendedor_uid: string;
  ganador_uid: null;
  cierra_en: string;
  estado: string;
}

function buildAuctions(now: Date): AuctionSeed[] {
  const ms = now.getTime();
  return [
    {
      id: "leica-m3-1954",
      titulo: "Cámara Vintage Leica M3 1954",
      descripcion:
        "Cámara telemétrica clásica de 35 mm en impecable estado de conservación mecánica y estética. Número de serie original de 1954, incluye lente Summicron 50mm f/2 y funda de cuero original.",
      fotos: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
      ],
      precio_inicial_centavos: 15000000,
      incremento_centavos: 1000000,
      puja_actual_centavos: 15000000,
      vendedor_uid: "vendedor-demo-01",
      ganador_uid: null,
      cierra_en: new Date(ms + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estado: "activa",
    },
    {
      id: "omega-speedmaster-1969",
      titulo: "Reloj Omega Speedmaster Professional 1969",
      descripcion:
        "El legendario Moonwatch cronógrafo de cuerda manual calibre 861. Esfera negra original con pátina tritium homogénea y brazalete de acero inoxidable de época.",
      fotos: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"],
      precio_inicial_centavos: 28000000,
      incremento_centavos: 1000000,
      puja_actual_centavos: 28000000,
      vendedor_uid: "vendedor-demo-01",
      ganador_uid: null,
      cierra_en: new Date(ms + 36 * 60 * 60 * 1000).toISOString(),
      estado: "activa",
    },
    {
      id: "macbook-pro-m3-max",
      titulo: 'MacBook Pro 16" M3 Max 2023',
      descripcion:
        "Potencia gráfica y de cómputo extrema con chip M3 Max de 16 núcleos CPU y 40 núcleos GPU. 64 GB de memoria unificada y 1 TB de SSD ultra veloz, color negro espacial.",
      fotos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"],
      precio_inicial_centavos: 12500000,
      incremento_centavos: 500000,
      puja_actual_centavos: 12500000,
      vendedor_uid: "vendedor-demo-01",
      ganador_uid: null,
      cierra_en: new Date(ms + 102 * 60 * 60 * 1000).toISOString(),
      estado: "activa",
    },
    {
      id: "guitarra-fender-stratocaster-1965",
      titulo: "Guitarra Fender Stratocaster 1965 Sunburst",
      descripcion:
        "Stratocaster de época con cuerpo de aliso original y mástil de arce. Acabado sunburst original con relic natural. Electrónica y pastillas originales de 1965. Incluye estuche vintage de tweed.",
      fotos: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"],
      precio_inicial_centavos: 45000000,
      incremento_centavos: 2000000,
      puja_actual_centavos: 45000000,
      vendedor_uid: "vendedor-demo-01",
      ganador_uid: null,
      cierra_en: new Date(ms + 5 * 24 * 60 * 60 * 1000).toISOString(),
      estado: "activa",
    },
    {
      id: "cuadro-surrealista-arte-mexicano",
      titulo: "Cuadro Surrealista · Óleo sobre lienzo 60×80 cm",
      descripcion:
        "Obra única firmada por artista emergente mexicano. Técnica mixta con pan de oro real sobre lienzo de lino belga. Certificado de autenticidad y procedencia incluido.",
      fotos: ["https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1200&q=80"],
      precio_inicial_centavos: 8000000,
      incremento_centavos: 500000,
      puja_actual_centavos: 8000000,
      vendedor_uid: "vendedor-demo-01",
      ganador_uid: null,
      cierra_en: new Date(ms + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estado: "activa",
    },
  ];
}

async function seedAccounts(db: Firestore): Promise<void> {
  const accounts = buildAccounts();
  for (const account of accounts) {
    await db.collection("users").doc(account.uid).set(account);
    console.log(`✅ Usuario: ${account.nombre} (${account.email})`);
  }
}

async function seedAuctions(db: Firestore): Promise<void> {
  const auctions = buildAuctions(new Date());
  for (const auction of auctions) {
    await db.collection("auctions").doc(auction.id).set(auction);
    console.log(`✅ Subasta: ${auction.titulo} — cierra ${auction.cierra_en}`);
  }
}

async function main(): Promise<void> {
  // Cargar variables de entorno desde .env.local si existe (Node 20.6+)
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  initFirebase();
  const db = getFirestore();

  console.log("\n📦 Iniciando seed de Firestore...\n");

  await seedAccounts(db);
  console.log("");
  await seedAuctions(db);

  console.log("\n🚀 Seed completo. Base de datos lista para demo.");
  process.exit(0);
}

main().then(
  () => {},
  (err: Error) => {
    logError(err);
    process.exit(1);
  },
);
