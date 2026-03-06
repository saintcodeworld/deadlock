'use client'

import { useRef, useCallback, useEffect } from 'react'

// Crop settings for the knock sound (seconds)
// Only play the actual knocking portion of the audio file
const KNOCK_START = 0.15  // skip silence at the start
const KNOCK_DURATION = 1.8 // just the knocking hits

export function useKnockSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const isLoadedRef = useRef(false)

  // Load and decode the audio file once
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = ctx

        const response = await fetch('/knock.mp3')
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        audioBufferRef.current = audioBuffer
        isLoadedRef.current = true
      } catch (err) {
        console.error('Failed to load knock sound:', err)
      }
    }

    loadAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playKnock = useCallback(() => {
    const ctx = audioContextRef.current
    const buffer = audioBufferRef.current
    if (!ctx || !buffer || !isLoadedRef.current) return

    // Resume audio context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    // Add a slight gain to make it punchy
    const gainNode = ctx.createGain()
    gainNode.gain.value = 0.8

    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play only the cropped knock portion
    source.start(0, KNOCK_START, KNOCK_DURATION)
  }, [])

  return { playKnock }
}
