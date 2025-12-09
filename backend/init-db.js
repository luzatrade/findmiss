/**
 * Script per inizializzare il database su Railway
 * Esegue le migrazioni e il seed automaticamente
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Inizializzazione database...');

try {
  // Esegui le migrazioni
  console.log('📦 Eseguo migrazioni database...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  console.log('✅ Migrazioni completate!');

  // Esegui il seed
  console.log('🌱 Popolo database con dati iniziali...');
  execSync('node prisma/seed.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  console.log('✅ Database popolato!');

  console.log('🎉 Database inizializzato con successo!');
  process.exit(0);
} catch (error) {
  console.error('❌ Errore durante inizializzazione:', error.message);
  process.exit(1);
}

