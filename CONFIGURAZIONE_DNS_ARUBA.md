# 🌐 Configurazione DNS su ARUBA per FindMiss.it

## Accedi al Pannello Aruba

1. Vai su: **https://admin.aruba.it**
2. Inserisci le tue credenziali (email e password Aruba)
3. Clicca su **"Accedi"**

---

## Trova la Gestione DNS

1. Nel menu laterale, clicca su **"Domini"**
2. Trova **findmiss.it** nella lista
3. Clicca su **"Gestisci"** (o l'icona ingranaggio ⚙️)
4. Clicca su **"Gestione DNS"** o **"DNS"**

---

## Elimina i Record Esistenti (opzionale ma consigliato)

Se ci sono già record A, AAAA o CNAME per @ e www, eliminali prima.

---

## Aggiungi i Nuovi Record DNS

### 📱 RECORD 1 - Sito principale (findmiss.it)

```
Tipo:    A
Host:    @ (oppure lascia vuoto, oppure scrivi "findmiss.it")
Valore:  76.76.21.21
TTL:     3600 (o lascia il default)
```

Clicca **"Aggiungi"** o **"Salva"**

---

### 📱 RECORD 2 - Versione www (www.findmiss.it)

```
Tipo:    CNAME
Host:    www
Valore:  cname.vercel-dns.com
TTL:     3600 (o lascia il default)
```

Clicca **"Aggiungi"** o **"Salva"**

---

### 📱 RECORD 3 - API Backend (api.findmiss.it)

⚠️ **IMPORTANTE**: Questo valore lo ottieni da Railway dopo aver creato il backend!

```
Tipo:    CNAME
Host:    api
Valore:  [IL_VALORE_DA_RAILWAY]  <-- Lo vedrai su Railway
TTL:     3600 (o lascia il default)
```

---

## Come Apparirà la Tabella DNS Finale

| Tipo  | Host | Valore                          |
|-------|------|---------------------------------|
| A     | @    | 76.76.21.21                     |
| CNAME | www  | cname.vercel-dns.com            |
| CNAME | api  | [valore-da-railway].railway.app |

---

## Salva le Modifiche

1. Clicca **"Salva modifiche"** o **"Conferma"**
2. Aruba potrebbe chiederti conferma, clicca **"Sì"**

---

## Tempo di Propagazione

- I DNS di Aruba si propagano in genere in **5-30 minuti**
- A volte possono servire fino a **24 ore**
- Puoi controllare su: https://dnschecker.org/#A/findmiss.it

---

## Verifica che Funzioni

Dopo 10-30 minuti, prova ad aprire:
- https://findmiss.it
- https://www.findmiss.it
- https://api.findmiss.it

---

## 🆘 Problemi Comuni su Aruba

### "Record già esistente"
→ Elimina prima il record esistente, poi aggiungi quello nuovo

### "Host non valido"
→ Per il dominio principale, prova a lasciare il campo Host vuoto invece di @

### "Valore non valido"
→ Assicurati di non avere spazi prima o dopo il valore

### I DNS non funzionano dopo 24 ore
→ Contatta il supporto Aruba o verifica di aver salvato correttamente

---

## Screenshot di Riferimento (cosa cercare)

Nel pannello Aruba cerca:
- "Gestione DNS" 
- "DNS Editor"
- "Zone DNS"
- Icona con ingranaggio vicino al dominio

I pulsanti per aggiungere record di solito sono:
- "+ Aggiungi record"
- "Nuovo record"
- "Add record"

