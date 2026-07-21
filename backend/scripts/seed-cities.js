#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { ensureItalianCities } = require('../src/data/italianCities');

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non impostata');
    process.exit(1);
  }

  console.log('🏙️ Sincronizzazione catalogo città italiane...');
  const result = await ensureItalianCities(prisma);
  console.log(`✅ Completato: ${result.total} città (${result.created} create, ${result.updated} aggiornate)`);
}

main()
  .catch((error) => {
    console.error('❌ Errore seed città:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
