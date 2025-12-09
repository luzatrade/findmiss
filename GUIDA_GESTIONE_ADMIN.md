# 🎛️ Guida Completa - Gestione Admin FindMiss

## 📍 Come Accedere al Pannello Admin

### 1. **Via Frontend (Interfaccia Web)**

1. Vai su: **`https://findmiss.it/admin`**
2. Se non sei loggato, verrai reindirizzato al login
3. Accedi con un account (per ora tutti possono accedere, in produzione solo admin)

**Account di Test:**
- Email: `admin@findmiss.it`
- Password: `password123`

---

## 🎯 Funzionalità Disponibili nel Pannello Admin

### **Dashboard** 📊
- **Statistiche generali:**
  - Totale annunci
  - Annunci attivi
  - Annunci in attesa di approvazione
  - Visualizzazioni totali
  - Like totali
  - Contatti totali
  - Annunci VIP
  - Annunci verificati

### **Gestione Annunci** 📢
- **Visualizza tutti gli annunci** in una tabella
- **Filtra per stato:** active, pending, paused
- **Azioni disponibili:**
  - ✅ **Approva** (pending → active)
  - ⏸️ **Pausa** (active → paused)
  - ▶️ **Riattiva** (paused → active)
  - 👁️ **Visualizza** (apre il profilo pubblico)
  - 🗑️ **Elimina** (rimuove definitivamente)

### **Gestione Prezzi** 💰
- Vai su: **`https://findmiss.it/admin/pricing`**
- **Gestisci:**
  - Piani Premium (Basic, Premium, VIP)
  - Opzioni Boost
  - Codici Sconto

### **API Status** 🔌
- Visualizza tutti gli endpoint disponibili
- Testa le API direttamente
- Verifica stato WebSocket
- Info database

---

## 🛠️ Gestione Tramite API Backend

### **Base URL:**
```
https://api.findmiss.it/api
```

### **Autenticazione:**
Tutte le API admin richiedono un token JWT nell'header:
```http
Authorization: Bearer YOUR_TOKEN
```

---

## 📋 API Admin Disponibili

### **1. Statistiche**

```http
GET /api/admin/stats
```

**Risposta:**
```json
{
  "success": true,
  "data": {
    "totalAnnouncements": 16,
    "totalUsers": 10,
    "activeAnnouncements": 14,
    "pendingAnnouncements": 2,
    "totalRevenue": 0
  }
}
```

---

### **2. Gestione Annunci**

#### **Lista tutti gli annunci:**
```http
GET /api/admin/announcements?status=active&page=1&limit=50
```

#### **Verifica annuncio:**
```http
PUT /api/admin/announcements/:id/verify
Body: { "is_verified": true }
```

#### **Imposta VIP:**
```http
PUT /api/admin/announcements/:id/vip
Body: { "is_vip": true }
```

---

### **3. Gestione Utenti**

#### **Lista utenti:**
```http
GET /api/admin/users?role=advertiser&page=1&limit=50
```

#### **Cambia ruolo:**
```http
PUT /api/admin/users/:id/role
Body: { "role": "admin" }
```
Ruoli: `user`, `advertiser`, `admin`

#### **Banna/Sbanna:**
```http
PUT /api/admin/users/:id/ban
Body: { "is_active": false }
```

---

### **4. Gestione Piani Premium**

#### **Lista piani:**
```http
GET /api/admin/plans
```

#### **Crea piano:**
```http
POST /api/admin/plans
Body: {
  "name": "Premium Mensile",
  "slug": "premium-monthly",
  "price": 29.99,
  "duration_days": 30,
  "features": ["boost", "top_page"],
  "is_active": true
}
```

#### **Modifica piano:**
```http
PUT /api/admin/plans/:id
Body: {
  "price": 39.99,
  "is_active": false
}
```

#### **Elimina piano:**
```http
DELETE /api/admin/plans/:id
```

---

### **5. Gestione Codici Sconto**

#### **Lista codici:**
```http
GET /api/admin/discount-codes
```

#### **Crea codice:**
```http
POST /api/admin/discount-codes
Body: {
  "code": "SALDI2024",
  "discount_percent": 20,
  "max_uses": 100,
  "expires_at": "2024-12-31T23:59:59Z",
  "applies_to": "all"
}
```

#### **Valida codice (pubblico):**
```http
POST /api/admin/discount-codes/validate
Body: {
  "code": "SALDI2024",
  "type": "premium"
}
```

---

## 🗄️ Gestione Database Diretta

### **Prisma Studio (Interfaccia Grafica)**

Il modo più semplice per gestire il database:

```bash
cd backend
npx prisma studio
```

Si aprirà un browser su `http://localhost:5555` dove puoi:
- ✅ Visualizzare tutte le tabelle
- ✅ Modificare dati direttamente
- ✅ Creare nuovi record
- ✅ Eliminare record
- ✅ Filtrare e cercare

**Tabelle principali:**
- `User` - Utenti
- `Announcement` - Annunci
- `Media` - Foto e video
- `Category` - Categorie
- `City` - Città
- `Payment` - Pagamenti
- `Review` - Recensioni
- `Like` - Like
- `Conversation` - Chat
- `Message` - Messaggi

---

## 🔧 Comandi Utili

### **Backup Database:**
```bash
# Su Railway, usa il pannello PostgreSQL per export
# Oppure via CLI:
pg_dump DATABASE_URL > backup.sql
```

### **Reset Database (ATTENZIONE!):**
```bash
cd backend
npx prisma migrate reset
# Poi esegui di nuovo il seed:
node prisma/seed.js
```

### **Nuova Migrazione:**
```bash
cd backend
npx prisma migrate dev --name nome_migrazione
```

### **Genera Prisma Client:**
```bash
cd backend
npx prisma generate
```

---

## 📱 Gestione da Mobile

### **Via Browser Mobile:**
1. Apri `https://findmiss.it/admin` sul telefono
2. Il pannello è responsive e funziona su mobile
3. Puoi approvare/eliminare annunci anche da mobile

### **Via API (Postman/Insomnia):**
1. Installa Postman o Insomnia
2. Crea una collection con le API admin
3. Aggiungi il token JWT nell'header
4. Gestisci tutto da mobile

---

## 🚨 Operazioni Comuni

### **Approvare un Annuncio:**
1. Vai su `/admin`
2. Tab "Annunci"
3. Trova l'annuncio con stato "In attesa"
4. Clicca il pulsante ✅ verde

### **Eliminare un Annuncio:**
1. Vai su `/admin`
2. Tab "Annunci"
3. Trova l'annuncio
4. Clicca il pulsante 🗑️ rosso
5. Conferma

### **Verificare un Annuncio:**
```http
PUT https://api.findmiss.it/api/admin/announcements/ID_ANNUNCIO/verify
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "is_verified": true
}
```

### **Creare un Codice Sconto:**
1. Vai su `/admin/pricing`
2. Tab "Codici Sconto"
3. Compila il form
4. Clicca "Genera"

---

## 🔐 Sicurezza

### **In Produzione:**
1. **Attiva il controllo admin:**
   - Modifica `backend/src/routes/admin.js`
   - Rimuovi il commento in `requireAdmin`:
   ```javascript
   const requireAdmin = async (req, res, next) => {
     if (!req.user || req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: 'Accesso negato' });
     }
     next();
   };
   ```

2. **Crea un account admin:**
   - Via Prisma Studio o API
   - Imposta `role: 'admin'` per il tuo account

3. **Proteggi le route admin:**
   - Assicurati che solo admin possano accedere

---

## 📊 Monitoraggio

### **Log Backend (Railway):**
1. Vai su Railway dashboard
2. Clicca sul servizio backend
3. Tab "Deployments"
4. Clicca "View logs"
5. Vedi tutti i log in tempo reale

### **Log Frontend (Vercel):**
1. Vai su Vercel dashboard
2. Clicca sul progetto
3. Tab "Deployments"
4. Clicca su un deployment
5. Vedi i log

---

## 🆘 Risoluzione Problemi

### **Non riesco ad accedere al pannello:**
1. Verifica di essere loggato
2. Controlla che il token sia valido
3. Prova a fare logout e login di nuovo

### **Le API non funzionano:**
1. Verifica che il backend sia online: `https://api.findmiss.it`
2. Controlla i log su Railway
3. Verifica che il token JWT sia valido

### **Prisma Studio non si connette:**
1. Verifica `DATABASE_URL` in `.env`
2. Controlla che PostgreSQL sia online
3. Prova a rigenerare Prisma Client: `npx prisma generate`

---

## 📞 Supporto

Per problemi o domande:
- Controlla i log su Railway/Vercel
- Usa Prisma Studio per vedere i dati
- Testa le API con Postman/Insomnia

---

**🎉 Ora puoi gestire completamente il tuo sito FindMiss!**

