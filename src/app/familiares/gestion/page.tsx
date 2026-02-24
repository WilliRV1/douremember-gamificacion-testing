/**
 * Página: Gestión de Familiares (CRUD)
 * Ruta: /familiares/gestion
 * HU-001: CRUD de familiares
 * Acceso: Cuidadores y Administradores
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { FamiliarCRUD } from '@/components/familiares'
import { authService } from '@/services/auth.service'

export default function GestionFamiliaresPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // El pacienteId viene como query param: /familiares/gestion?pacienteId=xxx
  const pacienteId = searchParams.get('pacienteId')
  const pacienteNombre = searchParams.get('nombre') || undefined

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authService.getSession()
        if (!session) {
          router.push('/authentication/login')
          return
        }

        // Solo cuidadores y administradores
        const rol = session.rol
        if (rol !== 'cuidador' && rol !== 'administrador') {
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
              ? 'Se requiere un ID de paciente para gestionar familiares.'
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
        </div>

        {/* Título */}
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Familiares</h1>
        </div>

        {/* CRUD */}
        <FamiliarCRUD
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
        />
      </div>
    </div>
  )
}
