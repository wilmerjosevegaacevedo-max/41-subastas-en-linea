"use client";

import { useEffect, useState } from "react";
import { ServerTimeResponseSchema } from "../schema";
import { calculateTimeRemaining, type TimeRemainingResult } from "./time-calculation";

export interface UseCountdownOptions {
  closesAtIso: string;
  initialServerOffsetMs?: number;
}

export interface UseCountdownReturn {
  remaining: TimeRemainingResult;
  serverOffsetMs: number;
  isSyncing: boolean;
}

function parseServerTime(raw: string): number | null {
  try {
    const parsed = ServerTimeResponseSchema.parse(JSON.parse(raw));
    return new Date(parsed.server_time).getTime();
  } catch {
    return null;
  }
}

export function useCountdown({ closesAtIso, initialServerOffsetMs = 0 }: UseCountdownOptions): UseCountdownReturn {
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(initialServerOffsetMs);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [remaining, setRemaining] = useState<TimeRemainingResult>(() => {
    return calculateTimeRemaining(closesAtIso, new Date(), initialServerOffsetMs);
  });

  useEffect(() => {
    let isCancelled = false;

    async function syncClock(): Promise<void> {
      try {
        const clientSentTime = Date.now();
        const response = await fetch("/api/tiempo", { cache: "no-store" });
        if (!response.ok) {
          setIsSyncing(false);
          return;
        }
        const text = await response.text();
        const serverTimestamp = parseServerTime(text);
        if (serverTimestamp === null || isCancelled) {
          setIsSyncing(false);
          return;
        }

        const clientReceivedTime = Date.now();
        const roundTripEstimate = (clientReceivedTime - clientSentTime) / 2;
        const offset = serverTimestamp + roundTripEstimate - clientReceivedTime;

        setServerOffsetMs(offset);
        setIsSyncing(false);
        setRemaining(calculateTimeRemaining(closesAtIso, new Date(), offset));
      } catch {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    }

    void syncClock();

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        void syncClock();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [closesAtIso]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev.isFinished) {
          return prev;
        }
        return calculateTimeRemaining(closesAtIso, new Date(), serverOffsetMs);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [closesAtIso, serverOffsetMs]);

  return { remaining, serverOffsetMs, isSyncing };
}
