import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prevent multiple instances of Prisma Client in development
// AND ensure connection reuse in Serverless environments (Vercel)
export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["error", "warn"], // Reduce log noise in prod, keep error/warn
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
