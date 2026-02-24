/**
 * Página: Mini-juego de Reconocimiento
 * Ruta: /familiares/minijuego
 * HU-004 a HU-009: Flujo completo del mini-juego
 * Acceso: Pacientes autenticados
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Gamepad2 } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { MiniJuegoBoard } from '@/components/familiares'
import { authService } from '@/services/auth.service'

export default function MinijuegoPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authService.getSession()
        if (!session) {
          router.push('/authentication/login')
          return
        }
        setUserId(session.userId)
      } catch {
        router.push('/authentication/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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

          <button
            onClick={() => router.push('/familiares/gallery')}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Ver Galería
          </button>
        </div>

        {/* Título */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-slate-800">Mini-juego</h1>
          </div>
          <p className="text-slate-500">
            ¿Puedes recordar los nombres de tus familiares?
          </p>
        </div>

        {/* Tablero del juego */}
        <MiniJuegoBoard pacienteId={userId} />
      </div>
    </div>
  )
}
