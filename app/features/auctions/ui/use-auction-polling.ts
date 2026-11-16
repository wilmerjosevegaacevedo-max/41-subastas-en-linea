"use client";

import { useCallback, useEffect, useState } from "react";
import { AuctionStateResponseSchema, type AuctionStateResponse } from "../schema";

export interface UseAuctionPollingOptions {
  subastaId: string;
  intervalMs?: number;
  initialCents: number;
  onPriceUpdated?: (newCents: number, data: AuctionStateResponse) => void;
  onAuctionClosed?: (winnerUid: string | null) => void;
}

export function useAuctionPolling(options: UseAuctionPollingOptions) {
  const [lastState, setLastState] = useState<AuctionStateResponse | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  let intervalMs = 3000;
  if (options.intervalMs !== undefined) {
    intervalMs = options.intervalMs;
  }

  const { subastaId, initialCents, onPriceUpdated, onAuctionClosed } = options;

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/subastas/${subastaId}/estado`, {
        cache: "no-store",
      });
      if (!res.ok) {
        return;
      }
      const data = AuctionStateResponseSchema.parse(await res.json());
      setLastState(data);

      if (data.puja_actual_centavos > initialCents) {
        if (onPriceUpdated !== undefined) {
          onPriceUpdated(data.puja_actual_centavos, data);
        }
        setNotification(`¡Atención! La puja más alta aumentó a $${Math.floor(data.puja_actual_centavos / 100)} COP.`);
      }

      if (data.estado === "cerrada") {
        if (onAuctionClosed !== undefined) {
          onAuctionClosed(data.ganador_uid);
        }
      }
    } catch {
      // Ignorar error transitorio durante sondeo en segundo plano
    }
  }, [subastaId, initialCents, onPriceUpdated, onAuctionClosed]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      } else {
        setIsPaused(false);
        void fetchState();
        timer = setInterval(() => {
          void fetchState();
        }, intervalMs);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!document.hidden) {
      timer = setInterval(() => {
        void fetchState();
      }, intervalMs);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [fetchState, intervalMs]);

  return {
    lastState,
    notification,
    isPaused,
    refreshManual: fetchState,
    clearNotification: () => {
      setNotification(null);
    },
  };
}
