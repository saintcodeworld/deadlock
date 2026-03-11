'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { sendGamblingBetTransaction } from '@/utils/devbuy'
import { X, Swords, Coins, TrendingUp, AlertCircle, Loader2, Skull } from 'lucide-react'

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
      setError('Enter a valid sacrifice amount')
      return
    }

    setIsSubmitting(true)
    try {
      const sig = await sendGamblingBetTransaction(amount, publicKey, signTransaction)
      if (sig) {
        await placeGamblingBet(roomId, amount, walletAddr)
        await updatePlayerPosition(walletAddr, roomId)
        setSuccessMsg(`Soul wagered: ${amount} SOL in Room #${roomId}`)
        setBetAmount('0.1')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError('Ritual failed. Check your wallet.')
      }
    } catch (err) {
      setError('Ritual rejected.')
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
          className="fixed inset-0 z-50 flex items-center justify-center font-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop - made solid dark instead of transparent */}
          <div className="absolute inset-0 bg-[#050505]" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative w-[480px] max-w-[90vw] max-h-[90vh] bg-[#0a0a0a] border border-[#222] shadow-[0_0_50px_rgba(138,3,3,0.15)] overflow-y-auto uppercase tracking-wider custom-scrollbar"
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
                <div className="w-10 h-10 border border-[#333] bg-[#0a0a0a] flex items-center justify-center text-white">
                  <Swords className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg tracking-[0.2em]">WAGER SOUL</h2>
                  <p className="text-gray-500 text-[10px] font-mono mt-1 tracking-widest lowercase">Bet SOL against others</p>
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
                <p className="text-white text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
                  <Swords className="w-3.5 h-3.5 text-red-500" /> THE RITUAL:
                </p>
                <p className="text-gray-400 text-[10px] font-mono leading-relaxed lowercase">
                  Wager <strong className="text-white">real SOL</strong> on a room. If the killer targets it,
                  you <strong className="text-white">win a share of the total blood pool</strong> based on your sacrifice.
                </p>
                <p className="text-gray-400 text-[10px] font-mono leading-relaxed lowercase mt-2">
                  If <strong className="text-red-500">no one survives</strong>, all SOL goes to the pump.fun dev buy.
                </p>
              </div>

              {/* Pot info bar */}
              <div className="flex items-center justify-between bg-[#111] border border-[#222] px-4 py-3 mb-6">
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 text-red-500" />
                  <span className="text-gray-500 text-[10px] font-mono tracking-widest">TOTAL BLOOD POOL</span>
                </div>
                <span className="text-white font-bold font-mono tracking-wider">{totalPot.toFixed(2)} SOL</span>
              </div>

              {/* My bets summary */}
              {myBets.length > 0 && (
                <div className="bg-[#0a0a0a] border border-[#222] px-4 py-3 mb-6">
                  <p className="text-gray-500 text-[9px] font-mono mb-2 tracking-widest">YOUR SACRIFICES ({myTotalBet.toFixed(2)} SOL TOTAL):</p>
                  <div className="flex flex-wrap gap-2">
                    {myBets.map((b, i) => {
                      const roomName = rooms.find(r => r.id === b.roomId)?.name || `Room ${b.roomId}`
                      return (
                        <span key={i} className="text-[10px] bg-[#111] text-white border border-[#333] px-2 py-1 font-mono">
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
                  {(() => {
                    const room = rooms.find(r => r.id === preSelectedRoom)
                    const roomBets = room ? getTotalGamblingBetsForRoom(room.id) : 0
                    const pctOfPot = totalPot > 0 ? ((roomBets / totalPot) * 100).toFixed(0) : '0'
                    return room ? (
                      <div className="mb-6 p-4 border border-[#333] bg-[#111] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
                        <div className="flex items-center gap-4 relative z-10">
                          <span className="w-10 h-10 border border-[#444] bg-[#0a0a0a] text-white flex items-center justify-center text-sm font-bold font-mono">
                            {room.id}
                          </span>
                          <div>
                            <p className="text-white font-bold text-sm tracking-wider">{room.name}</p>
                            <p className="text-gray-500 text-[10px] font-mono mt-1 lowercase flex items-center gap-2">
                              <span>{roomBets.toFixed(2)} SOL</span>
                              <span className="w-1 h-1 bg-[#444] rounded-full" />
                              <span>{pctOfPot}% of pot</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-[10px] font-mono mb-4 tracking-[0.2em]">Select your target:</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {bettableRooms.map(room => {
                      const roomBets = getTotalGamblingBetsForRoom(room.id)
                      const isSelected = selectedRoom === room.id
                      const pctOfPot = totalPot > 0 ? ((roomBets / totalPot) * 100).toFixed(0) : '0'
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
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold font-mono border ${
                              isSelected ? 'border-red-900 text-red-500 bg-[#0a0a0a]' : 'border-[#333] text-gray-500'
                            }`}>
                              {room.id}
                            </span>
                            <span className={`text-xs font-bold tracking-wider ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                              {room.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-500 font-mono">{roomBets.toFixed(2)} SOL</span>
                            <span className="text-[9px] text-gray-500 font-mono">{pctOfPot}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 h-[2px] bg-[#0a0a0a] border border-[#222] w-full">
                            <div
                              className="h-full bg-red-900/50 transition-all"
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
                  className="mb-6"
                >
                  <p className="text-gray-500 text-[10px] font-mono mb-3 tracking-[0.2em]">SACRIFICE AMOUNT (SOL):</p>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="0.01"
                      step="0.1"
                      className="flex-1 bg-[#111] border border-[#333] px-4 py-3
                                 text-white font-mono text-sm focus:border-red-900 focus:outline-none focus:ring-1 focus:ring-red-900/50 transition-all placeholder:text-gray-600"
                      placeholder="0.1"
                    />
                    <div className="w-16 flex items-center justify-center border border-[#333] bg-[#0a0a0a] text-gray-500 font-mono text-[10px] tracking-widest">
                      SOL
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['0.05', '0.1', '0.5', '1'].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`flex-1 py-2 border text-[10px] font-mono transition-all duration-300 ${
                          betAmount === amt
                            ? 'border-red-900 bg-[#111] text-red-500'
                            : 'border-[#222] bg-[#0a0a0a] text-gray-500 hover:border-[#444] hover:text-white'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {/* Potential winnings preview */}
                  {parseFloat(betAmount) > 0 && totalPot >= 0 && (
                    <div className="mt-4 bg-[#0a0a0a] border border-[#222] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-gray-500 text-[10px] font-mono tracking-widest">POTENTIAL SURVIVAL REWARD:</span>
                        </div>
                        <span className="text-white text-xs font-bold font-mono">
                          ~{(totalPot + parseFloat(betAmount || '0')).toFixed(2)} SOL
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Error / Success */}
              {error && (
                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-red-900 p-4 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-white text-[10px] font-mono tracking-widest uppercase">{error}</span>
                </div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-[#111] border border-green-900/50 p-4 mb-5"
                >
                  <Coins className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white text-[10px] font-mono tracking-widest uppercase">{successMsg}</span>
                </motion.div>
              )}

              {/* Place bet button */}
              <button
                onClick={handlePlaceBet}
                disabled={!publicKey || !(selectedRoom || preSelectedRoom) || gamePhase !== 'betting' || isSubmitting}
                className={`w-full py-4 font-bold text-xs tracking-[0.2em] transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-3 ${
                  publicKey && (selectedRoom || preSelectedRoom) && gamePhase === 'betting' && !isSubmitting
                    ? 'bg-[#111] text-red-500 border border-red-900 hover:bg-red-950/20 hover:shadow-[0_0_20px_rgba(138,3,3,0.2)]'
                    : 'bg-[#0a0a0a] border border-[#222] text-gray-600 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    PERFORMING RITUAL...
                  </>
                ) : !publicKey ? (
                  'CONNECT WALLET'
                ) : gamePhase !== 'betting' ? (
                  'TIME IS UP'
                ) : !(selectedRoom || preSelectedRoom) ? (
                  'SELECT A TARGET'
                ) : (
                  <>
                    <Swords className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    SACRIFICE {betAmount} SOL
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
