/**
 * Hook: useMinijuego
 * Gestiona el estado completo del mini-juego de reconocimiento
 * Principio SOLID: Single Responsibility - Solo lógica de estado del juego
 */

'use client'

import { useState, useCallback } from 'react'
import { familiarService } from '@/services/familiar.service'
import { minijuegoService } from '@/services/minijuego.service'
import type {
  Familiar,
  EstadoJuego,
  EstadoRonda,
  NivelAyuda,
  PUNTOS_POR_NIVEL,
} from '@/types/familiares.types'

const PUNTOS: Record<NivelAyuda, number> = { 1: 10, 2: 8, 3: 6, 4: 4 }

/**
 * Normalizar texto para comparación
 * Elimina tildes, espacios extra, y convierte a minúsculas
 */
function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, ' ') // Normalizar espacios
}

export function useMinijuego(pacienteId: string) {
  const [estado, setEstado] = useState<EstadoJuego>({
    sesionId: null,
    familiares: [],
    familiaresRestantes: [],
    rondaActual: null,
    puntajeTotal: 0,
    rondasCompletadas: 0,
    juegoTerminado: false,
    cargando: false,
  })

  const [feedback, setFeedback] = useState<{
    tipo: 'correcto' | 'incorrecto' | null
    mensaje: string
  }>({ tipo: null, mensaje: '' })

  /**
   * Iniciar nuevo juego
   */
  const iniciarJuego = useCallback(async () => {
    setEstado(prev => ({ ...prev, cargando: true }))

    try {
      // Obtener familiares con foto
      const familiares = await familiarService.obtenerFamiliaresConFoto(pacienteId)

      if (familiares.length === 0) {
        throw new Error('No hay familiares registrados con foto para jugar')
      }

      // Crear sesión en BD
      const sesion = await minijuegoService.iniciarSesion(pacienteId)

      // Mezclar familiares aleatoriamente
      const familiaresShuffled = [...familiares].sort(() => Math.random() - 0.5)

      // Configurar primera ronda
      const primerFamiliar = familiaresShuffled[0]
      const restantes = familiaresShuffled.slice(1)

      setEstado({
        sesionId: sesion.id,
        familiares: familiaresShuffled,
        familiaresRestantes: restantes,
        rondaActual: {
          familiar: primerFamiliar,
          nivelAyuda: 1,
          intentos: 0,
          respondida: false,
          respuestaCorrecta: false,
        },
        puntajeTotal: 0,
        rondasCompletadas: 0,
        juegoTerminado: false,
        cargando: false,
      })

      setFeedback({ tipo: null, mensaje: '' })
    } catch (error: any) {
      console.error('❌ Error al iniciar juego:', error)
      setEstado(prev => ({ ...prev, cargando: false }))
      throw error
    }
  }, [pacienteId])

  /**
   * Validar respuesta del paciente
   */
  const validarRespuesta = useCallback(async (respuesta: string) => {
    if (!estado.rondaActual || !estado.sesionId) return

    const { familiar, nivelAyuda, intentos } = estado.rondaActual
    const nombreCorrecto = familiar.nombre || ''

    const esCorrecta =
      normalizarTexto(respuesta) === normalizarTexto(nombreCorrecto)

    const nuevosIntentos = intentos + 1

    if (esCorrecta) {
      // ✅ Respuesta correcta
      const puntos = PUNTOS[nivelAyuda]
      const nuevoPuntaje = estado.puntajeTotal + puntos

      setFeedback({
        tipo: 'correcto',
        mensaje: `¡Correcto! +${puntos} puntos`,
      })

      // Guardar ronda en BD
      await minijuegoService.guardarRonda({
        sesion_id: estado.sesionId,
        familiar_id: familiar.id,
        respuesta_usuario: respuesta,
        es_correcta: true,
        intentos: nuevosIntentos,
        nivel_ayuda_final: nivelAyuda,
        puntos_obtenidos: puntos,
      })

      // Verificar si hay más familiares
      if (estado.familiaresRestantes.length === 0) {
        // Juego terminado
        await minijuegoService.cerrarSesion(estado.sesionId, nuevoPuntaje)

        setEstado(prev => ({
          ...prev,
          puntajeTotal: nuevoPuntaje,
          rondasCompletadas: prev.rondasCompletadas + 1,
          rondaActual: null,
          juegoTerminado: true,
        }))
      } else {
        // Siguiente ronda
        const siguienteFamiliar = estado.familiaresRestantes[0]
        const nuevosRestantes = estado.familiaresRestantes.slice(1)

        // Delay para mostrar feedback antes de avanzar
        setTimeout(() => {
          setEstado(prev => ({
            ...prev,
            puntajeTotal: nuevoPuntaje,
            rondasCompletadas: prev.rondasCompletadas + 1,
            familiaresRestantes: nuevosRestantes,
            rondaActual: {
              familiar: siguienteFamiliar,
              nivelAyuda: 1,
              intentos: 0,
              respondida: false,
              respuestaCorrecta: false,
            },
          }))
          setFeedback({ tipo: null, mensaje: '' })
        }, 1500)
      }
    } else {
      // ❌ Respuesta incorrecta
      setFeedback({
        tipo: 'incorrecto',
        mensaje: 'Incorrecto, intenta de nuevo',
      })

      // Subir nivel de ayuda si hay siguiente
      const siguienteNivel = calcularSiguienteNivel(nivelAyuda, familiar)

      // Guardar intento fallido en BD
      await minijuegoService.guardarRonda({
        sesion_id: estado.sesionId,
        familiar_id: familiar.id,
        respuesta_usuario: respuesta,
        es_correcta: false,
        intentos: nuevosIntentos,
        nivel_ayuda_final: siguienteNivel,
        puntos_obtenidos: 0,
      })

      setEstado(prev => ({
        ...prev,
        rondaActual: prev.rondaActual
          ? {
              ...prev.rondaActual,
              nivelAyuda: siguienteNivel,
              intentos: nuevosIntentos,
            }
          : null,
      }))
    }
  }, [estado])

  /**
   * Reiniciar juego
   */
  const reiniciarJuego = useCallback(() => {
    setEstado({
      sesionId: null,
      familiares: [],
      familiaresRestantes: [],
      rondaActual: null,
      puntajeTotal: 0,
      rondasCompletadas: 0,
      juegoTerminado: false,
      cargando: false,
    })
    setFeedback({ tipo: null, mensaje: '' })
  }, [])

  return {
    estado,
    feedback,
    iniciarJuego,
    validarRespuesta,
    reiniciarJuego,
  }
}

/**
 * Calcular siguiente nivel de ayuda según datos disponibles del familiar
 */
function calcularSiguienteNivel(nivelActual: NivelAyuda, familiar: Familiar): NivelAyuda {
  if (nivelActual >= 4) return 4

  const siguienteNivel = (nivelActual + 1) as NivelAyuda

  // Si el siguiente nivel requiere algo que el familiar no tiene, saltar
  if (siguienteNivel === 3 && !familiar.descripcion) {
    if (familiar.audio_url) return 4
    return nivelActual // Mantener nivel actual
  }

  if (siguienteNivel === 4 && !familiar.audio_url) {
    return nivelActual // Mantener nivel actual
  }

  return siguienteNivel
}
