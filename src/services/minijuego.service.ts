/**
 * Servicio del Mini-juego
 * Principio SOLID: Single Responsibility - Solo gestiona lógica de sesiones y rondas
 * Principio SOLID: Open/Closed - Nuevo servicio, no modifica servicios existentes
 */

import { createClient } from '@/utils/supabase/client'
import type {
  MiniJuegoSesion,
  MiniJuegoRonda,
  CreateRondaDto,
  ResumenMinijuego,
  FamiliarDificultad,
} from '@/types/familiares.types'

class MinijuegoService {
  private supabase = createClient()

  // =========================================
  // SESIONES
  // =========================================

  /**
   * Iniciar una nueva sesión de mini-juego
   */
  async iniciarSesion(pacienteId: string): Promise<MiniJuegoSesion> {
    const { data, error } = await this.supabase
      .from('minijuego_sesiones')
      .insert({
        paciente_id: pacienteId,
        fecha_inicio: new Date().toISOString(),
        puntuaje_total: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error al iniciar sesión:', error)
      throw new Error(error.message || 'Error al iniciar sesión de mini-juego')
    }

    console.log('✅ Sesión de mini-juego iniciada:', data)
    return data as MiniJuegoSesion
  }

  /**
   * Cerrar una sesión de mini-juego
   */
  async cerrarSesion(sesionId: string, puntuajeTotal: number): Promise<MiniJuegoSesion> {
    const { data, error } = await this.supabase
      .from('minijuego_sesiones')
      .update({
        fecha_fin: new Date().toISOString(),
        puntuaje_total: puntuajeTotal,
      })
      .eq('id', sesionId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error al cerrar sesión:', error)
      throw new Error(error.message || 'Error al cerrar sesión')
    }

    console.log('✅ Sesión cerrada con puntaje:', puntuajeTotal)
    return data as MiniJuegoSesion
  }

  /**
   * Obtener sesiones de un paciente
   */
  async obtenerSesiones(pacienteId: string): Promise<MiniJuegoSesion[]> {
    const { data, error } = await this.supabase
      .from('minijuego_sesiones')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener sesiones:', error)
      throw new Error(error.message || 'Error al obtener sesiones')
    }

    return (data || []) as MiniJuegoSesion[]
  }

  // =========================================
  // RONDAS
  // =========================================

  /**
   * Guardar resultado de una ronda
   */
  async guardarRonda(data: CreateRondaDto): Promise<MiniJuegoRonda> {
    const { data: ronda, error } = await this.supabase
      .from('minijuego_rondas')
      .insert({
        sesion_id: data.sesion_id,
        familiar_id: data.familiar_id,
        respuesta_usuario: data.respuesta_usuario,
        es_correcta: data.es_correcta,
        intentos: data.intentos,
        nivel_ayuda_final: data.nivel_ayuda_final,
        puntos_obtenidos: data.puntos_obtenidos,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error al guardar ronda:', error)
      throw new Error(error.message || 'Error al guardar ronda')
    }

    return ronda as MiniJuegoRonda
  }

  /**
   * Obtener rondas de una sesión
   */
  async obtenerRondasDeSesion(sesionId: string): Promise<MiniJuegoRonda[]> {
    const { data, error } = await this.supabase
      .from('minijuego_rondas')
      .select('*')
      .eq('sesion_id', sesionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error al obtener rondas:', error)
      throw new Error(error.message || 'Error al obtener rondas')
    }

    return (data || []) as MiniJuegoRonda[]
  }

  // =========================================
  // MÉTRICAS Y RESUMEN
  // =========================================

  /**
   * Obtener resumen de métricas del mini-juego para un paciente
   */
  async obtenerResumen(pacienteId: string): Promise<ResumenMinijuego> {
    // Obtener todas las sesiones
    const sesiones = await this.obtenerSesiones(pacienteId)
    const sesionesCompletadas = sesiones.filter(s => s.fecha_fin !== null)

    // Obtener todas las rondas de todas las sesiones
    const todasLasRondas: MiniJuegoRonda[] = []
    for (const sesion of sesionesCompletadas) {
      const rondas = await this.obtenerRondasDeSesion(sesion.id)
      todasLasRondas.push(...rondas)
    }

    // Calcular métricas generales
    const totalSesiones = sesionesCompletadas.length
    const puntuajeTotal = sesionesCompletadas.reduce((acc, s) => acc + s.puntuaje_total, 0)

    const rondasCorrectas = todasLasRondas.filter(r => r.es_correcta === true).length
    const totalRondas = todasLasRondas.length
    const porcentajeAciertos = totalRondas > 0
      ? Math.round((rondasCorrectas / totalRondas) * 100)
      : 0

    // Calcular dificultad por familiar
    const familiaresMap = new Map<string, { intentos: number[]; nivelMax: number; nombre: string | null }>()

    for (const ronda of todasLasRondas) {
      const existing = familiaresMap.get(ronda.familiar_id) || {
        intentos: [],
        nivelMax: 1,
        nombre: null,
      }
      existing.intentos.push(ronda.intentos)
      existing.nivelMax = Math.max(existing.nivelMax, ronda.nivel_ayuda_final)
      familiaresMap.set(ronda.familiar_id, existing)
    }

    const familiaresDificultad: FamiliarDificultad[] = Array.from(familiaresMap.entries())
      .map(([familiarId, data]) => ({
        familiar_id: familiarId,
        nombre: data.nombre,
        intentos_promedio: Math.round(
          (data.intentos.reduce((a, b) => a + b, 0) / data.intentos.length) * 10
        ) / 10,
        nivel_max_alcanzado: data.nivelMax,
      }))
      .sort((a, b) => b.intentos_promedio - a.intentos_promedio)

    return {
      total_sesiones: totalSesiones,
      puntuaje_total: puntuajeTotal,
      porcentaje_aciertos: porcentajeAciertos,
      familiares_dificultad: familiaresDificultad,
    }
  }
}

// Exportar instancia singleton
export const minijuegoService = new MinijuegoService()
