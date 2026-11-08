# Foto e video: dove sono e perché spariscono

## Dove vengono salvati

1. **Upload** → API `POST /api/upload` salva il file su disco in:
   - `UPLOADS_PATH/images/` (foto, con eventuale WebP ottimizzato)
   - `UPLOADS_PATH/videos/` (reel e video)
2. **Database PostgreSQL** → tabella `media` (e `stories`) con `url` / `thumbnail_url`.
3. **URL pubblici**:
   - senza S3: `https://api.findmiss.it/uploads/images/...`
   - con S3/R2: URL HTTPS del bucket (es. Cloudflare R2)

## Problema attuale su Railway (senza volume né S3)

Il database **conserva i link**, ma il **disco del container si resetta** a ogni redeploy. Risultato: link nel DB ma file **404** → niente foto né reel visibili.

## Soluzione A — Cloudflare R2 o S3 (consigliata)

Su Railway, variabili d’ambiente del backend:

| Variabile | Esempio |
|-----------|---------|
| `S3_BUCKET` | `findmiss-media` |
| `AWS_ACCESS_KEY_ID` | chiave R2/S3 |
| `AWS_SECRET_ACCESS_KEY` | secret |
| `AWS_REGION` | `auto` (R2) o `eu-central-1` (AWS) |
| `S3_ENDPOINT` | endpoint R2 (solo se non usi AWS nativo) |
| `S3_PUBLIC_BASE_URL` | dominio pubblico del bucket (es. `https://pub-xxx.r2.dev`) |

Dopo il deploy, **ricarica foto e reel**: i file persi non si recuperano da soli.

## Soluzione B — Volume Railway

1. Nel servizio backend → **Volume** montato (es. `/data/uploads`).
2. Variabile `UPLOADS_PATH=/data/uploads`.
3. Redeploy.

I file restano sul volume, ma un backup esterno resta comunque consigliato.

## Verifica rapida

```bash
curl -I "https://api.findmiss.it/uploads/images/NOMEFILE.webp"
```

- **404** → file mancante sul server (disco perso o path errato).
- **200** → il file c’è; se non lo vedi sul sito, controlla cache o URL nel DB.
