# Media su Vercel Blob (foto, reel, storie)

## Flusso

1. Il **browser** carica il file su **Vercel Blob** (route Next.js `/api/media/upload`).
2. Il frontend invia gli **URL pubblici** al backend Railway (`POST /api/upload/media/register`).
3. PostgreSQL salva gli URL HTTPS (non più solo `/uploads/...` sul disco effimero).

## Setup Vercel (obbligatorio)

1. Progetto **frontend** su Vercel → **Storage** → **Blob** → collega al progetto.
2. Vercel imposta automaticamente `BLOB_READ_WRITE_TOKEN` sul progetto.
3. Variabile consigliata: `NEXT_PUBLIC_API_URL=https://api.findmiss.it/api` (se non già presente).
4. Opzionale: `NEXT_PUBLIC_USE_VERCEL_BLOB=false` per tornare all’upload Railway (sconsigliato in prod).

## Setup Railway (backend)

1. Variabile opzionale `MEDIA_URL_ALLOWLIST=blob.vercel-storage.com` (è già il default).
2. **Redeploy** del backend dopo il merge.

## Dopo il deploy

- **Ricarica** foto, reel e storie: i file persi sul disco Railway non si recuperano.
- I **nuovi** upload restano su Blob e restano visibili dopo i redeploy.

## Sviluppo locale

- Senza Blob: upload verso Railway come prima (`NEXT_PUBLIC_USE_VERCEL_BLOB` non impostato su localhost).
- Con Blob locale: `.env.local` con `BLOB_READ_WRITE_TOKEN` + `NEXT_PUBLIC_USE_VERCEL_BLOB=true`.
