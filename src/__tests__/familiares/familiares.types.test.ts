/**
 * Tests unitarios: Tipos y utilidades de familiares
 * Cubre: RF-01, RF-05
 */

import {
  PUNTOS_POR_NIVEL,
  PARENTESCOS,
  getParentescoIcon,
  getParentescoLabel,
} from '@/types/familiares.types'
import type { NivelAyuda } from '@/types/familiares.types'

describe('familiares.types', () => {
  // =============================================
  // PUNTOS POR NIVEL (RF-06)
  // =============================================
  describe('PUNTOS_POR_NIVEL', () => {
    it('debe otorgar 10 puntos en nivel 1', () => {
      expect(PUNTOS_POR_NIVEL[1]).toBe(10)
    })

    it('debe otorgar 8 puntos en nivel 2', () => {
      expect(PUNTOS_POR_NIVEL[2]).toBe(8)
    })

    it('debe otorgar 6 puntos en nivel 3', () => {
      expect(PUNTOS_POR_NIVEL[3]).toBe(6)
    })

    it('debe otorgar 4 puntos en nivel 4', () => {
      expect(PUNTOS_POR_NIVEL[4]).toBe(4)
    })

    it('los puntos deben disminuir con cada nivel', () => {
      const niveles: NivelAyuda[] = [1, 2, 3, 4]
      for (let i = 0; i < niveles.length - 1; i++) {
        expect(PUNTOS_POR_NIVEL[niveles[i]]).toBeGreaterThan(PUNTOS_POR_NIVEL[niveles[i + 1]])
      }
    })
  })

  // =============================================
  // PARENTESCOS
  // =============================================
  describe('PARENTESCOS', () => {
    it('debe tener al menos 5 opciones de parentesco', () => {
      expect(PARENTESCOS.length).toBeGreaterThanOrEqual(5)
    })

    it('cada parentesco debe tener value, label e icon', () => {
      PARENTESCOS.forEach((p) => {
        expect(p).toHaveProperty('value')
        expect(p).toHaveProperty('label')
        expect(p).toHaveProperty('icon')
        expect(p.value).toBeTruthy()
        expect(p.label).toBeTruthy()
        expect(p.icon).toBeTruthy()
      })
    })

    it('debe incluir parentescos comunes: madre, padre, hermano, hijo, abuelo', () => {
      const values = PARENTESCOS.map(p => p.value)
      expect(values).toContain('madre')
      expect(values).toContain('padre')
      expect(values).toContain('hermano')
      expect(values).toContain('hijo')
      expect(values).toContain('abuelo')
    })
  })

  // =============================================
  // getParentescoIcon
  // =============================================
  describe('getParentescoIcon', () => {
    it('debe retornar ícono correcto para parentesco conocido', () => {
      const icon = getParentescoIcon('madre')
      expect(icon).toBe('👩')
    })

    it('debe retornar ícono por defecto para parentesco desconocido', () => {
      const icon = getParentescoIcon('desconocido')
      expect(icon).toBe('👤')
    })

    it('debe retornar ícono para cada parentesco definido', () => {
      PARENTESCOS.forEach((p) => {
        const icon = getParentescoIcon(p.value)
        expect(icon).toBe(p.icon)
      })
    })
  })

  // =============================================
  // getParentescoLabel
  // =============================================
  describe('getParentescoLabel', () => {
    it('debe retornar label correcto para parentesco conocido', () => {
      expect(getParentescoLabel('madre')).toBe('Madre')
      expect(getParentescoLabel('padre')).toBe('Padre')
    })

    it('debe retornar el valor original para parentesco desconocido', () => {
      expect(getParentescoLabel('desconocido')).toBe('desconocido')
    })
  })
})
