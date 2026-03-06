'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, Swords } from 'lucide-react'

interface BetTypeChooserProps {
  isOpen: boolean
  roomId: number | null
  onClose: () => void
  onChooseFreeBet: (roomId: number) => void
  onChooseGambling: (roomId: number) => void
}

export function BetTypeChooser({ isOpen, roomId, onClose, onChooseFreeBet, onChooseGambling }: BetTypeChooserProps) {
  const { rooms, hasPlacedFreeBet, getTotalGamblingBetsForRoom, getFreeBetCountForRoom } = useGame()

  if (!roomId) return null

  const room = rooms.find(r => r.id === roomId)
  if (!room) return null

  const gamblingTotal = getTotalGamblingBetsForRoom(roomId)
  const freeCount = getFreeBetCountForRoom(roomId)

  // Check if user already placed free bet (using session id from localStorage)
  let alreadyFreeBet = false
  if (typeof window !== 'undefined') {
    const sessionId = localStorage.getItem('deadlock_session_id') || ''
    alreadyFreeBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-[380px] max-w-[90vw] bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Room #{room.id} — {room.name}</h2>
                <p className="text-cyan-300/70 text-xs mt-0.5">Choose your bet type</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room stats */}
            <div className="px-6 pt-4 pb-2 flex gap-3">
              <div className="flex-1 bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50 text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase">Free Predictions</p>
                <p className="text-white font-bold text-sm font-mono">{freeCount}</p>
              </div>
              <div className="flex-1 bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50 text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase">SOL Wagered</p>
                <p className="text-amber-300 font-bold text-sm font-mono">{gamblingTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Bet type buttons */}
            <div className="p-6 pt-3 space-y-3">
              {/* Free Prediction */}
              <button
                onClick={() => { onClose(); onChooseFreeBet(roomId) }}
                disabled={alreadyFreeBet}
                className={`w-full rounded-xl p-4 text-left transition-all border ${
                  alreadyFreeBet
                    ? 'border-gray-700 bg-gray-800/30 opacity-60 cursor-default'
                    : 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-green-950/60 hover:from-emerald-900/60 hover:to-green-900/60 cursor-pointer hover:border-emerald-400/50 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alreadyFreeBet ? 'bg-gray-700' : 'bg-emerald-500/20'}`}>
                    <Gift className={`w-5 h-5 ${alreadyFreeBet ? 'text-gray-500' : 'text-emerald-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${alreadyFreeBet ? 'text-gray-500' : 'text-white'}`}>
                      {alreadyFreeBet ? '✓ Prediction Placed' : 'Free Prediction'}
                    </p>
                    <p className={`text-[11px] ${alreadyFreeBet ? 'text-gray-600' : 'text-emerald-300/70'}`}>
                      {alreadyFreeBet ? 'One per round' : 'Guess right → 0.01 SOL dev buy'}
                    </p>
                  </div>
                  {!alreadyFreeBet && (
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded">FREE</span>
                  )}
                </div>
              </button>

              {/* PvP Gambling */}
              <button
                onClick={() => { onClose(); onChooseGambling(roomId) }}
                className="w-full rounded-xl p-4 text-left transition-all border border-amber-500/30 bg-gradient-to-r from-amber-950/60 to-orange-950/60 hover:from-amber-900/60 hover:to-orange-900/60 cursor-pointer hover:border-amber-400/50 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20">
                    <Swords className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">PvP Gambling</p>
                    <p className="text-[11px] text-amber-300/70">Wager SOL against other players</p>
                  </div>
                  <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded">SOL</span>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
