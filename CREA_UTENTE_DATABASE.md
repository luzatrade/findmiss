# 🆕 Crea Nuovo Utente Database - Soluzione Semplice

## ✅ Metodo Più Semplice: Crea Nuovo Utente

Invece di cambiare la password di `postgres`, creiamo un nuovo utente con password `password`.

## 📋 Passi da Seguire

### 1. Apri pgAdmin 4

Dal menu Start Windows, cerca "pgAdmin 4" e aprilo.

### 2. Connettiti al Server

- Ti chiederà la password che hai usato durante l'installazione di PostgreSQL
- **Inserisci quella password** (non `password`, quella originale!)
- Clicca "Save Password" se vuoi

### 3. Crea Nuovo Utente

1. Nel pannello sinistro:
   - Espandi "Servers" → "PostgreSQL 18" (o la tua versione)
   - Espandi "Login/Group Roles"

2. **Click destro** su "Login/Group Roles" → **"Create"** → **"Login/Group Role"**

3. **Tab "General"**:
   - **Name**: `findmiss_user`
   - ✅ **Can login?** (seleziona)

4. **Tab "Definition"**:
   - **Password**: `password`
   - **Password (again)**: `password`

5. **Tab "Privileges"**:
   - ✅ **Can login?**
   - ✅ **Superuser?** (seleziona temporaneamente per creare database)

6. Clicca **"Save"**

### 4. Crea Database

1. Click destro su **"Databases"** → **"Create"** → **"Database"**

2. **Tab "General"**:
   - **Database**: `findmiss`
   - **Owner**: `findmiss_user` (selezionalo dal menu)

3. Clicca **"Save"**

### 5. Aggiorna .env

Apri `backend/.env` e cambia:

```env
DATABASE_URL="postgresql://findmiss_user:password@localhost:5432/findmiss?schema=public"
```

### 6. Testa Connessione

```powershell
cd C:\Users\asiaz\Desktop\findmiss\backend
npx prisma migrate dev --name add_notifications
```

## ✅ Dovrebbe Funzionare!

Se vedi:
```
✔ Applied migration `add_notifications`
```

Hai finito! 🎉

---

**Se non riesci ad aprire pgAdmin o non ricordi la password originale, dimmelo e troviamo un'altra soluzione!**


