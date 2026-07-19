const { generateSecret, generateURI, verifySync } = require('otplib');
const QRCode = require('qrcode');

const APP_NAME = 'Find Miss Admin';

function generateTotpSecret() {
  return generateSecret();
}

function buildOtpAuthUrl(email, secret) {
  return generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });
}

async function buildQrDataUrl(otpAuthUrl) {
  return QRCode.toDataURL(otpAuthUrl);
}

function verifyTotpCode(secret, code) {
  if (!secret || !code) return false;
  const normalized = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  const result = verifySync({ secret, token: normalized });
  return Boolean(result?.valid);
}

module.exports = {
  generateTotpSecret,
  buildOtpAuthUrl,
  buildQrDataUrl,
  verifyTotpCode,
};
