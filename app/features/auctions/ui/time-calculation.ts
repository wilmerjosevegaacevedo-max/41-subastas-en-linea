export interface TimeRemainingResult {
  readonly isFinished: boolean;
  readonly isUnderOneMinute: boolean;
  readonly totalSeconds: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly formatted: string;
}

function padZero(value: number): string {
  if (value < 10) {
    return `0${value}`;
  }
  return String(value);
}

export function calculateTimeRemaining(
  closesAtIso: string,
  clientNow: Date,
  serverOffsetMs: number = 0,
): TimeRemainingResult {
  const closesAt = new Date(closesAtIso).getTime();
  const adjustedClientTime = clientNow.getTime() + serverOffsetMs;
  const remainingMs = closesAt - adjustedClientTime;

  if (remainingMs <= 0) {
    return {
      isFinished: true,
      isUnderOneMinute: false,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "00:00:00",
    };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isUnderOneMinute = totalSeconds < 60;

  if (isUnderOneMinute) {
    return {
      isFinished: false,
      isUnderOneMinute: true,
      totalSeconds,
      days,
      hours,
      minutes,
      seconds,
      formatted: `${seconds} segundos restantes`,
    };
  }

  let formatted = `${padZero(hours)}h ${padZero(minutes)}m ${padZero(seconds)}s`;
  if (days > 0) {
    formatted = `${days}d ${formatted}`;
  }

  return {
    isFinished: false,
    isUnderOneMinute: false,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formatted,
  };
}
