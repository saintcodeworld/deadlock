'use client'

import React, { useEffect, useState } from 'react'
import { useGame } from '@/context/GameContext'
import { motion, AnimatePresence } from 'framer-motion'

export function DevBuyToast() {
  const { roundResult, gamePhase } = useGame()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (gamePhase === 'result' && roundResult) {
      if (roundResult.devBuyAmount > 0) {
        setMessage(`🚀 DEVBUY: ${roundResult.devBuyAmount} SOL | Correct bets: ${roundResult.correctFreeBets.length}`)
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
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-2xl font-mono font-bold text-sm"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
