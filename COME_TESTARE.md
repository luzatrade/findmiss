# 🧪 Come Testare Find Miss - Guida Completa

## ✅ Prima di Iniziare

Assicurati che:
- ✅ Backend sia avviato (vedi terminale con `npm run dev` in `backend`)
- ✅ Frontend sia avviato (vedi terminale con `npm run dev` in `frontend`)
- ✅ Database PostgreSQL sia avviato
- ✅ File `.env` e `.env.local` siano configurati

---

## 🚀 TEST 1: Verifica che il Backend Funzioni

### 1.1 Test API Base

1. Apri il browser (Chrome, Firefox, Edge)
2. Vai su: `http://localhost:3001`
3. **Dovresti vedere:**
   ```json
   {"status":"ok","message":"FindMiss API"}
   ```

✅ **Se vedi questo, il backend funziona!**

### 1.2 Test Endpoint API

1. Vai su: `http://localhost:3001/api/test`
2. **Dovresti vedere:**
   ```json
   {"status":"ok","message":"API funzionante!"}
   ```

✅ **Se vedi questo, le API rispondono correttamente!**

### 1.3 Test Categorie

1. Vai su: `http://localhost:3001/api/categories`
2. **Dovresti vedere:**
   ```json
   {
     "success": true,
     "data": [
       {"id": "...", "name": "Donna", "slug": "donna", ...},
       {"id": "...", "name": "Uomo", "slug": "uomo", ...},
       ...
     ]
   }
   ```

✅ **Se vedi le categorie, il database è connesso!**

### 1.4 Test Città

1. Vai su: `http://localhost:3001/api/cities`
2. **Dovresti vedere:**
   ```json
   {
     "success": true,
     "data": [
       {"id": "...", "name": "Milano", "slug": "milano", ...},
       {"id": "...", "name": "Roma", "slug": "roma", ...},
       ...
     ]
   }
   ```

✅ **Se vedi le città, tutto funziona!**

---

## 🌐 TEST 2: Verifica che il Frontend Funzioni

### 2.1 Apri la Homepage

1. Vai su: `http://localhost:3000`
2. **Dovresti vedere:**
   - ✅ Scritta "Find Miss" in alto (con colori viola/rosa)
   - ✅ Barra inferiore fissa con 5 pulsanti:
     - Home (casa)
     - Città (mappina)
     - Reel (play)
     - Filtri (slider)
     - Menu (hamburger)
   - ✅ Se hai fatto il seed, card con annunci

✅ **Se vedi tutto questo, il frontend funziona!**

### 2.2 Test Navigazione

Clicca sui pulsanti della barra inferiore:

1. **Home** - Dovresti vedere il feed annunci
2. **Città** - Si apre un modal fullscreen per cercare città
3. **Reel** - Dovresti vedere la pagina reel (anche se vuota)
4. **Filtri** - Si apre un modal fullscreen con i filtri
5. **Menu** - Si apre il menu account

✅ **Se tutti i pulsanti funzionano, la navigazione è OK!**

---

## 👤 TEST 3: Test Registrazione e Login

### 3.1 Registrazione

1. Nel sito, clicca su **"Menu"** (ultimo pulsante in basso)
2. Clicca su **"Registrati"** o **"Accedi"**
3. Se non vedi questi pulsanti, cerca un link "Registrati" o "Login"

**Crea un account di test:**
- Email: `test@test.com`
- Password: `test123456`
- Nickname: `TestUser` (opzionale)

4. Clicca **"Registrati"**

**✅ Risultato atteso:**
- Messaggio di successo
- Redirect alla homepage
- Menu mostra il tuo account

**❌ Se vedi errori:**
- Controlla il terminale del backend per errori
- Verifica che il database sia connesso
- Controlla la console del browser (F12 → Console)

### 3.2 Login

1. Se sei già registrato, clicca su **"Accedi"**
2. Inserisci:
   - Email: `test@test.com`
   - Password: `test123456`
3. Clicca **"Accedi"**

**✅ Risultato atteso:**
- Login riuscito
- Menu mostra il tuo account

### 3.3 Test con Account Seed (se hai fatto il seed)

Se hai eseguito `node prisma/seed.js`, puoi usare questi account:

**Account Admin:**
- Email: `admin@findmiss.it`
- Password: `password123`

**Account Inserzionista:**
- Email: `sofia@test.it`
- Password: `password123`

**Account Cliente:**
- Email: `cliente@test.it`
- Password: `password123`

---

## 📋 TEST 4: Test Feed Annunci

### 4.1 Visualizza Annunci

1. Vai sulla homepage (`http://localhost:3000`)
2. **Dovresti vedere:**
   - Card con annunci (se hai fatto il seed)
   - Ogni card mostra:
     - Immagine
     - Titolo
     - Età
     - Città
     - Prezzo
     - Pulsante "Contatta"

✅ **Se vedi le card, il feed funziona!**

### 4.2 Clicca su un Annuncio

1. Clicca su una card annuncio
2. **Dovresti vedere:**
   - Pagina dettaglio annuncio
   - Tutte le informazioni
   - Foto/video
   - Pulsante "Contatta"

✅ **Se vedi i dettagli, la navigazione funziona!**

---

## 🔍 TEST 5: Test Ricerca Città

### 5.1 Apri Ricerca Città

1. Clicca sul pulsante **"Città"** (secondo pulsante in basso)
2. **Dovresti vedere:**
   - Modal fullscreen
   - Barra di ricerca in alto
   - Lista di città

### 5.2 Cerca una Città

1. Nella barra di ricerca, digita: `Milano`
2. **Dovresti vedere:**
   - Lista filtrata con Milano
   - Autocomplete funzionante

### 5.3 Seleziona una Città

1. Clicca su "Milano"
2. **Dovresti vedere:**
   - Modal si chiude
   - Badge "Milano" in alto nella homepage
   - Feed filtrato per Milano

✅ **Se funziona, la ricerca città è OK!**

---

## 🎬 TEST 6: Test Reel

### 6.1 Apri Reel

1. Clicca sul pulsante **"Reel"** (terzo pulsante in basso)
2. **Dovresti vedere:**
   - Pagina reel (anche se vuota se non hai video)

### 6.2 Se hai Video Reel

Se hai fatto il seed e ci sono video:
- Dovresti vedere video verticali
- Swipe up/down per navigare
- Pulsanti Like, Contatta, Condividi

✅ **Se vedi i video, i reel funzionano!**

---

## 🔧 TEST 7: Test Filtri Avanzati

### 7.1 Apri Filtri

1. Clicca sul pulsante **"Filtri"** (quarto pulsante in basso)
2. **Dovresti vedere:**
   - Modal fullscreen con filtri
   - Sezioni: Generali, Età, Prezzo, Caratteristiche

### 7.2 Applica Filtri

1. Seleziona alcuni filtri:
   - ✓ Verificato
   - Età: 20-30
   - Prezzo: 100-200
2. Clicca **"Applica Filtri"**
3. **Dovresti vedere:**
   - Modal si chiude
   - Badge "Filtri attivi" in alto
   - Feed filtrato

✅ **Se funziona, i filtri sono OK!**

---

## 💬 TEST 8: Test Chat (Richiede Login)

### 8.1 Accedi

1. Fai login con un account
2. Vai su un annuncio
3. Clicca **"Contatta"**

### 8.2 Apri Chat

**✅ Risultato atteso:**
- Si apre la chat
- Puoi inviare messaggi
- Se l'inserzionista ha il numero visibile, lo vedi

**❌ Se non sei loggato:**
- Dovresti vedere un messaggio per registrarti

---

## 🧪 TEST 9: Test API con Postman/Thunder Client (Opzionale)

### 9.1 Installa Thunder Client (VS Code)

1. Apri VS Code
2. Vai su Estensioni
3. Cerca "Thunder Client"
4. Installa

### 9.2 Test Registrazione API

1. Apri Thunder Client in VS Code
2. Crea nuova richiesta POST
3. URL: `http://localhost:3001/api/auth/register`
4. Body (JSON):
   ```json
   {
     "email": "nuovo@test.com",
     "password": "test123",
     "nickname": "NuovoUtente"
   }
   ```
5. Invia

**✅ Risultato atteso:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "...",
    "refreshToken": "..."
  }
}
```

### 9.3 Test Login API

1. Nuova richiesta POST
2. URL: `http://localhost:3001/api/auth/login`
3. Body (JSON):
   ```json
   {
     "email": "test@test.com",
     "password": "test123456"
   }
   ```
4. Invia

**✅ Risultato atteso:**
- Token JWT
- Dati utente

### 9.4 Test Annunci con Token

1. Copia il token dalla risposta login
2. Nuova richiesta GET
3. URL: `http://localhost:3001/api/announcements`
4. Headers:
   - `Authorization: Bearer TUA_TOKEN_QUI`
5. Invia

**✅ Risultato atteso:**
- Lista annunci
- Dati completi

---

## ✅ CHECKLIST COMPLETA

Verifica che tutto funzioni:

### Backend
- [ ] `http://localhost:3001` risponde
- [ ] `http://localhost:3001/api/test` funziona
- [ ] `http://localhost:3001/api/categories` restituisce categorie
- [ ] `http://localhost:3001/api/cities` restituisce città

### Frontend
- [ ] `http://localhost:3000` si apre
- [ ] Homepage mostra "Find Miss"
- [ ] Barra inferiore con 5 pulsanti visibile
- [ ] Card annunci visibili (se seed fatto)

### Funzionalità
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Ricerca città funziona
- [ ] Filtri funzionano
- [ ] Navigazione tra pagine funziona
- [ ] Click su annuncio mostra dettagli

### Database
- [ ] Database `findmiss` esiste
- [ ] Tabelle create (verifica con Prisma Studio)
- [ ] Dati seed presenti (se seed fatto)

---

## 🐛 Se Qualcosa Non Funziona

### Backend non risponde
1. Controlla il terminale del backend
2. Verifica errori in rosso
3. Controlla che il file `.env` sia corretto
4. Verifica che PostgreSQL sia avviato

### Frontend non si apre
1. Controlla il terminale del frontend
2. Verifica errori in rosso
3. Controlla che il file `.env.local` esista
4. Verifica che il backend sia avviato

### Database non connesso
1. Apri pgAdmin 4
2. Verifica che il database `findmiss` esista
3. Controlla la password in `DATABASE_URL` nel file `.env`
4. Riavvia PostgreSQL se necessario

### API restituiscono errori
1. Apri la Console del browser (F12)
2. Vai su "Network" (Rete)
3. Clicca su una richiesta fallita
4. Guarda l'errore nella risposta
5. Controlla il terminale del backend per dettagli

---

## 📊 Test Avanzati (Opzionale)

### Test Performance

1. Apri Chrome DevTools (F12)
2. Vai su "Network"
3. Ricarica la pagina
4. Verifica tempi di caricamento
5. Dovrebbero essere < 2 secondi

### Test Mobile

1. Chrome DevTools (F12)
2. Clicca icona dispositivo mobile (Ctrl+Shift+M)
3. Seleziona "iPhone" o "Samsung Galaxy"
4. Verifica che il layout sia responsive

### Test Console Errori

1. Apri Chrome DevTools (F12)
2. Vai su "Console"
3. Verifica che non ci siano errori rossi
4. Warning gialli sono OK, errori rossi no

---

## 🎯 Prossimi Test

Una volta che tutto funziona:

1. **Test Pagamenti** (se configurato Stripe)
2. **Test Chat Completa** (messaggi, media protetti)
3. **Test Upload Media** (se implementato)
4. **Test Premium Features** (se implementato)

---

## 📝 Note

- Se vedi errori, copiali e incollali per cercare soluzioni
- I terminali mostrano sempre cosa sta succedendo
- La console del browser (F12) mostra errori JavaScript
- Prisma Studio (`npx prisma studio`) mostra i dati nel database

---

**🎉 Se tutti i test passano, il progetto funziona correttamente!**

Buon testing! 🚀
