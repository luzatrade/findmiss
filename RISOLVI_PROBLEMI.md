# 🔧 Risolvi Problemi - Find Miss

## ❌ "Non riesco ad avviarlo" - Soluzione Passo-Passo

### 🔍 DIAGNOSTICA RAPIDA

Prima di tutto, dimmi:
1. **Cosa stai cercando di avviare?** (Backend o Frontend)
2. **Quale errore vedi?** (Copia l'errore esatto)
3. **In quale terminale?** (Backend o Frontend)

---

## 🚨 PROBLEMA 1: File .env Mancante

### Sintomi:
```
Error: Cannot find module
Database connection failed
Environment variable not found
```

### Soluzione:

**1. Crea `backend/.env`:**

1. Vai in `C:\Users\asiaz\Desktop\findmiss\backend`
2. Crea un file chiamato `.env` (con il punto!)
3. Copia questo contenuto:

```env
DATABASE_URL="postgresql://postgres:TUAPASSWORD@localhost:5432/findmiss?schema=public"
JWT_SECRET="chiave-casuale-32-caratteri-1234567890123456"
JWT_REFRESH_SECRET="altra-chiave-32-caratteri-9876543210987654"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

**⚠️ IMPORTANTE:** Sostituisci `TUAPASSWORD` con la password di PostgreSQL!

**2. Crea `frontend/.env.local`:**

1. Vai in `C:\Users\asiaz\Desktop\findmiss\frontend`
2. Crea un file chiamato `.env.local`
3. Scrivi dentro:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## 🚨 PROBLEMA 2: Dipendenze Non Installate

### Sintomi:
```
Cannot find module '@prisma/client'
Cannot find module 'express'
Module not found
```

### Soluzione:

**Backend:**
```bash
cd C:\Users\asiaz\Desktop\findmiss\backend
npm install
```

**Frontend:**
```bash
cd C:\Users\asiaz\Desktop\findmiss\frontend
npm install
```

**Aspetta** che finisca (2-5 minuti)!

---

## 🚨 PROBLEMA 3: Database Non Connesso

### Sintomi:
```
Database connection failed
Can't reach database server
Connection refused
```

### Soluzione:

**1. Verifica che PostgreSQL sia avviato:**

1. Premi `Windows + R`
2. Digita: `services.msc`
3. Cerca "postgresql" nella lista
4. Se è "Arrestato", clicca destro → "Avvia"

**2. Verifica la password nel file .env:**

1. Apri `backend/.env`
2. Controlla `DATABASE_URL`
3. La password deve essere quella che hai scelto durante l'installazione di PostgreSQL

**3. Crea il database se non esiste:**

1. Apri **pgAdmin 4**
2. Inserisci la password
3. Clicca destro su "Databases" → "Create" → "Database"
4. Nome: `findmiss`
5. Salva

---

## 🚨 PROBLEMA 4: Porta Già in Uso

### Sintomi:
```
Port 3001 is already in use
EADDRINUSE: address already in use
```

### Soluzione:

**Opzione 1 - Chiudi il processo:**
1. Apri "Task Manager" (Ctrl+Shift+Esc)
2. Cerca "node" nei processi
3. Termina tutti i processi Node.js
4. Riavvia il backend

**Opzione 2 - Cambia porta:**
1. Apri `backend/.env`
2. Cambia: `PORT=3002`
3. Apri `frontend/.env.local`
4. Cambia: `NEXT_PUBLIC_API_URL="http://localhost:3002/api"`

---

## 🚨 PROBLEMA 5: Prisma Non Configurato

### Sintomi:
```
Prisma Client not generated
Schema not found
```

### Soluzione:

```bash
cd C:\Users\asiaz\Desktop\findmiss\backend
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🚨 PROBLEMA 6: Errori Durante npm install

### Sintomi:
```
npm ERR!
Permission denied
```

### Soluzione:

**1. Esegui come Amministratore:**
1. Clicca destro su "Prompt dei comandi"
2. Seleziona "Esegui come amministratore"
3. Riprova `npm install`

**2. Pulisci e reinstalla:**
```bash
# Backend
cd C:\Users\asiaz\Desktop\findmiss\backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd C:\Users\asiaz\Desktop\findmiss\frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 🚨 PROBLEMA 7: Backend Non Si Avvia

### Cosa Controllare:

**1. Verifica che il file .env esista:**
```bash
cd backend
dir .env
```

**2. Verifica che le dipendenze siano installate:**
```bash
cd backend
dir node_modules
```

**3. Verifica che Prisma sia generato:**
```bash
cd backend
npx prisma generate
```

**4. Prova ad avviare:**
```bash
cd backend
npm run dev
```

**5. Leggi l'errore esatto:**
- Copia l'errore completo
- Cercalo su Google
- O condividilo qui per aiuto

---

## 🚨 PROBLEMA 8: Frontend Non Si Avvia

### Cosa Controllare:

**1. Verifica che il file .env.local esista:**
```bash
cd frontend
dir .env.local
```

**2. Verifica che le dipendenze siano installate:**
```bash
cd frontend
dir node_modules
```

**3. Prova ad avviare:**
```bash
cd frontend
npm run dev
```

**4. Leggi l'errore esatto**

---

## 📋 CHECKLIST COMPLETA

Prima di avviare, verifica:

- [ ] File `backend/.env` esiste e contiene DATABASE_URL corretto
- [ ] File `frontend/.env.local` esiste
- [ ] PostgreSQL è avviato (verifica in Servizi)
- [ ] Database `findmiss` esiste (verifica in pgAdmin)
- [ ] `npm install` eseguito in `backend` (senza errori)
- [ ] `npm install` eseguito in `frontend` (senza errori)
- [ ] `npx prisma generate` eseguito in `backend`
- [ ] `npx prisma migrate dev` eseguito in `backend`

---

## 🆘 SE NIENTE FUNZIONA

### Reset Completo:

**1. Pulisci tutto:**
```bash
# Backend
cd C:\Users\asiaz\Desktop\findmiss\backend
rmdir /s /q node_modules
del package-lock.json

# Frontend
cd C:\Users\asiaz\Desktop\findmiss\frontend
rmdir /s /q node_modules
del package-lock.json
```

**2. Ricrea i file .env:**
- Verifica che `backend/.env` esista e sia corretto
- Verifica che `frontend/.env.local` esista

**3. Reinstalla tutto:**
```bash
# Backend
cd C:\Users\asiaz\Desktop\findmiss\backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# Frontend
cd C:\Users\asiaz\Desktop\findmiss\frontend
npm install
```

**4. Riavvia tutto:**
- Chiudi tutti i terminali
- Riavvia PostgreSQL (in Servizi)
- Riapri i terminali e riavvia

---

## 💬 CONDIVIDI L'ERRORE

Se ancora non funziona, condividi:

1. **Quale comando stai eseguendo?** (es: `npm run dev`)
2. **In quale cartella?** (backend o frontend)
3. **Errore completo** (copia tutto il testo rosso)

Così posso aiutarti meglio! 🚀




