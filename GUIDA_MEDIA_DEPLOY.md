# Perché foto/reel spariscono dopo un deploy

## Causa

| Dove finiva il file (vecchio flusso) | Cosa succede al redeploy Railway |
|--------------------------------------|----------------------------------|
| Disco del container `backend/uploads` | **Tutto cancellato** |
| Database PostgreSQL | Restano solo gli **URL** (`/uploads/...`) → **404** |

**Non è un bug del sito**: senza storage esterno, Railway non conserva i file.

## Soluzione obbligatoria (findmiss.it)

**Vercel Blob** collegato al progetto frontend **findmiss**:

1. [vercel.com](https://vercel.com) → progetto **findmiss** → **Storage** → **Blob** → crea e **Connect** al progetto
2. Verifica **Settings** → **Environment Variables** → `BLOB_READ_WRITE_TOKEN` o store OIDC (Production)
3. **Redeploy** frontend Vercel

I nuovi upload salvano URL `https://....blob.vercel-storage.com/...` che **non** si perdono ai redeploy.

Il codice dal merge PR #23 in poi **non** salva più in produzione sul disco Railway (messaggio chiaro se Blob manca).

## Alternativa (solo backend)

Volume Railway montato su `/data/uploads` + `UPLOADS_PATH=/data/uploads` — i file restano sul volume, ma Blob è preferibile con frontend su Vercel.

## Dopo aver attivato Blob

**Ricarica** foto, reel e storie: i file vecchi su `/uploads/...` **non si recuperano**.

## Verifica rapida

```bash
# Deve essere 400/401, non 503 con "Blob non configurato":
curl -s -X POST https://www.findmiss.it/api/media/upload \
  -H 'Content-Type: application/json' -d '{}'
```

Nel DB, i nuovi media devono avere URL `blob.vercel-storage.com`, non `/uploads/...`.
