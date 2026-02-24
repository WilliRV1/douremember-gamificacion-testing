/**
 * RecuerdoModal - Modal de detalle de un familiar
 * HU-003: Abrir modal de recuerdo desde una card
 * RF-02: Foto grande, nombre, parentesco, descripción, audio bajo demanda
 */

'use client'

import { X, Volume2, Pause, Square } from 'lucide-react'
import Image from 'next/image'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { getParentescoIcon, getParentescoLabel } from '@/types/familiares.types'
import type { Familiar } from '@/types/familiares.types'

interface RecuerdoModalProps {
  familiar: Familiar
  isOpen: boolean
  onClose: () => void
}

export function RecuerdoModal({ familiar, isOpen, onClose }: RecuerdoModalProps) {
  const audio = useAudioPlayer()

  if (!isOpen) return null

  const handleClose = () => {
    audio.stop()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Recuerdo de ${familiar.nombre || 'familiar'}`}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        {/* CA2: Foto en tamaño grande */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={familiar.foto_url}
            alt={familiar.nombre || 'Familiar'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
        </div>

        {/* Información del familiar */}
        <div className="p-6 space-y-4">
          {/* Parentesco + ícono */}
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={getParentescoLabel(familiar.parentesco)}>
              {getParentescoIcon(familiar.parentesco)}
            </span>
            <div>
              <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
                {getParentescoLabel(familiar.parentesco)}
              </p>
              {/* CA2: Nombre completo */}
              {familiar.nombre && (
                <h2 className="text-2xl font-bold text-slate-800">
                  {familiar.nombre}
                </h2>
              )}
            </div>
          </div>

          {/* CA3: Descripción/frase de apoyo - solo si existe */}
          {familiar.descripcion && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-slate-700 text-base leading-relaxed italic">
                &ldquo;{familiar.descripcion}&rdquo;
              </p>
            </div>
          )}

          {/* CA4: Audio bajo demanda - solo si existe */}
          {familiar.audio_url && (
            <div className="flex items-center gap-3 pt-2">
              {!audio.isPlaying && !audio.isPaused && (
                <button
                  onClick={() => audio.play(familiar.audio_url!)}
                  className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-lg"
                >
                  <Volume2 className="h-5 w-5" />
                  Reproducir audio
                </button>
              )}

              {audio.isPlaying && (
                <div className="flex gap-2">
                  <button
                    onClick={audio.pause}
                    className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                    Pausar
                  </button>
                  <button
                    onClick={audio.stop}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <Square className="h-5 w-5" />
                    Detener
                  </button>
                </div>
              )}

              {audio.isPaused && (
                <div className="flex gap-2">
                  <button
                    onClick={audio.resume}
                    className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <Volume2 className="h-5 w-5" />
                    Reanudar
                  </button>
                  <button
                    onClick={audio.stop}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <Square className="h-5 w-5" />
                    Detener
                  </button>
                </div>
              )}

              {audio.error && (
                <p className="text-red-500 text-sm">{audio.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
