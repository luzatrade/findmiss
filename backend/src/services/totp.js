const { authenticator } = require('otplib');
const QRCode = require('qrcode');

const APP_NAME = 'Find Miss Admin';

authenticator.options = { window: 1 };

function generateTotpSecret() {
  return authenticator.generateSecret();
}

function buildOtpAuthUrl(email, secret) {
  return authenticator.keyuri(email, APP_NAME, secret);
}

async function buildQrDataUrl(otpAuthUrl) {
  return QRCode.toDataURL(otpAuthUrl);
}

function verifyTotpCode(secret, code) {
  if (!secret || !code) return false;
  const normalized = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  return authenticator.verify({ token: normalized, secret });
}

module.exports = {
  generateTotpSecret,
  buildOtpAuthUrl,
  buildQrDataUrl,
  verifyTotpCode,
};
