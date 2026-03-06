'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { Skull, Clock, Coins, Play, Gift, Swords, TrendingUp, Trophy, Flame } from 'lucide-react'

interface BettingSidebarProps {
  onOpenFreeBet: () => void
  onOpenGambling: () => void
}

export function BettingSidebar({ onOpenFreeBet, onOpenGambling }: BettingSidebarProps) {
  const { publicKey } = useWallet()
  const {
    rooms,
    roundTimeRemaining,
    currentRound,
    gamePhase,
    killerKnockingRoom,
    killerKillRoom,
    getTotalGamblingBetsForRoom,
    getFreeBetCountForRoom,
    getTotalPot,
    hasPlacedFreeBet,
    roundResult,
  } = useGame()

  const [sessionId, setSessionId] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('deadlock_session_id')
      if (!id) {
        id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('deadlock_session_id', id)
      }
      setSessionId(id)
    }
  }, [])

  const alreadyFreeBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  const totalPot = getTotalPot()
  const bettableRooms = rooms

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const knockedRoomName = killerKnockingRoom
    ? rooms.find(r => r.id === killerKnockingRoom)?.name || ''
    : ''
  const killRoomName = killerKillRoom
    ? rooms.find(r => r.id === killerKillRoom)?.name || ''
    : ''

  return (
    <div className="w-80 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl flex flex-col gap-0 max-h-full overflow-y-auto shadow-2xl">

      {/* ── Header ── */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-500" />
          <h2 className="text-white font-bold text-sm tracking-wide">DEADLOCK</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">Round</span>
          <span className="text-xs font-mono text-white bg-gray-800 px-2 py-0.5 rounded">#{currentRound}</span>
        </div>
      </div>

      {/* ── Phase Status ── */}
      <div className="px-5 py-3 border-b border-gray-800/50">
        {gamePhase === 'betting' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-400 font-bold text-sm font-mono">BETTING OPEN</span>
              <span className={`font-mono font-bold text-lg ${
                roundTimeRemaining < 15 ? 'text-red-500 animate-pulse' : 'text-white'
              }`}>
                {formatTime(roundTimeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">Killer is patrolling the hallway...</span>
            </div>
          </div>
        )}
        {gamePhase === 'knocking' && (
          <div>
            <span className="text-orange-400 font-bold text-sm font-mono">KILLER KNOCKING</span>
            {knockedRoomName && (
              <motion.p
                className="text-xs text-orange-300 mt-1 font-mono"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🚪 {knockedRoomName}
              </motion.p>
            )}
          </div>
        )}
        {gamePhase === 'killing' && (
          <div>
            <span className="text-red-500 font-bold text-sm font-mono">KILLER STRIKES!</span>
            {killRoomName && (
              <motion.p
                className="text-xs text-red-400 mt-1 font-mono"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                🔪 {killRoomName}
              </motion.p>
            )}
          </div>
        )}
        {gamePhase === 'result' && (
          <span className="text-gray-400 font-bold text-sm font-mono">ROUND OVER</span>
        )}
      </div>

      {/* ── Two Betting Buttons (only during betting) ── */}
      {gamePhase === 'betting' && (
        <div className="px-5 py-4 space-y-3 border-b border-gray-800/50">
          {/* Free Prediction — GREEN */}
          <button
            onClick={onOpenFreeBet}
            disabled={alreadyFreeBet}
            className={`w-full rounded-xl p-3.5 text-left transition-all border ${
              alreadyFreeBet
                ? 'border-gray-700 bg-gray-800/30 opacity-60 cursor-default'
                : 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-green-950/60 hover:from-emerald-900/60 hover:to-green-900/60 cursor-pointer hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alreadyFreeBet ? 'bg-gray-700' : 'bg-emerald-500/20'}`}>
                <Gift className={`w-4.5 h-4.5 ${alreadyFreeBet ? 'text-gray-500' : 'text-emerald-400'}`} />
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
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">FREE</span>
              )}
            </div>
          </button>

          {/* PvP Gambling — GOLD */}
          <button
            onClick={onOpenGambling}
            className="w-full rounded-xl p-3.5 text-left transition-all border border-amber-500/30 bg-gradient-to-r from-amber-950/60 to-orange-950/60 hover:from-amber-900/60 hover:to-orange-900/60 cursor-pointer hover:border-amber-400/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Swords className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">PvP Gambling</p>
                <p className="text-[11px] text-amber-300/70">Bet SOL against others — win the pot</p>
              </div>
              <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded font-mono">SOL</span>
            </div>
          </button>
        </div>
      )}

      {/* ── Pot Display ── */}
      {totalPot > 0 && (
        <div className="px-5 py-3 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-gray-400 text-xs font-mono">TOTAL POT</span>
            </div>
            <span className="text-amber-300 font-bold font-mono text-sm">{totalPot.toFixed(2)} SOL</span>
          </div>
        </div>
      )}

      {/* ── Room Leaderboard ── */}
      <div className="px-5 py-3 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500 text-[11px] font-mono uppercase tracking-wider">Rooms</span>
        </div>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {bettableRooms.map(room => {
            const gamblingTotal = getTotalGamblingBetsForRoom(room.id)
            const freeCount = getFreeBetCountForRoom(room.id)
            const isKillTarget = killerKillRoom === room.id && (gamePhase === 'killing' || gamePhase === 'result')
            const pctOfPot = totalPot > 0 ? ((gamblingTotal / totalPot) * 100).toFixed(0) : '0'

            return (
              <div
                key={room.id}
                className={`relative rounded-lg px-3 py-2 border transition-colors ${
                  isKillTarget
                    ? 'border-red-500/50 bg-red-950/30'
                    : 'border-gray-800 bg-gray-800/30 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isKillTarget ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {room.id}
                    </span>
                    <span className={`text-xs font-medium ${isKillTarget ? 'text-red-300' : 'text-gray-300'}`}>
                      {room.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {freeCount > 0 && (
                      <span className="text-[9px] text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                        {freeCount}🎯
                      </span>
                    )}
                    <span className={`text-xs font-mono ${isKillTarget ? 'text-red-300' : 'text-gray-500'}`}>
                      {gamblingTotal > 0 ? `${gamblingTotal.toFixed(2)}` : '—'}
                    </span>
                    {totalPot > 0 && gamblingTotal > 0 && (
                      <span className="text-[9px] text-amber-400/60 font-mono">{pctOfPot}%</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Round Result ── */}
      {gamePhase === 'result' && roundResult && (
        <div className="px-5 py-4 border-t border-gray-700/50">
          <div className="bg-gray-800/60 rounded-xl p-4 space-y-3">
            <p className="text-gray-300 text-xs font-mono">
              Killer chose: <strong className="text-red-400">{killRoomName}</strong>
            </p>

            {/* Free bet results */}
            {roundResult.correctFreeBets.length > 0 && (
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold">
                    {roundResult.correctFreeBets.length} correct prediction{roundResult.correctFreeBets.length > 1 ? 's' : ''}!
                  </span>
                </div>
                <p className="text-emerald-400/70 text-[10px]">
                  {(roundResult.correctFreeBets.length * 0.01).toFixed(2)} SOL token devbuy triggered
                </p>
              </div>
            )}

            {/* Gambling results */}
            {roundResult.totalPot > 0 && (
              <>
                {roundResult.winnersExist ? (
                  <div className="bg-amber-950/40 border border-amber-500/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 text-xs font-bold">
                        Winners! ({roundResult.payouts.length} player{roundResult.payouts.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {roundResult.payouts.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono">
                          <span className="text-gray-400">{p.wallet.slice(0, 4)}...{p.wallet.slice(-4)}</span>
                          <span className="text-emerald-300">+{p.amount.toFixed(3)} SOL</span>
                        </div>
                      ))}
                      {roundResult.payouts.length > 5 && (
                        <p className="text-[10px] text-gray-500">+{roundResult.payouts.length - 5} more</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/40 border border-red-500/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-300 text-xs font-bold">No winners!</span>
                    </div>
                    <p className="text-red-400/70 text-[10px]">
                      {roundResult.totalPot.toFixed(2)} SOL → automatic token devbuy
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Total devbuy */}
            {roundResult.devBuyAmount > 0 && (
              <div className="flex items-center justify-between bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-700/50">
                <span className="text-gray-500 text-[10px] font-mono">DEVBUY TOTAL</span>
                <span className="text-cyan-300 text-xs font-bold font-mono">{roundResult.devBuyAmount.toFixed(3)} SOL</span>
              </div>
            )}

            {/* Auto-restart indicator */}
            <div className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-blue-200 flex items-center justify-center gap-2">
              <Play className="w-4 h-4 animate-pulse" />
              NEXT ROUND STARTING...
            </div>
          </div>
        </div>
      )}

      {/* ── Footer hint ── */}
      <div className="px-5 py-2.5 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-600 font-mono leading-relaxed">
          {gamePhase === 'betting' && 'Click a room on the map, or use the buttons above to bet.'}
          {gamePhase === 'knocking' && 'The killer checks each room...'}
          {gamePhase === 'killing' && 'The killer has chosen!'}
          {gamePhase === 'result' && 'Next round starts automatically...'}
        </p>
      </div>
    </div>
  )
}
