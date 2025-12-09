# 🎯 Setup Passo-Passo - Find Miss

## ✅ Hai già installato Node.js e PostgreSQL? Perfetto!

Ora dobbiamo solo configurare il progetto. Segui questi passaggi IN ORDINE.

---

## 📋 CHECKLIST RAPIDA

Prima di iniziare, verifica:
- [ ] Node.js installato (apri cmd e digita `node --version`)
- [ ] PostgreSQL installato (cerca "pgAdmin" nel menu Start)
- [ ] Sei nella cartella `C:\Users\asiaz\Desktop\findmiss`

---

## 🗄️ PASSO 1: Crea il Database PostgreSQL

### Opzione A - Usando pgAdmin (CONSIGLIATO)

1. Apri **pgAdmin 4** dal menu Start
2. Inserisci la password che hai scelto durante l'installazione di PostgreSQL
3. Nel pannello sinistro, espandi "Servers" → "PostgreSQL 14" (o la tua versione)
4. Clicca destro su **"Databases"** → **"Create"** → **"Database..."**
5. Nome database: `findmiss`
6. Clicca **"Save"**

✅ **Fatto!** Ora hai il database.

### Opzione B - Usando il Terminale

1. Apri il **Prompt dei comandi** (cmd)
2. Digita: `psql -U postgres`
3. Inserisci la password di PostgreSQL
4. Digita: `CREATE DATABASE findmiss;`
5. Digita: `\q` per uscire

---

## ⚙️ PASSO 2: Crea il File .env per il Backend

### 2.1 Vai nella Cartella Backend

1. Apri **File Explorer** (Esplora File)
2. Vai su: `C:\Users\asiaz\Desktop\findmiss\backend`

### 2.2 Crea il File .env

**IMPORTANTE:** Il file deve chiamarsi esattamente `.env` (con il punto all'inizio!)

**Come crearlo:**

**Metodo 1 - Con Notepad:**
1. Nella cartella `backend`, clicca destro → **"Nuovo"** → **"Documento di testo"**
2. Rinomina il file in: `.env` (rimuovi `.txt`)
3. Windows ti chiederà conferma → Clicca **"Sì"**

**Metodo 2 - Con Visual Studio Code:**
1. Apri la cartella `backend` in VS Code
2. Clicca sull'icona **"Nuovo file"** (in alto a sinistra)
3. Chiamalo: `.env`

### 2.3 Scrivi il Contenuto

Apri il file `.env` e copia/incolla questo contenuto:

```env
DATABASE_URL="postgresql://postgres:TUAPASSWORD@localhost:5432/findmiss?schema=public"
JWT_SECRET="cambia-questa-chiave-casuale-di-32-caratteri-1234567890123456"
JWT_REFRESH_SECRET="cambia-anche-questa-chiave-casuale-di-32-caratteri-9876543210987654"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

**⚠️ MODIFICA QUESTE PARTI:**

1. **DATABASE_URL:** Sostituisci `TUAPASSWORD` con la password di PostgreSQL
   - Esempio: Se la password è `postgres123`, scrivi:
   ```
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/findmiss?schema=public"
   ```

2. **JWT_SECRET e JWT_REFRESH_SECRET:** Genera 2 chiavi casuali
   - Vai su: https://www.random.org/strings/
   - Genera 2 stringhe di 32 caratteri
   - Incollale nelle due righe

**Esempio di file .env completo:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/findmiss?schema=public"
JWT_SECRET="aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1p"
JWT_REFRESH_SECRET="zY9xW7vU5tS3rQ1pO9nM7lK5jI3hG1fE9dC7bA5zY3xW1vU9tS7rQ5pO3n"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

✅ **Salva il file** (Ctrl+S)

---

## 🎨 PASSO 3: Crea il File .env.local per il Frontend

### 3.1 Vai nella Cartella Frontend

1. Vai su: `C:\Users\asiaz\Desktop\findmiss\frontend`

### 3.2 Crea il File .env.local

1. Crea un nuovo file chiamato: `.env.local`
2. Scrivi dentro:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

✅ **Salva il file**

---

## 📦 PASSO 4: Installa le Dipendenze del Backend

### 4.1 Apri il Terminale

1. Apri il **Prompt dei comandi** (cmd) o **PowerShell**
2. Digita:

```bash
cd C:\Users\asiaz\Desktop\findmiss\backend
```

### 4.2 Installa le Dipendenze

Digita:

```bash
npm install
```

**Aspetta** che finisca (2-5 minuti). Vedrai molti messaggi, è normale!

✅ Quando vedi il prompt di nuovo (senza errori), è finito.

---

## 🔧 PASSO 5: Configura Prisma (Database)

### 5.1 Genera Prisma Client

Nel terminale (ancora in `backend`), digita:

```bash
npx prisma generate
```

Aspetta che finisca. Dovresti vedere: `Generated Prisma Client`

### 5.2 Crea le Tabelle nel Database

Digita:

```bash
npx prisma migrate dev --name init
```

**Cosa succede:**
- Ti chiederà se vuoi creare il database → Digita `y` (yes) e premi Invio
- Creerà tutte le tabelle nel database
- Aspetta che finisca

✅ Quando vedi "Applied migration", è finito!

### 5.3 (Opzionale) Aggiungi Dati di Test

Se vuoi vedere annunci di esempio nel sito, digita:

```bash
node prisma/seed.js
```

Aspetta che finisca. Vedrai: "Seeding completato!"

---

## 📦 PASSO 6: Installa le Dipendenze del Frontend

### 6.1 Apri un NUOVO Terminale

1. Apri un **nuovo** Prompt dei comandi (lascia quello del backend aperto!)
2. Digita:

```bash
cd C:\Users\asiaz\Desktop\findmiss\frontend
```

### 6.2 Installa le Dipendenze

Digita:

```bash
npm install
```

**Aspetta** che finisca (2-5 minuti).

✅ Quando vedi il prompt di nuovo, è finito.

---

## ▶️ PASSO 7: Avvia il Backend (Server)

### 7.1 Nel Terminale del Backend

Nel **primo terminale** (quello dove hai fatto `cd backend`), digita:

```bash
npm run dev
```

**Aspetta** qualche secondo.

✅ **Dovresti vedere:** `Server avviato su http://localhost:3001`

**❌ Se vedi errori:**
- Controlla che il file `.env` esista e sia corretto
- Verifica che la password nel DATABASE_URL sia giusta
- Assicurati che PostgreSQL sia avviato

---

## 🌐 PASSO 8: Avvia il Frontend (Sito Web)

### 8.1 Nel Terminale del Frontend

Nel **secondo terminale** (quello dove hai fatto `cd frontend`), digita:

```bash
npm run dev
```

**Aspetta** qualche secondo.

✅ **Dovresti vedere:** `Ready on http://localhost:3000`

---

## 🎉 PASSO 9: Apri il Sito!

1. Apri il **browser** (Chrome, Firefox, Edge)
2. Vai su: `http://localhost:3000`
3. **Dovresti vedere la homepage di Find Miss!** 🎉

---

## ✅ VERIFICA CHE TUTTO FUNZIONI

### Test 1: Backend
1. Apri un nuovo tab nel browser
2. Vai su: `http://localhost:3001/api/test`
3. Dovresti vedere: `{"status":"ok","message":"API funzionante!"}`

### Test 2: Frontend
1. Nel sito (`http://localhost:3000`), dovresti vedere:
   - Scritta "Find Miss" in alto
   - Barra inferiore con 5 pulsanti
   - Se hai fatto il seed, card con annunci

### Test 3: Registrazione
1. Clicca su "Menu" (ultimo pulsante in basso)
2. Clicca "Registrati"
3. Prova a creare un account

---

## 🐛 PROBLEMI COMUNI

### "Cannot connect to database"
**Soluzione:**
1. Verifica che PostgreSQL sia avviato:
   - Apri "Servizi" (cerca nel menu Start)
   - Cerca "postgresql"
   - Se è "Arrestato", clicca "Avvia"

2. Controlla il file `.env`:
   - La password in DATABASE_URL deve essere quella di PostgreSQL

### "Port 3001 already in use"
**Soluzione:**
1. Chiudi tutti i terminali
2. Riavvia il computer
3. Oppure cambia PORT in `.env` a `3002`

### "npm install" non funziona
**Soluzione:**
1. Verifica Node.js: `node --version`
2. Se non funziona, reinstalla Node.js
3. Prova a cancellare `node_modules` e rifare `npm install`

### Il sito è bianco
**Soluzione:**
1. Premi F12 nel browser → Vai su "Console"
2. Verifica errori rossi
3. Controlla che il backend sia avviato
4. Verifica `.env.local` nel frontend

---

## 📝 RIEPILOGO

**Ordine delle operazioni:**

1. ✅ Crea database `findmiss` in PostgreSQL
2. ✅ Crea `backend/.env` con le configurazioni
3. ✅ Crea `frontend/.env.local`
4. ✅ `cd backend` → `npm install` → `npx prisma generate` → `npx prisma migrate dev`
5. ✅ `cd frontend` → `npm install`
6. ✅ Terminale 1: `cd backend` → `npm run dev`
7. ✅ Terminale 2: `cd frontend` → `npm run dev`
8. ✅ Apri browser su `http://localhost:3000`

---

## 🎯 PROSSIMI PASSI

Una volta che tutto funziona:

1. **Esplora il sito** - Clicca sui vari pulsanti
2. **Registrati** - Crea un account di test
3. **Modifica il codice** - Apri i file e personalizza
4. **Leggi la documentazione** - Vedi `ARCHITETTURA.md`

---

**🚀 Buon divertimento!**

Se hai problemi, rileggi questa guida o controlla i messaggi di errore nei terminali.





