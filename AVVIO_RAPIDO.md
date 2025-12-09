# 🚀 Find Miss - Avvio Rapido

## Requisiti

- Node.js 18+
- PostgreSQL (o usare SQLite per test rapidi)
- Redis (opzionale, per cache e scheduler)

---

## 1️⃣ Setup Backend

```powershell
cd backend

# Installa dipendenze
npm install

# Crea file .env
Copy-Item .env.example .env
# OPPURE crea manualmente con questo contenuto:
```

**Contenuto `.env`:**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/findmiss"
JWT_SECRET=il-tuo-secret-super-sicuro-123
FRONTEND_URL=http://localhost:3000
```

```powershell
# Genera Prisma Client
npx prisma generate

# Esegui migrazioni
npx prisma migrate dev --name init

# Popola database con dati di test
node prisma/seed-completo.js

# Avvia server
npm run dev
```

---

## 2️⃣ Setup Frontend

```powershell
cd frontend

# Installa dipendenze
npm install

# Crea file .env.local
```

**Contenuto `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

```powershell
# Avvia frontend
npm run dev
```

---

## 3️⃣ Accedi

Apri **http://localhost:3000** nel browser.

### Credenziali di Test

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | `admin@findmiss.com` | `password123` |
| Inserzionista | `sofia@example.com` | `password123` |
| Utente | `user@example.com` | `password123` |

---

## 📱 Funzionalità Disponibili

### Homepage
- Feed annunci stile EscortForum
- Live streaming in evidenza (badge rosso "LIVE")
- Storie 24h
- Reel in evidenza
- Filtri per categoria

### Reel (`/reels`)
- Video fullscreen stile YouTube Shorts
- Swipe up/down per navigare
- Like, commenti, condividi
- Pulsante "Contatta" diretto

### Live Streaming (`/live`)
- Lista live attive
- Guarda live con chat real-time
- Invia tips agli streamer
- Avvia la tua live (`/live/start`)

### Chat (`/chat`)
- Chat real-time WebSocket
- Media protetti con screenshot block
- Typing indicator
- Read receipts

### Area Inserzionista
- Pubblica annunci (`/announcements/new`)
- Gestisci annunci (`/my-announcements`)
- Acquista premium (`/payments`)
- Statistiche

### Admin (`/admin`)
- Dashboard statistiche
- Approva/rifiuta annunci
- Gestione utenti
- Broadcast notifiche

---

## 🔧 Comandi Utili

```powershell
# Backend
cd backend
npm run dev              # Avvia server development
npm run prisma:studio    # Apri Prisma Studio (GUI database)
npm test                 # Esegui test

# Frontend
cd frontend
npm run dev              # Avvia frontend development
npm run build            # Build produzione
npm run lint             # Controlla errori
```

---

## 📂 Struttura Progetto

```
findmiss/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── announcements.js
│   │   │   ├── reels.js
│   │   │   ├── live.js      # 🆕 Live streaming
│   │   │   ├── stories.js   # 🆕 Storie
│   │   │   ├── follows.js   # 🆕 Followers
│   │   │   ├── chat.js
│   │   │   └── ...
│   │   ├── websocket/       # WebSocket
│   │   │   ├── chatSocket.js
│   │   │   └── liveSocket.js # 🆕
│   │   └── services/
│   └── prisma/
│       ├── schema.prisma    # Database schema
│       └── seed-completo.js # Dati di test
│
├── frontend/
│   └── app/
│       ├── page.js          # Homepage
│       ├── reels/           # Reel fullscreen
│       ├── live/            # 🆕 Live streaming
│       │   ├── page.js      # Lista live
│       │   ├── [id]/        # Watch live
│       │   └── start/       # Avvia live
│       ├── chat/            # Chat
│       └── ...
│
└── AVVIO_RAPIDO.md          # Questa guida
```

---

## 🎯 Prossimi Passi

1. **Configura Stripe** per pagamenti reali
2. **Configura Redis** per cache e job queue
3. **Configura RTMP Server** per live streaming reale (es. nginx-rtmp)
4. **Deploy** su Vercel (frontend) + Railway/Render (backend)

---

## ❓ Problemi Comuni

### "Cannot connect to database"
```powershell
# Verifica che PostgreSQL sia avviato
# Controlla DATABASE_URL nel .env
```

### "Port 3001 already in use"
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Module not found"
```powershell
# Reinstalla dipendenze
npm install
npx prisma generate
```

---

## 🎉 Buon sviluppo!

Il progetto è completo e pronto per lo sviluppo. Include:
- ✅ Sistema annunci completo
- ✅ Reel stile YouTube Shorts
- ✅ Live Streaming con chat
- ✅ Storie 24h
- ✅ Sistema followers
- ✅ Chat real-time
- ✅ Pagamenti (Stripe-ready)
- ✅ Pannello Admin
- ✅ Privacy totale (no documenti richiesti)

