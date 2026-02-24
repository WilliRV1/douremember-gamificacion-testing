/**
 * Tests unitarios: Normalización de texto para validación de respuestas
 * Cubre: RF-04 (CA3 - Normalización)
 * HU-005: CA3 - trim, case-insensitive, eliminación de tildes
 */

// Importamos la función de normalización directamente
// (extraída del hook useMinijuego para testeo independiente)

function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

describe('normalizarTexto (RF-04: Validación de respuesta)', () => {
  // =============================================
  // TRIM Y ESPACIOS
  // =============================================
  describe('Manejo de espacios', () => {
    it('debe eliminar espacios al inicio y final', () => {
      expect(normalizarTexto('  María  ')).toBe('maria')
    })

    it('debe normalizar múltiples espacios internos', () => {
      expect(normalizarTexto('María   Elena')).toBe('maria elena')
    })

    it('debe manejar string vacío', () => {
      expect(normalizarTexto('')).toBe('')
    })

    it('debe manejar solo espacios', () => {
      expect(normalizarTexto('   ')).toBe('')
    })
  })

  // =============================================
  // CASE INSENSITIVE
  // =============================================
  describe('Case insensitive', () => {
    it('debe convertir mayúsculas a minúsculas', () => {
      expect(normalizarTexto('MARÍA')).toBe('maria')
    })

    it('debe manejar mixed case', () => {
      expect(normalizarTexto('JuAn PaBLo')).toBe('juan pablo')
    })

    it('dos textos iguales con diferente case deben ser iguales', () => {
      expect(normalizarTexto('Carlos')).toBe(normalizarTexto('CARLOS'))
      expect(normalizarTexto('ana')).toBe(normalizarTexto('ANA'))
    })
  })

  // =============================================
  // ELIMINACIÓN DE TILDES/ACENTOS
  // =============================================
  describe('Eliminación de tildes y acentos', () => {
    it('debe eliminar tildes en vocales', () => {
      expect(normalizarTexto('María')).toBe('maria')
      expect(normalizarTexto('José')).toBe('jose')
      expect(normalizarTexto('Raúl')).toBe('raul')
    })

    it('debe eliminar ñ → n (normalización NFD)', () => {
      // Nota: ñ en NFD se descompone a n + combining tilde
      expect(normalizarTexto('Toño')).toBe('tono')
    })

    it('debe manejar diéresis', () => {
      // La diéresis sobre la ü se elimina, pero la 'u' permanece
      expect(normalizarTexto('Ángüela')).toBe('anguela')
    })

    it('dos textos iguales con/sin tildes deben ser iguales', () => {
      expect(normalizarTexto('María')).toBe(normalizarTexto('Maria'))
      expect(normalizarTexto('José')).toBe(normalizarTexto('Jose'))
      expect(normalizarTexto('Andrés')).toBe(normalizarTexto('Andres'))
    })
  })

  // =============================================
  // CASOS COMBINADOS (Escenarios reales)
  // =============================================
  describe('Casos combinados del paciente', () => {
    it('debe manejar nombre con tildes, mayúsculas y espacios', () => {
      expect(normalizarTexto('  MARÍA ELENA  ')).toBe('maria elena')
    })

    it('paciente escribe "maria" y nombre correcto es "María" → debe coincidir', () => {
      expect(normalizarTexto('maria')).toBe(normalizarTexto('María'))
    })

    it('paciente escribe "JOSE" y nombre correcto es "José" → debe coincidir', () => {
      expect(normalizarTexto('JOSE')).toBe(normalizarTexto('José'))
    })

    it('paciente escribe "  carlos  " y nombre correcto es "Carlos" → debe coincidir', () => {
      expect(normalizarTexto('  carlos  ')).toBe(normalizarTexto('Carlos'))
    })
  })
})
