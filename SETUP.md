# 🚀 Guida Setup Find Miss

## Prerequisiti

Assicurati di avere installato:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- ✅ Redis (opzionale, per job queue) ([Download](https://redis.io/download))
- ✅ Git

---

## 📋 Checklist Setup

### 1. Database PostgreSQL

```bash
# Crea database
createdb findmiss

# Oppure via psql
psql -U postgres
CREATE DATABASE findmiss;
\q
```

### 2. Backend Setup

```bash
cd backend

# 1. Installa dipendenze
npm install

# 2. Configura variabili ambiente
cp .env.example .env
# Modifica .env con le tue configurazioni:
# - DATABASE_URL (connessione PostgreSQL)
# - JWT_SECRET (genera una chiave casuale)
# - JWT_REFRESH_SECRET (genera un'altra chiave casuale)
# - STRIPE_SECRET_KEY (se vuoi testare pagamenti)
# - FRONTEND_URL

# 3. Genera Prisma Client
npm run prisma:generate

# 4. Esegui migrazioni database
npm run prisma:migrate

# 5. (Opzionale) Popola database con dati di test
npm run prisma:seed

# 6. Avvia server
npm run dev
```

Il server dovrebbe essere disponibile su `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# 1. Installa dipendenze
npm install

# 2. Configura variabili ambiente
cp .env.local.example .env.local
# Modifica .env.local:
# - NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# 3. Avvia sviluppo
npm run dev
```

Il frontend dovrebbe essere disponibile su `http://localhost:3000`

---

## 🔧 Configurazione Dettagliata

### Backend .env

```env
# Database - Modifica con le tue credenziali PostgreSQL
DATABASE_URL="postgresql://tuo_user:tua_password@localhost:5432/findmiss?schema=public"

# JWT - Genera chiavi sicure (usa: openssl rand -base64 32)
JWT_SECRET="genera-chiave-casuale-qui"
JWT_REFRESH_SECRET="genera-altra-chiave-casuale-qui"

# Stripe (opzionale per test)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Redis (opzionale)
REDIS_URL="redis://localhost:6379"

# Porta server
PORT=3001
```

### Genera Chiavi JWT

```bash
# Su Linux/Mac
openssl rand -base64 32

# Su Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🧪 Test Setup

### 1. Test Database Connection

```bash
cd backend
npm run prisma:studio
# Apri browser su http://localhost:5555
```

### 2. Test API

```bash
# Test health check
curl http://localhost:3001/

# Test API
curl http://localhost:3001/api/test
```

### 3. Test Frontend

Apri browser su `http://localhost:3000` e verifica che:
- ✅ La homepage carichi
- ✅ La barra inferiore sia visibile
- ✅ I componenti si visualizzino correttamente

---

## 📊 Seed Database (Dati di Test)

Se vuoi popolare il database con dati di esempio:

```bash
cd backend
npm run prisma:seed
```

Questo creerà:
- Categorie (Donna, Uomo, Trans, Coppie, Videochat)
- Città principali italiane
- Utenti di test
- Annunci di esempio

---

## 🐛 Troubleshooting

### Errore: "Cannot find module '@prisma/client'"
```bash
cd backend
npm install
npm run prisma:generate
```

### Errore: "Database connection failed"
- Verifica che PostgreSQL sia avviato
- Controlla DATABASE_URL in `.env`
- Verifica credenziali database

### Errore: "Port 3001 already in use"
- Cambia PORT in `.env`
- Oppure termina il processo che usa la porta

### Errore: "Prisma schema is out of sync"
```bash
cd backend
npm run prisma:migrate
```

### Frontend non si connette al backend
- Verifica che il backend sia avviato
- Controlla `NEXT_PUBLIC_API_URL` in `.env.local`
- Verifica CORS in `backend/src/server.js`

---

## ✅ Verifica Setup Completo

Dopo il setup, verifica che:

1. ✅ Backend risponde su `http://localhost:3001`
2. ✅ Frontend risponde su `http://localhost:3000`
3. ✅ Database connesso (verifica con Prisma Studio)
4. ✅ API funzionanti (test con curl o Postman)
5. ✅ Frontend si connette al backend

---

## 🎯 Prossimi Passi

Una volta completato il setup:

1. **Testa le funzionalità base:**
   - Registrazione/Login
   - Visualizzazione annunci
   - Ricerca città
   - Filtri

2. **Configura Stripe** (se vuoi testare pagamenti):
   - Crea account Stripe
   - Ottieni chiavi API
   - Configura webhook

3. **Personalizza design:**
   - Modifica colori in Tailwind
   - Aggiungi logo
   - Personalizza componenti

4. **Aggiungi storage media:**
   - Configura AWS S3 o simile
   - Implementa upload immagini/video

5. **Deploy:**
   - Backend: Vercel, Railway, Heroku
   - Frontend: Vercel, Netlify
   - Database: Supabase, Railway, AWS RDS

---

## 📚 Documentazione

- [ARCHITETTURA.md](./ARCHITETTURA.md) - Architettura completa
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentazione API
- [README.md](./README.md) - Overview progetto

---

**Buon sviluppo! 🚀**





