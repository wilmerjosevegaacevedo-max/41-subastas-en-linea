import { describe, expect, it } from "vitest";
import { calculateTimeRemaining } from "../ui/time-calculation";

describe("F1 · cálculo de cuenta regresiva y sincronización de reloj", () => {
  const baseServerTime = new Date("2026-11-13T12:00:00.000Z");

  it("calcula exactamente el tiempo restante con reloj sincronizado", () => {
    const closesAtIso = "2026-11-13T12:10:00.000Z"; // 10 minutos después
    const result = calculateTimeRemaining(closesAtIso, baseServerTime, 0);

    expect(result.isFinished).toBe(false);
    expect(result.isUnderOneMinute).toBe(false);
    expect(result.minutes).toBe(10);
    expect(result.seconds).toBe(0);
    expect(result.formatted).toBe("00h 10m 00s");
  });

  it("corrige el cálculo cuando el reloj del cliente está adelantado 5 minutos", () => {
    const closesAtIso = "2026-11-13T12:10:00.000Z";
    // El cliente cree que son las 12:05:00 (+5 min adelantado)
    const clientClockAhead = new Date("2026-11-13T12:05:00.000Z");
    // El servidor reportó que eran las 12:00:00 cuando el cliente envió la solicitud
    const serverOffsetMs = baseServerTime.getTime() - clientClockAhead.getTime(); // -300000 ms

    const result = calculateTimeRemaining(closesAtIso, clientClockAhead, serverOffsetMs);

    // Debe mostrar los 10 minutos reales, no 5 minutos
    expect(result.isFinished).toBe(false);
    expect(result.minutes).toBe(10);
    expect(result.seconds).toBe(0);
  });

  it("corrige el cálculo cuando el reloj del cliente está atrasado 5 minutos", () => {
    const closesAtIso = "2026-11-13T12:10:00.000Z";
    // El cliente cree que son las 11:55:00 (-5 min atrasado)
    const clientClockBehind = new Date("2026-11-13T11:55:00.000Z");
    const serverOffsetMs = baseServerTime.getTime() - clientClockBehind.getTime(); // +300000 ms

    const result = calculateTimeRemaining(closesAtIso, clientClockBehind, serverOffsetMs);

    expect(result.isFinished).toBe(false);
    expect(result.minutes).toBe(10);
    expect(result.seconds).toBe(0);
  });

  it("muestra formato destacado de segundos cuando faltan menos de 60 segundos", () => {
    const closesAtIso = "2026-11-13T12:00:45.000Z"; // 45 segundos restantes
    const result = calculateTimeRemaining(closesAtIso, baseServerTime, 0);

    expect(result.isFinished).toBe(false);
    expect(result.isUnderOneMinute).toBe(true);
    expect(result.totalSeconds).toBe(45);
    expect(result.formatted).toBe("45 segundos restantes");
  });

  it("marca finalizado y 00:00:00 cuando el tiempo expira", () => {
    const closesAtIso = "2026-11-13T11:59:59.000Z"; // 1 segundo en el pasado
    const result = calculateTimeRemaining(closesAtIso, baseServerTime, 0);

    expect(result.isFinished).toBe(true);
    expect(result.totalSeconds).toBe(0);
    expect(result.formatted).toBe("00:00:00");
  });

  it("muestra días completos cuando la subasta cierra en varios días", () => {
    const closesAtIso = "2026-11-16T15:30:00.000Z"; // 3 días y 3 horas y media
    const result = calculateTimeRemaining(closesAtIso, baseServerTime, 0);

    expect(result.isFinished).toBe(false);
    expect(result.days).toBe(3);
    expect(result.hours).toBe(3);
    expect(result.minutes).toBe(30);
  });
});
