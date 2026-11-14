/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { z } from "zod";

const sharedModules = import.meta.glob<Record<string, object>>("../../app/shared/schema.ts", { eager: true });
const featureModules = import.meta.glob<Record<string, object>>("../../app/features/*/schema.ts", { eager: true });
const contractModules = { ...sharedModules, ...featureModules };

/** snake_case estricto: minúsculas y dígitos separados por guiones bajos simples */
const SNAKE_CASE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

type JsonNode = z.core.JSONSchema.JSONSchema;
type JsonNodeOrFlag = z.core.JSONSchema._JSONSchema;

function childNodes(node: JsonNode): JsonNodeOrFlag[] {
  const children: JsonNodeOrFlag[] = [];
  children.push(...Object.values(node.properties ?? {}));
  children.push(...Object.values(node.patternProperties ?? {}));
  children.push(...Object.values(node.$defs ?? {}));
  children.push(...(node.prefixItems ?? []));
  children.push(...(node.anyOf ?? []));
  children.push(...(node.allOf ?? []));
  children.push(...(node.oneOf ?? []));
  const single = [node.items, node.additionalProperties, node.propertyNames, node.not, node.contains];
  for (const child of single) {
    if (Array.isArray(child)) {
      children.push(...child);
    } else if (child !== undefined) {
      children.push(child);
    }
  }
  return children;
}

function collectPropertyKeys(node: JsonNodeOrFlag, found: string[]): string[] {
  if (typeof node === "boolean") {
    return found;
  }
  found.push(...Object.keys(node.properties ?? {}));
  for (const child of childNodes(node)) {
    collectPropertyKeys(child, found);
  }
  return found;
}

function keysOfSchema(schema: z.ZodType): string[] {
  const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  return collectPropertyKeys(jsonSchema, []);
}

function badKeys(keys: string[]): string[] {
  return keys.filter((key) => !SNAKE_CASE.test(key));
}

function exportedSchemas(): [string, z.ZodType][] {
  const schemas: [string, z.ZodType][] = [];
  for (const [file, module] of Object.entries(contractModules)) {
    for (const [name, value] of Object.entries(module)) {
      if (value instanceof z.ZodType) {
        schemas.push([`${file.replace("../../app/", "")} · ${name}`, value]);
      }
    }
  }
  return schemas;
}

describe("Contratos · todas las claves del cable están en snake_case", () => {
  const schemas = exportedSchemas();

  it("descubre los contratos del proyecto", () => {
    expect(Object.keys(contractModules).every((file) => file.endsWith("schema.ts"))).toBe(true);
  });

  it.each(schemas)("%s solo tiene claves en snake_case", (_name, schema) => {
    expect(badKeys(keysOfSchema(schema))).toEqual([]);
  });
});

describe("Contratos · detector de camelCase (prueba de la prueba)", () => {
  it("marca una clave montoCentavos en camelCase", () => {
    const camel = z.object({ montoCentavos: z.number(), nombre: z.string() });
    expect(badKeys(keysOfSchema(camel))).toEqual(["montoCentavos"]);
  });

  it("no marca un esquema escrito en snake_case", () => {
    const clean = z.object({ monto_centavos: z.number(), subasta_id: z.string() });
    expect(badKeys(keysOfSchema(clean))).toEqual([]);
  });
});
