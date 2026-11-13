import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { checkToolCall, isForbiddenPath } from "../../.agents/guard/rules";

describe("guard · carpetas y archivos prohibidos", () => {
  const root = resolve(import.meta.dirname, "../..");

  it("bloquea acceso a .env y sus variantes", () => {
    expect(isForbiddenPath(".env", root)).toBe(true);
    expect(isForbiddenPath(".env.local", root)).toBe(true);
    expect(isForbiddenPath("subfolder/.env", root)).toBe(true);
  });

  it("permite .env.example explícitamente", () => {
    expect(isForbiddenPath(".env.example", root)).toBe(false);
  });

  it("bloquea carpetas secrets/, data/ y .git/", () => {
    expect(isForbiddenPath("secrets/token.json", root)).toBe(true);
    expect(isForbiddenPath("data/dump.json", root)).toBe(true);
    expect(isForbiddenPath(".git/config", root)).toBe(true);
  });

  it("detecta accesos prohibidos en llamadas de herramientas", () => {
    const blocked = checkToolCall("read_file", { path: ".env" }, root);
    expect(blocked).not.toBeNull();

    const allowed = checkToolCall("read_file", { path: "package.json" }, root);
    expect(allowed).toBeNull();
  });
});
