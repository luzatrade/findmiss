/**
 * Script per creare un account admin direttamente nel database
 * 
 * Uso:
 *   node create-admin.js
 *   oppure
 *   node create-admin.js email@example.com password123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Credenziali di default o da parametri
  const email = process.argv[2] || 'admin@findmiss.it';
  const password = process.argv[3] || 'admin123';
  const nickname = process.argv[4] || 'Admin';

  console.log('🔐 Creazione account admin...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Nickname: ${nickname}\n`);

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
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

