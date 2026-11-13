import { EnvironmentReportSchema } from "@/shared/schema";
import { DomainError } from "./errors";

const REQUIRED_VARIABLES = [
  "APP_ORIGIN",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "BLOB_READ_WRITE_TOKEN",
] as const;

function statusOf(name: string): "PRESENTE" | "AUSENTE" | "FORMATO_INVALIDO" {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    return "AUSENTE";
  }
  if (name === "APP_ORIGIN") {
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "FORMATO_INVALIDO";
      }
    } catch {
      return "FORMATO_INVALIDO";
    }
  }
  return "PRESENTE";
}

export function environmentReport(): Record<string, "PRESENTE" | "AUSENTE" | "FORMATO_INVALIDO"> {
  const report: Record<string, "PRESENTE" | "AUSENTE" | "FORMATO_INVALIDO"> = {};
  for (const name of REQUIRED_VARIABLES) {
    report[name] = statusOf(name);
  }
  return EnvironmentReportSchema.parse(report);
}

export function requireEnvironment(): void {
  const report = environmentReport();
  if (Object.values(report).some((status) => status !== "PRESENTE")) {
    throw new DomainError("INTERNAL_ERROR");
  }
}

export { REQUIRED_VARIABLES };
