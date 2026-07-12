import { PrismaClient } from "@prisma/client";

// Global for Prisma to prevent multiple instances in dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional logging
  });

if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  global.prisma = prisma;
}
