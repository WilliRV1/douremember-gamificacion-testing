/**
 * Servicio de Familiares
 * Principio SOLID: Single Responsibility - Solo gestiona CRUD de familiares
 * Principio SOLID: Open/Closed - Nuevo servicio, no modifica servicios existentes
 */

import { createClient } from '@/utils/supabase/client'
import type {
  Familiar,
  CreateFamiliarDto,
  UpdateFamiliarDto,
} from '@/types/familiares.types'

class FamiliarService {
  private supabase = createClient()

  /**
   * Crear un nuevo familiar para un paciente
   */
  async crearFamiliar(data: CreateFamiliarDto): Promise<Familiar> {
    const { data: familiar, error } = await this.supabase
      .from('familiares')
      .insert({
        paciente_id: data.paciente_id,
        foto_url: data.foto_url,
        nombre: data.nombre || null,
        parentesco: data.parentesco,
        descripcion: data.descripcion || null,
        audio_url: data.audio_url || null,
        mostrar_nombre_en_card: data.mostrar_nombre_en_card ?? false,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear familiar:', error)
      throw new Error(error.message || 'Error al crear familiar')
    }

    console.log('✅ Familiar creado:', familiar)
    return familiar as Familiar
  }

  /**
   * Obtener todos los familiares activos de un paciente
   */
  async obtenerFamiliaresPorPaciente(pacienteId: string): Promise<Familiar[]> {
    const { data, error } = await this.supabase
      .from('familiares')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener familiares:', error)
      throw new Error(error.message || 'Error al obtener familiares')
    }

    return (data || []) as Familiar[]
  }

  /**
   * Obtener familiares con foto (para galería y minijuego)
   */
  async obtenerFamiliaresConFoto(pacienteId: string): Promise<Familiar[]> {
    const { data, error } = await this.supabase
      .from('familiares')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('activo', true)
      .not('foto_url', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener familiares con foto:', error)
      throw new Error(error.message || 'Error al obtener familiares')
    }

    return (data || []) as Familiar[]
  }

  /**
   * Obtener un familiar por ID
   */
  async obtenerFamiliarPorId(id: string): Promise<Familiar | null> {
    const { data, error } = await this.supabase
      .from('familiares')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error al obtener familiar:', error)
      return null
    }

    return data as Familiar
  }

  /**
   * Actualizar un familiar
   */
  async actualizarFamiliar(id: string, data: UpdateFamiliarDto): Promise<Familiar> {
    const { data: familiar, error } = await this.supabase
      .from('familiares')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error al actualizar familiar:', error)
      throw new Error(error.message || 'Error al actualizar familiar')
    }

    console.log('✅ Familiar actualizado:', familiar)
    return familiar as Familiar
  }

  /**
   * Desactivar familiar (eliminación lógica)
   */
  async desactivarFamiliar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('familiares')
      .update({
        activo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al desactivar familiar:', error)
      throw new Error(error.message || 'Error al desactivar familiar')
    }

    console.log('✅ Familiar desactivado:', id)
  }

  /**
   * Subir foto de familiar a Supabase Storage
   */
  async subirFotoFamiliar(file: File, pacienteId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${pacienteId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await this.supabase.storage
      .from('familiares-fotos')
      .upload(fileName, file)

    if (uploadError) {
      console.error('❌ Error al subir foto:', uploadError)
      throw new Error(uploadError.message || 'Error al subir foto')
    }

    const { data: urlData } = this.supabase.storage
      .from('familiares-fotos')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  /**
   * Subir audio de familiar a Supabase Storage
   */
  async subirAudioFamiliar(file: File, pacienteId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${pacienteId}/audio_${Date.now()}.${fileExt}`

    const { error: uploadError } = await this.supabase.storage
      .from('familiares-audios')
      .upload(fileName, file)

    if (uploadError) {
      console.error('❌ Error al subir audio:', uploadError)
      throw new Error(uploadError.message || 'Error al subir audio')
    }

    const { data: urlData } = this.supabase.storage
      .from('familiares-audios')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }
}

// Exportar instancia singleton
export const familiarService = new FamiliarService()
