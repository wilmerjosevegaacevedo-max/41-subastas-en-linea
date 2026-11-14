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

const INITIAL_REMAINING: TimeRemainingResult = {
  totalSeconds: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  formatted: "--:--:--",
  isUnderOneMinute: false,
  isFinished: false,
};

export function useCountdown({ closesAtIso, initialServerOffsetMs = 0 }: UseCountdownOptions): UseCountdownReturn {
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(initialServerOffsetMs);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [remaining, setRemaining] = useState<TimeRemainingResult>(INITIAL_REMAINING);

  useEffect(() => {
    let isCancelled = false;

    async function syncClock(): Promise<void> {
      try {
        const clientSentTime = Date.now();
        const response = await fetch("/api/tiempo", { cache: "no-store" });
        if (!response.ok) {
          setIsSyncing(false);
          setRemaining(calculateTimeRemaining(closesAtIso, new Date(), initialServerOffsetMs));
          return;
        }
        const text = await response.text();
        const serverTimestamp = parseServerTime(text);
        if (serverTimestamp === null || isCancelled) {
          setIsSyncing(false);
          setRemaining(calculateTimeRemaining(closesAtIso, new Date(), initialServerOffsetMs));
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
          setRemaining(calculateTimeRemaining(closesAtIso, new Date(), initialServerOffsetMs));
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
  }, [closesAtIso, initialServerOffsetMs]);

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
