describe('Smoke Test - Minijuego de Gamificación', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    cy.clearLocalStorage();
    cy.visit('/authentication/login');
  });

  it('Debe permitir el login con cuenta demo y navegar al minijuego', () => {
    // 1. Proceso de Login con bypass
    cy.get('input[type="email"]').type('paciente@douremember.app');
    cy.get('input[type="password"]').type('password123'); // Mínimo 10 caracteres
    cy.get('button[type="submit"]').click();

    // 2. Verificar redirección al dashboard del paciente
    cy.url().should('include', '/users/patient');
    cy.contains('Juan Pérez (Demo)').should('be.visible');

    // 3. Navegar directamente al minijuego (URL conocida)
    cy.visit('/familiares/minijuego');

    // 4. Verificar que el tablero del juego cargue
    cy.contains('Mini-juego').should('be.visible');
    
    // El tablero inicial debería mostrar el botón "Iniciar"
    cy.contains('button', 'Iniciar').should('be.visible').click();

    // Después de iniciar, debería aparecer el campo de entrada
    cy.get('input[placeholder="Escribe el nombre..."]').should('be.visible');
  });

  it('Debe mostrar la galería de fotos desde el minijuego', () => {
    // Bypass login rápido seteando localStorage
    localStorage.setItem('authToken', 'test-token-paciente');
    localStorage.setItem('userId', '7165f511-c999-46a7-881c-755fc3e61510');
    localStorage.setItem('userRole', 'paciente');
    localStorage.setItem('userName', 'Juan Pérez (Demo)');

    cy.visit('/familiares/minijuego');
    
    // Hacer clic en "Ver Galería"
    cy.contains('Ver Galería').click();
    
    // Verificar navegación a la galería
    cy.url().should('include', '/familiares/gallery');
  });
});
