/**
 * FamiliarCard - Card individual de un familiar en la galería
 * HU-002: Visualizar galería de familiares (cards)
 * RF-01: Muestra foto, ícono de parentesco, nombre opcional
 */

'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getParentescoIcon, getParentescoLabel } from '@/types/familiares.types'
import type { Familiar } from '@/types/familiares.types'

interface FamiliarCardProps {
  familiar: Familiar
  onClick?: (familiar: Familiar) => void
  className?: string
}

export function FamiliarCard({ familiar, onClick, className }: FamiliarCardProps) {
  // CA3: Si no tiene foto, no mostrar
  if (!familiar.foto_url) return null

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100 hover:border-purple-200 hover:-translate-y-1',
        className
      )}
      onClick={() => onClick?.(familiar)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(familiar)
        }
      }}
      aria-label={`Ver detalles de ${familiar.nombre || 'familiar'}`}
    >
      {/* Foto del familiar */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={familiar.foto_url}
          alt={familiar.nombre || `Familiar - ${getParentescoLabel(familiar.parentesco)}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info del familiar */}
      <div className="p-4 flex items-center gap-3">
        {/* Ícono de parentesco (obligatorio) */}
        <span className="text-2xl flex-shrink-0" role="img" aria-label={getParentescoLabel(familiar.parentesco)}>
          {getParentescoIcon(familiar.parentesco)}
        </span>

        <div className="flex-1 min-w-0">
          {/* Parentesco siempre visible */}
          <p className="text-sm text-slate-500 font-medium">
            {getParentescoLabel(familiar.parentesco)}
          </p>

          {/* CA2: Nombre visible solo si mostrar_nombre_en_card está habilitado */}
          {familiar.mostrar_nombre_en_card && familiar.nombre && (
            <p className="text-base font-semibold text-slate-800 truncate">
              {familiar.nombre}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
