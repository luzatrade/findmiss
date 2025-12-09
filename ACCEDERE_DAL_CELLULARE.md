# 📱 Come Accedere a Find Miss dal Cellulare

## 🎯 Obiettivo
Accedere al sito `http://localhost:3000` dal tuo smartphone per testare il design mobile-first.

---

## ✅ PREREQUISITI

1. ✅ Computer e cellulare sulla **stessa rete WiFi**
2. ✅ Backend e Frontend avviati sul computer
3. ✅ Firewall configurato (vedi sotto)

---

## 🔍 STEP 1: Trova l'IP del Tuo Computer

### Metodo 1 - Prompt dei Comandi (Windows)

1. Apri **Prompt dei comandi** (cmd)
2. Digita: `ipconfig`
3. Cerca **"Indirizzo IPv4"** nella sezione **"Scheda LAN wireless Wi-Fi"** o **"Ethernet"**
4. Dovresti vedere qualcosa come: `192.168.1.100` o `192.168.0.50`

**Esempio:**
```
Scheda LAN wireless Wi-Fi:
   Indirizzo IPv4 . . . . . . . . . . . : 192.168.1.100
```

👉 **Questo è il tuo IP!** (es: `192.168.1.100`)

### Metodo 2 - PowerShell

1. Apri **PowerShell**
2. Digita: `ipconfig | findstr IPv4`
3. Vedi l'IP direttamente

### Metodo 3 - Impostazioni Windows

1. Apri **Impostazioni** (Windows + I)
2. Vai su **"Rete e Internet"** → **"Wi-Fi"**
3. Clicca sulla tua connessione WiFi
4. Scorri in basso → Vedi **"Indirizzo IPv4"**

---

## 🔧 STEP 2: Configura il Backend per Accettare Connessioni Esterne

### 2.1 Modifica il File .env del Backend

1. Apri `backend/.env`
2. Trova la riga `FRONTEND_URL`
3. Cambiala in:

```env
FRONTEND_URL="http://TUO_IP:3000"
```

**Esempio:** Se il tuo IP è `192.168.1.100`:
```env
FRONTEND_URL="http://192.168.1.100:3000"
```

### 2.2 Modifica il Server per Ascoltare su Tutte le Interfacce

1. Apri `backend/src/server.js`
2. Trova la riga con `app.listen(PORT, ...)`
3. Cambiala in:

```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Accessibile anche su http://${TUO_IP}:${PORT}`);
});
```

**Esempio completo:**
```javascript
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Server accessibile su rete locale: http://192.168.1.100:${PORT}`);
});
```

### 2.3 Modifica CORS nel Backend

1. Apri `backend/src/server.js`
2. Trova la sezione CORS (dovrebbe essere già configurata)
3. Assicurati che sia così:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    `http://${TUO_IP}:3000`,  // Aggiungi questa riga
  ],
  credentials: true
}));
```

**Esempio:** Se il tuo IP è `192.168.1.100`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.1.100:3000',
  ],
  credentials: true
}));
```

---

## 🌐 STEP 3: Configura il Frontend

### 3.1 Modifica .env.local del Frontend

1. Apri `frontend/.env.local`
2. Aggiungi o modifica:

```env
NEXT_PUBLIC_API_URL="http://TUO_IP:3001/api"
```

**Esempio:** Se il tuo IP è `192.168.1.100`:
```env
NEXT_PUBLIC_API_URL="http://192.168.1.100:3001/api"
```

### 3.2 Avvia Next.js su Tutte le Interfacce

Quando avvii il frontend, usa:

```bash
cd frontend
npm run dev -- -H 0.0.0.0
```

Oppure modifica `package.json`:

1. Apri `frontend/package.json`
2. Trova la riga `"dev": "next dev"`
3. Cambiala in:

```json
"dev": "next dev -H 0.0.0.0"
```

---

## 🔥 STEP 4: Configura il Firewall Windows

### Metodo 1 - Porta 3000 e 3001

1. Apri **Windows Defender Firewall** (cerca nel menu Start)
2. Clicca **"Impostazioni avanzate"**
3. Clicca **"Regole in entrata"** → **"Nuova regola"**
4. Seleziona **"Porta"** → **Avanti**
5. Seleziona **"TCP"** e inserisci porte: `3000, 3001`
6. Seleziona **"Consenti la connessione"**
7. Seleziona tutti i profili (Dominio, Privato, Pubblico)
8. Nome: `Find Miss Dev`
9. Clicca **"Fine"**

### Metodo 2 - Prompt dei Comandi (Amministratore)

1. Apri **Prompt dei comandi come Amministratore**
2. Esegui:

```bash
netsh advfirewall firewall add rule name="Find Miss Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Find Miss Backend" dir=in action=allow protocol=TCP localport=3001
```

---

## 📱 STEP 5: Accedi dal Cellulare

### 5.1 Assicurati che Siano sulla Stessa Rete

- ✅ Computer connesso al WiFi
- ✅ Cellulare connesso allo **stesso WiFi**

### 5.2 Apri il Browser sul Cellulare

1. Apri Chrome, Safari o Firefox sul cellulare
2. Nella barra degli indirizzi, digita:

```
http://TUO_IP:3000
```

**Esempio:** Se il tuo IP è `192.168.1.100`:
```
http://192.168.1.100:3000
```

3. Premi **Invio**

✅ **Dovresti vedere la homepage di Find Miss!**

---

## 🧪 TEST

### Test 1: Backend dal Cellulare

1. Sul cellulare, vai su: `http://TUO_IP:3001/api/test`
2. Dovresti vedere: `{"status":"ok","message":"API funzionante!"}`

### Test 2: Frontend dal Cellulare

1. Sul cellulare, vai su: `http://TUO_IP:3000`
2. Dovresti vedere la homepage

### Test 3: Funzionalità

- ✅ Navigazione funziona
- ✅ Pulsanti rispondono
- ✅ API chiamate funzionano

---

## 🐛 PROBLEMI COMUNI

### "Impossibile raggiungere il sito"

**Soluzione:**
1. Verifica che computer e cellulare siano sulla stessa rete WiFi
2. Verifica che il firewall permetta le connessioni (vedi STEP 4)
3. Verifica che backend e frontend siano avviati
4. Prova a pingare l'IP dal cellulare (se possibile)

### "Connection refused"

**Soluzione:**
1. Verifica che il server ascolti su `0.0.0.0` (vedi STEP 2.2)
2. Verifica che le porte 3000 e 3001 siano aperte nel firewall
3. Riavvia backend e frontend

### "CORS error"

**Soluzione:**
1. Verifica che CORS includa l'IP del cellulare (vedi STEP 2.3)
2. Verifica che `FRONTEND_URL` in `.env` sia corretto
3. Riavvia il backend

### "API non funzionano"

**Soluzione:**
1. Verifica che `NEXT_PUBLIC_API_URL` in `.env.local` usi l'IP invece di localhost
2. Riavvia il frontend

---

## 📝 RIEPILOGO RAPIDO

**1. Trova IP computer:**
```bash
ipconfig
# Cerca "Indirizzo IPv4" → es: 192.168.1.100
```

**2. Modifica `backend/.env`:**
```env
FRONTEND_URL="http://192.168.1.100:3000"
```

**3. Modifica `backend/src/server.js`:**
```javascript
app.listen(PORT, '0.0.0.0', () => {...});
```

**4. Modifica `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://192.168.1.100:3001/api"
```

**5. Configura firewall** (vedi STEP 4)

**6. Avvia backend e frontend:**
```bash
# Terminale 1
cd backend
npm run dev

# Terminale 2
cd frontend
npm run dev -- -H 0.0.0.0
```

**7. Dal cellulare, vai su:**
```
http://192.168.1.100:3000
```

---

## 🎯 ALTERNATIVA: Usa ngrok (Per Test da Reti Diverse)

Se vuoi accedere da qualsiasi rete (anche dati mobili):

### 1. Installa ngrok
- Vai su: https://ngrok.com/
- Scarica e installa
- Crea account gratuito

### 2. Avvia Tunnel
```bash
ngrok http 3000
```

### 3. Usa l'URL ngrok
- ngrok ti darà un URL tipo: `https://abc123.ngrok.io`
- Usa questo URL sul cellulare

**Nota:** ngrok è gratuito ma ha limiti. Per sviluppo locale, usa il metodo IP diretto.

---

## ✅ CHECKLIST

Prima di accedere dal cellulare:

- [ ] IP computer trovato
- [ ] Computer e cellulare sulla stessa rete WiFi
- [ ] `backend/.env` modificato con IP
- [ ] `backend/src/server.js` modificato per ascoltare su `0.0.0.0`
- [ ] CORS configurato con IP
- [ ] `frontend/.env.local` modificato con IP
- [ ] Firewall configurato (porte 3000 e 3001)
- [ ] Backend avviato
- [ ] Frontend avviato con `-H 0.0.0.0`
- [ ] Testato da cellulare

---

**🎉 Una volta configurato, potrai accedere al sito dal cellulare e testare il design mobile-first!**

Buon test! 📱

