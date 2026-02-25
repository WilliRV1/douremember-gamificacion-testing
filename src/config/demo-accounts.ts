/**
 * Configuración de cuentas para Modo de Demostración
 * Estas cuentas permiten probar la funcionalidad del minijuego sin dependencia del backend original.
 */

export const DEMO_USERS: Record<string, { id: string; nombre: string; rol: string }> = {
  'doctor@douremember.app': {
    id: '649e531b-2d27-4fe6-a1ca-bd38ff712d04',
    nombre: 'Carlos García (Demo)',
    rol: 'medico'
  },
  'paciente@douremember.app': {
    id: '7165f511-c999-46a7-881c-755fc3e61510',
    nombre: 'Juan Pérez (Demo)',
    rol: 'paciente'
  },
  'cuidador@douremember.app': {
    id: '892c4a2f-b555-4bdd-9fac-db16a4f1d3cc',
    nombre: 'María López (Demo)',
    rol: 'cuidador'
  }
};
