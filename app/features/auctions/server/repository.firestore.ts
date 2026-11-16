import { getFirestoreDb } from "@/shared/server/firebase-admin";
import { type AuctionDetail, AuctionDetailSchema } from "../schema";
import type { AuctionListFilters, AuctionRepository } from "./repository";

interface FirestoreAuctionDoc {
  id?: string;
  vendedorUid?: string;
  titulo?: string;
  descripcion?: string;
  fotos?: string[];
  precioInicialCentavos?: number;
  incrementoCentavos?: number;
  pujaActualCentavos?: number;
  ganadorUid?: string | null;
  cierraEn?: string;
  estado?: string;
  precio_inicial_centavos?: number;
  incremento_centavos?: number;
  puja_actual_centavos?: number;
  vendedor_uid?: string;
  cierra_en?: string;
  ganador_uid?: string | null;
}

function toDomainAuction(docId: string, data: FirestoreAuctionDoc): AuctionDetail {
  const precioInicial = Number(data.precioInicialCentavos ?? data.precio_inicial_centavos ?? 0);
  const incremento = Number(data.incrementoCentavos ?? data.incremento_centavos ?? 0);
  const pujaActual = Number(data.pujaActualCentavos ?? data.puja_actual_centavos ?? precioInicial);
  const vendedor = String(data.vendedorUid ?? data.vendedor_uid ?? "");
  const cierraEn = String(data.cierraEn ?? data.cierra_en ?? "");
  const estado = String(data.estado ?? "activa");

  let ganador: string | null = null;
  if (data.ganadorUid !== undefined) {
    ganador = data.ganadorUid as string | null;
  } else if (data.ganador_uid !== undefined) {
    ganador = data.ganador_uid as string | null;
  }

  let fotos: string[] = [];
  if (Array.isArray(data.fotos)) {
    fotos = data.fotos as string[];
  }

  return AuctionDetailSchema.parse({
    id: docId,
    titulo: String(data.titulo ?? ""),
    descripcion: String(data.descripcion ?? ""),
    fotos,
    precio_inicial_centavos: precioInicial,
    incremento_centavos: incremento,
    puja_actual_centavos: pujaActual,
    vendedor_uid: vendedor,
    ganador_uid: ganador,
    cierra_en: cierraEn,
    estado,
  });
}

function toFirestoreAuction(auction: AuctionDetail): FirestoreAuctionDoc {
  return {
    id: auction.id,
    vendedorUid: auction.vendedor_uid,
    titulo: auction.titulo,
    descripcion: auction.descripcion,
    fotos: auction.fotos,
    precioInicialCentavos: auction.precio_inicial_centavos,
    incrementoCentavos: auction.incremento_centavos,
    pujaActualCentavos: auction.puja_actual_centavos,
    ganadorUid: auction.ganador_uid,
    cierraEn: auction.cierra_en,
    estado: auction.estado,
  };
}

export interface FirestoreAdapter {
  getDoc(collection: string, id: string): Promise<AuctionDetail | null>;
  queryAuctions(collection: string, filters?: AuctionListFilters): Promise<AuctionDetail[]>;
  setDoc(collection: string, id: string, data: AuctionDetail): Promise<void>;
  updateDoc(collection: string, id: string, partial: Record<string, string>): Promise<AuctionDetail>;
  cancelDoc(collection: string, id: string): Promise<AuctionDetail>;
}

export class DefaultFirestoreAdapter implements FirestoreAdapter {
  async getDoc(collection: string, id: string): Promise<AuctionDetail | null> {
    const db = getFirestoreDb();
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const rawData = doc.data() as FirestoreAuctionDoc | undefined;
    if (rawData === undefined) {
      return null;
    }
    return toDomainAuction(doc.id, rawData);
  }

  async queryAuctions(collection: string, filters?: AuctionListFilters): Promise<AuctionDetail[]> {
    const db = getFirestoreDb();
    let query: FirebaseFirestore.Query = db.collection(collection);

    if (filters?.estado !== undefined) {
      query = query.where("estado", "==", filters.estado);
    }

    query = query.orderBy("cierraEn", "asc");

    if (filters?.limite !== undefined && filters.limite > 0) {
      query = query.limit(filters.limite);
    }

    const snapshot = await query.get();
    let items: AuctionDetail[] = [];
    for (const doc of snapshot.docs) {
      const raw = doc.data() as FirestoreAuctionDoc;
      items.push(toDomainAuction(doc.id, raw));
    }

    if (filters?.q !== undefined && filters.q.trim() !== "") {
      const qLower = filters.q.toLowerCase().trim();
      items = items.filter((item) => {
        const matchTitle = item.titulo.toLowerCase().includes(qLower);
        const matchDesc = item.descripcion.toLowerCase().includes(qLower);
        return matchTitle || matchDesc;
      });
    }

    return items;
  }

  async setDoc(collection: string, id: string, data: AuctionDetail): Promise<void> {
    const db = getFirestoreDb();
    const firestoreData = toFirestoreAuction(data);
    await db.collection(collection).doc(id).set(firestoreData);
  }

  async updateDoc(collection: string, id: string, partial: Record<string, string>): Promise<AuctionDetail> {
    const db = getFirestoreDb();
    const docRef = db.collection(collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Subasta no encontrada");
    }

    await docRef.update(partial);
    const updated = await docRef.get();
    const raw = updated.data() as FirestoreAuctionDoc;
    return toDomainAuction(updated.id, raw);
  }

  async cancelDoc(collection: string, id: string): Promise<AuctionDetail> {
    const db = getFirestoreDb();
    const docRef = db.collection(collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Subasta no encontrada");
    }

    await docRef.update({ estado: "cancelada" });
    const updated = await docRef.get();
    const raw = updated.data() as FirestoreAuctionDoc;
    return toDomainAuction(updated.id, raw);
  }
}

export class FirestoreAuctionRepository implements AuctionRepository {
  private readonly adapter: FirestoreAdapter;
  private readonly collectionName: string;

  constructor(adapter?: FirestoreAdapter, collectionName = "subastas") {
    if (adapter !== undefined) {
      this.adapter = adapter;
    } else {
      this.adapter = new DefaultFirestoreAdapter();
    }
    this.collectionName = collectionName;
  }

  async findById(id: string): Promise<AuctionDetail | null> {
    return this.adapter.getDoc(this.collectionName, id);
  }

  async listActive(): Promise<AuctionDetail[]> {
    return this.adapter.queryAuctions(this.collectionName, { estado: "activa" });
  }

  async list(filters?: AuctionListFilters): Promise<AuctionDetail[]> {
    return this.adapter.queryAuctions(this.collectionName, filters);
  }

  async create(auction: AuctionDetail): Promise<AuctionDetail> {
    await this.adapter.setDoc(this.collectionName, auction.id, auction);
    return auction;
  }

  async update(id: string, partial: { titulo?: string; descripcion?: string }): Promise<AuctionDetail> {
    const updateData: Record<string, string> = {};
    if (partial.titulo !== undefined) {
      updateData.titulo = partial.titulo;
    }
    if (partial.descripcion !== undefined) {
      updateData.descripcion = partial.descripcion;
    }
    return this.adapter.updateDoc(this.collectionName, id, updateData);
  }

  async cancel(id: string): Promise<AuctionDetail> {
    return this.adapter.cancelDoc(this.collectionName, id);
  }
}
