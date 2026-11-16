import { DomainError } from "@/shared/server/errors";
import { getFirestoreDb } from "@/shared/server/firebase-admin";
import type { AuctionUpdatedSnapshot, BidItem, UserBidSummary } from "../schema";
import type { BidRepository, PlaceBidTransactionParams, PlaceBidTransactionResult } from "./repository";

export interface FirestoreBidAdapter {
  listBidsByUser(bidderUid: string): Promise<UserBidSummary[]>;
  runBidTransaction(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult>;
}

interface FirestoreBidDoc {
  subastaId?: string;
  subastaTitulo?: string;
  subastaFoto?: string;
  miPujaCentavos?: number;
  pujaActualCentavos?: number;
  cierraEn?: string;
  estadoSubasta?: string;
  estadoParticipacion?: string;
  fechaPuja?: string;
  subasta_id?: string;
  subasta_titulo?: string;
  subasta_foto?: string;
  mi_puja_centavos?: number;
  puja_actual_centavos?: number;
  cierra_en?: string;
  estado_subasta?: string;
  estado_participacion?: string;
  fecha_puja?: string;
}

export class DefaultFirestoreBidAdapter implements FirestoreBidAdapter {
  async listBidsByUser(bidderUid: string): Promise<UserBidSummary[]> {
    const db = getFirestoreDb();
    const snapshot = await db
      .collection("usuarios")
      .doc(bidderUid)
      .collection("pujas")
      .orderBy("fechaPuja", "desc")
      .get();

    const items: UserBidSummary[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data() as FirestoreBidDoc;
      let estadoSubasta: "activa" | "cerrada" = "activa";
      if (data.estadoSubasta === "cerrada" || data.estado_subasta === "cerrada") {
        estadoSubasta = "cerrada";
      }

      items.push({
        subasta_id: String(data.subastaId ?? data.subasta_id ?? ""),
        subasta_titulo: String(data.subastaTitulo ?? data.subasta_titulo ?? ""),
        subasta_foto: String(data.subastaFoto ?? data.subasta_foto ?? ""),
        mi_puja_centavos: Number(data.miPujaCentavos ?? data.mi_puja_centavos ?? 0),
        puja_actual_centavos: Number(data.pujaActualCentavos ?? data.puja_actual_centavos ?? 0),
        cierra_en: String(data.cierraEn ?? data.cierra_en ?? ""),
        estado_subasta: estadoSubasta,
        estado_participacion: (data.estadoParticipacion ??
          data.estado_participacion ??
          "ganando") as UserBidSummary["estado_participacion"],
        fecha_puja: String(data.fechaPuja ?? data.fecha_puja ?? ""),
      });
    }
    return items;
  }

  async runBidTransaction(params: PlaceBidTransactionParams): Promise<PlaceBidTransactionResult> {
    const db = getFirestoreDb();

    return db.runTransaction(async (transaction) => {
      const auctionRef = db.collection("subastas").doc(params.auctionId);
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

      const cierraEnStr = String(auctionData.cierraEn ?? auctionData.cierra_en ?? "");
      const cierraEnMs = new Date(cierraEnStr).getTime();
      if (cierraEnMs <= params.now.getTime()) {
        throw new DomainError("EXPIRED", "La subasta ya ha finalizado");
      }

      const vendedorUid = String(auctionData.vendedorUid ?? auctionData.vendedor_uid ?? "");
      if (vendedorUid === params.bidderUid) {
        throw new DomainError("FORBIDDEN", "No puedes pujar en tu propia subasta");
      }

      const precioInicialCentavos = Number(
        auctionData.precioInicialCentavos ?? auctionData.precio_inicial_centavos ?? 0,
      );
      const pujaActualCentavos = Number(
        auctionData.pujaActualCentavos ?? auctionData.puja_actual_centavos ?? precioInicialCentavos,
      );
      const incrementoCentavos = Number(auctionData.incrementoCentavos ?? auctionData.incremento_centavos ?? 100000);
      const ganadorUid = (auctionData.ganadorUid ?? auctionData.ganador_uid ?? null) as string | null;

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
        pujaActualCentavos: params.montoCentavos,
        ganadorUid: params.bidderUid,
        cierraEn: nuevoCierraEn,
      });

      const bidDocRef = auctionRef.collection("pujas").doc();
      const bidId = bidDocRef.id;

      transaction.set(bidDocRef, {
        uid: params.bidderUid,
        montoCentavos: params.montoCentavos,
        creadaEn: params.now.toISOString(),
      });

      const bid: BidItem = {
        id: bidId,
        subasta_id: params.auctionId,
        postor_uid: params.bidderUid,
        monto_centavos: params.montoCentavos,
        creada_en: params.now.toISOString(),
      };

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
