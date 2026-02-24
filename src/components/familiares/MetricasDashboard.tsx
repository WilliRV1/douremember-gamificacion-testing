/**
 * MetricasDashboard - Panel de métricas del mini-juego
 * HU-011: Visualización de métricas y progreso del paciente
 */

'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trophy, Target, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react'
import { minijuegoService } from '@/services/minijuego.service'
import { familiarService } from '@/services/familiar.service'
import type { ResumenMinijuego, Familiar } from '@/types/familiares.types'

interface MetricasDashboardProps {
  pacienteId: string
  pacienteNombre?: string
}

export function MetricasDashboard({ pacienteId, pacienteNombre }: MetricasDashboardProps) {
  const [resumen, setResumen] = useState<ResumenMinijuego | null>(null)
  const [familiares, setFamiliares] = useState<Familiar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true)
        const [resumenData, familiaresData] = await Promise.all([
          minijuegoService.obtenerResumen(pacienteId),
          familiarService.obtenerFamiliaresPorPaciente(pacienteId),
        ])
        setResumen(resumenData)
        setFamiliares(familiaresData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) cargar()
  }, [pacienteId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        Error: {error}
      </div>
    )
  }

  if (!resumen || resumen.total_sesiones === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-lg">No hay datos de sesiones aún</p>
        <p className="text-slate-400 text-sm mt-1">
          El paciente debe completar al menos una sesión del mini-juego
        </p>
      </div>
    )
  }

  // Enriquecer familiares_dificultad con nombres
  const familiaresConNombre = resumen.familiares_dificultad.map((fd) => {
    const familiar = familiares.find(f => f.id === fd.familiar_id)
    return {
      ...fd,
      nombre: familiar?.nombre || fd.nombre || 'Sin nombre',
      parentesco: familiar?.parentesco || '',
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Métricas del Mini-juego</h2>
        {pacienteNombre && (
          <p className="text-slate-500">Paciente: {pacienteNombre}</p>
        )}
      </div>

      {/* CA1: Resumen de partidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total sesiones */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Sesiones Jugadas</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{resumen.total_sesiones}</p>
        </div>

        {/* Puntaje total */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Puntaje Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{resumen.puntuaje_total}</p>
        </div>

        {/* Porcentaje aciertos */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Aciertos</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{resumen.porcentaje_aciertos}%</p>
        </div>
      </div>

      {/* CA2: Detalle de familiares con dificultad */}
      {familiaresConNombre.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Detalle por Familiar
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Los familiares más difíciles de recordar aparecen primero
            </p>
          </div>

          <div className="divide-y divide-slate-50">
            {familiaresConNombre.map((fd) => (
              <div key={fd.familiar_id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-slate-800">{fd.nombre}</p>
                  {fd.parentesco && (
                    <p className="text-sm text-slate-400">{fd.parentesco}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-slate-500">Intentos prom.</p>
                    <p className={`font-bold ${fd.intentos_promedio > 2 ? 'text-red-500' : 'text-green-600'}`}>
                      {fd.intentos_promedio}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-slate-500">Nivel máx.</p>
                    <div className="flex items-center gap-1">
                      {fd.nivel_max_alcanzado >= 3 && (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <p className={`font-bold ${fd.nivel_max_alcanzado >= 3 ? 'text-amber-500' : 'text-slate-700'}`}>
                        {fd.nivel_max_alcanzado}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
