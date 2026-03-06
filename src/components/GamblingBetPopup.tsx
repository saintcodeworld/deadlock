'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { sendGamblingBetTransaction } from '@/utils/devbuy'
import { X, Swords, Coins, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'

interface GamblingBetPopupProps {
  isOpen: boolean
  onClose: () => void
  preSelectedRoom?: number | null
}

export function GamblingBetPopup({ isOpen, onClose, preSelectedRoom }: GamblingBetPopupProps) {
  const { publicKey, signTransaction } = useWallet()
  const {
    rooms,
    placeGamblingBet,
    getTotalGamblingBetsForRoom,
    getTotalPot,
    getMyGamblingBets,
    gamePhase,
    updatePlayerPosition,
  } = useGame()

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('0.1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  React.useEffect(() => {
    if (isOpen && preSelectedRoom) {
      setSelectedRoom(preSelectedRoom)
    }
  }, [isOpen, preSelectedRoom])

  const walletAddr = publicKey?.toBase58() || ''
  const bettableRooms = rooms
  const totalPot = getTotalPot()
  const myBets = walletAddr ? getMyGamblingBets(walletAddr) : []
  const myTotalBet = myBets.reduce((s, b) => s + b.amount, 0)

  const handlePlaceBet = async () => {
    setError('')
    setSuccessMsg('')

    const roomId = selectedRoom || preSelectedRoom
    if (!publicKey || !signTransaction || !roomId) return
    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount')
      return
    }

    setIsSubmitting(true)
    try {
      const sig = await sendGamblingBetTransaction(amount, publicKey, signTransaction)
      if (sig) {
        await placeGamblingBet(roomId, amount, walletAddr)
        await updatePlayerPosition(walletAddr, roomId)
        setSuccessMsg(`Bet placed! ${amount} SOL on Room #${roomId}`)
        setBetAmount('0.1')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError('Transaction failed. Check wallet and try again.')
      }
    } catch (err) {
      setError('Transaction rejected or failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccessMsg('')
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
            className="relative w-[460px] max-w-[90vw] max-h-[90vh] bg-gray-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header — gold/amber theme for gambling */}
            <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">PvP Gambling</h2>
                  <p className="text-amber-300/70 text-xs">Bet SOL against other players</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* How it works */}
              <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 mb-5">
                <p className="text-amber-300 text-sm font-medium mb-1">⚔️ How it works:</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Wager <strong className="text-white">real SOL</strong> on a room. If the killer enters your room,
                  you <strong className="text-emerald-300">win a share of the entire pot</strong> — proportional to your bet size.
                </p>
                <p className="text-gray-400 text-xs mt-1.5">
                  If <strong className="text-red-300">nobody guesses right</strong>, all SOL goes to an automatic dev buy on pump.fun.
                </p>
                <p className="text-gray-500 text-xs mt-2">💰 You can bet on multiple rooms.</p>
              </div>

              {/* Pot info bar */}
              <div className="flex items-center justify-between bg-gray-800/80 rounded-lg px-4 py-2.5 mb-5 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-400 text-xs font-mono">TOTAL POT</span>
                </div>
                <span className="text-amber-300 font-bold font-mono">{totalPot.toFixed(2)} SOL</span>
              </div>

              {/* My bets summary */}
              {myBets.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg px-4 py-2.5 mb-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs font-mono mb-1.5">YOUR BETS ({myTotalBet.toFixed(2)} SOL total):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {myBets.map((b, i) => {
                      const roomName = rooms.find(r => r.id === b.roomId)?.name || `Room ${b.roomId}`
                      return (
                        <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded px-2 py-0.5 font-mono">
                          {roomName}: {b.amount} SOL
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Room selection */}
              {preSelectedRoom ? (
                <>
                  {/* Show pre-selected room info */}
                  {(() => {
                    const room = rooms.find(r => r.id === preSelectedRoom)
                    const roomBets = room ? getTotalGamblingBetsForRoom(room.id) : 0
                    const pctOfPot = totalPot > 0 ? ((roomBets / totalPot) * 100).toFixed(0) : '0'
                    return room ? (
                      <div className="mb-5 p-4 rounded-xl border border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                              {room.id}
                            </span>
                            <div>
                              <p className="text-amber-300 font-bold text-sm">{room.name}</p>
                              <p className="text-gray-400 text-[10px] font-mono">{roomBets.toFixed(2)} SOL wagered · {pctOfPot}% of pot</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-xs font-mono mb-3 uppercase tracking-wider">Select a room to bet on:</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {bettableRooms.map(room => {
                      const roomBets = getTotalGamblingBetsForRoom(room.id)
                      const isSelected = selectedRoom === room.id
                      const pctOfPot = totalPot > 0 ? ((roomBets / totalPot) * 100).toFixed(0) : '0'
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className={`relative p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/50'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300'
                            }`}>
                              {room.id}
                            </span>
                            <span className={`text-sm font-medium ${isSelected ? 'text-amber-300' : 'text-gray-300'}`}>
                              {room.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-500 font-mono">{roomBets.toFixed(2)} SOL</span>
                            <span className="text-[10px] text-gray-500 font-mono">{pctOfPot}% of pot</span>
                          </div>
                          {/* Thin progress bar */}
                          <div className="mt-1.5 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500/60 rounded-full transition-all"
                              style={{ width: `${totalPot > 0 ? (roomBets / totalPot) * 100 : 0}%` }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Amount input */}
              {(selectedRoom || preSelectedRoom) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5"
                >
                  <p className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">Bet amount (SOL):</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="0.01"
                      step="0.1"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5
                                 text-white font-mono text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                      placeholder="0.1"
                    />
                    <span className="flex items-center text-gray-500 font-mono text-sm px-2">SOL</span>
                  </div>
                  <div className="flex gap-2">
                    {['0.05', '0.1', '0.5', '1'].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          betAmount === amt
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {/* Potential winnings preview */}
                  {parseFloat(betAmount) > 0 && totalPot >= 0 && (
                    <div className="mt-3 bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-gray-400 text-xs">If you win:</span>
                        <span className="text-emerald-300 text-xs font-bold font-mono">
                          ~{(totalPot + parseFloat(betAmount || '0')).toFixed(2)} SOL pot
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Error / Success */}
              {error && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-xs">{error}</span>
                </div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-3 mb-4"
                >
                  <Coins className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 text-xs font-medium">{successMsg}</span>
                </motion.div>
              )}

              {/* Place bet button */}
              <button
                onClick={handlePlaceBet}
                disabled={!publicKey || !(selectedRoom || preSelectedRoom) || gamePhase !== 'betting' || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  publicKey && (selectedRoom || preSelectedRoom) && gamePhase === 'betting' && !isSubmitting
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : !publicKey ? (
                  'Connect Wallet First'
                ) : gamePhase !== 'betting' ? (
                  'Betting Phase Ended'
                ) : !(selectedRoom || preSelectedRoom) ? (
                  'Select a Room'
                ) : (
                  `⚔️ Bet ${betAmount} SOL on Room #${selectedRoom || preSelectedRoom}`
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
