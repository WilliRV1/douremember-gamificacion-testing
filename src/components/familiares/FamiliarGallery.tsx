/**
 * FamiliarGallery - Grid de cards de familiares
 * HU-002: CA1 - Renderiza lista/grilla de cards
 */

'use client'

import { useState, useEffect } from 'react'
import { Loader2, Users, ImageOff } from 'lucide-react'
import { FamiliarCard } from './FamiliarCard'
import { RecuerdoModal } from './RecuerdoModal'
import { familiarService } from '@/services/familiar.service'
import type { Familiar } from '@/types/familiares.types'

interface FamiliarGalleryProps {
  pacienteId: string
}

export function FamiliarGallery({ pacienteId }: FamiliarGalleryProps) {
  const [familiares, setFamiliares] = useState<Familiar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFamiliar, setSelectedFamiliar] = useState<Familiar | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function cargarFamiliares() {
      try {
        setLoading(true)
        const data = await familiarService.obtenerFamiliaresConFoto(pacienteId)
        setFamiliares(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar familiares')
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      cargarFamiliares()
    }
  }, [pacienteId])

  const handleCardClick = (familiar: Familiar) => {
    setSelectedFamiliar(familiar)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFamiliar(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
        <p className="text-slate-500 text-lg">Cargando galería familiar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageOff className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-500 text-lg font-medium">Error al cargar galería</p>
        <p className="text-slate-400 mt-2">{error}</p>
      </div>
    )
  }

  if (familiares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="h-16 w-16 text-slate-300 mb-4" />
        <p className="text-slate-500 text-xl font-medium">No hay familiares registrados</p>
        <p className="text-slate-400 mt-2 max-w-md">
          Tu cuidador puede agregar familiares con fotos para que los puedas ver aquí.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Grid de cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {familiares.map((familiar) => (
          <FamiliarCard
            key={familiar.id}
            familiar={familiar}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* Modal de recuerdo */}
      {selectedFamiliar && (
        <RecuerdoModal
          familiar={selectedFamiliar}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
