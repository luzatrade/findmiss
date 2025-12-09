# 🧪 Guida Test Completa - Find Miss

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere:
- ✅ Node.js 18+ installato
- ✅ PostgreSQL installato e avviato
- ✅ Database `findmiss` creato
- ✅ Redis installato (opzionale ma consigliato)

## 🚀 STEP 1: Setup Iniziale

### 1.1 Installa Dipendenze

```bash
# Backend
cd backend
npm install
npm install sharp  # Per compressione immagini

# Frontend (nuovo terminale)
cd frontend
npm install
npm install socket.io-client  # Per WebSocket
```

### 1.2 Configura Variabili Ambiente

**Backend** - Crea `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/findmiss?schema=public"

# JWT
JWT_SECRET="test-secret-key-change-in-production"
JWT_REFRESH_SECRET="test-refresh-secret-change-in-production"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"

# AWS S3 (opzionale - lascia vuoto per test locale)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="eu-west-1"
AWS_S3_BUCKET_NAME=""

# Redis (opzionale - lascia vuoto se non installato)
REDIS_URL="redis://localhost:6379"

# Stripe (opzionale)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

**Frontend** - Crea `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 1.3 Setup Database

```bash
cd backend

# Genera Prisma Client
npx prisma generate

# Esegui migrazioni (crea tabelle)
npx prisma migrate dev --name add_notifications

# Popola database con dati di test
npm run prisma:seed-completo
```

## 🎯 STEP 2: Avvia il Progetto

### Terminale 1 - Backend
```bash
cd backend
npm run dev
```

**Dovresti vedere:**
```
🚀 Server avviato su http://localhost:3001
🌐 Server accessibile su rete locale
💬 WebSocket attivo per chat real-time
✅ Redis connesso (se configurato)
```

### Terminale 2 - Frontend
```bash
cd frontend
npm run dev
```

**Dovresti vedere:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

## ✅ STEP 3: Test Funzionalità Base

### 3.1 Test Homepage

1. Apri browser: `http://localhost:3000`
2. Verifica che la homepage carichi
3. Controlla che gli annunci siano visibili
4. Testa i filtri rapidi (città, filtri avanzati)
5. Verifica che la bottom navigation funzioni

**✅ Cosa verificare:**
- [ ] Homepage carica senza errori
- [ ] Annunci visibili nel feed
- [ ] Filtri funzionano
- [ ] BottomNav naviga correttamente

### 3.2 Test Autenticazione

1. Clicca su "Menu" nella bottom nav
2. Clicca "Accedi / Registrati"
3. Registra un nuovo account:
   - Email: `test@test.com`
   - Password: `test123456`
   - Nickname: `TestUser`

4. Dopo registrazione, fai login

**✅ Cosa verificare:**
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Token salvato in localStorage
- [ ] Redirect dopo login funziona

### 3.3 Test Upload Media

1. Vai su `/announcements/new` (crea annuncio)
2. Compila i campi obbligatori
3. Clicca "Carica Immagini"
4. Seleziona un'immagine (jpg, png)
5. Verifica che l'upload funzioni

**✅ Cosa verificare:**
- [ ] Upload immagine funziona
- [ ] Immagine viene compressa (controlla dimensione file)
- [ ] Thumbnail generato
- [ ] URL immagine salvato correttamente

**🔍 Come verificare:**
- Apri Console browser (F12)
- Vai su Network tab
- Cerca richiesta `/api/upload/media`
- Verifica risposta con `url` e `thumbnail_url`

### 3.4 Test WebSocket Chat

1. Registra/logga con 2 utenti diversi (2 browser o incognito)
2. Utente 1: Clicca su un annuncio → "Chat"
3. Utente 2: Accetta la conversazione
4. Invia un messaggio da Utente 1
5. Verifica che arrivi in tempo reale a Utente 2

**✅ Cosa verificare:**
- [ ] Console mostra "✅ WebSocket connesso"
- [ ] Messaggi arrivano in tempo reale (senza refresh)
- [ ] Typing indicator funziona ("sta scrivendo...")
- [ ] Messaggi letti funzionano

**🔍 Come verificare:**
- Apri Console browser (F12)
- Dovresti vedere: `✅ WebSocket connesso`
- Invia messaggio e verifica che arrivi istantaneamente
- Digita e verifica che l'altro utente veda "sta scrivendo..."

### 3.5 Test Notifiche

1. Utente 1: Metti like a un annuncio di Utente 2
2. Utente 2: Verifica che la campanella notifiche mostri il badge
3. Clicca sulla campanella
4. Verifica che la notifica sia visibile

**✅ Cosa verificare:**
- [ ] Badge notifiche appare quando ci sono notifiche non lette
- [ ] Dropdown notifiche si apre
- [ ] Notifiche sono visibili
- [ ] "Segna come letta" funziona
- [ ] Contatore aggiorna correttamente

**🔍 Come verificare:**
- Metti like a un annuncio
- Verifica badge rosso sulla campanella
- Clicca campanella → verifica notifica
- Clicca "Segna come letta" → verifica che badge scompaia

### 3.6 Test Caching

1. Apri Network tab nel browser (F12)
2. Carica homepage
3. Ricarica pagina (F5)
4. Verifica che alcune richieste siano più veloci

**✅ Cosa verificare:**
- [ ] Richieste GET vengono cachate
- [ ] Cache viene invalidata su update
- [ ] Performance migliorata

**🔍 Come verificare:**
- Se Redis configurato: richieste dovrebbero essere più veloci
- Se Redis non configurato: sistema funziona comunque (senza cache)

## 🧪 STEP 4: Test API Dirette

### 4.1 Test Upload API

```bash
# Test upload singolo file
curl -X POST http://localhost:3001/api/upload/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

**Risposta attesa:**
```json
{
  "success": true,
  "data": {
    "url": "http://...",
    "thumbnail_url": "http://...",
    "type": "image",
    "size": 12345
  }
}
```

### 4.2 Test Notifiche API

```bash
# Ottieni notifiche
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Conta non lette
curl http://localhost:3001/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.3 Test WebSocket

Apri console browser e verifica:
```javascript
// Dovresti vedere nel console:
✅ WebSocket connesso
```

## 🐛 STEP 5: Troubleshooting

### Problema: Backend non si avvia

**Soluzione:**
1. Verifica che PostgreSQL sia avviato
2. Controlla `.env` file
3. Verifica che la porta 3001 sia libera
4. Controlla errori nel terminale

### Problema: Frontend non si connette al backend

**Soluzione:**
1. Verifica che backend sia avviato su porta 3001
2. Controlla `.env.local` con `NEXT_PUBLIC_API_URL`
3. Verifica CORS nel backend
4. Controlla console browser per errori

### Problema: WebSocket non si connette

**Soluzione:**
1. Verifica che backend sia avviato
2. Controlla che token JWT sia valido
3. Verifica console browser per errori
4. Controlla che Socket.IO sia installato

### Problema: Upload non funziona

**Soluzione:**
1. Se S3 non configurato: usa URL locali (funziona comunque)
2. Verifica che multer sia installato
3. Controlla dimensione file (max 50MB)
4. Verifica formato file supportato

### Problema: Notifiche non arrivano

**Soluzione:**
1. Verifica che migrazione database sia eseguita
2. Controlla che modello Notification esista
3. Verifica che utente sia loggato
4. Controlla console per errori

## 📊 STEP 6: Test Performance

### 6.1 Test Caricamento Pagina

1. Apri Chrome DevTools (F12)
2. Vai su "Network"
3. Ricarica pagina
4. Verifica tempi di caricamento

**Obiettivi:**
- Homepage: < 2 secondi
- API calls: < 500ms
- Immagini: lazy loading attivo

### 6.2 Test Mobile

1. Chrome DevTools (F12)
2. Clicca icona dispositivo mobile (Ctrl+Shift+M)
3. Seleziona "iPhone" o "Samsung Galaxy"
4. Verifica layout responsive

**✅ Cosa verificare:**
- [ ] Layout si adatta allo schermo
- [ ] Touch gestures funzionano
- [ ] BottomNav sempre visibile
- [ ] Testi leggibili

## ✅ Checklist Test Completo

### Funzionalità Base
- [ ] Homepage carica correttamente
- [ ] Feed annunci funziona
- [ ] Filtri funzionano
- [ ] Ricerca città funziona
- [ ] Dettaglio annuncio funziona

### Autenticazione
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Logout funziona
- [ ] Token refresh funziona

### Upload Media
- [ ] Upload singolo file funziona
- [ ] Upload multipli file funziona
- [ ] Compressione immagini funziona
- [ ] Thumbnail generati correttamente

### WebSocket Chat
- [ ] Connessione WebSocket funziona
- [ ] Messaggi real-time funzionano
- [ ] Typing indicator funziona
- [ ] Messaggi letti funzionano

### Notifiche
- [ ] Notifiche vengono create
- [ ] Badge contatore funziona
- [ ] Dropdown notifiche funziona
- [ ] Marcatura letta funziona

### Caching
- [ ] Cache funziona (se Redis configurato)
- [ ] Invalida cache funziona
- [ ] Performance migliorata

## 🎉 Test Completati!

Se tutti i test passano, il progetto è **funzionante e pronto**!

**Prossimi passi:**
1. Testare con dati reali
2. Configurare AWS S3 per produzione
3. Configurare Redis per produzione
4. Deploy in produzione

---

**Buon testing! 🚀**

