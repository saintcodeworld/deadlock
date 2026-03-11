'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, Swords, Skull } from 'lucide-react'

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
    const sessionId = localStorage.getItem('hide_session_id') || ''
    alreadyFreeBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center font-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop - solid dark */}
          <div className="absolute inset-0 bg-[#050505]" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-[400px] max-w-[90vw] bg-[#0a0a0a] border border-[#222] shadow-[0_0_50px_rgba(138,3,3,0.15)] overflow-hidden uppercase tracking-wider"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            {/* Glitch line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-red-900 opacity-50" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {/* Header */}
            <div className="bg-[#111] border-b border-[#222] px-6 py-5 flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-white font-bold text-lg tracking-[0.2em] flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-500" />
                  TARGET: {room.name}
                </h2>
                <p className="text-gray-500 text-[10px] font-mono mt-1 tracking-widest">Select your fate for Room #{room.id}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors hover:rotate-90 duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room stats */}
            <div className="px-6 py-4 flex gap-4 bg-[#0f0f0f] border-b border-[#222] relative z-10">
              <div className="flex-1 bg-[#0a0a0a] border border-[#333] px-4 py-3 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-[9px] font-mono tracking-widest mb-1">SURVIVORS</p>
                <p className="text-white font-bold text-sm font-mono">{freeCount}</p>
              </div>
              <div className="flex-1 bg-[#0a0a0a] border border-[#333] px-4 py-3 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-[9px] font-mono tracking-widest mb-1">BLOOD MONEY</p>
                <p className="text-red-500 font-bold text-sm font-mono">{gamblingTotal.toFixed(2)} SOL</p>
              </div>
            </div>

            {/* Bet type buttons */}
            <div className="p-6 space-y-4 relative z-10">
              {/* Free Prediction */}
              <button
                onClick={() => { onClose(); onChooseFreeBet(roomId) }}
                disabled={alreadyFreeBet}
                className={`w-full p-4 text-left transition-all duration-300 border relative overflow-hidden group ${
                  alreadyFreeBet
                    ? 'border-[#333] bg-[#0a0a0a] opacity-50 cursor-not-allowed'
                    : 'border-red-900 bg-[#111] hover:border-red-500 hover:bg-red-950/20 cursor-pointer hover:shadow-[0_0_15px_rgba(138,3,3,0.3)]'
                }`}
              >
                {!alreadyFreeBet && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 flex items-center justify-center border ${alreadyFreeBet ? 'border-[#333] bg-[#0a0a0a] text-gray-500' : 'border-red-900 bg-[#0a0a0a] text-red-500 group-hover:scale-110 transition-transform'}`}>
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-xs tracking-wider ${alreadyFreeBet ? 'text-gray-500' : 'text-white'}`}>
                      {alreadyFreeBet ? 'PREDICTION LOGGED' : 'FREE GUESS'}
                    </p>
                    <p className={`text-[9px] font-mono lowercase tracking-wide mt-1 ${alreadyFreeBet ? 'text-gray-600' : 'text-gray-400'}`}>
                      {alreadyFreeBet ? 'awaiting blood' : 'survive for 0.01 sol dev buy'}
                    </p>
                  </div>
                  {!alreadyFreeBet && (
                    <span className="text-red-500 text-[10px] font-bold border border-red-900/50 px-2 py-1 font-mono">FREE</span>
                  )}
                </div>
              </button>

              {/* PvP Gambling */}
              <button
                onClick={() => { onClose(); onChooseGambling(roomId) }}
                className="w-full p-4 text-left transition-all duration-300 border border-[#222] bg-[#0a0a0a] hover:border-[#444] hover:bg-[#111] cursor-pointer relative overflow-hidden group hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-white transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 border border-[#333] bg-[#111] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-white tracking-wider">WAGER SOUL</p>
                    <p className="text-[9px] text-gray-400 font-mono lowercase tracking-wide mt-1">Bet sol against others</p>
                  </div>
                  <span className="text-white text-[10px] font-bold border border-[#333] px-2 py-1 font-mono">SOL</span>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
