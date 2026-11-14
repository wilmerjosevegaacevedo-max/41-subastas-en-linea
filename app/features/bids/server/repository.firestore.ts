import { DomainError } from "@/shared/server/errors";
import { getFirestoreDb } from "@/shared/server/firebase-admin";
import type { AuctionUpdatedSnapshot, BidItem, UserBidSummary } from "../schema";
import type { BidRepository, PlaceBidTransactionParams, PlaceBidTransactionResult } from "./repository";

export interface FirestoreBidAdapter {
  listBidsByUser(bidderUid: string): Promise<UserBidSummary[]>;
  runBidTransaction(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult>;
}

export class DefaultFirestoreBidAdapter implements FirestoreBidAdapter {
  async listBidsByUser(bidderUid: string): Promise<UserBidSummary[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").doc(bidderUid).collection("bids").orderBy("fecha_puja", "desc").get();

    const items: UserBidSummary[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data() as UserBidSummary;
      items.push(data);
    }
    return items;
  }

  async runBidTransaction(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult> {
    const db = getFirestoreDb();

    return db.runTransaction(async (transaction) => {
      const auctionRef = db.collection("auctions").doc(params.auctionId);
      const auctionDoc = await transaction.get(auctionRef);

      if (!auctionDoc.exists) {
        throw new DomainError("NOT_FOUND", "La subasta solicitada no existe");
      }

      const auctionData = auctionDoc.data();
      if (auctionData === undefined) {
        throw new DomainError("NOT_FOUND", "Datos de subasta no disponibles");
      }

      const estado = String(auctionData.estado ?? "");
      if (estado !== "activa") {
        throw new DomainError("CONFLICT", "La subasta no está activa");
      }

      const cierraEnStr = String(auctionData.cierra_en ?? "");
      const cierraEnMs = new Date(cierraEnStr).getTime();
      if (cierraEnMs <= params.now.getTime()) {
        throw new DomainError("EXPIRED", "La subasta ya ha finalizado");
      }

      const vendedorUid = String(auctionData.vendedor_uid ?? "");
      if (vendedorUid === params.bidderUid) {
        throw new DomainError("FORBIDDEN", "No puedes pujar en tu propia subasta");
      }

      const precioInicialCentavos = Number(auctionData.precio_inicial_centavos ?? 0);
      const pujaActualCentavos = Number(auctionData.puja_actual_centavos ?? precioInicialCentavos);
      const incrementoCentavos = Number(auctionData.incremento_centavos ?? 100000);
      const ganadorUid = auctionData.ganador_uid as string | null;

      let minRequired = precioInicialCentavos;
      if (ganadorUid !== null) {
        minRequired = pujaActualCentavos + incrementoCentavos;
      }

      if (params.montoCentavos < minRequired) {
        throw new DomainError("CONFLICT", `La puja debe ser de al menos ${minRequired} centavos`);
      }

      const remainingMs = cierraEnMs - params.now.getTime();
      let extensionAplicada = false;
      let nuevoCierraEn = cierraEnStr;

      if (remainingMs < 60000) {
        extensionAplicada = true;
        const extendedTime = new Date(cierraEnMs + 60000);
        nuevoCierraEn = extendedTime.toISOString();
      }

      transaction.update(auctionRef, {
        puja_actual_centavos: params.montoCentavos,
        ganador_uid: params.bidderUid,
        cierra_en: nuevoCierraEn,
      });

      const bidDocRef = auctionRef.collection("bids").doc();
      const bidId = bidDocRef.id;

      const bid: BidItem = {
        id: bidId,
        subasta_id: params.auctionId,
        postor_uid: params.bidderUid,
        monto_centavos: params.montoCentavos,
        creada_en: params.now.toISOString(),
      };

      transaction.set(bidDocRef, bid);

      const updatedAuction: AuctionUpdatedSnapshot = {
        id: params.auctionId,
        puja_actual_centavos: params.montoCentavos,
        ganador_uid: params.bidderUid,
        cierra_en: nuevoCierraEn,
        extension_aplicada: extensionAplicada,
      };

      return { bid, updatedAuction };
    });
  }
}

export class FirestoreBidRepository implements BidRepository {
  private readonly adapter: FirestoreBidAdapter;

  constructor(adapter?: FirestoreBidAdapter) {
    if (adapter !== undefined) {
      this.adapter = adapter;
    } else {
      this.adapter = new DefaultFirestoreBidAdapter();
    }
  }

  async listByBidder(bidderUid: string): Promise<UserBidSummary[]> {
    return this.adapter.listBidsByUser(bidderUid);
  }

  async placeBid(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult> {
    return this.adapter.runBidTransaction(params);
  }
}
