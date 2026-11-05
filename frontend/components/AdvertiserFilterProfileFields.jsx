'use client'

import {
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  CUP_SIZE_OPTIONS,
  BODY_TYPE_OPTIONS,
  ETHNICITY_OPTIONS,
  SERVICE_FILTER_OPTIONS,
  AVAILABLE_FOR_OPTIONS,
} from '../lib/filterFieldOptions'

export default function AdvertiserFilterProfileFields({ formData, updateField, setFormData }) {
  const toggleAvailableFor = (id) => {
    setFormData((prev) => {
      const active = prev.available_for.includes(id)
      return {
        ...prev,
        available_for: active
          ? prev.available_for.filter((v) => v !== id)
          : [...prev.available_for, id],
      }
    })
  }

  const toggleService = (key) => {
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [key]: !prev.services[key],
      },
    }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Profilo per ricerca (filtri visitatore)</h3>
        <p className="text-sm text-gray-500 mt-1">
          Compila i campi corrispondenti al menu <strong>Filtri</strong> del sito: età e città li
          inserisci sopra; qui aggiungi aspetto, servizi e disponibilità.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Altezza (cm)</label>
          <input
            type="number"
            value={formData.height || ''}
            onChange={(e) => updateField('height', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            placeholder="170"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Peso (kg)</label>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e) => updateField('weight', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            placeholder="55"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Colore capelli</label>
          <select
            value={formData.hair_color || ''}
            onChange={(e) => updateField('hair_color', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="">Seleziona</option>
            {HAIR_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Colore occhi</label>
          <select
            value={formData.eye_color || ''}
            onChange={(e) => updateField('eye_color', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="">Seleziona</option>
            {EYE_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Taglia reggiseno</label>
          <select
            value={formData.cup_size || ''}
            onChange={(e) => updateField('cup_size', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="">Seleziona</option>
            {CUP_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Fisico</label>
          <select
            value={formData.body_type || ''}
            onChange={(e) => updateField('body_type', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="">Seleziona</option>
            {BODY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Etnia</label>
          <select
            value={formData.ethnicity || ''}
            onChange={(e) => updateField('ethnicity', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="">Seleziona</option>
            {ETHNICITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Nazionalità</label>
          <input
            type="text"
            value={formData.nationality || ''}
            onChange={(e) => updateField('nationality', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            placeholder="Es. Italiana"
          />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-sm font-medium text-gray-700">Lingue parlate</label>
          <input
            type="text"
            value={formData.language || ''}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            placeholder="Es. Italiano, Inglese"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.is_available_now)}
            onChange={(e) => updateField('is_available_now', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Online ora
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.available_overnight)}
            onChange={(e) => updateField('available_overnight', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Pernottamento
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.smoker)}
            onChange={(e) => updateField('smoker', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Fumatore/trice
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.speaks_english)}
            onChange={(e) => updateField('speaks_english', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Parla inglese
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.has_tattoos)}
            onChange={(e) => updateField('has_tattoos', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Tatuaggi
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(formData.has_piercings)}
            onChange={(e) => updateField('has_piercings', e.target.checked)}
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
          />
          Piercing
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Tipo di incontro</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_FOR_OPTIONS.map((item) => {
            const active = (formData.available_for || []).includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleAvailableFor(item.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-700 hover:border-pink-200'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Servizi (come nel menu Filtri)</p>
        <div className="space-y-2">
          {SERVICE_FILTER_OPTIONS.map((service) => (
            <label
              key={service.key}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 text-sm text-gray-800"
            >
              <input
                type="checkbox"
                checked={Boolean(formData.services?.[service.key])}
                onChange={() => toggleService(service.key)}
                className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
              />
              {service.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
