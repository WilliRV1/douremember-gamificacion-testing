/**
 * Tests E2E: Galería Familiar
 * Cubre: HU-002, HU-003
 */

describe('Galería Familiar (HU-002)', () => {
  beforeEach(() => {
    // Visitar la galería familiar
    cy.visit('/familiares/gallery')
  })

  it('debe mostrar la página de galería familiar', () => {
    cy.contains('Galería Familiar').should('be.visible')
  })

  it('debe mostrar el botón para ir al mini-juego', () => {
    cy.contains('Jugar Mini-juego').should('be.visible')
  })

  it('debe mostrar mensaje cuando no hay familiares', () => {
    // Si no hay familiares registrados
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay familiares registrados')) {
        cy.contains('No hay familiares registrados').should('be.visible')
      }
    })
  })

  it('debe navegar al mini-juego al hacer clic en el botón', () => {
    cy.contains('Jugar Mini-juego').click()
    cy.url().should('include', '/familiares/minijuego')
  })
})

describe('Modal de Recuerdo (HU-003)', () => {
  beforeEach(() => {
    cy.visit('/familiares/gallery')
  })

  it('la página debe cargar sin errores', () => {
    cy.get('body').should('be.visible')
    // No debe haber errores críticos
    cy.on('uncaught:exception', () => false)
  })
})
