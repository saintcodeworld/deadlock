'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, CheckCircle, AlertCircle } from 'lucide-react'

interface FreeBetPopupProps {
  isOpen: boolean
  onClose: () => void
  preSelectedRoom?: number | null
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('deadlock_session_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('deadlock_session_id', id)
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative w-[420px] max-w-[90vw] bg-gray-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header — green theme for "free" */}
            <div className="bg-gradient-to-r from-emerald-900/80 to-green-900/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Free Prediction</h2>
                  <p className="text-emerald-300/70 text-xs">Guess right = 0.01 SOL dev buy</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* How it works — very clear for new users */}
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 mb-5">
                <p className="text-emerald-300 text-sm font-medium mb-1">🎯 How it works:</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Pick which room you think the killer will enter. <strong className="text-white">It&apos;s completely free</strong> — no SOL needed.
                  If you guess correctly, <strong className="text-emerald-300">0.01 SOL</strong> automatically buys the token on pump.fun!
                </p>
                <p className="text-gray-500 text-xs mt-2">⚡ One free prediction per round.</p>
              </div>

              {/* Already bet state */}
              {alreadyBet && (
                <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-500/20 rounded-lg p-3 mb-4">
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-300 text-sm">You already placed your free prediction this round!</span>
                </div>
              )}

              {/* Success state */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-3 mb-4"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 text-sm font-medium">Prediction placed! Good luck 🍀</span>
                </motion.div>
              )}

              {/* Bet confirm / Room selection */}
              {!alreadyBet && status !== 'success' && (
                <>
                  {preSelectedRoom ? (
                    <>
                      {/* Show pre-selected room info */}
                      {(() => {
                        const room = rooms.find(r => r.id === preSelectedRoom)
                        const freeCount = room ? getFreeBetCountForRoom(room.id) : 0
                        return room ? (
                          <div className="mb-5 p-4 rounded-xl border border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/50">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                                {room.id}
                              </span>
                              <div>
                                <p className="text-emerald-300 font-bold text-sm">{room.name}</p>
                                {freeCount > 0 && (
                                  <p className="text-gray-400 text-[10px] font-mono">{freeCount} prediction{freeCount > 1 ? 's' : ''} already</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null
                      })()}

                      {/* Confirm button */}
                      <button
                        onClick={handlePlaceBet}
                        disabled={gamePhase !== 'betting'}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          gamePhase === 'betting'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting'
                          ? 'Betting Phase Ended'
                          : `🎯 Confirm Free Prediction — Room #${preSelectedRoom}`}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Room selection grid (only when opened from sidebar without pre-selection) */}
                      <p className="text-gray-400 text-xs font-mono mb-3 uppercase tracking-wider">Select a room:</p>
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {bettableRooms.map(room => {
                          const freeCount = getFreeBetCountForRoom(room.id)
                          const isSelected = selectedRoom === room.id
                          return (
                            <button
                              key={room.id}
                              onClick={() => setSelectedRoom(room.id)}
                              className={`relative p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/50'
                                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
                                }`}>
                                  {room.id}
                                </span>
                                <span className={`text-sm font-medium ${isSelected ? 'text-emerald-300' : 'text-gray-300'}`}>
                                  {room.name}
                                </span>
                              </div>
                              {freeCount > 0 && (
                                <span className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono">
                                  {freeCount} pred
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Confirm button */}
                      <button
                        onClick={handlePlaceBet}
                        disabled={!selectedRoom || gamePhase !== 'betting'}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          selectedRoom && gamePhase === 'betting'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting'
                          ? 'Betting Phase Ended'
                          : !selectedRoom
                          ? 'Select a Room'
                          : '🎯 Place Free Prediction'}
                      </button>
                    </>
                  )}
                </>
              )}

              {status === 'already' && (
                <div className="flex items-center gap-2 bg-yellow-950/40 border border-yellow-500/20 rounded-lg p-3 mt-3">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-300 text-xs">Only 1 free prediction per round.</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
