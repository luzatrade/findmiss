# 🎓 Guida Completa per Principianti - Find Miss

## 👋 Benvenuto!

Questa guida ti accompagnerà passo-passo per far funzionare Find Miss, anche se non hai mai programmato prima.

**Tempo stimato:** 30-60 minuti

---

## 📋 COSA TI SERVE PRIMA DI INIZIARE

### 1. Software da Installare

#### ✅ Node.js (OBBLIGATORIO)
**Cos'è:** Node.js è il "motore" che fa funzionare il backend (server).

**Come installarlo:**
1. Vai su: https://nodejs.org/
2. Scarica la versione **LTS** (Long Term Support) - quella consigliata
3. Installa il file scaricato (clicca "Next" su tutto)
4. **Verifica installazione:**
   - Apri il **Prompt dei comandi** (cerca "cmd" nel menu Start)
   - Digita: `node --version`
   - Dovresti vedere qualcosa come: `v18.17.0` o simile
   - Se vedi un errore, riavvia il computer e riprova

#### ✅ PostgreSQL (OBBLIGATORIO)
**Cos'è:** PostgreSQL è il database dove vengono salvati tutti i dati (utenti, annunci, etc.).

**Come installarlo:**
1. Vai su: https://www.postgresql.org/download/windows/
2. Scarica il **Windows installer**
3. Durante l'installazione:
   - **Password importante:** Scegli una password per l'utente `postgres` (es: `postgres123`)
   - **Porta:** Lascia 5432 (default)
   - **Locale:** Lascia default
4. **Verifica installazione:**
   - Cerca "pgAdmin 4" nel menu Start
   - Se si apre, PostgreSQL è installato correttamente

#### ✅ Git (OPZIONALE ma consigliato)
**Cos'è:** Git serve per gestire il codice.

**Come installarlo:**
1. Vai su: https://git-scm.com/download/win
2. Scarica e installa (clicca "Next" su tutto)
3. Non è obbligatorio per far funzionare il progetto, ma è utile

#### ✅ Un Editor di Codice (OPZIONALE ma consigliato)
**Consigliati:**
- **Visual Studio Code** (gratuito): https://code.visualstudio.com/
- **Cursor** (quello che stai usando ora)

---

## 🚀 STEP 1: PREPARARE IL PROGETTO

### 1.1 Apri la Cartella del Progetto

1. Apri **File Explorer** (Esplora File)
2. Vai su: `C:\Users\asiaz\Desktop\findmiss`
3. Dovresti vedere due cartelle: `backend` e `frontend`

### 1.2 Apri il Terminale nella Cartella

**Metodo 1 (Facile):**
1. Nella cartella `findmiss`, clicca con il tasto destro
2. Seleziona "Apri in terminale" o "Open in Terminal"

**Metodo 2:**
1. Premi `Windows + R`
2. Digita: `cmd` e premi Invio
3. Digita

4. Premi Invio

---

## 🗄️ STEP 2: CONFIGURARE IL DATABASE

### 2.1 Crea il Database PostgreSQL

**Opzione A - Usando pgAdmin (Facile):**
1. Apri **pgAdmin 4** dal menu Start
2. Inserisci la password che hai scelto durante l'installazione
3. Clicca destro su "Databases" → "Create" → "Database"
4. Nome database: `findmiss`
5. Clicca "Save"

**Opzione B - Usando il Terminale:**
1. Apri il Prompt dei comandi
2. Digita: `psql -U postgres`
3. Inserisci la password di PostgreSQL
4. Digita: `CREATE DATABASE findmiss;`
5. Digita: `\q` per uscire

### 2.2 Verifica che il Database Esista

1. Apri pgAdmin 4
2. Espandi "Databases"
3. Dovresti vedere `findmiss` nella lista

---

## ⚙️ STEP 3: CONFIGURARE IL BACKEND

### 3.1 Crea il File .env

**Cosa è .env?** È un file di configurazione che contiene le "password" e le impostazioni del progetto.

**Come crearlo:**
1. Vai nella cartella `backend`
2. Crea un nuovo file chiamato esattamente: `.env` (con il punto all'inizio!)
3. **IMPORTANTE:** Se non riesci a creare un file che inizia con punto:
   - Crea un file normale chiamato `env.txt`
   - Poi rinominalo in `.env` (rimuovi `.txt`)

**Cosa scrivere nel file .env:**

Copia e incolla questo contenuto, poi MODIFICA le parti indicate:

```env
# Database - MODIFICA CON LA TUA PASSWORD DI POSTGRESQL
DATABASE_URL="postgresql://postgres:TUAPASSWORD@localhost:5432/findmiss?schema=public"

# JWT - Genera due chiavi casuali (vedi sotto come fare)
JWT_SECRET="cambia-questa-chiave-casuale-123456789"
JWT_REFRESH_SECRET="cambia-anche-questa-chiave-987654321"

# Stripe (lascia vuoto per ora se non hai account)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Frontend
FRONTEND_URL="http://localhost:3000"

# Redis (lascia vuoto per ora)
REDIS_URL=""

# Porta server
PORT=3001
NODE_ENV="development"
```

**Come generare chiavi JWT casuali:**
1. Apri: https://www.random.org/strings/
2. Genera 2 stringhe casuali di 32 caratteri
3. Incollale in `JWT_SECRET` e `JWT_REFRESH_SECRET`

**Esempio di DATABASE_URL:**
Se la tua password PostgreSQL è `postgres123`, scrivi:
```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/findmiss?schema=public"
```

### 3.2 Installa le Dipendenze del Backend

1. Apri il terminale nella cartella `findmiss`
2. Digita: `cd backend`
3. Digita: `npm install`
4. **Aspetta** che finisca (può richiedere 2-5 minuti)
5. Vedrai molti messaggi, è normale!

**Cosa significa "npm install"?**
Scarica tutti i "pezzi" (librerie) necessari per far funzionare il progetto.

### 3.3 Genera Prisma Client

**Cos'è Prisma?** È lo strumento che "parla" con il database.

1. Nel terminale (ancora in `backend`), digita: `npx prisma generate`
2. Aspetta che finisca
3. Dovresti vedere: "Generated Prisma Client"

### 3.4 Crea le Tabelle nel Database

1. Nel terminale, digita: `npx prisma migrate dev --name init`
2. Ti chiederà se vuoi creare il database - digita: `y` (yes)
3. Aspetta che finisca
4. Dovresti vedere: "Applied migration"

**Cosa è successo?** Hai creato tutte le "tabelle" nel database (come fogli Excel vuoti pronti per i dati).

### 3.5 (Opzionale) Popola il Database con Dati di Test

1. Nel terminale, digita: `node prisma/seed.js`
2. Aspetta che finisca
3. Dovresti vedere: "Seeding completato!"

**Cosa è successo?** Hai inserito dati di esempio (utenti, annunci, città) per testare il sito.

---

## 🎨 STEP 4: CONFIGURARE IL FRONTEND

### 4.1 Crea il File .env.local

1. Vai nella cartella `frontend`
2. Crea un nuovo file chiamato: `.env.local`
3. Scrivi dentro:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

**Cosa significa?** Dice al frontend dove trovare il backend (il server).

### 4.2 Installa le Dipendenze del Frontend

1. Apri un NUOVO terminale (lascia quello del backend aperto!)
2. Vai nella cartella `findmiss`
3. Digita: `cd frontend`
4. Digita: `npm install`
5. Aspetta che finisca (2-5 minuti)

---

## ▶️ STEP 5: AVVIARE IL PROGETTO

### 5.1 Avvia il Backend (Server)

1. Nel **primo terminale** (quello dove hai fatto `cd backend`)
2. Digita: `npm run dev`
3. Aspetta qualche secondo
4. Dovresti vedere: `Server avviato su http://localhost:3001`

**✅ Se vedi questo messaggio, il backend funziona!**

**❌ Se vedi errori:**
- Controlla che il file `.env` esista e sia corretto
- Verifica che PostgreSQL sia avviato
- Controlla che la password nel DATABASE_URL sia corretta

### 5.2 Avvia il Frontend (Sito Web)

1. Nel **secondo terminale** (quello dove hai fatto `cd frontend`)
2. Digita: `npm run dev`
3. Aspetta qualche secondo
4. Dovresti vedere: `Ready on http://localhost:3000`

**✅ Se vedi questo messaggio, il frontend funziona!**

### 5.3 Apri il Sito nel Browser

1. Apri il browser (Chrome, Firefox, Edge)
2. Vai su: `http://localhost:3000`
3. **Dovresti vedere la homepage di Find Miss!** 🎉

---

## 🧪 STEP 6: TESTARE CHE TUTTO FUNZIONI

### 6.1 Test Visivo

Nel browser su `http://localhost:3000`, verifica:
- ✅ Vedi la scritta "Find Miss" in alto
- ✅ Vedi una barra in basso con 5 pulsanti (Home, Città, Reel, Filtri, Menu)
- ✅ Se hai fatto il seed, vedi delle card con annunci

### 6.2 Test API Backend

1. Apri un nuovo tab nel browser
2. Vai su: `http://localhost:3001/api/test`
3. Dovresti vedere: `{"status":"ok","message":"API funzionante!"}`

**✅ Se vedi questo, le API funzionano!**

### 6.3 Test Registrazione

1. Nel sito (`http://localhost:3000`), clicca sul pulsante "Menu" (ultimo in basso)
2. Clicca su "Registrati" o "Accedi"
3. Prova a creare un account:
   - Email: `test@test.com`
   - Password: `test123`
4. Clicca "Registrati"

**✅ Se funziona, vedrai un messaggio di successo!**

---

## 🐛 RISOLUZIONE PROBLEMI COMUNI

### Problema: "Cannot find module '@prisma/client'"

**Soluzione:**
```bash
cd backend
npm install
npx prisma generate
```

### Problema: "Database connection failed"

**Cosa fare:**
1. Verifica che PostgreSQL sia avviato:
   - Apri "Servizi" (cerca "services" nel menu Start)
   - Cerca "postgresql"
   - Se è "Arrestato", clicca "Avvia"

2. Controlla il file `.env`:
   - Apri `backend/.env`
   - Verifica che `DATABASE_URL` sia corretto
   - La password deve essere quella che hai scelto durante l'installazione

3. Testa la connessione:
   - Apri pgAdmin 4
   - Prova a connetterti con la password

### Problema: "Port 3001 already in use"

**Cosa significa:** Un altro programma sta usando la porta 3001.

**Soluzione:**
1. Chiudi tutti i terminali
2. Riavvia il computer
3. Oppure cambia la porta in `backend/.env`:
   ```
   PORT=3002
   ```
   E in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:3002/api"
   ```

### Problema: "npm install" non funziona

**Cosa fare:**
1. Verifica che Node.js sia installato:
   ```bash
   node --version
   ```
2. Se non funziona, reinstalla Node.js
3. Prova a cancellare `node_modules` e `package-lock.json`:
   ```bash
   # In backend
   cd backend
   rmdir /s node_modules
   del package-lock.json
   npm install
   
   # In frontend
   cd frontend
   rmdir /s node_modules
   del package-lock.json
   npm install
   ```

### Problema: Il sito è bianco o non carica

**Cosa fare:**
1. Apri la **Console del Browser**:
   - Premi `F12`
   - Vai su "Console"
   - Guarda se ci sono errori rossi

2. Verifica che il backend sia avviato:
   - Controlla il terminale del backend
   - Dovresti vedere: "Server avviato su http://localhost:3001"

3. Verifica il file `.env.local`:
   - Apri `frontend/.env.local`
   - Deve contenere: `NEXT_PUBLIC_API_URL="http://localhost:3001/api"`

---

## 📊 VERIFICA FINALE

Prima di considerare tutto pronto, verifica:

- [ ] PostgreSQL installato e database `findmiss` creato
- [ ] File `backend/.env` creato e configurato
- [ ] File `frontend/.env.local` creato
- [ ] `npm install` eseguito in `backend` (senza errori)
- [ ] `npm install` eseguito in `frontend` (senza errori)
- [ ] `npx prisma generate` eseguito (senza errori)
- [ ] `npx prisma migrate dev` eseguito (senza errori)
- [ ] Backend avviato su `http://localhost:3001`
- [ ] Frontend avviato su `http://localhost:3000`
- [ ] Sito si apre nel browser
- [ ] Vedi la homepage con la barra inferiore

---

## 🎯 COSA FARE DOPO

Una volta che tutto funziona:

### 1. Esplora il Sito
- Clicca sui vari pulsanti
- Prova a registrarti
- Esplora le funzionalità

### 2. Modifica il Codice
- Apri i file in `frontend/app/page.js` per modificare la homepage
- Modifica i colori in `frontend/app/globals.css`

### 3. Leggi la Documentazione
- `ARCHITETTURA.md` - Come funziona tutto
- `API_DOCUMENTATION.md` - Come usare le API

### 4. Aggiungi Funzionalità
- Personalizza i colori
- Aggiungi nuove pagine
- Modifica i componenti

---

## 📞 AIUTO

Se hai problemi:

1. **Controlla i log:**
   - Guarda i terminali (backend e frontend)
   - Cerca messaggi di errore in rosso

2. **Verifica i file:**
   - Controlla che `.env` e `.env.local` esistano
   - Verifica che le password siano corrette

3. **Riavvia tutto:**
   - Chiudi i terminali
   - Riavvia PostgreSQL
   - Riapri i terminali e riavvia backend/frontend

4. **Leggi gli errori:**
   - Copia l'errore esatto
   - Cercalo su Google
   - Spesso troverai la soluzione

---

## ✅ RIEPILOGO RAPIDO

**Ordine delle operazioni:**

1. ✅ Installa Node.js e PostgreSQL
2. ✅ Crea database `findmiss`
3. ✅ Crea `backend/.env` con le configurazioni
4. ✅ `cd backend` → `npm install` → `npx prisma generate` → `npx prisma migrate dev`
5. ✅ Crea `frontend/.env.local`
6. ✅ `cd frontend` → `npm install`
7. ✅ Terminale 1: `cd backend` → `npm run dev`
8. ✅ Terminale 2: `cd frontend` → `npm run dev`
9. ✅ Apri browser su `http://localhost:3000`

---

**🎉 Congratulazioni! Se sei arrivato qui, hai completato il setup!**

Ora puoi iniziare a sviluppare e personalizzare Find Miss!





