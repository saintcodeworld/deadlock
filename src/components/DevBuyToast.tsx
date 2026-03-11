'use client'

import React, { useEffect, useState } from 'react'
import { useGame } from '@/context/GameContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Skull } from 'lucide-react'

export function DevBuyToast() {
  const { roundResult, gamePhase } = useGame()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (gamePhase === 'result' && roundResult) {
      if (roundResult.devBuyAmount > 0) {
        setMessage(`BLOOD MONEY DEPOSITED: ${roundResult.devBuyAmount} SOL`)
        setShow(true)
        const timer = setTimeout(() => setShow(false), 6000)
        return () => clearTimeout(timer)
      }
    }
  }, [gamePhase, roundResult])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-28 left-1/2 -translate-x-1/2 z-[10000] bg-void border border-blood-glow px-6 py-4 shadow-[0_0_30px_rgba(204,0,0,0.6)] font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <Skull className="w-4 h-4 text-blood-glow animate-pulse relative z-10" />
          <span className="text-white relative z-10">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
