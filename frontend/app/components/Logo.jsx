'use client'

const sizes = {
  xs: { text: 'text-sm', spacing: 'tracking-[0.2em]', line: 'w-6', gap: 'gap-2' },
  sm: { text: 'text-lg', spacing: 'tracking-[0.25em]', line: 'w-8', gap: 'gap-2.5' },
  md: { text: 'text-2xl', spacing: 'tracking-[0.3em]', line: 'w-12', gap: 'gap-3' },
  lg: { text: 'text-3xl', spacing: 'tracking-[0.35em]', line: 'w-16', gap: 'gap-4' },
  xl: { text: 'text-4xl', spacing: 'tracking-[0.4em]', line: 'w-20', gap: 'gap-5' },
}

export default function Logo({ size = 'md', className = '' }) {
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Linea sinistra - gradient rosa-viola */}
      <div 
        className={`h-[1px] ${s.line}`}
        style={{
          background: 'linear-gradient(to right, transparent, #E91E8C)'
        }}
      />
      
      {/* Testo FIND MISS */}
      <div className={`font-tenor ${s.text} ${s.spacing} uppercase font-normal flex items-center`}>
        <span className="text-white">FIND</span>
        <span className="text-[#E91E8C]">MISS</span>
      </div>
      
      {/* Linea destra - gradient rosa-viola */}
      <div 
        className={`h-[1px] ${s.line}`}
        style={{
          background: 'linear-gradient(to right, #8B5CF6, transparent)'
        }}
      />
    </div>
  )
}

// Versione per sfondo chiaro
export function LogoLight({ size = 'md', className = '' }) {
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Linea sinistra */}
      <div 
        className={`h-[1px] ${s.line}`}
        style={{
          background: 'linear-gradient(to right, transparent, #D946A8)'
        }}
      />
      
      {/* Testo FIND MISS */}
      <div className={`font-tenor ${s.text} ${s.spacing} uppercase font-normal flex items-center`}>
        <span className="text-gray-900">FIND</span>
        <span className="text-[#D946A8]">MISS</span>
      </div>
      
      {/* Linea destra */}
      <div 
        className={`h-[1px] ${s.line}`}
        style={{
          background: 'linear-gradient(to right, #8B5CF6, transparent)'
        }}
      />
    </div>
  )
}

// Versione solo testo (senza linee)
export function LogoText({ size = 'md', light = false, className = '' }) {
  const s = sizes[size] || sizes.md

  return (
    <div className={`font-tenor ${s.text} ${s.spacing} uppercase font-normal flex items-center ${className}`}>
      <span className={light ? 'text-gray-900' : 'text-white'}>FIND</span>
      <span className={light ? 'text-[#D946A8]' : 'text-[#E91E8C]'}>MISS</span>
    </div>
  )
}

