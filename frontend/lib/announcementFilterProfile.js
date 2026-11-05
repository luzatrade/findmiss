import { DEFAULT_SERVICE_FLAGS } from './filterFieldOptions'

export function parseServicesRaw(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return raw
}

export function parseAvailableForRaw(raw) {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return Array.isArray(raw) ? raw : []
}

/** Estrae campi profilo/filtri da un annuncio API. */
function normalizeHairColor(value) {
  if (value === 'rosso') return 'rossi'
  return value || ''
}

function normalizeEyeColor(value) {
  const map = { marrone: 'marroni', azzurro: 'azzurri', verde: 'verdi', grigio: 'grigi' }
  return map[value] || value || ''
}

export function profileFromAnnouncement(announcement) {
  const services = parseServicesRaw(announcement?.services)
  return {
    hair_color: normalizeHairColor(announcement?.hair_color),
    eye_color: normalizeEyeColor(announcement?.eye_color),
    cup_size: announcement?.cup_size || '',
    body_type: services.bodyType || '',
    ethnicity: announcement?.ethnicity || '',
    nationality: announcement?.nationality || '',
    language: announcement?.language || '',
    height: announcement?.height?.toString() || '',
    weight: announcement?.weight?.toString() || '',
    smoker: Boolean(announcement?.smoker),
    speaks_english: Boolean(services.speaksEnglish),
    has_tattoos: Boolean(services.tatoos),
    has_piercings: Boolean(services.piercings),
    is_available_now: Boolean(announcement?.is_available_now),
    available_overnight: Boolean(announcement?.available_overnight),
    available_for: parseAvailableForRaw(announcement?.available_for),
    services: {
      ...DEFAULT_SERVICE_FLAGS,
      inCall: Boolean(services.inCall),
      outCall: Boolean(services.outCall),
      dinnerDate: Boolean(services.dinnerDate),
      overnight: Boolean(services.overnight),
      travel: Boolean(services.travel),
    },
  }
}

export function buildServicesPayload(formSlice) {
  const flags = formSlice.services || DEFAULT_SERVICE_FLAGS
  return {
    ...flags,
    ...(formSlice.body_type ? { bodyType: formSlice.body_type } : {}),
    ...(formSlice.speaks_english ? { speaksEnglish: true } : {}),
    ...(formSlice.has_tattoos ? { tatoos: true } : {}),
    ...(formSlice.has_piercings ? { piercings: true } : {}),
  }
}

export function buildFilterProfilePayload(formData) {
  return {
    hair_color: formData.hair_color || null,
    eye_color: formData.eye_color || null,
    cup_size: formData.cup_size || null,
    ethnicity: formData.ethnicity || null,
    nationality: formData.nationality || null,
    language: formData.language || null,
    height: formData.height ? Number(formData.height) : null,
    weight: formData.weight ? Number(formData.weight) : null,
    smoker: Boolean(formData.smoker),
    is_available_now: Boolean(formData.is_available_now),
    available_overnight: Boolean(formData.available_overnight),
    available_for: formData.available_for?.length ? formData.available_for : null,
    services: buildServicesPayload(formData),
  }
}

export function isFilterProfileIncomplete(announcement) {
  const p = profileFromAnnouncement(announcement)
  const hasService = Object.values(p.services).some(Boolean)
  return !p.hair_color || !p.eye_color || !p.cup_size || !hasService
}
