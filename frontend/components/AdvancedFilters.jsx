'use client'
import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

export default function AdvancedFilters({ isOpen, onClose, onApply }) {
  const [filters, setFilters] = useState({
    city: '',
    verified: false,
    vip: false,
    availableNow: false,
    ageMin: 18,
    ageMax: 50,
    heightMin: 150,
    heightMax: 190,
    weightMin: 40,
    weightMax: 80,
    hairColor: '',
    eyeColor: '',
    cupSize: '',
    bodyType: '',
    ethnicity: '',
    services: {
      inCall: false,
      outCall: false,
      dinnerDate: false,
      overnight: false,
      travel: false
    },
    priceMin: 50,
    priceMax: 500,
    availableToday: false,
    speaksEnglish: false,
    smoker: false,
    tatoos: false,
    piercings: false
  })

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      city: '',
      verified: false,
      vip: false,
      availableNow: false,
      ageMin: 18,
      ageMax: 50,
      heightMin: 150,
      heightMax: 190,
      weightMin: 40,
      weightMax: 80,
      hairColor: '',
      eyeColor: '',
      cupSize: '',
      bodyType: '',
      ethnicity: '',
      services: {
        inCall: false,
        outCall: false,
        dinnerDate: false,
        overnight: false,
        travel: false
      },
      priceMin: 50,
      priceMax: 500,
      availableToday: false,
      speaksEnglish: false,
      smoker: false,
      tatoos: false,
      piercings: false
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">Filtri</h2>
          </div>
          <button 
            onClick={handleReset}
            className="text-purple-400 text-sm font-semibold"
          >
            Azzera tutto
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Città */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Città</h3>
          <div className="space-y-3">
            <select
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-900 outline-none"
            >
              <option value="">Tutte le città</option>
              <option value="Roma">Roma</option>
              <option value="Milano">Milano</option>
              <option value="Napoli">Napoli</option>
              <option value="Torino">Torino</option>
              <option value="Firenze">Firenze</option>
              <option value="Bologna">Bologna</option>
              <option value="Venezia">Venezia</option>
              <option value="Palermo">Palermo</option>
              <option value="Bari">Bari</option>
              <option value="Catania">Catania</option>
            </select>
          </div>
        </div>

        {/* Filtri Generali */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Generale</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">✓ Verificato</span>
              <input 
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">👑 VIP</span>
              <input 
                type="checkbox"
                checked={filters.vip}
                onChange={(e) => setFilters({...filters, vip: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">🟢 Online ora</span>
              <input 
                type="checkbox"
                checked={filters.availableNow}
                onChange={(e) => setFilters({...filters, availableNow: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">🗓️ Oggi</span>
              <input 
                type="checkbox"
                checked={filters.availableToday}
                onChange={(e) => setFilters({...filters, availableToday: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
          </div>
        </div>

        {/* Fascia di prezzo */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Prezzo (€/h)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-white text-sm">
              <span>Min: {filters.priceMin}€</span>
              <span>Max: {filters.priceMax}€</span>
            </div>
            <div className="px-2">
              <div className="relative">
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="absolute h-1 bg-pink-500 rounded-full"
                    style={{
                      left: `${(filters.priceMin / 500) * 100}%`,
                      right: `${100 - (filters.priceMax / 500) * 100}%`
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({...filters, priceMin: parseInt(e.target.value)})}
                  className="absolute w-full h-1 -top-1 appearance-none pointer-events-none"
                  style={{
                    background: 'none',
                    WebkitAppearance: 'none',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})}
                  className="absolute w-full h-1 -top-1 appearance-none pointer-events-none"
                  style={{
                    background: 'none',
                    WebkitAppearance: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Età */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Età</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-white text-sm">
              <span>Da: {filters.ageMin} anni</span>
              <span>A: {filters.ageMax} anni</span>
            </div>
            <div className="px-2">
              <div className="relative">
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="absolute h-1 bg-pink-500 rounded-full"
                    style={{
                      left: `${((filters.ageMin - 18) / (50 - 18)) * 100}%`,
                      right: `${100 - ((filters.ageMax - 18) / (50 - 18)) * 100}%`
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filters.ageMin}
                  onChange={(e) => setFilters({...filters, ageMin: parseInt(e.target.value)})}
                  className="absolute w-full h-1 -top-1 appearance-none pointer-events-none"
                  style={{
                    background: 'none',
                    WebkitAppearance: 'none',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filters.ageMax}
                  onChange={(e) => setFilters({...filters, ageMax: parseInt(e.target.value)})}
                  className="absolute w-full h-1 -top-1 appearance-none pointer-events-none"
                  style={{
                    background: 'none',
                    WebkitAppearance: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Servizi */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Servizi</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries({
              inCall: '🏠 Incontri in loco',
              outCall: '🚗 Trasferta',
              dinnerDate: '🍽️ Cena',
              overnight: '🌙 Pernottamento',
              travel: '✈️ Viaggi'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
                <span className="text-white text-sm">{label}</span>
                <input 
                  type="checkbox"
                  checked={filters.services[key]}
                  onChange={(e) => setFilters({
                    ...filters, 
                    services: {
                      ...filters.services,
                      [key]: e.target.checked
                    }
                  })}
                  className="w-5 h-5 accent-pink-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Aspetto fisico */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Aspetto fisico</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-white text-sm mb-1">Colore capelli</label>
              <select
                value={filters.hairColor}
                onChange={(e) => setFilters({...filters, hairColor: e.target.value})}
                className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-900 outline-none text-sm"
              >
                <option value="">Qualsiasi colore</option>
                <option value="nero">Neri</option>
                <option value="castano">Castani</option>
                <option value="biondo">Biondi</option>
                <option value="rossi">Rossi</option>
                <option value="colorati">Colorati</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm mb-1">Colore occhi</label>
              <select
                value={filters.eyeColor}
                onChange={(e) => setFilters({...filters, eyeColor: e.target.value})}
                className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-900 outline-none text-sm"
              >
                <option value="">Qualsiasi colore</option>
                <option value="marroni">Marroni</option>
                <option value="azzurri">Azzurri</option>
                <option value="verdi">Verdi</option>
                <option value="grigi">Grigi</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm mb-1">Taglia reggiseno</label>
              <select
                value={filters.cupSize}
                onChange={(e) => setFilters({...filters, cupSize: e.target.value})}
                className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-900 outline-none text-sm"
              >
                <option value="">Qualsiasi taglia</option>
                <option value="A">Coppa A</option>
                <option value="B">Coppa B</option>
                <option value="C">Coppa C</option>
                <option value="D">Coppa D</option>
                <option value="E">Coppa E+</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm mb-1">Fisico</label>
              <select
                value={filters.bodyType}
                onChange={(e) => setFilters({...filters, bodyType: e.target.value})}
                className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-900 outline-none text-sm"
              >
                <option value="">Qualsiasi fisico</option>
                <option value="slim">Magro</option>
                <option value="athletic">Atletico</option>
                <option value="curvy">Formose</option>
                <option value="bbw">BBW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Altre caratteristiche */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Altre caratteristiche</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">🌍 Parla inglese</span>
              <input 
                type="checkbox"
                checked={filters.speaksEnglish}
                onChange={(e) => setFilters({...filters, speaksEnglish: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">🚬 Fumatrice</span>
              <input 
                type="checkbox"
                checked={filters.smoker}
                onChange={(e) => setFilters({...filters, smoker: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">💉 Tatuaggi</span>
              <input 
                type="checkbox"
                checked={filters.tatoos}
                onChange={(e) => setFilters({...filters, tatoos: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
            <label className="flex items-center justify-between bg-gray-900 p-3 rounded-xl">
              <span className="text-white text-sm">👂 Piercing</span>
              <input 
                type="checkbox"
                checked={filters.piercings}
                onChange={(e) => setFilters({...filters, piercings: e.target.checked})}
                className="w-5 h-5 accent-pink-500"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-10">
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition"
          >
            Azzera
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-pink-500/20"
          >
            Mostra risultati
          </button>
        </div>
      </div>
    </div>
  )
}