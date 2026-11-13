import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import localRules from "./scripts/eslint/max-methods-per-class.mjs";

/**
 * Reglas de código del proyecto:
 *  1. Cero `any` y cero `unknown`: validación estricta en el punto de entrada con Zod.
 *  2. Sin operadores ternarios y todo if/else/bucle lleva llaves.
 *  3. Funciones de máximo 100 líneas.
 *  4. Clases de máximo 10 funciones.
 *  5. Nombres: funciones y variables en camelCase; clases, interfaces y tipos en PascalCase.
 */

const namingConvention = (functionFormats) => [
  "error",
  { selector: "function", format: functionFormats },
  { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"], leadingUnderscore: "allow" },
  { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
  { selector: "method", format: ["camelCase"] },
  { selector: "typeLike", format: ["PascalCase"] },
];

const unknownBan = [
  {
    selector: "TSUnknownKeyword",
    message:
      "Prohibido el tipo `unknown`. Valida en el punto de entrada con Zod; para `catch`, pasa el error a una función genérica `<T>(error: T)`.",
  },
  {
    selector: "CallExpression[callee.object.name='z'][callee.property.name=/^(unknown|any)$/]",
    message: "Prohibido `z.unknown()` y `z.any()`: describe la forma real del dato con un esquema.",
  },
];

const semanticHtml = [
  {
    selector: "JSXElement[openingElement.name.name=/^(div|span)$/] > JSXText[value=/\\S/]",
    message:
      "No pongas texto directamente en <div> ni <span>: usa <p>, <h1>–<h6>, <li>, <label>, <button>, <a>, <strong>, <time>…",
  },
];

const accessibilityRules = Object.fromEntries(
  [
    "alt-text",
    "anchor-has-content",
    "anchor-is-valid",
    "aria-props",
    "aria-proptypes",
    "aria-role",
    "aria-unsupported-elements",
    "click-events-have-key-events",
    "heading-has-content",
    "html-has-lang",
    "img-redundant-alt",
    "interactive-supports-focus",
    "label-has-associated-control",
    "no-autofocus",
    "no-noninteractive-element-interactions",
    "no-noninteractive-tabindex",
    "no-redundant-roles",
    "no-static-element-interactions",
    "role-has-required-aria-props",
    "role-supports-aria-props",
    "tabindex-no-positive",
  ].map((name) => [`jsx-a11y/${name}`, "error"]),
);

const boundary = (message, group) => ["error", { patterns: [{ group, message }] }];
const OTHER_FEATURE_SERVER = "@/features/*/server/**";
const CONTAINER = "@/features/container";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { local: localRules },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "no-restricted-syntax": ["error", ...unknownBan],
      "no-ternary": "error",
      curly: ["error", "all"],
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
      "local/max-methods-per-class": ["error", { max: 10 }],
      "@typescript-eslint/naming-convention": namingConvention(["camelCase"]),
    },
  },
  {
    files: ["app/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary("shared/ no puede depender de features/.", ["@/features/**"]),
    },
  },
  {
    files: ["app/features/*/schema.ts"],
    rules: {
      "no-restricted-imports": boundary("schema.ts solo describe contratos: sin server/, ui/ ni el contenedor.", [
        "**/server/**",
        "**/ui/**",
        CONTAINER,
      ]),
    },
  },
  {
    files: ["app/features/*/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary(
        "server/ no importa ui/, el contenedor ni el server/ de otra feature: usa un puerto propio.",
        ["**/ui/**", CONTAINER, OTHER_FEATURE_SERVER],
      ),
    },
  },
  {
    files: ["app/features/*/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary(
        "ui/ no importa server/ ni el contenedor: los datos le llegan por props desde las páginas.",
        ["**/server/**", CONTAINER, "server-only"],
      ),
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/features/**", "app/shared/**"],
    rules: {
      "no-restricted-imports": boundary(
        "Las rutas llegan a la lógica por @/features/container, no por el server/ de una feature.",
        [OTHER_FEATURE_SERVER],
      ),
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": namingConvention(["camelCase", "PascalCase"]),
      "no-restricted-syntax": ["error", ...unknownBan, ...semanticHtml],
      ...accessibilityRules,
    },
  },
  {
    files: ["**/route.ts"],
    rules: { "@typescript-eslint/naming-convention": namingConvention(["camelCase", "UPPER_CASE"]) },
  },
  {
    files: ["tests/**/*.ts", "app/features/*/tests/**/*.ts", "app/shared/tests/**/*.ts"],
    rules: { "max-lines-per-function": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
