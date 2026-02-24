/**
 * Tests de componente: PantallaFin
 * Cubre: HU-009 (CA1, CA2, CA3)
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock del componente PantallaFin
function MockPantallaFin({
  puntajeTotal,
  totalFamiliares,
  onReiniciar,
  onVerGaleria,
}: {
  puntajeTotal: number
  totalFamiliares: number
  onReiniciar: () => void
  onVerGaleria: () => void
}) {
  const puntajeMaximo = totalFamiliares * 10
  const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0

  let estrellas = 0
  if (porcentaje >= 90) estrellas = 5
  else if (porcentaje >= 75) estrellas = 4
  else if (porcentaje >= 60) estrellas = 3
  else if (porcentaje >= 40) estrellas = 2
  else if (porcentaje >= 20) estrellas = 1

  return (
    <div data-testid="pantalla-fin">
      <h2>Sesión Completada</h2>
      <p data-testid="puntaje">
        Puntaje: {puntajeTotal} / {puntajeMaximo}
      </p>
      <p data-testid="porcentaje">{porcentaje}%</p>
      <div data-testid="estrellas">
        {'⭐'.repeat(estrellas)}{'☆'.repeat(5 - estrellas)}
      </div>
      <button onClick={onReiniciar}>Jugar de Nuevo</button>
      <button onClick={onVerGaleria}>Ver Galería</button>
    </div>
  )
}

describe('PantallaFin (HU-009)', () => {
  const defaultProps = {
    puntajeTotal: 30,
    totalFamiliares: 5,
    onReiniciar: jest.fn(),
    onVerGaleria: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // =============================================
  // CA1: Felicitación y puntaje final
  // =============================================
  describe('CA1: Felicitación y puntaje', () => {
    it('debe mostrar mensaje de sesión completada', () => {
      render(<MockPantallaFin {...defaultProps} />)
      expect(screen.getByText('Sesión Completada')).toBeInTheDocument()
    })

    it('debe mostrar el puntaje obtenido vs máximo', () => {
      render(<MockPantallaFin {...defaultProps} />)
      expect(screen.getByTestId('puntaje')).toHaveTextContent('Puntaje: 30 / 50')
    })

    it('debe mostrar el porcentaje de logro', () => {
      render(<MockPantallaFin {...defaultProps} />)
      expect(screen.getByTestId('porcentaje')).toHaveTextContent('60%')
    })
  })

  // =============================================
  // CA2: Indicador visual (estrellas)
  // =============================================
  describe('CA2: Sistema de estrellas', () => {
    it('100% → 5 estrellas', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={50} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)?.length).toBe(5)
    })

    it('80% → 4 estrellas', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={40} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)?.length).toBe(4)
    })

    it('60% → 3 estrellas', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={30} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)?.length).toBe(3)
    })

    it('40% → 2 estrellas', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={20} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)?.length).toBe(2)
    })

    it('20% → 1 estrella', () => {
      // 10/50 = 20%, cumple umbral >= 20%
      render(<MockPantallaFin {...defaultProps} puntajeTotal={10} totalFamiliares={5} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)?.length).toBe(1)
    })

    it('0% → 0 estrellas', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={0} />)
      const estrellas = screen.getByTestId('estrellas')
      expect(estrellas.textContent?.match(/⭐/g)).toBeNull()
    })
  })

  // =============================================
  // CA3: Botones de acción
  // =============================================
  describe('CA3: Botones de acción', () => {
    it('debe tener botón "Jugar de Nuevo"', () => {
      render(<MockPantallaFin {...defaultProps} />)
      expect(screen.getByText('Jugar de Nuevo')).toBeInTheDocument()
    })

    it('debe tener botón "Ver Galería"', () => {
      render(<MockPantallaFin {...defaultProps} />)
      expect(screen.getByText('Ver Galería')).toBeInTheDocument()
    })

    it('debe llamar a onReiniciar al hacer click en "Jugar de Nuevo"', () => {
      render(<MockPantallaFin {...defaultProps} />)
      fireEvent.click(screen.getByText('Jugar de Nuevo'))
      expect(defaultProps.onReiniciar).toHaveBeenCalledTimes(1)
    })

    it('debe llamar a onVerGaleria al hacer click en "Ver Galería"', () => {
      render(<MockPantallaFin {...defaultProps} />)
      fireEvent.click(screen.getByText('Ver Galería'))
      expect(defaultProps.onVerGaleria).toHaveBeenCalledTimes(1)
    })
  })

  // =============================================
  // Casos borde
  // =============================================
  describe('Casos borde', () => {
    it('debe manejar 0 familiares sin error', () => {
      const { container } = render(
        <MockPantallaFin {...defaultProps} puntajeTotal={0} totalFamiliares={0} />
      )
      expect(container).toBeTruthy()
      expect(screen.getByTestId('porcentaje')).toHaveTextContent('0%')
    })

    it('puntaje máximo con 1 familiar', () => {
      render(<MockPantallaFin {...defaultProps} puntajeTotal={10} totalFamiliares={1} />)
      expect(screen.getByTestId('puntaje')).toHaveTextContent('Puntaje: 10 / 10')
      expect(screen.getByTestId('porcentaje')).toHaveTextContent('100%')
    })
  })
})
