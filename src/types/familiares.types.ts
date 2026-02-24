/**
 * Tipos e interfaces para la feature de Galería Familiar y Mini-juego
 * Principio SOLID: Interface Segregation - interfaces específicas por dominio
 */

// =========================================
// FAMILIAR
// =========================================

export interface Familiar {
  id: string
  paciente_id: string
  foto_url: string
  nombre: string | null
  parentesco: string
  descripcion: string | null
  audio_url: string | null
  mostrar_nombre_en_card: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateFamiliarDto {
  paciente_id: string
  foto_url: string
  nombre?: string
  parentesco: string
  descripcion?: string
  audio_url?: string
  mostrar_nombre_en_card?: boolean
}

export interface UpdateFamiliarDto {
  nombre?: string
  parentesco?: string
  descripcion?: string
  audio_url?: string
  mostrar_nombre_en_card?: boolean
  foto_url?: string
}

// =========================================
// MINI-JUEGO: SESIÓN
// =========================================

export interface MiniJuegoSesion {
  id: string
  paciente_id: string
  fecha_inicio: string
  fecha_fin: string | null
  puntuaje_total: number
  created_at: string
}

export interface CreateSesionDto {
  paciente_id: string
}

// =========================================
// MINI-JUEGO: RONDA
// =========================================

export interface MiniJuegoRonda {
  id: string
  sesion_id: string
  familiar_id: string
  respuesta_usuario: string | null
  es_correcta: boolean | null
  intentos: number
  nivel_ayuda_final: number
  puntos_obtenidos: number
  created_at: string
}

export interface CreateRondaDto {
  sesion_id: string
  familiar_id: string
  respuesta_usuario: string
  es_correcta: boolean
  intentos: number
  nivel_ayuda_final: number
  puntos_obtenidos: number
}

// =========================================
// MINI-JUEGO: ESTADO DEL JUEGO (Frontend)
// =========================================

export type NivelAyuda = 1 | 2 | 3 | 4

export interface EstadoRonda {
  familiar: Familiar
  nivelAyuda: NivelAyuda
  intentos: number
  respondida: boolean
  respuestaCorrecta: boolean
}

export interface EstadoJuego {
  sesionId: string | null
  familiares: Familiar[]
  familiaresRestantes: Familiar[]
  rondaActual: EstadoRonda | null
  puntajeTotal: number
  rondasCompletadas: number
  juegoTerminado: boolean
  cargando: boolean
}

// =========================================
// PUNTUACIÓN POR NIVEL
// =========================================

export const PUNTOS_POR_NIVEL: Record<NivelAyuda, number> = {
  1: 10,
  2: 8,
  3: 6,
  4: 4,
}

// =========================================
// MÉTRICAS / DASHBOARD
// =========================================

export interface ResumenMinijuego {
  total_sesiones: number
  puntuaje_total: number
  porcentaje_aciertos: number
  familiares_dificultad: FamiliarDificultad[]
}

export interface FamiliarDificultad {
  familiar_id: string
  nombre: string | null
  intentos_promedio: number
  nivel_max_alcanzado: number
}

// =========================================
// PARENTESCOS DISPONIBLES
// =========================================

export const PARENTESCOS = [
  { value: 'madre', label: 'Madre', icon: '👩' },
  { value: 'padre', label: 'Padre', icon: '👨' },
  { value: 'hermano', label: 'Hermano/a', icon: '👫' },
  { value: 'hijo', label: 'Hijo/a', icon: '👶' },
  { value: 'abuelo', label: 'Abuelo/a', icon: '👴' },
  { value: 'tio', label: 'Tío/a', icon: '🧑' },
  { value: 'primo', label: 'Primo/a', icon: '🧑' },
  { value: 'esposo', label: 'Esposo/a', icon: '💑' },
  { value: 'nieto', label: 'Nieto/a', icon: '👶' },
  { value: 'amigo', label: 'Amigo/a', icon: '🤝' },
  { value: 'otro', label: 'Otro', icon: '👤' },
] as const

export type Parentesco = typeof PARENTESCOS[number]['value']

/**
 * Obtener ícono de parentesco
 */
export function getParentescoIcon(parentesco: string): string {
  const found = PARENTESCOS.find(p => p.value === parentesco)
  return found?.icon || '👤'
}

/**
 * Obtener label de parentesco
 */
export function getParentescoLabel(parentesco: string): string {
  const found = PARENTESCOS.find(p => p.value === parentesco)
  return found?.label || parentesco
}
