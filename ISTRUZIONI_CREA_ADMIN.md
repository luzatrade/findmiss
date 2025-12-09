# 👑 Istruzioni Rapide - Crea il Tuo Account Admin

## 🎯 Metodo 1: Via Script (Locale)

### Se hai il database locale configurato:

1. **Apri un terminale**
2. **Vai nella cartella backend:**
   ```bash
   cd backend
   ```

3. **Esegui lo script con le tue credenziali:**
   ```bash
   node create-admin.js tua-email@findmiss.it TuaPassword123 "Tuo Nome"
   ```

   **Esempio:**
   ```bash
   node create-admin.js mario@findmiss.it MySecurePass2024 "Mario"
   ```

4. **Lo script ti dirà se è stato creato o aggiornato**

5. **Accedi su:**
   - `https://findmiss.it/auth`
   - Usa le credenziali che hai inserito

---

## 🎯 Metodo 2: Via Script (Produzione Railway)

### Se vuoi creare l'admin direttamente sul database di produzione:

1. **Ottieni la DATABASE_URL da Railway:**
   - Vai su Railway dashboard
   - Clicca sul servizio PostgreSQL
   - Tab "Variables"
   - Copia `DATABASE_URL`

2. **Crea un file temporaneo `.env` nella cartella backend:**
   ```env
   DATABASE_URL="postgresql://..."
   ```

3. **Esegui lo script:**
   ```bash
   cd backend
   node create-admin.js tua-email@findmiss.it TuaPassword123 "Tuo Nome"
   ```

4. **Elimina il file `.env` dopo (per sicurezza)**

---

## 🎯 Metodo 3: Via Prisma Studio (Interfaccia Grafica)

### Il modo più semplice e visivo:

1. **Ottieni DATABASE_URL da Railway** (vedi Metodo 2)

2. **Crea file `.env` temporaneo in `backend/` con:**
   ```env
   DATABASE_URL="postgresql://..."
   ```

3. **Apri Prisma Studio:**
   ```bash
   cd backend
   npx prisma studio
   ```

4. **Si apre il browser su `http://localhost:5555`**

5. **Clicca sulla tabella `User`**

6. **Clicca "Add record" (in alto a destra)**

7. **Compila i campi:**
   - `email`: la tua email (es: `mario@findmiss.it`)
   - `nickname`: il tuo nome (es: `Mario`)
   - `role`: `admin` (seleziona dalla dropdown)
   - `is_verified`: `true` (checkbox)
   - `is_active`: `true` (checkbox)
   - `password_hash`: **LEGGI SOTTO** ⚠️

8. **Per generare `password_hash`:**
   - Apri un **nuovo terminale**
   - Vai in `backend/`
   - Esegui:
     ```bash
     node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TUA_PASSWORD', 10).then(h => console.log(h))"
     ```
   - **Sostituisci `TUA_PASSWORD` con la tua password**
   - Copia l'hash generato (lunga stringa)
   - Incollalo nel campo `password_hash` in Prisma Studio

9. **Clicca "Save 1 change"**

10. **Fatto! Ora puoi accedere con le tue credenziali**

---

## 🎯 Metodo 4: Via API (Se hai già un account)

### Se hai già un account e vuoi renderlo admin:

1. **Fai login su `https://findmiss.it/auth`**

2. **Ottieni il tuo token JWT:**
   - Apri la console del browser (F12)
   - Vai su "Application" → "Local Storage"
   - Copia il valore di `token`

3. **Chiama l'API per cambiare ruolo:**
   ```bash
   curl -X PUT https://api.findmiss.it/api/admin/users/TUO_USER_ID/role \
     -H "Authorization: Bearer TUO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin"}'
   ```

   **Oppure usa Postman/Insomnia**

---

## ✅ Verifica che Funziona

1. **Vai su:** `https://findmiss.it/auth`
2. **Inserisci:** email e password che hai creato
3. **Clicca:** "Login"
4. **Vai su:** `https://findmiss.it/admin`
5. **Se vedi il pannello admin → ✅ Funziona!**

---

## 🆘 Problemi Comuni

### "Errore: Cannot connect to database"
- Verifica che `DATABASE_URL` sia corretto
- Controlla che il database sia online (Railway)

### "Errore: User already exists"
- Lo script aggiorna automaticamente l'account esistente a admin
- Prova a fare login con quelle credenziali

### "Non vedo il pannello admin dopo login"
- Verifica che `role: 'admin'` nel database
- Fai logout e login di nuovo
- Pulisci i cookie del browser

---

## 🔐 Password Sicura

Usa una password forte:
- ✅ Minimo 12 caratteri
- ✅ Lettere maiuscole e minuscole
- ✅ Numeri
- ✅ Simboli speciali (!@#$%^&*)

**Esempio:** `MySecurePass2024!@#`

---

**🎉 Scegli il metodo che preferisci e crea il tuo account admin!**

