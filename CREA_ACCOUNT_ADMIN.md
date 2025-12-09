# 👑 Come Creare il Tuo Account Admin

## 🎯 Problema
Come gestore del sito, non dovresti doverti registrare come un utente normale. Ecco come creare il tuo account admin direttamente.

---

## ✅ Soluzione 1: Account Admin Già Esistente

**L'account admin esiste già nel database!**

### Credenziali di Default:
- **Email:** `admin@findmiss.it`
- **Password:** `admin123` (o `password123` se è stato fatto il seed vecchio)

### Come Accedere:
1. Vai su: **`https://findmiss.it/auth`**
2. Inserisci le credenziali sopra
3. Clicca "Login"
4. Vai su: **`https://findmiss.it/admin`**

---

## ✅ Soluzione 2: Crea il Tuo Account Admin Personalizzato

### Metodo A: Via Script (Consigliato)

```bash
cd backend
node create-admin.js tua-email@example.com tua-password-sicura "Tuo Nome"
```

**Esempio:**
```bash
node create-admin.js mario@findmiss.it MySecurePass123 "Mario Admin"
```

**Oppure usa npm:**
```bash
cd backend
npm run create-admin tua-email@example.com tua-password "Tuo Nome"
```

### Metodo B: Via Prisma Studio (Interfaccia Grafica)

1. Apri Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

2. Si apre il browser su `http://localhost:5555`

3. Clicca sulla tabella **`User`**

4. Clicca **"Add record"**

5. Compila:
   - `email`: la tua email
   - `password_hash`: **NON inserire la password direttamente!**
   - `nickname`: il tuo nome
   - `role`: `admin`
   - `is_verified`: `true`
   - `is_active`: `true`

6. **Per la password:**
   - Apri un terminale
   - Esegui:
     ```bash
     node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TUA_PASSWORD', 10).then(h => console.log(h))"
     ```
   - Copia l'hash generato
   - Incollalo in `password_hash`

7. Clicca **"Save 1 change"**

---

## ✅ Soluzione 3: Modifica il Seed (Per Nuove Installazioni)

Se stai facendo un nuovo seed, puoi modificare le credenziali admin:

1. Apri `backend/prisma/seed.js`

2. Cerca la sezione utenti (circa riga 52)

3. Modifica:
   ```javascript
   const adminEmail = process.env.ADMIN_EMAIL || 'tua-email@findmiss.it';
   const adminPassword = process.env.ADMIN_PASSWORD || 'tua-password-sicura';
   ```

4. Oppure usa variabili ambiente:
   ```bash
   ADMIN_EMAIL=mario@findmiss.it ADMIN_PASSWORD=MyPass123 node prisma/seed.js
   ```

---

## 🔐 Cambiare Password Admin Esistente

### Via Script:
```bash
cd backend
node create-admin.js admin@findmiss.it nuova-password "Admin"
```

### Via Prisma Studio:
1. Apri Prisma Studio
2. Trova l'utente admin
3. Genera nuovo hash password (vedi Metodo B sopra)
4. Aggiorna `password_hash`
5. Salva

---

## 🚀 Accesso Rapido

Dopo aver creato l'account admin:

1. **Login:**
   - Vai su: `https://findmiss.it/auth`
   - Inserisci email e password
   - Clicca "Login"

2. **Pannello Admin:**
   - Vai su: `https://findmiss.it/admin`
   - Oppure clicca "Admin Panel" nel menu

3. **Gestisci il sito:**
   - Dashboard con statistiche
   - Gestione annunci
   - Gestione utenti
   - Gestione prezzi

---

## ⚠️ Importante: Sicurezza

### In Produzione:
1. **Cambia la password di default** subito!
2. **Usa una password forte:**
   - Minimo 12 caratteri
   - Lettere maiuscole e minuscole
   - Numeri
   - Simboli speciali

3. **Attiva il controllo admin:**
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

---

## 📋 Verifica Account Admin

Per verificare che il tuo account sia admin:

1. Fai login su `https://findmiss.it/auth`
2. Vai su `https://findmiss.it/admin`
3. Se vedi il pannello admin → ✅ Sei admin!
4. Se vedi errore → ❌ Non sei admin, usa uno dei metodi sopra

---

## 🆘 Problemi?

### "Non riesco ad accedere"
1. Verifica che l'email sia corretta
2. Verifica che la password sia corretta
3. Controlla i log su Railway per errori

### "Non vedo il pannello admin"
1. Verifica che `role: 'admin'` nel database
2. Fai logout e login di nuovo
3. Pulisci i cookie del browser

### "Lo script non funziona"
1. Assicurati di essere nella cartella `backend`
2. Verifica che `DATABASE_URL` sia configurato
3. Controlla i log per errori

---

**🎉 Ora hai il tuo account admin e puoi gestire il sito senza doverti registrare!**

