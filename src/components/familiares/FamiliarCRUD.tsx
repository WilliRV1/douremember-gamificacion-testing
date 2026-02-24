/**
 * FamiliarCRUD - Gestión de perfiles de familiares
 * HU-001: Crear, editar, visualizar y eliminar/desactivar familiares
 * Solo accesible para Cuidadores y Administradores
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Plus, Edit2, Trash2, Loader2, Save, X, Upload, Users, Eye, EyeOff
} from 'lucide-react'
import { familiarService } from '@/services/familiar.service'
import {
  PARENTESCOS,
  getParentescoIcon,
  getParentescoLabel,
} from '@/types/familiares.types'
import type { Familiar, CreateFamiliarDto, UpdateFamiliarDto } from '@/types/familiares.types'

interface FamiliarCRUDProps {
  pacienteId: string
  pacienteNombre?: string
}

export function FamiliarCRUD({ pacienteId, pacienteNombre }: FamiliarCRUDProps) {
  const [familiares, setFamiliares] = useState<Familiar[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    parentesco: '',
    descripcion: '',
    mostrar_nombre_en_card: false,
    foto_url: '',
    audio_url: '',
  })
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  // Cargar familiares
  useEffect(() => {
    cargarFamiliares()
  }, [pacienteId])

  async function cargarFamiliares() {
    try {
      setLoading(true)
      const data = await familiarService.obtenerFamiliaresPorPaciente(pacienteId)
      setFamiliares(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resetear formulario
  function resetForm() {
    setFormData({
      nombre: '',
      parentesco: '',
      descripcion: '',
      mostrar_nombre_en_card: false,
      foto_url: '',
      audio_url: '',
    })
    setFotoFile(null)
    setAudioFile(null)
    setFotoPreview(null)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  // Abrir formulario para editar
  function editarFamiliar(familiar: Familiar) {
    setFormData({
      nombre: familiar.nombre || '',
      parentesco: familiar.parentesco,
      descripcion: familiar.descripcion || '',
      mostrar_nombre_en_card: familiar.mostrar_nombre_en_card,
      foto_url: familiar.foto_url,
      audio_url: familiar.audio_url || '',
    })
    setFotoPreview(familiar.foto_url)
    setEditingId(familiar.id)
    setShowForm(true)
  }

  // Manejar selección de foto
  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFotoFile(file)
      setFotoPreview(URL.createObjectURL(file))
    }
  }

  // Manejar selección de audio
  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  // Guardar familiar (crear o actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.parentesco) {
      setError('El parentesco es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      let fotoUrl = formData.foto_url
      let audioUrl = formData.audio_url

      // Subir foto si hay nueva
      if (fotoFile) {
        fotoUrl = await familiarService.subirFotoFamiliar(fotoFile, pacienteId)
      }

      // Subir audio si hay nuevo
      if (audioFile) {
        audioUrl = await familiarService.subirAudioFamiliar(audioFile, pacienteId)
      }

      if (!fotoUrl && !editingId) {
        setError('La foto es obligatoria')
        setSaving(false)
        return
      }

      if (editingId) {
        // CA2: Actualizar
        await familiarService.actualizarFamiliar(editingId, {
          nombre: formData.nombre || undefined,
          parentesco: formData.parentesco,
          descripcion: formData.descripcion || undefined,
          mostrar_nombre_en_card: formData.mostrar_nombre_en_card,
          foto_url: fotoUrl || undefined,
          audio_url: audioUrl || undefined,
        })
      } else {
        // CA1: Crear
        await familiarService.crearFamiliar({
          paciente_id: pacienteId,
          foto_url: fotoUrl,
          nombre: formData.nombre || undefined,
          parentesco: formData.parentesco,
          descripcion: formData.descripcion || undefined,
          audio_url: audioUrl || undefined,
          mostrar_nombre_en_card: formData.mostrar_nombre_en_card,
        })
      }

      resetForm()
      await cargarFamiliares()
    } catch (err: any) {
      setError(err.message || 'Error al guardar familiar')
    } finally {
      setSaving(false)
    }
  }

  // CA3: Desactivar familiar
  async function handleDesactivar(id: string) {
    if (!window.confirm('¿Estás seguro de desactivar este familiar? No aparecerá en la galería ni en el mini-juego.')) return

    try {
      await familiarService.desactivarFamiliar(id)
      await cargarFamiliares()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Familiares</h2>
          {pacienteNombre && (
            <p className="text-slate-500">Paciente: {pacienteNombre}</p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Agregar Familiar
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingId ? 'Editar Familiar' : 'Nuevo Familiar'}
            </h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Foto (obligatoria) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Foto <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {fotoPreview && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200">
                  <Image src={fotoPreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500">Seleccionar foto</span>
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Parentesco (obligatorio) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Parentesco <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.parentesco}
              onChange={(e) => setFormData(prev => ({ ...prev, parentesco: e.target.value }))}
              className="w-full px-4 py-2.5 text-black border border-slate-300 rounded-xl focus:border-purple-400 outline-none"
              required
            >
              <option value="">Seleccionar parentesco...</option>
              {PARENTESCOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre (opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre (opcional)</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del familiar"
              className="w-full px-4 py-2.5 text-black placeholder:text-slate-500 border border-slate-300 rounded-xl focus:border-purple-400 outline-none"
            />
          </div>

          {/* Mostrar nombre en card */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mostrar_nombre"
              checked={formData.mostrar_nombre_en_card}
              onChange={(e) => setFormData(prev => ({ ...prev, mostrar_nombre_en_card: e.target.checked }))}
              className="h-5 w-5 accent-purple-600"
            />
            <label htmlFor="mostrar_nombre" className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              {formData.mostrar_nombre_en_card ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Mostrar nombre en la tarjeta de galería
            </label>
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción / Frase de apoyo (opcional)</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Una frase que ayude al paciente a recordar..."
              rows={3}
              className="w-full px-4 py-2.5 text-black placeholder:text-slate-500 border border-slate-300 rounded-xl focus:border-purple-400 outline-none resize-none"
            />
          </div>

          {/* Audio (opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Audio (opcional)</label>
            <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-500">
                {audioFile ? audioFile.name : 'Seleccionar archivo de audio'}
              </span>
              <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de familiares */}
      {familiares.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No hay familiares registrados</p>
          <p className="text-slate-400 text-sm">Haz clic en &ldquo;Agregar Familiar&rdquo; para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {familiares.map((familiar) => (
            <div
              key={familiar.id}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              {/* Foto */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={familiar.foto_url}
                  alt={familiar.nombre || 'Familiar'}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getParentescoIcon(familiar.parentesco)}</span>
                  <span className="font-semibold text-slate-800 truncate">
                    {familiar.nombre || getParentescoLabel(familiar.parentesco)}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {getParentescoLabel(familiar.parentesco)}
                  {familiar.descripcion && ' • Con descripción'}
                  {familiar.audio_url && ' • Con audio'}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => editarFamiliar(familiar)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDesactivar(familiar.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Desactivar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
