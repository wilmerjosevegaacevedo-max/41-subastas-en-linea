import { getFirestoreDb } from "@/shared/server/firebase-admin";
import { type AuctionDetail, AuctionDetailSchema } from "../schema";
import type { AuctionListFilters, AuctionRepository } from "./repository";

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
    return AuctionDetailSchema.parse(doc.data());
  }

  async queryAuctions(collection: string, filters?: AuctionListFilters): Promise<AuctionDetail[]> {
    const db = getFirestoreDb();
    let query: FirebaseFirestore.Query = db.collection(collection);

    if (filters?.estado !== undefined) {
      query = query.where("estado", "==", filters.estado);
    }

    query = query.orderBy("cierra_en", "asc");

    if (filters?.limite !== undefined && filters.limite > 0) {
      query = query.limit(filters.limite);
    }

    const snapshot = await query.get();
    let items: AuctionDetail[] = [];
    for (const doc of snapshot.docs) {
      items.push(AuctionDetailSchema.parse(doc.data()));
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
    const validated = AuctionDetailSchema.parse(data);
    await db.collection(collection).doc(id).set(validated);
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
    return AuctionDetailSchema.parse(updated.data());
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
    return AuctionDetailSchema.parse(updated.data());
  }
}

export class FirestoreAuctionRepository implements AuctionRepository {
  private readonly adapter: FirestoreAdapter;
  private readonly collectionName: string;

  constructor(adapter?: FirestoreAdapter, collectionName = "auctions") {
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
