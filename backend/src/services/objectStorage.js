const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { UPLOADS_ROOT } = require('../config/uploads');

function isObjectStorageEnabled() {
  const bucket = process.env.S3_BUCKET;
  const accessKey = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  return Boolean(bucket && accessKey && secretKey);
}

function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || process.env.S3_REGION || 'auto',
    signatureVersion: 'v4',
  };

  if (endpoint) {
    config.endpoint = endpoint;
    config.s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE !== 'false';
  }

  return new AWS.S3(config);
}

function publicUrlForKey(key) {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (base) {
    return `${base}/${key}`;
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || process.env.S3_REGION || 'eu-central-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function parseLocalUploadPath(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/\/uploads\/(images|videos)\/([^/?#]+)/);
  if (!match) return null;
  return {
    folder: match[1],
    filename: match[2],
    localPath: path.join(UPLOADS_ROOT, match[1], match[2]),
    key: `${match[1]}/${match[2]}`,
  };
}

function parseStoredObjectKey(value) {
  if (!value || typeof value !== 'string') return null;
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return parseLocalUploadPath(value)?.key || null;
  }

  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (base && value.startsWith(`${base}/`)) {
    return value.slice(base.length + 1);
  }

  try {
    const url = new URL(value);
    const pathname = url.pathname.replace(/^\//, '');
    const bucket = process.env.S3_BUCKET;
    if (bucket && pathname.startsWith(`${bucket}/`)) {
      return pathname.slice(bucket.length + 1);
    }
    if (/^(images|videos)\//.test(pathname)) {
      return pathname;
    }
  } catch {
    return null;
  }

  return null;
}

async function uploadLocalFile(localPath, key, contentType) {
  const client = getS3Client();
  const body = fs.readFileSync(localPath);
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream',
  };

  if (process.env.S3_OBJECT_ACL) {
    params.ACL = process.env.S3_OBJECT_ACL;
  }

  await client.upload(params).promise();
  return publicUrlForKey(key);
}

async function publishStoredMediaUrl(storedUrl, { mimetype } = {}) {
  if (!storedUrl || !isObjectStorageEnabled()) {
    return storedUrl;
  }

  const parsed = parseLocalUploadPath(storedUrl);
  if (!parsed || !fs.existsSync(parsed.localPath)) {
    return storedUrl;
  }

  const publicUrl = await uploadLocalFile(parsed.localPath, parsed.key, mimetype);
  return publicUrl;
}

async function deleteStoredMediaUrl(storedUrl) {
  if (!storedUrl) return;

  const local = parseLocalUploadPath(storedUrl);
  if (local && fs.existsSync(local.localPath)) {
    fs.unlinkSync(local.localPath);
  }

  if (!isObjectStorageEnabled()) return;

  const key = parseStoredObjectKey(storedUrl);
  if (!key) return;

  try {
    await getS3Client()
      .deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
      .promise();
  } catch (error) {
    console.warn('Eliminazione oggetto S3 fallita:', key, error.message);
  }
}

function logStorageModeOnBoot() {
  if (process.env.NODE_ENV !== 'production') return;

  if (isObjectStorageEnabled()) {
    console.log(`📦 Media storage: S3 bucket ${process.env.S3_BUCKET}`);
    return;
  }

  console.warn(
    '⚠️ Media storage: solo disco locale. Su Railway i file si perdono ai redeploy — configura S3_BUCKET + credenziali oppure un volume su UPLOADS_PATH.'
  );
}

module.exports = {
  isObjectStorageEnabled,
  publishStoredMediaUrl,
  deleteStoredMediaUrl,
  logStorageModeOnBoot,
  parseLocalUploadPath,
};
