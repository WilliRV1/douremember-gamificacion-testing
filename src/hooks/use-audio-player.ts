/**
 * Hook: useAudioPlayer
 * Gestiona la reproducción de audio bajo demanda
 * RF-07: Audio nunca se reproduce automáticamente
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  isPaused: boolean
  duration: number
  currentTime: number
  error: string | null
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    duration: 0,
    currentTime: 0,
    error: null,
  })

  /**
   * Reproducir audio desde URL
   */
  const play = useCallback((audioUrl: string) => {
    try {
      // Detener audio anterior si existe
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onloadedmetadata = () => {
        setState(prev => ({ ...prev, duration: audio.duration }))
      }

      audio.ontimeupdate = () => {
        setState(prev => ({ ...prev, currentTime: audio.currentTime }))
      }

      audio.onended = () => {
        setState({
          isPlaying: false,
          isPaused: false,
          duration: 0,
          currentTime: 0,
          error: null,
        })
      }

      audio.onerror = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: 'Error al reproducir audio',
        }))
      }

      audio.play()
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        error: null,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar audio',
      }))
    }
  }, [])

  /**
   * Pausar audio
   */
  const pause = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause()
      setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
    }
  }, [state.isPlaying])

  /**
   * Reanudar audio
   */
  const resume = useCallback(() => {
    if (audioRef.current && state.isPaused) {
      audioRef.current.play()
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }))
    }
  }, [state.isPaused])

  /**
   * Detener audio
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setState({
      isPlaying: false,
      isPaused: false,
      duration: 0,
      currentTime: 0,
      error: null,
    })
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
  }
}
