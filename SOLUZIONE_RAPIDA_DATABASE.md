# 🔧 Soluzione Rapida Database - Find Miss

## ❌ Problema: Connessione Fallita

Se la connessione fallisce, proviamo questi metodi:

## 🔄 Metodo 1: Reset Password PostgreSQL (Via File)

### Passo 1: Ferma PostgreSQL

```powershell
# Apri Services
services.msc

# Ferma il servizio "postgresql-x64-18"
```

### Passo 2: Crea File Password

Crea un file `C:\temp\password.txt` con solo:
```
password
```

### Passo 3: Avvia PostgreSQL con Password Reset

```powershell
# Trova il percorso di PostgreSQL (solitamente)
cd "C:\Program Files\PostgreSQL\18\bin"

# Avvia PostgreSQL con file password
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\18\data" -w start
.\psql.exe -U postgres -f C:\temp\password.txt -c "ALTER USER postgres PASSWORD 'password';"
```

## 🔄 Metodo 2: Crea Nuovo Database Utente

Se non riesci a cambiare la password, creiamo un nuovo utente:

### Via pgAdmin:

1. Connettiti con la password che hai usato durante l'installazione
2. Click destro su "Login/Group Roles" → "Create" → "Login/Group Role"
3. **General**:
   - Name: `findmiss_user`
   - Password: `password`
4. **Privileges**:
   - ✅ Can login
   - ✅ Superuser (temporaneamente, per creare database)
5. Clicca "Save"

6. **Crea Database**:
   - Click destro su "Databases" → "Create" → "Database"
   - Database: `findmiss`
   - Owner: `findmiss_user`
   - Save

7. **Aggiorna .env**:
   ```env
   DATABASE_URL="postgresql://findmiss_user:password@localhost:5432/findmiss?schema=public"
   ```

## 🔄 Metodo 3: Reinstallazione Pulita (Ultima Risorsa)

Se nulla funziona:

1. **Disinstalla PostgreSQL**:
   - Settings → Apps → PostgreSQL → Uninstall

2. **Reinstalla PostgreSQL**:
   - Durante installazione, usa password: `password`
   - Crea database `findmiss` durante installazione

3. **Verifica**:
   ```powershell
   cd backend
   npx prisma migrate dev --name add_notifications
   ```

## ✅ Metodo 4: Usa Password Attuale

Se ricordi la password che hai usato durante l'installazione:

1. Aggiorna `.env` con quella password
2. Prova di nuovo le migrazioni

## 🆘 Se Nulla Funziona

Condividi:
1. Quale errore vedi esattamente?
2. Riesci ad aprire pgAdmin?
3. Quale password hai usato durante l'installazione?

---

**Prova prima il Metodo 2 (nuovo utente) - è il più semplice!**



