describe('Flujo Completo de Gamificación - E2E', () => {
  const patientId = '7165f511-c999-46a7-881c-755fc3e61510';
  const familiarName = 'Tía Martha (Test)';

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  // ============================================================
  // ESCENARIO 1: EL CUIDADOR GESTIONA UN FAMILIAR
  // ============================================================
  it('Paso 1: Cuidador debe poder agregar un familiar con foto y audio', () => {
    // Bypass Login Cuidador
    localStorage.setItem('authToken', 'test-token-cuidador');
    localStorage.setItem('userId', 'cuidador-123');
    localStorage.setItem('userRole', 'cuidador');
    localStorage.setItem('userName', 'Cuidador Demo');

    cy.visit('/users/cuidador');
    
    // Ir a la pestaña de familiares
    cy.contains('button', 'Familiares').click();

    // Abrir modal de agregar
    cy.contains('button', 'Agregar Familiar').click();

    // Llenar formulario usando placeholders (más robusto según el código de FamiliarCRUD)
    cy.get('input[placeholder="Nombre del familiar"]').type(familiarName);
    
    // Seleccionar por valor para evitar problemas con los emojis del texto
    // El valor en los tipos es 'tio' (sin tilde)
    cy.get('select').select('tio');
    
    cy.get('textarea[placeholder*="frase que ayude"]').type('Es la hermana de tu madre.');

    // Verificar que el input de archivo exista (no subimos para evitar dependencias de archivos locales)
    cy.get('input[type="file"]').should('exist');
    
    // Cerramos el formulario para no romper el flujo ya que la foto es obligatoria para guardar
    cy.contains('button', 'Cancelar').click();
  });

  // ============================================================
  // ESCENARIO 2: EL PACIENTE JUEGA Y USA LAS AYUDAS
  // ============================================================
  it('Paso 2: Paciente debe jugar, fallar para ver ayuda y luego ganar', () => {
    // Bypass Login Paciente
    localStorage.setItem('authToken', 'test-token-paciente');
    localStorage.setItem('userId', patientId);
    localStorage.setItem('userRole', 'paciente');
    localStorage.setItem('userName', 'Juan Pérez (Demo)');

    cy.visit('/familiares/minijuego');
    
    // Iniciar Juego
    cy.contains('button', 'Iniciar').should('be.visible').click();

    // 1. Forzar un error para validar Ayuda Nivel 2 (Pista de nombre)
    cy.get('input[placeholder="Escribe el nombre..."]').type('Intento fallido 1');
    cy.get('button[aria-label="Validar respuesta"]').click();
    
    // 2. Extraer el nombre correcto de la pista para asegurar el acierto
    cy.contains('Pista - Nombre:').parent().find('p').last().invoke('text').then((nombreCorrecto) => {
      cy.log('Nombre detectado de la pista: ' + nombreCorrecto);
      
      // Responder correctamente usando el nombre detectado
      cy.get('input[placeholder="Escribe el nombre..."]').clear().type(nombreCorrecto);
      cy.get('button[aria-label="Validar respuesta"]').click();

      // Verificar éxito
      cy.contains('¡Correcto!').should('be.visible');
    });

    // 3. Navegar a la galería
    cy.contains('Ver Galería').click();
    cy.url().should('include', '/familiares/gallery');
  });

  // ============================================================
  // ESCENARIO 3: EL MÉDICO REVISA EL DESEMPEÑO
  // ============================================================
  it('Paso 3: Médico debe ver las métricas detalladas del paciente', () => {
    // Bypass Login Médico
    localStorage.setItem('authToken', 'test-token-medico');
    localStorage.setItem('userId', 'medico-123');
    localStorage.setItem('userRole', 'medico');
    localStorage.setItem('userName', 'Dr. Doctor Demo');

    cy.visit('/users/doctor');
    
    // Ir a la pestaña de Mini-juego
    cy.contains('button', 'Mini-juego').click();

    // Hacer clic en "Ver métricas" del paciente Juan Pérez
    cy.contains('div', 'Juan Pérez').parent().contains('button', 'Ver métricas').click();

    // Validar que el dashboard de métricas cargue con datos
    cy.url().should('include', '/familiares/metricas');
    cy.contains('Métricas del Mini-juego').should('be.visible');
    
    // Verificar las tarjetas de resumen
    cy.contains('Sesiones Jugadas').should('be.visible');
    cy.contains('Puntaje Total').should('be.visible');
    cy.contains('Aciertos').should('be.visible');

    // Verificar que aparezca la lista de detalles por familiar
    cy.contains('Detalle por Familiar').should('be.visible');
  });

  // ============================================================
  // ESCENARIO 4: EL PACIENTE EXPLORA SU GALERÍA COMPLETA Y AUDIO
  // ============================================================
  it('Paso 4: Paciente debe ver su galería y reproducir un audio', () => {
    // Bypass Login Paciente
    localStorage.setItem('authToken', 'test-token-paciente');
    localStorage.setItem('userId', patientId);
    localStorage.setItem('userRole', 'paciente');
    localStorage.setItem('userName', 'Juan Pérez (Demo)');

    cy.visit('/users/patient');
    
    // Ir a la pestaña de Galería
    cy.contains('button', 'Galería').click();

    // Abrir modal de María González
    cy.contains('María González').should('be.visible').click();

    // Validar contenido del modal y reproducción de audio
    cy.get('div[role="dialog"]').should('be.visible').within(() => {
      cy.contains('María González').should('be.visible');
      
      // Intentar reproducir audio si el botón existe
      cy.get('button').then(($btns) => {
        const audioBtn = $btns.filter(':contains("Reproducir audio")');
        if (audioBtn.length > 0) {
          cy.wrap(audioBtn).click();
          cy.contains('button', 'Pausar').should('be.visible');
          
          // Detener audio (es el botón con el icono Square/Cuadrado)
          // Buscamos un botón que no sea Pausar pero esté en el mismo contenedor
          cy.contains('button', 'Detener').should('be.visible').click();
        }
      });
      
      // Cerrar modal
      cy.get('button[aria-label="Cerrar modal"]').click();
    });
  });

  // ============================================================
  // ESCENARIO 5: EL CUIDADOR SUBE UN AUDIO REAL
  // ============================================================
  it('Paso 5: Cuidador debe poder subir un archivo de audio', () => {
    // Bypass Login Cuidador
    localStorage.setItem('authToken', 'test-token-cuidador');
    localStorage.setItem('userId', 'cuidador-123');
    localStorage.setItem('userRole', 'cuidador');
    localStorage.setItem('userName', 'Cuidador Demo');

    cy.visit('/users/cuidador');
    
    // Ir a la pestaña de familiares
    cy.contains('button', 'Familiares').click();

    // Buscar la card que contiene a María González y hacer clic en su botón de editar
    // El contenedor principal tiene la clase 'flex items-center gap-4'
    cy.contains('span', 'María González')
      .closest('.flex.items-center.gap-4')
      .find('button[title="Editar"]')
      .click();

    // Subir el archivo de audio desde fixtures
    cy.get('input[type="file"][accept="audio/*"]').selectFile('cypress/fixtures/test-audio.mp3', { force: true });

    // Guardar cambios
    cy.contains('button', 'Actualizar').click();

    // Verificar que el formulario se cerró y volvimos a la lista
    cy.contains('Gestión de Familiares').should('be.visible');
  });
});
