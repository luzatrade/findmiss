# 📱 Accesso Rapido dal Cellulare - Find Miss

## ⚡ Guida Veloce (3 passaggi)

### 1️⃣ Trova l'IP del Computer

Apri **Prompt dei comandi** e digita:
```bash
ipconfig
```

Cerca **"Indirizzo IPv4"** → Esempio: `192.168.1.100`

---

### 2️⃣ Modifica i File di Configurazione

**A) `backend/.env`**
Aggiungi/modifica:
```env
FRONTEND_URL="http://TUO_IP:3000"
```
Esempio: `FRONTEND_URL="http://192.168.1.100:3000"`

**B) `frontend/.env.local`**
Modifica in:
```env
NEXT_PUBLIC_API_URL="http://TUO_IP:3001/api"
```
Esempio: `NEXT_PUBLIC_API_URL="http://192.168.1.100:3001/api"`

---

### 3️⃣ Avvia e Accedi

**Terminale 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminale 2 - Frontend:**
```bash
cd frontend
npm run dev -- -H 0.0.0.0
```

**Dal cellulare (stesso WiFi):**
```
http://TUO_IP:3000
```
Esempio: `http://192.168.1.100:3000`

---

## ✅ Fatto!

Ora puoi accedere dal cellulare! 🎉

**Per guida completa:** Vedi `ACCEDERE_DAL_CELLULARE.md`

