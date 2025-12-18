require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 AS ok');
    console.log('DB OK', result);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('DB FAIL', error);
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(1);
  }
}

main();
