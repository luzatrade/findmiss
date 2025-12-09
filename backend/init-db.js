/**
 * Script per inizializzare il database su Railway
 * Esegue le migrazioni e il seed automaticamente
 */

const { execSync } = require('child_process');
const path = require('path');

async function initDatabase() {
  console.log('🔄 Inizializzazione database...');

  try {
    // Esegui le migrazioni
    console.log('📦 Eseguo migrazioni database...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: path.join(__dirname)
    });
    console.log('✅ Migrazioni completate!');

    // Esegui il seed (solo se il database è vuoto)
    try {
      console.log('🌱 Popolo database con dati iniziali...');
      execSync('node prisma/seed.js', { 
        stdio: 'inherit',
        cwd: path.join(__dirname)
      });
      console.log('✅ Database popolato!');
    } catch (seedError) {
      // Se il seed fallisce (es. dati già presenti), continua comunque
      console.log('⚠️ Seed non eseguito (database potrebbe essere già popolato)');
    }

    console.log('🎉 Database inizializzato con successo!');
  } catch (error) {
    console.error('❌ Errore durante inizializzazione:', error.message);
    // Non esce con errore, lascia che il server si avvii comunque
  }
}

// Esegui l'inizializzazione
initDatabase().then(() => {
  console.log('✅ Inizializzazione completata, avvio server...');
  // Avvia il server
  require('./src/server.js');
}).catch((error) => {
  console.error('❌ Errore:', error);
  // Avvia comunque il server
  require('./src/server.js');
});

