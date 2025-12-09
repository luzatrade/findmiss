/**
 * Script per creare un account admin sul database di PRODUZIONE (Railway)
 * 
 * Uso:
 *   DATABASE_URL="postgresql://..." node create-admin-production.js
 *   oppure
 *   DATABASE_URL="postgresql://..." node create-admin-production.js email@example.com password123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Usa DATABASE_URL da variabile ambiente o .env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  // Credenziali di default o da parametri
  const email = process.argv[2] || 'admin@findmiss.it';
  const password = process.argv[3] || 'admin123';
  const nickname = process.argv[4] || 'Admin';

  console.log('🔐 Creazione account admin su DATABASE DI PRODUZIONE...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Nickname: ${nickname}\n`);

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERRORE: DATABASE_URL non trovato!');
    console.error('\nCome usare:');
    console.error('1. Ottieni DATABASE_URL da Railway:');
    console.error('   - Vai su Railway dashboard');
    console.error('   - Clicca sul servizio PostgreSQL');
    console.error('   - Tab "Variables"');
    console.error('   - Copia DATABASE_URL');
    console.error('\n2. Esegui:');
    console.error('   DATABASE_URL="postgresql://..." node create-admin-production.js');
    console.error('   oppure');
    console.error('   DATABASE_URL="postgresql://..." node create-admin-production.js email@example.com password123');
    process.exit(1);
  }

  try {
    // Verifica se esiste già
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  Account già esistente!');
      console.log('Aggiorno a admin...');
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data: {
          password_hash: passwordHash,
          role: 'admin',
          is_verified: true,
          is_active: true,
          nickname
        }
      });
      
      console.log('✅ Account aggiornato a admin!');
    } else {
      // Crea nuovo account admin
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          nickname,
          role: 'admin',
          is_verified: true,
          is_active: true
        }
      });
      
      console.log('✅ Account admin creato con successo!');
    }

    console.log('\n📋 Credenziali di accesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🌐 Accedi su: https://findmiss.it/admin`);
    console.log(`   oppure: https://findmiss.it/auth`);

  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Il database non è raggiungibile. Verifica:');
      console.error('   - DATABASE_URL è corretto?');
      console.error('   - Il database Railway è online?');
      console.error('   - La connessione è permessa dal tuo IP?');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

