import { PrismaClient } from "@prisma/client";

// 1. Extension du type de globalThis pour TypeScript
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient
};

// 2. Récupération de l'instance existante ou création d'une nouvelle
export const prisma =
    globalForPrisma.prisma || new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// 3. Stockage sur globalThis uniquement en environnement de développement
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}