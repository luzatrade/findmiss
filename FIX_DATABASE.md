# 🔧 Fix Database Connection - Find Miss

## ❌ Errore Attuale

```
Error: P1001: Can't reach database server at `localhost:5432`
```

## ✅ Soluzioni

### 1. Verifica che PostgreSQL sia Avviato

**Windows:**
```powershell
# Verifica servizio PostgreSQL
Get-Service postgresql*

# Se non è avviato, avvialo:
Start-Service postgresql-x64-14  # (o la tua versione)
```

**Oppure:**
- Apri **Services** (Servizi) da Windows
- Cerca "PostgreSQL"
- Verifica che sia "Running" (In esecuzione)
- Se non lo è, clicca destro → Start

### 2. Verifica le Credenziali nel .env

Apri `backend/.env` e verifica:

```env
DATABASE_URL="postgresql://postgres:TUAPASSWORD@localhost:5432/findmiss?schema=public"
```

**Sostituisci `TUAPASSWORD`** con la password del tuo PostgreSQL.

### 3. Crea il Database se Non Esiste

**Opzione A: Via pgAdmin**
1. Apri pgAdmin 4
2. Connettiti al server PostgreSQL
3. Click destro su "Databases" → "Create" → "Database"
4. Nome: `findmiss`
5. Owner: `postgres`
6. Clicca "Save"

**Opzione B: Via psql (Command Line)**
```powershell
# Connettiti a PostgreSQL
psql -U postgres

# Crea database
CREATE DATABASE findmiss;

# Esci
\q
```

**Opzione C: Via PowerShell**
```powershell
# Se psql è nel PATH
psql -U postgres -c "CREATE DATABASE findmiss;"
```

### 4. Test Connessione

```powershell
cd backend
npx prisma db pull
```

Se funziona, vai al passo 5.

### 5. Esegui Migrazioni

```powershell
cd backend
npx prisma migrate dev --name add_notifications
```

### 6. Popola Database con Dati di Test

```powershell
cd backend
npm run prisma:seed-completo
```

## 🐛 Se Ancora Non Funziona

### Verifica Porta PostgreSQL

```powershell
# Verifica che PostgreSQL sia in ascolto sulla porta 5432
netstat -an | findstr 5432
```

Dovresti vedere qualcosa come:
```
TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING
```

### Verifica Configurazione PostgreSQL

Il file `postgresql.conf` dovrebbe avere:
```
port = 5432
listen_addresses = 'localhost'
```

### Verifica Firewall

Assicurati che Windows Firewall non blocchi PostgreSQL sulla porta 5432.

## 📝 Checklist

- [ ] PostgreSQL installato
- [ ] Servizio PostgreSQL avviato
- [ ] Database `findmiss` creato
- [ ] Credenziali corrette in `.env`
- [ ] Porta 5432 accessibile
- [ ] Migrazioni eseguite

## 🚀 Dopo aver Risolto

Esegui questi comandi:

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name add_notifications
npm run prisma:seed-completo
npm run dev
```

---

**Se hai ancora problemi, condividi l'errore completo!**

