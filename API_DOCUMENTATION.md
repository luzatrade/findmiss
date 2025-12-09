# API Documentation - Find Miss

## Base URL
```
http://localhost:3001/api
```

## Autenticazione

La maggior parte delle API richiede un token JWT nell'header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticazione

### POST /api/auth/register
Registra un nuovo utente (anonimo, solo email e password).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "Nickname" // opzionale
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "Nickname"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /api/auth/login
Login utente.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /api/auth/refresh
Rinnova token JWT.

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /api/auth/logout
Logout utente.

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

## 📋 Annunci

### GET /api/announcements
Feed annunci con filtri avanzati.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `city` - Slug città o `{id: "uuid"}`
- `category` - Slug categoria o `{id: "uuid"}`
- `is_verified` - true/false
- `has_video` - true/false
- `has_reviews` - true/false
- `is_vip` - true/false
- `is_available_now` - true/false
- `price_min` - Numero
- `price_max` - Numero
- `age_min` - Numero
- `age_max` - Numero
- `cup_size` - String (A, B, C, D+)
- `hair_color` - String
- `eye_color` - String
- `sort` - recent | price_asc | price_desc | popular

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Titolo annuncio",
      "description": "...",
      "age": 25,
      "city": { "id": "...", "name": "Milano", "slug": "milano" },
      "category": { ... },
      "price_1hour": 150.00,
      "is_verified": true,
      "has_video": true,
      "media": [ { "url": "...", "thumbnail_url": "..." } ],
      "views_count": 1234,
      "likes_count": 56
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /api/announcements/:id
Dettaglio annuncio completo.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "age": 25,
    "height": 170,
    "weight": 60,
    "hair_color": "biondo",
    "eye_color": "azzurri",
    "price_30min": 100.00,
    "price_1hour": 150.00,
    "price_2hour": 250.00,
    "price_night": 500.00,
    "is_available_now": true,
    "city": { ... },
    "category": { ... },
    "media": [ ... ],
    "reviews": [ ... ],
    "user": {
      "id": "uuid",
      "phone": "+39...", // Solo se phone_visible = true
      "nickname": "..."
    },
    "userLiked": false
  }
}
```

### POST /api/announcements/:id/like
Aggiungi/rimuovi like (richiede autenticazione).

**Response:**
```json
{
  "success": true,
  "liked": true
}
```

### POST /api/announcements/:id/contact
Contatta inserzionista (richiede autenticazione).

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "phone": "+39..." // Solo se phone_visible = true
  }
}
```

---

## 🎥 Reel

### GET /api/reels
Feed reel con algoritmo ranking.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `city` - Slug o `{id: "uuid"}`
- `category` - Slug o `{id: "uuid"}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "stage_name": "...",
      "age": 25,
      "city": { ... },
      "category": { ... },
      "is_verified": true,
      "premium_level": "premium",
      "video": {
        "url": "...",
        "thumbnail_url": "...",
        "duration": 30
      },
      "views_count": 5000,
      "likes_count": 234,
      "score": 1234.56,
      "_score_details": {
        "relevance_score": 1000,
        "premium_boost": 1.2,
        "engagement_score": 800,
        "city_match_score": 1.3,
        "category_match_score": 1.2,
        "recency_score": 234.56,
        "verified_boost": 1.1
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/reels/:id/like
Like reel (opzionale autenticazione).

**Response:**
```json
{
  "success": true,
  "message": "Like aggiunto"
}
```

### POST /api/reels/:id/view
Registra visualizzazione reel.

**Body:**
```json
{
  "watch_time": 15 // secondi
}
```

---

## 🏙 Città

### GET /api/cities
Lista città con autocomplete.

**Query Parameters:**
- `search` - Testo ricerca
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Milano",
      "slug": "milano",
      "region": "Lombardia",
      "country": "IT",
      "population": 1400000,
      "announcements_count": 1234
    }
  ]
}
```

### GET /api/cities/:slug
Dettaglio città.

---

## 📂 Categorie

### GET /api/categories
Lista categorie.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Donna",
      "slug": "donna",
      "icon": "👩",
      "display_order": 1
    }
  ]
}
```

---

## 💬 Chat

### GET /api/chat/conversations
Lista conversazioni utente (richiede autenticazione).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "other_user": {
        "id": "uuid",
        "nickname": "...",
        "email": "..."
      },
      "last_message": {
        "id": "uuid",
        "content": "...",
        "created_at": "...",
        "protected_media": [ ... ]
      },
      "unread_count": 2,
      "updated_at": "..."
    }
  ]
}
```

### GET /api/chat/conversations/:id/messages
Messaggi conversazione (richiede autenticazione).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Messaggio testo",
      "message_type": "text",
      "sender": { "id": "...", "nickname": "..." },
      "receiver": { ... },
      "is_read": false,
      "created_at": "...",
      "protected_media": [
        {
          "id": "uuid",
          "media_url": "...",
          "type": "image",
          "is_protected": true,
          "view_once": false,
          "expires_at": null,
          "view_count": 0,
          "max_views": 1
        }
      ]
    }
  ]
}
```

### POST /api/chat/conversations/:id/messages
Invia messaggio (richiede autenticazione).

**Body:**
```json
{
  "content": "Testo messaggio",
  "message_type": "text", // text | image | video
  "protected_media": {
    "media_url": "https://...",
    "thumbnail_url": "https://...",
    "type": "image",
    "is_protected": true,
    "view_once": false,
    "expires_at": "2024-12-31T23:59:59Z", // opzionale
    "max_views": 1,
    "screenshot_block": true
  }
}
```

### GET /api/chat/protected-media/:id
Visualizza media protetto (richiede autenticazione).

**Response:**
```json
{
  "success": true,
  "data": {
    "media_url": "https://...",
    "thumbnail_url": "https://...",
    "type": "image",
    "is_protected": true,
    "screenshot_block": true,
    "view_count": 1,
    "max_views": 1
  }
}
```

---

## 💳 Pagamenti

### GET /api/payments/plans
Lista piani premium disponibili.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Piano Settimanale",
      "plan_type": "weekly",
      "duration": 7,
      "price": 29.99,
      "currency": "EUR",
      "daily_exits": 4,
      "features": ["boost", "priority", "analytics"]
    }
  ]
}
```

### POST /api/payments/checkout
Crea checkout Stripe (richiede autenticazione).

**Body:**
```json
{
  "announcement_id": "uuid",
  "payment_type": "premium_plan", // premium_plan | daily_exits | top_page_boost
  "plan_id": "uuid", // Per premium_plan
  "daily_exits": 4, // Per daily_exits
  "top_page_boost": true // Per top_page_boost
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "cs_...",
    "url": "https://checkout.stripe.com/...",
    "payment_id": "uuid"
  }
}
```

### POST /api/payments/webhook
Webhook Stripe (non richiede autenticazione, verifica signature).

### GET /api/payments/history
Storico pagamenti utente (richiede autenticazione).

---

## 📱 Sessioni

### POST /api/sessions
Salva/aggiorna sessione (città, categoria, filtri).

**Body:**
```json
{
  "session_id": "session_123", // Opzionale, generato se mancante
  "city_id": "uuid",
  "category_id": "uuid",
  "filters": {
    "is_verified": true,
    "price_min": 100
  }
}
```

### GET /api/sessions/:session_id
Recupera sessione.

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session_123",
    "selected_city_id": "uuid",
    "selected_category_id": "uuid",
    "filters": { ... },
    "city": { ... }
  }
}
```

---

## ⚠️ Errori

Tutte le API restituiscono errori nel formato:

```json
{
  "success": false,
  "error": "Messaggio errore"
}
```

**Codici HTTP:**
- `200` - Successo
- `400` - Bad Request
- `401` - Non autenticato
- `403` - Accesso negato
- `404` - Non trovato
- `500` - Errore server

---

## 📝 Note

- Tutte le date sono in formato ISO 8601
- I prezzi sono in formato Decimal (EUR)
- Le immagini/video sono URL assoluti
- Il token JWT scade dopo 7 giorni
- Il refresh token scade dopo 30 giorni





