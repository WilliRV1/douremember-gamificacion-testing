/**
 * Página: Métricas del Mini-juego
 * Ruta: /familiares/metricas
 * HU-010 + HU-011: Persistencia y Dashboard de métricas
 * Acceso: Cuidadores, Médicos y Administradores
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { MetricasDashboard } from '@/components/familiares'
import { authService } from '@/services/auth.service'

export default function MetricasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const pacienteIdRaw = searchParams.get('pacienteId')
  // Protección: si el valor es literalmente "undefined" (string), tratar como null
  const pacienteId = pacienteIdRaw === 'undefined' ? null : pacienteIdRaw
  const pacienteNombre = searchParams.get('nombre') || undefined

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authService.getSession()
        if (!session) {
          router.push('/authentication/login')
          return
        }

        // Cuidadores, médicos, doctor y administradores pueden ver métricas
        const rol = session.rol
        if (rol !== 'cuidador' && rol !== 'medico' && rol !== 'doctor' && rol !== 'administrador') {
          router.push('/')
          return
        }

        setAuthorized(true)
      } catch {
        router.push('/authentication/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!authorized || !pacienteId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">
            {!pacienteId
              ? 'Se requiere un ID de paciente para ver métricas.'
              : 'No tienes permisos para acceder a esta sección.'}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Navegación */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        {/* Título */}
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800">Métricas del Mini-juego</h1>
        </div>

        {/* Dashboard */}
        <MetricasDashboard
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
        />
      </div>
    </div>
  )
}
