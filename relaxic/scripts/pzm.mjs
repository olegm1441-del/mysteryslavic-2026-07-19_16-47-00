#!/usr/bin/env node
/**
 * pzm — поднять Relaxic одной командой.
 *
 *   npm run pzm
 *
 * Ставит зависимости, если их нет; поднимает базу, если задан DATABASE_URL;
 * запускает dev-сервер. Без базы сайт тоже работает — на демо-данных.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  accent: (s) => `\x1b[38;2;232;72;43m${s}\x1b[0m`,
};

function run(cmd, args, { optional = false } = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    p.on("close", (code) => {
      if (code !== 0 && !optional) {
        console.error(c.red(`\n✕ Упало: ${cmd} ${args.join(" ")}`));
        process.exit(code ?? 1);
      }
      resolve(code);
    });
  });
}

function loadEnv() {
  const f = join(root, ".env");
  if (!existsSync(f)) return;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

console.log(c.accent("\n  RELAXIC ✕  ") + c.dim("поднимаю проект\n"));

loadEnv();

if (!existsSync(join(root, "node_modules"))) {
  console.log(c.dim("  → ставлю зависимости (это один раз)\n"));
  await run("npm", ["install", "--no-audit", "--no-fund"]);
}

const hasDb = Boolean(process.env.DATABASE_URL);

if (hasDb) {
  console.log(c.dim("\n  → DATABASE_URL найден, поднимаю базу\n"));
  await run("npx", ["prisma", "generate"]);
  await run("npx", ["prisma", "db", "push", "--skip-generate"]);
  await run("npm", ["run", "db:seed"], { optional: true });
  console.log(c.green("\n  ✓ база готова"));
} else {
  console.log(
    c.dim("\n  → DATABASE_URL не задан — запускаю на демо-данных.\n") +
    c.dim("    Чтобы подключить базу: скопируйте .env.example в .env\n")
  );
}

console.log(c.accent("\n  → http://localhost:3000\n"));
await run("npx", ["next", "dev"]);
