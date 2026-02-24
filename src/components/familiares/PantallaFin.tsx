/**
 * PantallaFin - Pantalla de fin de sesión del mini-juego
 * HU-009: Pantalla de cierre con felicitación y puntaje
 * RF-08: Mensaje positivo, puntaje total, botón volver
 */

'use client'

import { useRouter } from 'next/navigation'
import { Trophy, Home, Eye, Star, PartyPopper } from 'lucide-react'

interface PantallaFinProps {
  puntajeTotal: number
  totalFamiliares: number
  rondasCompletadas: number
  onVolverInicio: () => void
}

export function PantallaFin({
  puntajeTotal,
  totalFamiliares,
  rondasCompletadas,
  onVolverInicio,
}: PantallaFinProps) {
  const router = useRouter()

  // Calcular nivel de logro
  const puntajeMaximo = totalFamiliares * 10
  const porcentaje = Math.round((puntajeTotal / puntajeMaximo) * 100)

  let mensaje = ''
  let estrellas = 0

  if (porcentaje >= 90) {
    mensaje = '¡Increíble! ¡Tienes una memoria excepcional!'
    estrellas = 3
  } else if (porcentaje >= 70) {
    mensaje = '¡Muy bien! ¡Estás recordando cada vez mejor!'
    estrellas = 2
  } else if (porcentaje >= 50) {
    mensaje = '¡Buen trabajo! ¡Sigue practicando!'
    estrellas = 1
  } else {
    mensaje = '¡No te rindas! Cada intento te hace más fuerte.'
    estrellas = 1
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center max-w-md mx-auto">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 shadow-xl w-full border border-purple-100">
        {/* Ícono de celebración */}
        <div className="mb-6">
          <PartyPopper className="h-20 w-20 text-purple-500 mx-auto mb-2" />

          {/* Estrellas */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`h-8 w-8 ${
                  n <= estrellas
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mensaje de felicitación */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          ¡Sesión completada!
        </h2>
        <p className="text-lg text-slate-600 mb-6">{mensaje}</p>

        {/* Puntaje total */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border border-purple-100">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <span className="text-4xl font-extrabold text-purple-700">
              {puntajeTotal}
            </span>
            <span className="text-lg text-slate-400">pts</span>
          </div>
          <p className="text-sm text-slate-500">
            de {puntajeMaximo} puntos posibles ({porcentaje}%)
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {rondasCompletadas} familiares recordados
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onVolverInicio}
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-bold text-lg shadow-lg"
          >
            <Home className="h-5 w-5" />
            Volver al Inicio
          </button>

          <button
            onClick={() => router.push('/familiares/gallery')}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 transition-all font-medium"
          >
            <Eye className="h-5 w-5" />
            Ver Galería
          </button>
        </div>
      </div>
    </div>
  )
}
