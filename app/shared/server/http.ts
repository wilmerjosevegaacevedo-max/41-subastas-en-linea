import { z } from "zod";
import { ErrorResponseSchema } from "@/shared/schema";
import { DomainError } from "./errors";

export function errorResponse<T>(error: T): Response {
  if (error instanceof DomainError) {
    const payload = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return Response.json(ErrorResponseSchema.parse(payload), {
      status: error.status,
    });
  }

  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    let msg = "La solicitud no es válida";
    if (firstIssue !== undefined) {
      msg = firstIssue.message;
    }
    const payload = {
      error: {
        code: "VALIDATION_ERROR" as const,
        message: msg,
      },
    };
    return Response.json(ErrorResponseSchema.parse(payload), {
      status: 400,
    });
  }

  return Response.json(
    ErrorResponseSchema.parse({
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error interno",
      },
    }),
    { status: 500 },
  );
}
