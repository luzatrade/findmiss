function allowedMediaHosts() {
  const fromEnv = (process.env.MEDIA_URL_ALLOWLIST || 'blob.vercel-storage.com')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return fromEnv;
}

function isAllowedRemoteMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) {
    return false;
  }
  if (url.startsWith('/uploads/')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    return allowedMediaHosts().some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

module.exports = { isAllowedRemoteMediaUrl, allowedMediaHosts };
