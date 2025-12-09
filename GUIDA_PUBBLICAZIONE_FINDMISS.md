# 🚀 GUIDA PUBBLICAZIONE FINDMISS.IT

## Tempo necessario: ~30 minuti
## Costo: ~5€/mese (per il database e backend)

---

# PARTE 1: CREA GLI ACCOUNT (5 minuti)

## 1.1 Crea account GitHub
1. Vai su: **https://github.com**
2. Clicca **"Sign up"** (in alto a destra)
3. Inserisci la tua email
4. Crea una password
5. Scegli un username (es: tuonome)
6. Verifica l'email cliccando il link che ti arriva

## 1.2 Crea account Vercel (per il frontend)
1. Vai su: **https://vercel.com**
2. Clicca **"Sign Up"**
3. Clicca **"Continue with GitHub"**
4. Autorizza Vercel ad accedere a GitHub

## 1.3 Crea account Railway (per backend + database)
1. Vai su: **https://railway.app**
2. Clicca **"Login"** → **"Login with GitHub"**
3. Autorizza Railway

---

# PARTE 2: CARICA IL CODICE SU GITHUB (10 minuti)

## 2.1 Installa GitHub Desktop (più facile)
1. Vai su: **https://desktop.github.com**
2. Scarica e installa
3. Apri GitHub Desktop
4. Clicca **"Sign in to GitHub.com"**
5. Accedi con il tuo account GitHub

## 2.2 Crea il repository
1. In GitHub Desktop, clicca **"File"** → **"Add Local Repository"**
2. Clicca **"Choose..."** e seleziona la cartella: `C:\Users\asiaz\Desktop\findmiss`
3. Ti chiederà di creare un repository, clicca **"Create repository"**
4. Nome: `findmiss`
5. Togli la spunta da "Keep this code private" (per ora)
6. Clicca **"Create repository"**

## 2.3 Pubblica su GitHub
1. Clicca il pulsante **"Publish repository"** (in alto)
2. Lascia il nome `findmiss`
3. Clicca **"Publish repository"**

✅ **Fatto!** Il tuo codice è ora su GitHub.

---

# PARTE 3: PUBBLICA IL BACKEND SU RAILWAY (10 minuti)

## 3.1 Crea il progetto
1. Vai su: **https://railway.app/dashboard**
2. Clicca **"New Project"**
3. Clicca **"Deploy from GitHub repo"**
4. Seleziona **"findmiss"**
5. Clicca **"Add variables"** prima del deploy

## 3.2 Aggiungi il database PostgreSQL
1. Nel progetto, clicca **"+ New"**
2. Clicca **"Database"** → **"Add PostgreSQL"**
3. Aspetta che si crei (1-2 minuti)
4. Clicca sul database PostgreSQL creato
5. Vai nella tab **"Variables"**
6. Copia il valore di **"DATABASE_URL"** (ti servirà dopo)

## 3.3 Configura il Backend
1. Clicca sul servizio del tuo backend (quello collegato a GitHub)
2. Vai nella tab **"Settings"**
3. In **"Root Directory"** scrivi: `backend`
4. Vai nella tab **"Variables"**
5. Clicca **"+ New Variable"** e aggiungi queste:

```
DATABASE_URL = (incolla quello copiato dal database)
JWT_SECRET = findmiss_super_secret_key_2024_cambiami
JWT_REFRESH_SECRET = findmiss_refresh_secret_key_2024_cambiami
PORT = 3001
NODE_ENV = production
CORS_ORIGIN = https://findmiss.it,https://www.findmiss.it
```

6. Clicca **"Deploy"** per riavviare

## 3.4 Ottieni l'URL del backend
1. Vai nella tab **"Settings"**
2. Scorri fino a **"Domains"**
3. Clicca **"Generate Domain"**
4. Copia l'URL generato (es: `findmiss-backend-production.up.railway.app`)

## 3.5 Configura il dominio personalizzato per l'API
1. Nella sezione **"Domains"**, clicca **"+ Custom Domain"**
2. Scrivi: `api.findmiss.it`
3. Ti mostrerà un record CNAME da configurare (salvalo!)

---

# PARTE 4: PUBBLICA IL FRONTEND SU VERCEL (5 minuti)

## 4.1 Importa il progetto
1. Vai su: **https://vercel.com/dashboard**
2. Clicca **"Add New..."** → **"Project"**
3. Trova **"findmiss"** e clicca **"Import"**

## 4.2 Configura il progetto
1. In **"Root Directory"** clicca **"Edit"** e seleziona `frontend`
2. Clicca **"Environment Variables"**
3. Aggiungi:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.findmiss.it/api`
4. Clicca **"Deploy"**
5. Aspetta 2-3 minuti

## 4.3 Collega il dominio
1. Vai nelle impostazioni del progetto
2. Clicca **"Domains"**
3. Aggiungi: `findmiss.it`
4. Aggiungi: `www.findmiss.it`
5. Ti mostrerà i record DNS da configurare (salvali!)

---

# PARTE 5: CONFIGURA IL DOMINIO (5 minuti)

## 5.1 Accedi al pannello del tuo registrar
Dove hai comprato findmiss.it? (Aruba, GoDaddy, Namecheap, Register.it, ecc.)

1. Accedi al pannello di controllo
2. Trova la sezione **"DNS"** o **"Gestione DNS"**

## 5.2 Aggiungi questi record DNS:

### Per il FRONTEND (sito principale):
```
Tipo: A
Nome: @ (o lascia vuoto)
Valore: 76.76.21.21

Tipo: CNAME
Nome: www
Valore: cname.vercel-dns.com
```

### Per il BACKEND (API):
```
Tipo: CNAME
Nome: api
Valore: [quello che ti ha dato Railway]
```

## 5.3 Aspetta la propagazione
I DNS possono impiegare da 5 minuti a 24 ore per propagarsi.
Puoi controllare su: https://dnschecker.org

---

# PARTE 6: INIZIALIZZA IL DATABASE (2 minuti)

## 6.1 Esegui le migrazioni
1. In Railway, clicca sul tuo servizio backend
2. Vai nella tab **"Deployments"**
3. Clicca sull'ultimo deployment
4. Clicca **"View Logs"** per verificare che funzioni

## 6.2 Seed del database (dati iniziali)
1. In Railway, vai nella tab del tuo backend
2. Clicca **"Settings"** → **"Deploy"**
3. In "Start Command" temporaneamente metti:
   ```
   npx prisma migrate deploy && npx prisma db seed && node src/server.js
   ```
4. Dopo il primo deploy riuscito, rimetti:
   ```
   node src/server.js
   ```

---

# ✅ FATTO!

Il tuo sito sarà online su:
- **https://findmiss.it** (frontend)
- **https://api.findmiss.it** (backend API)

---

# 🆘 PROBLEMI COMUNI

## Il sito non carica
- Aspetta 5-10 minuti per la propagazione DNS
- Controlla i log su Vercel e Railway

## Errore "Cannot connect to database"
- Verifica che DATABASE_URL sia copiato correttamente
- Controlla che il database PostgreSQL sia attivo su Railway

## Errore CORS
- Verifica che CORS_ORIGIN includa il tuo dominio

## Errore 500
- Controlla i log del backend su Railway

---

# 📞 SERVE AIUTO?

Se hai problemi, fammi uno screenshot dell'errore e ti aiuto!

