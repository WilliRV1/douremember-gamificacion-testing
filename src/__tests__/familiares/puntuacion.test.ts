/**
 * Tests unitarios: Sistema de puntuación
 * Cubre: RF-06, HU-008
 */

import { PUNTOS_POR_NIVEL } from '@/types/familiares.types'
import type { NivelAyuda } from '@/types/familiares.types'

describe('Sistema de Puntuación (RF-06, HU-008)', () => {
  // =============================================
  // CA1: Suma de puntos por acierto según nivel
  // =============================================
  describe('CA1: Puntos por acierto según nivel', () => {
    it('Nivel 1 (solo foto) otorga 10 puntos', () => {
      expect(PUNTOS_POR_NIVEL[1]).toBe(10)
    })

    it('Nivel 2 (foto + nombre) otorga 8 puntos', () => {
      expect(PUNTOS_POR_NIVEL[2]).toBe(8)
    })

    it('Nivel 3 (foto + nombre + descripción) otorga 6 puntos', () => {
      expect(PUNTOS_POR_NIVEL[3]).toBe(6)
    })

    it('Nivel 4 (foto + nombre + descripción + audio) otorga 4 puntos', () => {
      expect(PUNTOS_POR_NIVEL[4]).toBe(4)
    })
  })

  // =============================================
  // Cálculos de puntaje
  // =============================================
  describe('Cálculos de puntaje acumulado', () => {
    it('3 familiares acertados en nivel 1 = 30 puntos', () => {
      const puntos = 3 * PUNTOS_POR_NIVEL[1]
      expect(puntos).toBe(30)
    })

    it('2 en nivel 1 + 1 en nivel 3 = 26 puntos', () => {
      const puntos = 2 * PUNTOS_POR_NIVEL[1] + 1 * PUNTOS_POR_NIVEL[3]
      expect(puntos).toBe(26)
    })

    it('puntaje máximo con 5 familiares = 50 puntos', () => {
      const maxPuntos = 5 * PUNTOS_POR_NIVEL[1]
      expect(maxPuntos).toBe(50)
    })

    it('puntaje mínimo con 5 familiares (todos nivel 4) = 20 puntos', () => {
      const minPuntos = 5 * PUNTOS_POR_NIVEL[4]
      expect(minPuntos).toBe(20)
    })
  })

  // =============================================
  // Porcentaje de logro
  // =============================================
  describe('Porcentaje de logro', () => {
    it('30 de 50 posibles = 60%', () => {
      const porcentaje = Math.round((30 / 50) * 100)
      expect(porcentaje).toBe(60)
    })

    it('50 de 50 posibles = 100%', () => {
      const porcentaje = Math.round((50 / 50) * 100)
      expect(porcentaje).toBe(100)
    })

    it('0 de 50 posibles = 0%', () => {
      const porcentaje = Math.round((0 / 50) * 100)
      expect(porcentaje).toBe(0)
    })
  })
})
