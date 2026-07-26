import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { env } from "@/lib/env"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL wajib diisi untuk inisialisasi Prisma.")
  }

  const pool = new pg.Pool({
    connectionString: process.env.DIRECT_URL || env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
