# Find Miss - Piattaforma Mobile-First per Annunci Adulti

## 🎯 Panoramica

Find Miss è una piattaforma mobile-first ispirata a YouTube, con feed verticale, reel stile Shorts, chat avanzata con media protetti, sistema premium e privacy totale.

## ✨ Caratteristiche Principali

- 📱 **Mobile-First**: Design ottimizzato per smartphone
- 🎬 **Feed Stile YouTube**: Scroll verticale infinito con card annunci
- 🎥 **Reel Stile Shorts**: Video verticali fullscreen con swipe
- 💬 **Chat Avanzata**: Media protetti con blocco screenshot
- 💎 **Sistema Premium**: Piani settimanali/mensili, uscite giornaliere, top page boost
- 🔍 **Filtri Avanzati**: 30+ filtri per ricerca precisa
- 🔒 **Privacy Totale**: Nessuna richiesta di documenti, solo nickname ed email
- 💳 **Pagamenti Sicuri**: Stripe, carte prepagate, Apple Pay/Google Pay

## 🛠 Stack Tecnologico

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT per autenticazione
- Stripe per pagamenti
- Bull + Redis per job queue

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Lucide React (icone)

## 📦 Installazione

### Prerequisiti
- Node.js 18+
- PostgreSQL 14+
- Redis (opzionale, per job queue)
- Stripe account (per pagamenti)

### Backend

```bash
cd backend
npm install

# Configura variabili ambiente
cp .env.example .env
# Modifica .env con le tue configurazioni

# Setup database
npx prisma migrate dev
npx prisma generate

# Seed database (opzionale)
node prisma/seed.js

# Avvia server
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Configura variabili ambiente
cp .env.example .env.local
# Modifica .env.local con NEXT_PUBLIC_API_URL

# Avvia sviluppo
npm run dev
```

## 🔧 Configurazione

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/findmiss"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 📚 Documentazione

Vedi [ARCHITETTURA.md](./ARCHITETTURA.md) per documentazione completa:
- Architettura database
- API endpoints
- Componenti React
- Flussi UX
- Sistema premium
- Algoritmo ranking reel
- Sistema chat e media protetti

## 🚀 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Annunci
- `GET /api/announcements` - Feed con filtri
- `GET /api/announcements/:id` - Dettaglio
- `POST /api/announcements/:id/like` - Like/Unlike
- `POST /api/announcements/:id/contact` - Contatta

### Reel
- `GET /api/reels` - Feed reel
- `POST /api/reels/:id/like` - Like reel
- `POST /api/reels/:id/view` - Registra visualizzazione

### Chat
- `GET /api/chat/conversations` - Lista conversazioni
- `GET /api/chat/conversations/:id/messages` - Messaggi
- `POST /api/chat/conversations/:id/messages` - Invia messaggio
- `GET /api/chat/protected-media/:id` - Media protetto

### Pagamenti
- `GET /api/payments/plans` - Lista piani
- `POST /api/payments/checkout` - Checkout
- `POST /api/payments/webhook` - Webhook Stripe
- `GET /api/payments/history` - Storico

## 🎨 Componenti Principali

- **BottomNav**: Barra inferiore fissa con 5 pulsanti
- **CitySelector**: Ricerca città con autocomplete
- **AdvancedFilters**: Filtri avanzati fullscreen
- **ReelPlayer**: Player video verticale fullscreen
- **Chat**: Chat con media protetti
- **ProtectedMediaViewer**: Viewer media con blocco screenshot

## 🔐 Privacy

- ✅ Solo email (anonima accettata)
- ✅ Solo nickname
- ❌ NO documenti
- ❌ NO selfie
- ❌ NO face-match
- ❌ NO informazioni personali obbligatorie

## 💳 Pagamenti

Sistema integrato con Stripe:
- Carte prepagate
- Apple Pay / Google Pay
- Webhook per attivazione automatica servizi premium

## 📱 Mobile-First

- Design responsive
- Touch gestures (swipe, tap)
- Lazy loading immagini/video
- Infinite scroll
- Caching intelligente

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 License

Proprietario - Tutti i diritti riservati

## 🤝 Contribuire

1. Fork il progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📞 Supporto

Per supporto, apri una issue su GitHub.

---

**Versione**: 1.0.0  
**Data**: 2024





