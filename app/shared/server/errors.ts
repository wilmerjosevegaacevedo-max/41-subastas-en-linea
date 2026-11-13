import type { ErrorCode, ErrorDetail } from "@/shared/schema";

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "La solicitud no es válida",
  UNAUTHENTICATED: "Debes iniciar sesión",
  FORBIDDEN: "No tienes permiso para realizar esta acción",
  NOT_FOUND: "El recurso no existe",
  CONFLICT: "La operación entra en conflicto",
  EXPIRED: "La subasta ya ha finalizado",
  INTERNAL_ERROR: "Ocurrió un error interno",
};

const ERROR_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  EXPIRED: 410,
  INTERNAL_ERROR: 500,
};

export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, customMessage?: string, details?: ErrorDetail[]) {
    let message = ERROR_MESSAGES[code];
    if (customMessage !== undefined && customMessage.trim() !== "") {
      message = customMessage;
    }
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function errorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}
