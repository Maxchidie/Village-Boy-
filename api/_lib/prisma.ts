import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is missing. Database features will be unavailable.");
    // Return a proxy that throws descriptive errors on access rather than crashing on init
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        return () => { throw new Error(`Database connection not configured. Missing DATABASE_URL environment variable. Tried to access: ${String(prop)}`); };
      }
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
