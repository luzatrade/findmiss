# ⚡ Quick Start - Find Miss

## 🎯 Setup Rapido (5 minuti se hai già Node.js e PostgreSQL)

### 1. Database
```bash
# Crea database (via pgAdmin o psql)
createdb findmiss
```

### 2. Backend
```bash
cd backend

# Crea .env (vedi esempio sotto)
# Poi:
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend
```bash
cd frontend

# Crea .env.local con:
# NEXT_PUBLIC_API_URL="http://localhost:3001/api"

npm install
npm run dev
```

### 4. Apri Browser
```
http://localhost:3000
```

---

## 📝 File .env Backend

Crea `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:TUAPASSWORD@localhost:5432/findmiss?schema=public"
JWT_SECRET="genera-chiave-casuale-32-caratteri"
JWT_REFRESH_SECRET="genera-altra-chiave-32-caratteri"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

**Genera chiavi JWT:** https://www.random.org/strings/ (32 caratteri)

---

## ✅ Verifica

- Backend: http://localhost:3001/api/test
- Frontend: http://localhost:3000

---

**Per guida dettagliata:** Vedi `GUIDA_PRINCIPIANTI.md`





