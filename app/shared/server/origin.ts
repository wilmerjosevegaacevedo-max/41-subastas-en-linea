import { DomainError } from "./errors";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return false;
    }
    return url.protocol === "http:";
  } catch {
    return false;
  }
}

export function assertRequestOrigin(request: Request, appOrigin: string, isDevelopment: boolean): void {
  if (!MUTATING_METHODS.has(request.method)) {
    return;
  }

  const origin = request.headers.get("origin");
  if (origin === appOrigin) {
    return;
  }
  if (isDevelopment && origin !== null && isDevelopmentOrigin(origin)) {
    return;
  }
  throw new DomainError("FORBIDDEN");
}
