'use client'

import { useRef, useCallback, useEffect } from 'react'

export function useKillSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const isLoadedRef = useRef(false)

  // Load and decode the audio file once
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = ctx

        const response = await fetch('/kill.mp3')
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        audioBufferRef.current = audioBuffer
        isLoadedRef.current = true
      } catch (err) {
        console.error('Failed to load kill sound:', err)
      }
    }

    loadAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playKill = useCallback(() => {
    const ctx = audioContextRef.current
    const buffer = audioBufferRef.current
    if (!ctx || !buffer || !isLoadedRef.current) return

    // Resume audio context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gainNode = ctx.createGain()
    gainNode.gain.value = 0.9

    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(0)
  }, [])

  return { playKill }
}
