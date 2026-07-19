function isDemoFallbackEnabled() {
  if (process.env.ENABLE_DEMO_FALLBACK === 'true') return true;
  if (process.env.ENABLE_DEMO_FALLBACK === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

function isAutoSeedEnabled() {
  return process.env.RUN_SEED === 'true';
}

module.exports = {
  isDemoFallbackEnabled,
  isAutoSeedEnabled,
};
