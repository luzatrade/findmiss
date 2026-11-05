/** Valori allineati a `AdvancedFilters.jsx` (ricerca visitatore). */

export const HAIR_COLOR_OPTIONS = [
  { value: 'nero', label: 'Neri' },
  { value: 'castano', label: 'Castani' },
  { value: 'biondo', label: 'Biondi' },
  { value: 'rossi', label: 'Rossi' },
  { value: 'colorati', label: 'Colorati' },
]

export const EYE_COLOR_OPTIONS = [
  { value: 'marroni', label: 'Marroni' },
  { value: 'azzurri', label: 'Azzurri' },
  { value: 'verdi', label: 'Verdi' },
  { value: 'grigi', label: 'Grigi' },
]

export const CUP_SIZE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F']

export const BODY_TYPE_OPTIONS = [
  { value: 'slim', label: 'Magro' },
  { value: 'athletic', label: 'Atletico' },
  { value: 'curvy', label: 'Formose' },
  { value: 'bbw', label: 'BBW' },
]

export const ETHNICITY_OPTIONS = [
  'Italiana',
  'Europea',
  'Latina',
  'Asiatica',
  'Africana',
  'Mista',
]

export const SERVICE_FILTER_OPTIONS = [
  { key: 'inCall', label: 'Incontri in loco (Incall)' },
  { key: 'outCall', label: 'Trasferta / a domicilio (Outcall)' },
  { key: 'dinnerDate', label: 'Cena / uscita' },
  { key: 'overnight', label: 'Pernottamento' },
  { key: 'travel', label: 'Disponibile a viaggiare' },
]

export const AVAILABLE_FOR_OPTIONS = [
  { id: 'incontro', label: 'Incontro di persona' },
  { id: 'videochat', label: 'Videochat / online' },
  { id: 'entrambi', label: 'Entrambi' },
]

export const DEFAULT_SERVICE_FLAGS = {
  inCall: false,
  outCall: false,
  dinnerDate: false,
  overnight: false,
  travel: false,
}
