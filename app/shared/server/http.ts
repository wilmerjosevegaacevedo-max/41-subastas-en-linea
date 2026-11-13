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
