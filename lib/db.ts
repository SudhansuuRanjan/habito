import { PrismaClient } from "@prisma/client"

declare global {
  var __prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  prisma =
    globalThis.__prisma ||
    new PrismaClient({
      log: ["query", "error", "warn"],
    })
} catch (error) {
  console.error("[v0] Failed to initialize Prisma client:", error)
  // Fallback to a new instance
  prisma = new PrismaClient()
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

export { prisma }
export default prisma
