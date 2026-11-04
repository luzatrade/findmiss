'use client'

import { useMemo, useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import CitySearchDropdown from './CitySearchDropdown'

export default function CityPickerField({
  value,
  onChange,
  cities = [],
  error,
  placeholder = 'Seleziona città',
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const label = useMemo(() => {
    if (!value) return ''
    const found = cities.find((c) => String(c.id) === String(value))
    return found?.name || ''
  }, [value, cities])

  return (
    <div className="relative space-y-1">
      <div
        className={`flex w-full items-center gap-2 rounded-xl border bg-white text-sm ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${open ? 'ring-2 ring-pink-400/50' : ''}`}
      >
        <MapPin className="ml-3 h-4 w-4 shrink-0 text-pink-500" />
        <input
          type="text"
          value={open ? search : label}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent py-3 pr-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <ChevronDown className="mr-3 h-4 w-4 shrink-0 text-gray-400" />
      </div>
      <CitySearchDropdown
        open={open}
        query={open ? search : label}
        onSelect={(city) => {
          onChange?.(city.id)
          setSearch('')
          setOpen(false)
        }}
        onClose={() => {
          setOpen(false)
          setSearch('')
        }}
      />
    </div>
  )
}
