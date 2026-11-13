/**
 * Reglas de "carpetas prohibidas" para agentes. Una sola fuente de verdad que usan
 * los dos harness: el plugin de OpenCode (.opencode/plugins/guard.ts) y el hook de
 * Claude Code (.claude/hooks/guard.ts).
 */
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { z } from "zod";

const optionalText = z.string().optional().catch(undefined);

export const ToolArgsSchema = z.looseObject({
  command: optionalText,
  filePath: optionalText,
  file_path: optionalText,
  path: optionalText,
  pattern: optionalText,
  include: optionalText,
  glob: optionalText,
  notebook_path: optionalText,
});
export type ToolArgs = z.infer<typeof ToolArgsSchema>;

const PATH_LIKE_KEY = /path|file|dir|glob|pattern|include|cwd/i;
const SHELL_TOOLS: readonly string[] = ["bash", "shell", "run_command"];

export const FORBIDDEN_DIRS = ["secrets/", "data/", ".git/"] as const;
export const FORBIDDEN_FILE_PATTERNS = [/^\.env(\..+)?$/] as const;
export const ALLOWED_EXCEPTIONS = [".env.example"] as const;

function toRelative(p: string, root: string): string | null {
  if (!p || p.includes("\0")) {
    return null;
  }
  const abs = resolve(root, p);
  let real = abs;
  try {
    if (existsSync(abs)) {
      real = realpathSync(abs);
    }
  } catch {
    /* sin acceso */
  }
  const rel = relative(realpathOrSelf(root), real);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    return null;
  }
  return rel.split(sep).join("/");
}

function realpathOrSelf(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
}

export function isForbiddenPath(p: string, root: string): boolean {
  const rel = toRelative(p, root);
  if (rel === null) {
    return false;
  }
  const segments = rel.split("/");
  const base = segments[segments.length - 1] ?? "";
  if ((ALLOWED_EXCEPTIONS as readonly string[]).includes(base)) {
    return false;
  }
  if (FORBIDDEN_DIRS.some((d) => rel === d.slice(0, -1) || rel.startsWith(d))) {
    return true;
  }
  return segments.some(
    (s) => FORBIDDEN_FILE_PATTERNS.some((re) => re.test(s)) && !ALLOWED_EXCEPTIONS.includes(s as never),
  );
}

export function shellTokens(command: string): string[] {
  return command
    .split(/[\s;|&<>()`'"=,]+/)
    .map((t) => t.replace(/^\$\{?PWD\}?\//, "./").replace(/^~\//, "/__home__/"))
    .filter(Boolean);
}

export function checkToolCall(tool: string, args: ToolArgs, root: string): string | null {
  const name = tool.toLowerCase();
  const deny = (what: string) =>
    `Bloqueado por la política del proyecto: '${what}' está en una zona prohibida (secretos, datos locales o .git). ` +
    `No intentes leerla por otro medio; si la necesitas, pídele permiso explícito a la persona.`;

  const isShellTool = SHELL_TOOLS.includes(name);
  if (isShellTool || args.command !== undefined) {
    const hit = shellTokens(args.command ?? "").find((t) => isForbiddenPath(t, root));
    if (hit) {
      return deny(hit);
    }
    if (isShellTool) {
      return null;
    }
  }

  for (const v of pathCandidates(args)) {
    const literal = v.replace(/\*+.*$/, "").replace(/\/+$/, "");
    if (isForbiddenPath(v, root) || (literal && isForbiddenPath(literal, root)) || /(^|\/)\.env(\.)?\*/.test(v)) {
      return deny(v);
    }
  }
  return null;
}

function pathCandidates(args: ToolArgs): string[] {
  const found: string[] = [];
  for (const [key, value] of Object.entries(args)) {
    if (!PATH_LIKE_KEY.test(key)) {
      continue;
    }
    if (typeof value === "string") {
      found.push(value);
      continue;
    }
    const list = z.array(z.string()).safeParse(value);
    if (list.success) {
      found.push(...list.data);
    }
  }
  return found;
}
