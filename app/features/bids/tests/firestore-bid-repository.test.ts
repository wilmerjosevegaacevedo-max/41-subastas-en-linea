import { DomainError } from "@/shared/server/errors";
import { describe, expect, it } from "vitest";
import type { AuctionUpdatedSnapshot, BidItem, UserBidSummary } from "../schema";
import { FirestoreBidRepository, type FirestoreBidAdapter } from "../server/repository.firestore";

describe("F7 · Repositorio Firestore de Pujas", () => {
  const now = new Date("2026-11-14T15:00:00.000Z");

  class FakeFirestoreBidAdapter implements FirestoreBidAdapter {
    private auctionPrice = 10000000;
    private auctionClose = new Date(now.getTime() + 30 * 1000).toISOString(); // 30s restante

    async listBidsByUser(): Promise<UserBidSummary[]> {
      return [];
    }

    async runBidTransaction(params: {
      auctionId: string;
      bidderUid: string;
      montoCentavos: number;
      now: Date;
    }): Promise<{ bid: BidItem; updatedAuction: AuctionUpdatedSnapshot }> {
      if (params.auctionId === "inexistente") {
        throw new DomainError("NOT_FOUND", "La subasta no existe");
      }
      if (params.bidderUid === "vendedor-01") {
        throw new DomainError("FORBIDDEN", "No puedes pujar en tu propia subasta");
      }
      if (params.montoCentavos <= this.auctionPrice) {
        throw new DomainError("CONFLICT", "La puja debe ser mayor");
      }

      this.auctionPrice = params.montoCentavos;
      const extendedClose = new Date(new Date(this.auctionClose).getTime() + 60000).toISOString();
      this.auctionClose = extendedClose;

      return {
        bid: {
          id: "bid-fake-1",
          subasta_id: params.auctionId,
          postor_uid: params.bidderUid,
          monto_centavos: params.montoCentavos,
          creada_en: params.now.toISOString(),
        },
        updatedAuction: {
          id: params.auctionId,
          puja_actual_centavos: params.montoCentavos,
          ganador_uid: params.bidderUid,
          cierra_en: extendedClose,
          extension_aplicada: true,
        },
      };
    }
  }

  it("ejecuta la transacción y aplica la extensión anti-sniper", async () => {
    const adapter = new FakeFirestoreBidAdapter();
    const repo = new FirestoreBidRepository(adapter);

    const result = await repo.placeBid({
      auctionId: "subasta-1",
      bidderUid: "comprador-01",
      montoCentavos: 12000000,
      now,
    });

    expect(result.updatedAuction.extension_aplicada).toBe(true);
    expect(result.bid.monto_centavos).toBe(12000000);
  });

  it("rechaza la transacción con FORBIDDEN si el postor es el vendedor", async () => {
    const adapter = new FakeFirestoreBidAdapter();
    const repo = new FirestoreBidRepository(adapter);

    await expect(
      repo.placeBid({
        auctionId: "subasta-1",
        bidderUid: "vendedor-01",
        montoCentavos: 12000000,
        now,
      }),
    ).rejects.toThrowError(DomainError);
  });
});
