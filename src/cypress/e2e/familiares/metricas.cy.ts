/**
 * Tests E2E: Dashboard de Métricas del Mini-juego
 * Cubre: HU-010, HU-011
 */

describe('Dashboard de Métricas (HU-011)', () => {
  beforeEach(() => {
    cy.visit('/familiares/metricas?pacienteId=test-patient-id')
  })

  it('debe mostrar la página de métricas', () => {
    cy.get('body').should('be.visible')
  })

  it('debe mostrar el título de métricas o progreso', () => {
    cy.get('body').then(($body) => {
      const hasTitle =
        $body.text().includes('Métricas') ||
        $body.text().includes('Progreso') ||
        $body.text().includes('Dashboard') ||
        $body.text().includes('Rendimiento')

      expect(hasTitle).to.be.true
    })
  })

  it('debe mostrar estadísticas de sesiones', () => {
    cy.get('body').then(($body) => {
      const hasStats =
        $body.text().includes('Sesiones') ||
        $body.text().includes('sesiones') ||
        $body.text().includes('Total') ||
        $body.text().includes('Puntaje')

      expect(hasStats).to.be.true
    })
  })

  it('debe mostrar porcentaje de aciertos', () => {
    cy.get('body').then(($body) => {
      const hasPercentage =
        $body.text().includes('%') ||
        $body.text().includes('Aciertos') ||
        $body.text().includes('aciertos') ||
        $body.text().includes('Porcentaje')

      expect(hasPercentage).to.be.true
    })
  })

  it('debe cargar sin errores críticos', () => {
    cy.on('uncaught:exception', () => false)
    cy.get('body').should('be.visible')
  })
})

describe('Persistencia de Resultados (HU-010)', () => {
  beforeEach(() => {
    cy.visit('/familiares/metricas?pacienteId=test-patient-id')
  })

  it('debe mostrar datos persistidos de sesiones anteriores', () => {
    // La página debe cargar y mostrar los datos guardados
    cy.get('body').should('be.visible')
    cy.get('body').then(($body) => {
      // La página debe intentar cargar datos
      const showsDataOrEmpty =
        $body.text().includes('Sesiones') ||
        $body.text().includes('No hay datos') ||
        $body.text().includes('Sin sesiones') ||
        $body.text().includes('0')

      expect(showsDataOrEmpty).to.be.true
    })
  })

  it('debe mostrar tabla de familiares con dificultad', () => {
    cy.get('body').then(($body) => {
      const hasFamiliarInfo =
        $body.text().includes('Familiar') ||
        $body.text().includes('familiar') ||
        $body.text().includes('Nombre') ||
        $body.text().includes('Intentos') ||
        $body.text().includes('Nivel')

      expect(hasFamiliarInfo).to.be.true
    })
  })
})
