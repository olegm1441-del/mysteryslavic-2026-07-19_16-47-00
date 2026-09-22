import { defineConfig } from "@prisma/config";

/**
 * Prisma 7 вынес строку подключения из schema.prisma сюда.
 * DATABASE_URL на Railway подставляется автоматически (см. docs/07-RAILWAY.md).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
