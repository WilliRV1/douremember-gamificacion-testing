/**
 * MiniJuegoBoard - Tablero principal del mini-juego de reconocimiento
 * HU-004: Iniciar mini-juego de reconocimiento por nombre escrito
 * HU-005: Validar respuesta escrita y avanzar de ronda
 * HU-006: Ayuda progresiva por niveles ante errores
 * HU-007: Audio bajo demanda en el juego
 * HU-008: Sistema de puntuación
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Send, Trophy, RotateCcw, Volume2, Pause, Square } from 'lucide-react'
import { useMinijuego } from '@/hooks/use-minijuego'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { PantallaFin } from './PantallaFin'
import { getParentescoLabel, getParentescoIcon } from '@/types/familiares.types'
import { cn } from '@/lib/utils'

interface MiniJuegoBoardProps {
  pacienteId: string
}

export function MiniJuegoBoard({ pacienteId }: MiniJuegoBoardProps) {
  const { estado, feedback, iniciarJuego, validarRespuesta, reiniciarJuego } = useMinijuego(pacienteId)
  const audio = useAudioPlayer()
  const [inputNombre, setInputNombre] = useState('')
  const [errorInicio, setErrorInicio] = useState<string | null>(null)

  // =========================================
  // PANTALLA INICIAL: Botón "Iniciar"
  // =========================================
  if (!estado.sesionId && !estado.juegoTerminado) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl p-10 shadow-lg max-w-md w-full">
          <Trophy className="h-16 w-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Mini-juego</h2>
          <p className="text-slate-500 text-lg mb-8">
            ¿Puedes recordar los nombres de tus familiares?
          </p>

          {errorInicio && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {errorInicio}
            </div>
          )}

          <button
            onClick={async () => {
              try {
                setErrorInicio(null)
                await iniciarJuego()
              } catch (err: any) {
                setErrorInicio(err.message)
              }
            }}
            disabled={estado.cargando}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-bold text-xl shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {estado.cargando ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Play className="h-6 w-6" />
            )}
            {estado.cargando ? 'Cargando...' : 'Iniciar'}
          </button>
        </div>
      </div>
    )
  }

  // =========================================
  // PANTALLA FIN: Cuando el juego termina
  // =========================================
  if (estado.juegoTerminado) {
    return (
      <PantallaFin
        puntajeTotal={estado.puntajeTotal}
        totalFamiliares={estado.familiares.length}
        rondasCompletadas={estado.rondasCompletadas}
        onVolverInicio={reiniciarJuego}
      />
    )
  }

  // =========================================
  // PANTALLA DEL JUEGO: Ronda activa
  // =========================================
  const ronda = estado.rondaActual
  if (!ronda) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputNombre.trim()) return
    await validarRespuesta(inputNombre)
    if (feedback.tipo === 'correcto') {
      setInputNombre('')
    }
  }

  const progreso = estado.rondasCompletadas + 1
  const total = estado.familiares.length

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header: Puntaje y Progreso */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="text-lg font-bold text-slate-800">{estado.puntajeTotal} pts</span>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Ronda {progreso} de {total}
        </div>
        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
          Nivel {ronda.nivelAyuda}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-purple-500 rounded-full h-2 transition-all duration-500"
          style={{ width: `${(estado.rondasCompletadas / total) * 100}%` }}
        />
      </div>

      {/* Foto del familiar */}
      <div className="relative w-full aspect-square max-h-80 rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={ronda.familiar.foto_url}
          alt="¿Quién es?"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 512px"
          priority
        />
      </div>

      {/* AYUDA PROGRESIVA POR NIVELES */}
      <div className="space-y-3">
        {/* Nivel 2+: Mostrar nombre correcto */}
        {ronda.nivelAyuda >= 2 && ronda.familiar.nombre && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center animate-in fade-in">
            <p className="text-sm text-blue-500 font-medium">Pista - Nombre:</p>
            <p className="text-xl font-bold text-blue-800">{ronda.familiar.nombre}</p>
          </div>
        )}

        {/* Nivel 3+: Mostrar descripción (si existe) */}
        {ronda.nivelAyuda >= 3 && ronda.familiar.descripcion && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center animate-in fade-in">
            <p className="text-sm text-amber-500 font-medium">Pista - Descripción:</p>
            <p className="text-base text-amber-800 italic">&ldquo;{ronda.familiar.descripcion}&rdquo;</p>
          </div>
        )}

        {/* Nivel 4: Audio bajo demanda (si existe) */}
        {ronda.nivelAyuda >= 4 && ronda.familiar.audio_url && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center animate-in fade-in">
            <p className="text-sm text-green-500 font-medium mb-2">Pista - Audio:</p>
            <div className="flex justify-center gap-2">
              {!audio.isPlaying && !audio.isPaused && (
                <button
                  onClick={() => audio.play(ronda.familiar.audio_url!)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Volume2 className="h-4 w-4" />
                  Reproducir audio
                </button>
              )}
              {audio.isPlaying && (
                <button
                  onClick={audio.pause}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </button>
              )}
              {audio.isPaused && (
                <button
                  onClick={audio.resume}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Volume2 className="h-4 w-4" />
                  Reanudar
                </button>
              )}
              {(audio.isPlaying || audio.isPaused) && (
                <button
                  onClick={audio.stop}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <Square className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback.tipo && (
        <div
          className={cn(
            'text-center py-3 px-4 rounded-xl font-semibold text-lg animate-in fade-in',
            feedback.tipo === 'correcto'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          )}
        >
          {feedback.tipo === 'correcto' ? '✅' : '❌'} {feedback.mensaje}
        </div>
      )}

      {/* Campo de respuesta + botón validar */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputNombre}
          onChange={(e) => setInputNombre(e.target.value)}
          placeholder="Escribe el nombre..."
          className="flex-1 px-5 py-4 text-lg font-semibold text-black placeholder:text-slate-500 border-2 border-slate-200 rounded-2xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          autoFocus
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!inputNombre.trim()}
          className="px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          aria-label="Validar respuesta"
        >
          <Send className="h-6 w-6" />
        </button>
      </form>

      {/* Intentos */}
      {ronda.intentos > 0 && (
        <p className="text-center text-sm text-slate-400">
          Intentos realizados: {ronda.intentos}
        </p>
      )}
    </div>
  )
}
