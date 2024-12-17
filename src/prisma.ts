import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

process.on("SIGINT", async () => {
  console.log("Disconnect to Prisma by SIGINT");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Disconnect to Prisma by SIGTERM");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("uncaughtException", async (err) => {
  console.log("Disconnect to Prisma by uncaughtException");
  await prisma.$disconnect();
  process.exit(1);
});

export default prisma;
