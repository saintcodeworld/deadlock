'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, AlertCircle } from 'lucide-react'

interface UsernamePopupProps {
  isOpen: boolean
  onComplete: (username: string) => void
}

export function UsernamePopup({ isOpen, onComplete }: UsernamePopupProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 2) {
      setError('At least 2 characters')
      return
    }
    if (trimmed.length > 20) {
      setError('Max 20 characters')
      return
    }
    // Only allow alphanumeric, underscores, dashes
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError('Letters, numbers, _ and - only')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      let clientId = localStorage.getItem('hide_chat_id')
      if (!clientId) {
        clientId = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('hide_chat_id', clientId)
      }

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, username: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save username')
        setIsSubmitting(false)
        return
      }

      localStorage.setItem('hide_username', trimmed)
      onComplete(trimmed)
    } catch (err) {
      setError('Connection error, try again')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-void/95 backdrop-blur-md"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(138,3,3,0.08)_0%,transparent_70%)] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full max-w-sm mx-4"
          >
            <div className="border border-void-border bg-void/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-blood-glow opacity-50" />

              {/* Header */}
              <div className="px-6 pt-8 pb-4 flex flex-col items-center gap-4">
                <div className="w-14 h-14 border border-blood/30 bg-blood-dark/20 flex items-center justify-center">
                  <User className="w-7 h-7 text-blood-glow" />
                </div>
                <div className="text-center">
                  <h2 className="text-white font-bold text-sm tracking-[0.25em] uppercase font-display">
                    CHOOSE YOUR NAME
                  </h2>
                  <p className="text-horror-muted text-[10px] font-mono mt-2 lowercase tracking-widest">
                    how shall the dead know you?
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter username..."
                    maxLength={20}
                    className="w-full bg-void border border-void-border text-white text-sm font-mono px-4 py-3 placeholder:text-horror-muted/50 focus:outline-none focus:border-blood/50 transition-colors tracking-wider text-center uppercase"
                  />
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-3 h-3 text-blood-glow" />
                      <span className="text-blood-glow text-[10px] font-mono tracking-wider uppercase">
                        {error}
                      </span>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || username.trim().length < 2}
                  className="w-full py-3 border border-blood/40 bg-blood-dark/20 text-white font-bold text-[11px] tracking-[0.25em] uppercase font-display hover:bg-blood-dark/40 hover:border-blood-glow hover:shadow-[0_0_15px_rgba(138,3,3,0.3)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      ENTERING...
                    </motion.span>
                  ) : (
                    'ENTER THE HOUSE'
                  )}
                </button>

                <p className="text-horror-muted/40 text-[8px] font-mono text-center tracking-widest uppercase">
                  2-20 characters &middot; letters, numbers, _ -
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
