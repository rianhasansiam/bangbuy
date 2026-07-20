import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Add a PostgreSQL connection string to .env.local or the process environment.",
    );
  }

  try {
    const parsed = new URL(url);
    if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
      throw new Error("DATABASE_URL must use the postgresql:// scheme.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("DATABASE_URL")) {
      throw error;
    }
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string. URL-encode special characters in the username or password.",
    );
  }

  return url;
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
