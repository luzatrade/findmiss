# 🔐 Cambiare Password PostgreSQL a "password"

## Metodo 1: Via pgAdmin (Più Facile)

1. **Apri pgAdmin 4** dal menu Start Windows

2. **Connettiti al server**:
   - Ti chiederà la password che hai usato durante l'installazione
   - Inseriscila per connetterti

3. **Cambia password**:
   - Nel pannello sinistro, espandi "Servers" → "PostgreSQL 14" (o la tua versione)
   - Espandi "Login/Group Roles"
   - **Click destro** su `postgres` → **"Properties"**
   - Vai alla tab **"Definition"**
   - Nel campo **"Password"**: inserisci `password`
   - Nel campo **"Password (again)"**: inserisci di nuovo `password`
   - Clicca **"Save"**

4. **Verifica**:
   - Chiudi e riapri pgAdmin
   - Prova a connetterti con password `password`
   - Se funziona, hai finito! ✅

## Metodo 2: Via SQL (Alternativo)

Se hai accesso a pgAdmin o psql:

```sql
ALTER USER postgres PASSWORD 'password';
```

## Dopo aver cambiato la password

Torna qui e dimmi quando hai finito, così procediamo con le migrazioni!

---

**Nota**: Se non riesci a connetterti a pgAdmin con la password vecchia, potrebbe essere necessario reimpostare la password tramite il file di configurazione PostgreSQL, ma questo è più complesso. Prova prima con pgAdmin!


