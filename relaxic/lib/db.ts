import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Один экземпляр клиента на процесс. В dev Next.js перезагружает модули,
 * поэтому кэшируем на globalThis — иначе при каждом hot reload открывается
 * новый пул соединений и база быстро упирается в лимит.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * null, если DATABASE_URL не задан. Сайт в этом случае работает на демо-данных:
 * `npm run pzm` должен подниматься без настройки базы.
 */
export const prisma: PrismaClient | null =
  globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export const hasDatabase = prisma !== null;
