#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { resetAllContent } = require('../src/services/resetContent');

const prisma = new PrismaClient();

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('⚠️  Operazione distruttiva.');
    console.error('Per procedere: npm run reset-content -- --confirm');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non impostata in backend/.env');
    process.exit(1);
  }

  console.log('🧹 Reset contenuti Find Miss in corso...\n');

  const { admins, counts } = await resetAllContent(prisma);

  console.log('\n✅ Reset completato.\n');
  console.log('Rimosso:');
  Object.entries(counts).forEach(([key, value]) => {
    if (value > 0) console.log(`  - ${key}: ${value}`);
  });
  console.log('\nAdmin mantenuti:', admins.map((a) => a.email).join(', '));
  console.log('Cartella uploads svuotata.');
  console.log('Conservati: città, categorie, piani premium, codici sconto.');
}

main()
  .catch((error) => {
    console.error('❌ Errore reset:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
