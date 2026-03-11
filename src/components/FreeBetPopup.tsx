'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, CheckCircle, AlertCircle, Skull } from 'lucide-react'

interface FreeBetPopupProps {
  isOpen: boolean
  onClose: () => void
  preSelectedRoom?: number | null
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('hide_session_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('hide_session_id', id)
  }
  return id
}

export function FreeBetPopup({ isOpen, onClose, preSelectedRoom }: FreeBetPopupProps) {
  const {
    rooms,
    placeFreeBet,
    hasPlacedFreeBet,
    getFreeBetCountForRoom,
    gamePhase,
    updatePlayerPosition,
  } = useGame()

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'already'>('idle')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(getOrCreateSessionId())
  }, [])

  useEffect(() => {
    if (isOpen && preSelectedRoom) {
      setSelectedRoom(preSelectedRoom)
    }
  }, [isOpen, preSelectedRoom])

  const alreadyBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  const bettableRooms = rooms

  const handlePlaceBet = async () => {
    if (!sessionId || !selectedRoom) return
    if (alreadyBet) {
      setStatus('already')
      return
    }
    const success = await placeFreeBet(selectedRoom, sessionId)
    if (success) {
      await updatePlayerPosition(sessionId, selectedRoom)
      setStatus('success')
      setTimeout(() => onClose(), 1500)
    } else {
      setStatus('already')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    setSelectedRoom(null)
    onClose()
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
          {/* Backdrop - made solid dark instead of transparent */}
          <div className="absolute inset-0 bg-[#050505]" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative w-[440px] max-w-[90vw] bg-[#0a0a0a] border border-[#222] shadow-[0_0_50px_rgba(138,3,3,0.15)] overflow-hidden uppercase tracking-wider"
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
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-[#333] bg-[#0a0a0a] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg tracking-[0.2em]">FREE GUESS</h2>
                  <p className="text-gray-500 text-[10px] font-mono mt-1 tracking-widest lowercase">Survive for 0.01 SOL dev buy</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors hover:rotate-90 duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 relative z-10">
              {/* How it works */}
              <div className="bg-[#0a0a0a] border border-[#222] p-4 mb-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 w-1 h-full bg-[#333] group-hover:bg-red-900 transition-colors" />
                <p className="text-red-500 text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
                  <Skull className="w-3.5 h-3.5" /> THE RULES:
                </p>
                <p className="text-gray-400 text-[10px] font-mono leading-relaxed lowercase">
                  Select a room. It costs nothing.
                  If the killer targets your room and you survive, <strong className="text-white">0.01 SOL</strong> automatically buys the token.
                </p>
                <p className="text-white text-[9px] font-mono mt-3 uppercase tracking-widest border-t border-[#333] pt-2">
                  One prediction per round.
                </p>
              </div>

              {/* Already bet state */}
              {alreadyBet && (
                <div className="flex items-center gap-3 bg-[#111] border border-[#333] p-4 mb-5">
                  <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-white text-xs tracking-widest">FATE ALREADY SEALED THIS ROUND.</span>
                </div>
              )}

              {/* Success state */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-[#111] border border-red-900 p-4 mb-5 shadow-[0_0_15px_rgba(138,3,3,0.2)]"
                >
                  <Skull className="w-4 h-4 text-red-500 flex-shrink-0 animate-pulse" />
                  <span className="text-white text-xs font-bold tracking-widest">PREDICTION LOGGED. PRAY.</span>
                </motion.div>
              )}

              {/* Bet confirm / Room selection */}
              {!alreadyBet && status !== 'success' && (
                <>
                  {preSelectedRoom ? (
                    <>
                      {(() => {
                        const room = rooms.find(r => r.id === preSelectedRoom)
                        const freeCount = room ? getFreeBetCountForRoom(room.id) : 0
                        return room ? (
                          <div className="mb-6 p-4 border border-[#333] bg-[#111] relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
                            <div className="flex items-center gap-4 relative z-10">
                              <span className="w-10 h-10 border border-[#444] bg-[#0a0a0a] text-red-500 flex items-center justify-center text-sm font-bold font-mono">
                                {room.id}
                              </span>
                              <div>
                                <p className="text-white font-bold text-sm tracking-wider">{room.name}</p>
                                {freeCount > 0 && (
                                  <p className="text-gray-500 text-[10px] font-mono mt-1 lowercase flex items-center gap-1">
                                    <Skull className="w-2.5 h-2.5" /> {freeCount} souls hiding here
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null
                      })()}

                      <button
                        onClick={handlePlaceBet}
                        disabled={gamePhase !== 'betting'}
                        className={`w-full py-4 font-bold text-xs tracking-[0.2em] transition-all duration-300 relative overflow-hidden group ${
                          gamePhase === 'betting'
                            ? 'bg-[#111] text-red-500 border border-red-900 hover:bg-red-950/20 hover:shadow-[0_0_20px_rgba(138,3,3,0.2)]'
                            : 'bg-[#0a0a0a] border border-[#222] text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting'
                          ? 'TIME IS UP'
                          : `CONFIRM FATE — ROOM #${preSelectedRoom}`}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Select your hiding spot:</p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {bettableRooms.map(room => {
                          const freeCount = getFreeBetCountForRoom(room.id)
                          const isSelected = selectedRoom === room.id
                          return (
                            <button
                              key={room.id}
                              onClick={() => setSelectedRoom(room.id)}
                              className={`relative p-3 border text-left transition-all duration-300 group ${
                                isSelected
                                  ? 'border-red-900 bg-[#111] shadow-[inset_0_0_15px_rgba(138,3,3,0.1)]'
                                  : 'border-[#222] bg-[#0a0a0a] hover:border-[#444] hover:bg-[#111]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold font-mono border ${
                                  isSelected ? 'border-red-900 text-red-500 bg-[#0a0a0a]' : 'border-[#333] text-gray-500'
                                }`}>
                                  {room.id}
                                </span>
                                <span className={`text-xs font-bold tracking-wider ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                  {room.name}
                                </span>
                              </div>
                              {freeCount > 0 && (
                                <span className="absolute top-2 right-2 text-[9px] text-gray-500 font-mono flex items-center gap-1">
                                  {freeCount} <Skull className="w-2 h-2" />
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={handlePlaceBet}
                        disabled={!selectedRoom || gamePhase !== 'betting'}
                        className={`w-full py-4 font-bold text-xs tracking-[0.2em] transition-all duration-300 relative overflow-hidden group ${
                          selectedRoom && gamePhase === 'betting'
                            ? 'bg-[#111] text-red-500 border border-red-900 hover:bg-red-950/20 hover:shadow-[0_0_20px_rgba(138,3,3,0.2)]'
                            : 'bg-[#0a0a0a] border border-[#222] text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting'
                          ? 'TIME IS UP'
                          : !selectedRoom
                          ? 'CHOOSE A ROOM'
                          : 'CONFIRM FATE'}
                      </button>
                    </>
                  )}
                </>
              )}

              {status === 'already' && (
                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#333] p-4 mt-4">
                  <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-white text-[10px] font-mono tracking-widest">ONE GUESS PER NIGHTMARE.</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
