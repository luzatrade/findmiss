# Architettura Find Miss - Documentazione Completa

## 📋 Indice
1. [Panoramica](#panoramica)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Architettura Database](#architettura-database)
4. [API Backend](#api-backend)
5. [Frontend Components](#frontend-components)
6. [Flussi UX](#flussi-ux)
7. [Sistema Premium](#sistema-premium)
8. [Sistema Chat e Media Protetti](#sistema-chat-e-media-protetti)
9. [Sistema Pagamenti](#sistema-pagamenti)
10. [Algoritmo Ranking Reel](#algoritmo-ranking-reel)
11. [Scheduler Uscite Giornaliere](#scheduler-uscite-giornaliere)
12. [Ottimizzazioni Mobile](#ottimizzazioni-mobile)

---

## 🎯 Panoramica

Find Miss è una piattaforma mobile-first per annunci adulti con:
- **Privacy totale**: Nessuna richiesta di documenti, solo nickname ed email
- **Feed stile YouTube**: Scroll verticale infinito con card annunci
- **Reel stile Shorts**: Video verticali fullscreen con swipe
- **Chat avanzata**: Media protetti con blocco screenshot
- **Sistema Premium**: Piani settimanali/mensili, uscite giornaliere, top page boost
- **Filtri avanzati**: 30+ filtri per ricerca precisa

---

## 🛠 Stack Tecnologico

### Backend
- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT** per autenticazione
- **Stripe** per pagamenti
- **Socket.io** (opzionale, per chat real-time)
- **Bull** + **Redis** per job queue

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **Lucide React** (icone)

---

## 🗄 Architettura Database

### Modelli Principali

#### User
```prisma
- id, email, password_hash, nickname
- phone, phone_visible
- role, is_active, is_verified
- ghost_mode, privacy_mode
- created_at, updated_at, last_login
```

#### Announcement
```prisma
- Informazioni base: title, description, stage_name
- Caratteristiche fisiche: age, height, weight, hair_color, eye_color, etc.
- Prezzi: price_30min, price_1hour, price_2hour, price_night, price_videochat
- Disponibilità: is_available_now, available_overnight, working_hours
- Status: status, is_verified, has_video, has_reviews, is_vip
- Premium: premium_level, plan_type, daily_exits, boost_active
- Statistiche: views_count, likes_count, contacts_count, reel_views
```

#### Media
```prisma
- type (image/video)
- url, thumbnail_url
- is_primary, is_reel
- metadata_removed, ai_processed
```

#### ProtectedMedia (Chat)
```prisma
- media_url, thumbnail_url, type
- is_protected, view_once
- expires_at, view_count, max_views
- screenshot_block
```

#### Conversation & Message
```prisma
- Conversation: user1_id, user2_id
- Message: content, message_type, is_read
- Relazione con ProtectedMedia
```

#### Payment
```prisma
- payment_provider (stripe)
- amount, currency, payment_type
- plan_details (JSON)
- status, provider_payment_id
```

#### PremiumPlan
```prisma
- name, plan_type (weekly/monthly)
- duration (days), price
- daily_exits, features (JSON)
```

#### DailySpot
```prisma
- announcement_id, spot_date, spot_time
- position, is_active
```

#### TopPageBoost
```prisma
- announcement_id
- start_date, end_date
- position (1-5), is_active
```

#### ReelStat
```prisma
- announcement_id, date
- view_count, like_count, share_count
- contact_count, avg_watch_time
```

---

## 🔌 API Backend

### Autenticazione
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Annunci
```
GET  /api/announcements          # Feed con filtri avanzati
GET  /api/announcements/:id      # Dettaglio annuncio
POST /api/announcements/:id/like # Like/Unlike
POST /api/announcements/:id/contact # Contatta inserzionista
```

**Filtri supportati:**
- Generali: `is_verified`, `has_video`, `has_reviews`, `is_vip`, `is_available_now`
- Prezzi: `price_min`, `price_max`
- Caratteristiche: `age_min`, `age_max`, `cup_size`, `hair_color`, `eye_color`, etc.
- Disponibilità: `available_for` (incontro/videochat/entrambi)

### Reel
```
GET  /api/reels                  # Feed reel con algoritmo ranking
POST /api/reels/:id/like        # Like reel
POST /api/reels/:id/view        # Registra visualizzazione
```

**Algoritmo Ranking:**
```javascript
score = (
  engagement_score * premium_boost * city_match * category_match * verified_boost
) + recency_score

engagement_score = 
  views * 0.1 +
  likes * 2.0 +
  contacts * 5.0 +
  reel_views * 0.15 +
  reel_likes * 2.5

recency_score = max(0, 100 - (days_old * 1.5))
```

### Città
```
GET /api/cities              # Lista città (con autocomplete)
GET /api/cities/:slug        # Dettaglio città
```

### Categorie
```
GET /api/categories          # Lista categorie
```

### Chat
```
GET  /api/chat/conversations                    # Lista conversazioni
GET  /api/chat/conversations/:id/messages       # Messaggi conversazione
POST /api/chat/conversations/:id/messages       # Invia messaggio
GET  /api/chat/protected-media/:id              # Visualizza media protetto
```

### Pagamenti
```
GET  /api/payments/plans           # Lista piani premium
POST /api/payments/checkout        # Crea checkout Stripe
POST /api/payments/webhook         # Webhook Stripe
GET  /api/payments/history         # Storico pagamenti
```

### Sessioni
```
POST /api/sessions                 # Salva/aggiorna sessione
GET  /api/sessions/:session_id    # Recupera sessione
```

---

## 🎨 Frontend Components

### BottomNav
Barra inferiore fissa con 5 pulsanti:
1. **Home** - Feed annunci
2. **Città** - Ricerca città (fullscreen modal)
3. **Reel** - Feed reel verticale
4. **Filtri** - Filtri avanzati (fullscreen modal)
5. **Menu** - Menu account

### CitySelector
- Modal fullscreen
- Autocomplete con API
- Salvataggio in sessione
- Lista città popolari

### AdvancedFilters
- Modal fullscreen scrollabile
- Sezioni: Generali, Prezzi, Caratteristiche fisiche, Disponibilità
- Reset filtri
- Applicazione filtri

### ReelPlayer
- Video fullscreen verticale
- Swipe up/down per navigazione
- Overlay info (nome, età, città, badge)
- Pulsanti: Like, Contatta, Condividi
- Tracciamento watch time

### Chat
- Lista conversazioni
- Messaggi testuali
- Invio foto/video
- Media protetti con viewer dedicato
- Polling ogni 3 secondi (o WebSocket)

### ProtectedMediaViewer
- Viewer fullscreen
- Blocco screenshot (best effort)
- Timer scadenza
- View-once support
- Disabilita download

---

## 🔄 Flussi UX

### 1. Homepage (Visitatori non registrati)
```
1. Carica feed annunci (senza autenticazione)
2. Scroll infinito
3. Click annuncio → Dettaglio (vede tutto tranne chat)
4. Click "Contatta" → Richiesta login/registrazione
5. Dopo login → Accesso chat
```

### 2. Ricerca Città
```
1. Click pulsante "Città" → Modal fullscreen
2. Digitazione → Autocomplete API
3. Selezione città → Salva in sessione
4. Feed filtrato per città
5. Badge città in header
```

### 3. Reel
```
1. Click pulsante "Reel" → Feed verticale
2. Swipe up/down → Navigazione
3. Auto-play video
4. Click "Contatta" → Apertura chat o annuncio
5. Tracciamento visualizzazioni
```

### 4. Filtri Avanzati
```
1. Click pulsante "Filtri" → Modal fullscreen
2. Selezione filtri multipli
3. Click "Applica" → Feed filtrato
4. Badge "Filtri attivi" in header
5. Reset filtri disponibile
```

### 5. Chat
```
1. Click "Contatta" su annuncio → Crea/recupera conversazione
2. Invio messaggio testuale
3. Invio media → Opzioni protezione
4. Visualizzazione media protetto → Viewer dedicato
5. Blocco screenshot attivo
```

---

## 💎 Sistema Premium

### Piani Disponibili
- **Settimanale** (7 giorni)
- **Mensile** (30 giorni)
- **Cambio città** consentito sempre

### Uscite Giornaliere
Pacchetti:
- 2 uscite/giorno
- 4 uscite/giorno
- 6 uscite/giorno
- 8 uscite/giorno

Ogni "uscita" = comparsa in evidenza homepage.

### Top Page Boost
- Annuncio bloccato in zona top homepage
- Posizioni 1-5 disponibili
- Durata: 7 giorni (configurabile)

### Priorità Feed
1. **Top Page Boost** (sempre primi)
2. **Pacchetti uscite** (distribuiti durante il giorno)
3. **Annunci normali** (ordinati per score)

---

## 💬 Sistema Chat e Media Protetti

### Media Protetti
- **Opzione "Media protetto"**: Blocca screenshot, download, inoltro
- **View-once**: Elimina dopo prima visualizzazione
- **Timer**: Scadenza automatica (es. 60 secondi)
- **View limit**: Max visualizzazioni (es. 1-5)

### Blocco Screenshot (Best Effort)
```javascript
// Disabilita tasto destro
document.addEventListener('contextmenu', e => e.preventDefault())

// Disabilita copia (Ctrl+C)
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'c') e.preventDefault()
})

// Blocca DevTools (limitato)
document.addEventListener('keydown', e => {
  if (e.key === 'F12') e.preventDefault()
})

// Blocca drag & drop immagini
img.addEventListener('dragstart', e => e.preventDefault())

// Video: controlsList="nodownload"
```

**Nota**: Il blocco screenshot completo è tecnicamente impossibile, ma questi metodi riducono la facilità di cattura.

---

## 💳 Sistema Pagamenti

### Metodi Supportati
- **Carte prepagate**
- **Apple Pay / Google Pay**
- **Stripe** (tokenizzato, sicuro)

### Flusso Checkout
```
1. Utente seleziona piano/uscite/boost
2. POST /api/payments/checkout
3. Crea Payment record (status: pending)
4. Crea Stripe Checkout Session
5. Redirect utente a Stripe
6. Webhook Stripe → POST /api/payments/webhook
7. Aggiorna Payment (status: completed)
8. Attiva servizio premium
```

### Webhook Stripe
```javascript
// Event: checkout.session.completed
1. Trova Payment per session_id
2. Aggiorna status → completed
3. Attiva servizio:
   - Premium plan → Aggiorna announcement
   - Daily exits → Incrementa daily_exits
   - Top page boost → Crea TopPageBoost record
```

---

## 🎯 Algoritmo Ranking Reel

### Formula Completa
```javascript
total_score = relevance_score + recency_score

relevance_score = 
  engagement_score * 
  premium_boost * 
  city_match_score * 
  category_match_score * 
  verified_boost

engagement_score = 
  (views_count * 0.1) +
  (likes_count * 2.0) +
  (contacts_count * 5.0) +
  (reel_views * 0.15) +
  (reel_likes * 2.5)

premium_boost = 
  vip ? 1.5 : 
  premium ? 1.2 : 
  1.0

city_match_score = 
  city_selected && matches ? 1.3 : 1.0

category_match_score = 
  category_selected && matches ? 1.2 : 1.0

verified_boost = 
  is_verified ? 1.1 : 1.0

recency_score = 
  max(0, 100 - (days_old * 1.5))
```

### Ordinamento
1. Ordina per `total_score` (desc)
2. Paginazione
3. Cache risultati (opzionale)

---

## ⏰ Scheduler Uscite Giornaliere

### Logica Distribuzione
```javascript
// Job schedulato ogni ora (o ogni 15 minuti)
1. Recupera annunci con daily_exits > 0
2. Per ogni annuncio:
   - Calcola uscite rimanenti oggi
   - Distribuisci uscite durante il giorno
   - Crea DailySpot records
3. Feed homepage:
   - Prima: Top Page Boost
   - Poi: DailySpot attivi (per ora corrente)
   - Poi: Annunci normali
```

### Reset Giornaliero
```javascript
// Job schedulato a mezzanotte
1. Reset daily_exits_used = 0 per tutti gli annunci
2. Elimina DailySpot scaduti
3. Aggiorna plan_end_date se scaduto
```

---

## 📱 Ottimizzazioni Mobile

### Lazy Loading
- Immagini: `loading="lazy"`
- Video: Caricamento on-demand
- Infinite scroll: Carica batch successivi

### Caching
- **Service Worker** (PWA)
- **localStorage**: Sessione, filtri, città selezionata
- **API Cache**: React Query o SWR

### Compressione Media
- **Backend**: Compressione automatica upload
- **Frontend**: Lazy loading, thumbnail prima di full-res

### Componenti Fullscreen
- Reel, Chat, Filtri: Modal fullscreen
- Touch gestures: Swipe, pinch-to-zoom

### Animazioni Leggere
- CSS transitions invece di JavaScript
- `will-change` per elementi animati
- Debounce scroll events

---

## 🔐 Privacy e Sicurezza

### Nessuna Raccolta Documenti
- ✅ Solo email (anonima accettata)
- ✅ Solo nickname
- ❌ NO documenti
- ❌ NO selfie
- ❌ NO face-match
- ❌ NO informazioni personali obbligatorie

### Verifica Interna (Senza Documenti)
- Verifica basata su:
  - Account attivo da tempo
  - Recensioni positive
  - Pagamenti completati
  - Nessun report negativo

### Modalità Privacy
- **Standard**: Profilo pubblico
- **Anonimo**: Numero nascosto, solo chat
- **Ghost**: Invisibile a utenti/blocchi specifici

---

## 📊 Statistiche Anonime

### Dati Raccolti (Senza Dati Personali)
- Views, likes, contacts (aggregati)
- Tempo medio visualizzazione
- Città più popolari
- Categorie più cercate

### Nessun Tracking Personale
- NO IP tracking
- NO fingerprinting
- NO analytics personalizzati

---

## 🚀 Deployment

### Backend
```bash
# Variabili ambiente
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
FRONTEND_URL=https://...

# Deploy
npm install
npx prisma migrate deploy
npm start
```

### Frontend
```bash
# Variabili ambiente
NEXT_PUBLIC_API_URL=https://api.findmiss.com

# Build
npm run build
npm start
```

---

## 📝 Note Finali

- **Mobile-first**: Tutto ottimizzato per smartphone
- **Privacy totale**: Nessuna richiesta documenti
- **Scalabile**: Architettura modulare, facile estendere
- **Sicuro**: JWT, Stripe, validazione input
- **Performante**: Lazy loading, caching, compressione

---

**Versione**: 1.0.0  
**Data**: 2024  
**Autore**: Find Miss Team





