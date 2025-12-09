# 🚀 Crea Account Admin sul Database di Produzione (Railway)

## ⚠️ Problema
L'account admin è stato creato sul database **locale**, ma il sito `https://findmiss.it` usa il database su **Railway** (produzione), che è diverso!

---

## ✅ Soluzione: Crea l'Account sul Database di Produzione

### **Passo 1: Ottieni DATABASE_URL da Railway**

1. Vai su: **https://railway.app**
2. Accedi al tuo account
3. Clicca sul progetto **FindMiss**
4. Clicca sul servizio **PostgreSQL** (il database)
5. Vai su tab **"Variables"**
6. Trova **`DATABASE_URL`**
7. Clicca sull'icona **👁️** (mostra valore)
8. **Copia** l'intera stringa (inizia con `postgresql://...`)

---

### **Passo 2: Crea l'Account Admin**

#### **Opzione A: Windows PowerShell (Consigliato)**

1. Apri **PowerShell**
2. Vai nella cartella backend:
   ```powershell
   cd C:\Users\asiaz\Desktop\findmiss\backend
   ```

3. Esegui (sostituisci `POSTGRESQL_URL` con quello che hai copiato):
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@host:port/database"; node create-admin-production.js admin@findmiss.it "Findmiss2025!" "Admin"
   ```

   **Esempio completo:**
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"; node create-admin-production.js admin@findmiss.it "Findmiss2025!" "Admin"
   ```

#### **Opzione B: Crea File .env Temporaneo**

1. Vai in `backend/`
2. Crea un file `.env.production` (temporaneo)
3. Incolla:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```
   (Sostituisci con il tuo DATABASE_URL di Railway)

4. Modifica temporaneamente `create-admin-production.js` per leggere da `.env.production`

5. Esegui:
   ```bash
   node create-admin-production.js admin@findmiss.it "Findmiss2025!" "Admin"
   ```

6. **IMPORTANTE:** Elimina `.env.production` dopo!

---

### **Passo 3: Verifica**

1. Vai su: **https://findmiss.it/auth**
2. Inserisci:
   - Email: `admin@findmiss.it`
   - Password: `Findmiss2025!`
3. Clicca "Login"
4. Vai su: **https://findmiss.it/admin**
5. Se vedi il pannello → ✅ **Funziona!**

---

## 🔐 Metodo Alternativo: Via Prisma Studio (Interfaccia Grafica)

### **Passo 1: Connetti Prisma Studio al Database di Produzione**

1. Ottieni `DATABASE_URL` da Railway (vedi sopra)

2. Crea file `.env` temporaneo in `backend/`:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. Apri Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

4. Si apre su `http://localhost:5555`

5. Clicca su tabella **`User`**

6. Clicca **"Add record"**

7. Compila:
   - `email`: `admin@findmiss.it`
   - `nickname`: `Admin`
   - `role`: `admin` (dalla dropdown)
   - `is_verified`: `true`
   - `is_active`: `true`
   - `password_hash`: **Genera hash** (vedi sotto)

8. **Per generare password_hash:**
   - Apri nuovo terminale
   - Vai in `backend/`
   - Esegui:
     ```bash
     node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Findmiss2025!', 10).then(h => console.log(h))"
     ```
   - Copia l'hash generato
   - Incollalo in `password_hash`

9. Clicca **"Save 1 change"**

10. **Elimina `.env` dopo** (per sicurezza)

---

## 🆘 Problemi Comuni

### "Cannot connect to database"
- Verifica che `DATABASE_URL` sia corretto
- Controlla che il database Railway sia online
- Verifica che non ci siano firewall che bloccano la connessione

### "Authentication failed"
- Verifica username e password in `DATABASE_URL`
- Controlla che le credenziali siano corrette su Railway

### "Connection timeout"
- Il database potrebbe essere inattivo
- Vai su Railway e verifica che il servizio PostgreSQL sia "Active"

---

## ✅ Dopo aver Creato l'Account

1. **Testa il login** su `https://findmiss.it/auth`
2. **Accedi al pannello** su `https://findmiss.it/admin`
3. **Elimina file temporanei** (`.env.production` o `.env` con DATABASE_URL di produzione)

---

**🎉 Ora hai l'account admin anche sul database di produzione!**

