'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { Skull, Clock, Coins, Play, Gift, Swords, TrendingUp, Trophy, Flame, Lock } from 'lucide-react'

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
    <div className="w-80 bg-void/90 backdrop-blur-xl border border-void-border flex flex-col gap-0 max-h-full overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] font-display uppercase tracking-wider relative">
      {/* Glitch accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-blood-glow opacity-50" />

      {/* ── Header ── */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-void-border bg-void-light/50">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-blood-glow" />
          <h2 className="text-white font-bold text-sm tracking-[0.2em]">STATUS</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-horror-muted">ROUND</span>
          <span className="text-xs font-mono text-blood-glow bg-blood-dark/30 border border-blood/30 px-2 py-0.5">#{currentRound}</span>
        </div>
      </div>

      {/* ── Phase Status ── */}
      <div className="px-5 py-4 border-b border-void-border bg-void-light/20">
        {gamePhase === 'betting' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-xs tracking-widest animate-pulse-slow">BETTING OPEN</span>
              <span className={`font-mono font-bold text-lg tracking-wider ${
                roundTimeRemaining < 15 ? 'text-blood-glow animate-glitch' : 'text-horror-text'
              }`}>
                {formatTime(roundTimeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-horror-accent" />
              <span className="text-[10px] text-horror-muted font-mono lowercase">Killer is selecting target...</span>
            </div>
          </div>
        )}
        {gamePhase === 'knocking' && (
          <div>
            <span className="text-blood-glow font-bold text-xs tracking-widest">KILLER APPROACHES</span>
            {knockedRoomName && (
              <motion.p
                className="text-xs text-white mt-2 font-mono"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                [ CHECKING: {knockedRoomName} ]
              </motion.p>
            )}
          </div>
        )}
        {gamePhase === 'killing' && (
          <div>
            <span className="text-blood-glow font-bold text-xs tracking-widest animate-glitch">BLOOD SPILLED!</span>
            {killRoomName && (
              <motion.p
                className="text-sm text-blood mt-2 font-mono font-bold"
                animate={{ scale: [1, 1.05, 1], textShadow: ["0 0 0px #ff1a1a", "0 0 10px #ff1a1a", "0 0 0px #ff1a1a"] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                VICTIM FOUND IN {killRoomName}
              </motion.p>
            )}
          </div>
        )}
        {gamePhase === 'result' && (
          <span className="text-horror-muted font-bold text-xs tracking-widest">CARNAGE CONCLUDED</span>
        )}
      </div>

      {/* ── Betting Buttons (only during betting phase) ── */}
      {gamePhase === 'betting' ? (
        <div className="px-5 py-5 space-y-4 border-b border-void-border">
          {/* Free Prediction */}
          <button
            onClick={onOpenFreeBet}
            disabled={alreadyFreeBet}
            className={`w-full p-4 text-left transition-all duration-300 border relative overflow-hidden group ${
              alreadyFreeBet
                ? 'border-void-border bg-void opacity-50 cursor-not-allowed'
                : 'border-blood/40 bg-void-light hover:border-blood-glow hover:bg-blood-dark/20 cursor-pointer hover:shadow-[0_0_15px_rgba(138,3,3,0.3)]'
            }`}
          >
            {!alreadyFreeBet && (
              <div className="absolute top-0 left-0 w-1 h-full bg-blood-glow transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            )}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center border ${alreadyFreeBet ? 'border-void-border bg-void text-horror-muted' : 'border-blood/50 bg-blood-dark/30 text-blood-glow group-hover:scale-110 transition-transform'}`}>
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-xs tracking-wider ${alreadyFreeBet ? 'text-horror-muted' : 'text-white'}`}>
                  {alreadyFreeBet ? 'PREDICTION LOGGED' : 'FREE GUESS'}
                </p>
                <p className={`text-[9px] font-mono lowercase tracking-wide mt-1 ${alreadyFreeBet ? 'text-void-border' : 'text-horror-muted'}`}>
                  {alreadyFreeBet ? 'awaiting blood' : 'survive for 0.01 sol dev buy'}
                </p>
              </div>
              {!alreadyFreeBet && (
                <span className="text-blood-glow text-[10px] font-bold border border-blood-glow/30 px-2 py-1 font-mono">FREE</span>
              )}
            </div>
          </button>

          {/* PvP Gambling */}
          <button
            onClick={onOpenGambling}
            className="w-full p-4 text-left transition-all duration-300 border border-void-border bg-void hover:border-white/30 hover:bg-void-light cursor-pointer relative overflow-hidden group hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-white transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-void-border bg-void-light flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-xs text-white tracking-wider">WAGER SOUL</p>
                <p className="text-[9px] text-horror-muted font-mono lowercase tracking-wide mt-1">Bet sol against others</p>
              </div>
              <span className="text-white text-[10px] font-bold border border-white/20 px-2 py-1 font-mono">SOL</span>
            </div>
          </button>
        </div>
      ) : (
        /* ── ROUND IN PROGRESS ── */
        <div className="px-5 py-5 border-b border-void-border bg-void-light/10">
          <div className="border border-blood-dark bg-void p-5 flex flex-col items-center gap-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <div className="w-12 h-12 border border-blood/30 bg-blood-dark/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blood-glow" />
            </div>
            <div>
              <p className="text-white font-bold text-xs tracking-widest uppercase">
                {gamePhase === 'knocking' && 'HUNT IN PROGRESS'}
                {gamePhase === 'killing' && 'FATAL BLOW'}
                {gamePhase === 'result' && 'AFTERMATH'}
              </p>
              <p className="text-horror-muted text-[10px] mt-2 font-mono lowercase tracking-widest">
                Doors are locked
              </p>
            </div>
            <motion.div
              className="w-full py-2 border border-void-border bg-void-light/50 mt-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-horror-accent text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                {gamePhase === 'result' ? 'PREPARING NEXT ROUND' : 'OBSERVE THE CARNAGE'}
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Pot Display ── */}
      {totalPot > 0 && (
        <div className="px-5 py-4 border-b border-void-border bg-[linear-gradient(to_right,rgba(138,3,3,0.1),transparent)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-4 h-4 text-white" />
              <span className="text-horror-muted text-[10px] font-mono tracking-widest">BLOOD POOL</span>
            </div>
            <span className="text-white font-bold font-mono text-sm tracking-wider">{totalPot.toFixed(2)} SOL</span>
          </div>
        </div>
      )}

      {/* ── Room Leaderboard ── */}
      <div className="px-5 py-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-horror-accent" />
          <span className="text-horror-muted text-[10px] font-mono tracking-[0.2em] uppercase">TARGETS</span>
        </div>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {bettableRooms.map(room => {
            const gamblingTotal = getTotalGamblingBetsForRoom(room.id)
            const freeCount = getFreeBetCountForRoom(room.id)
            const isKillTarget = killerKillRoom === room.id && (gamePhase === 'killing' || gamePhase === 'result')
            const pctOfPot = totalPot > 0 ? ((gamblingTotal / totalPot) * 100).toFixed(0) : '0'

            return (
              <div
                key={room.id}
                className={`relative px-4 py-3 border transition-all duration-300 group ${
                  isKillTarget
                    ? 'border-blood-glow bg-blood-dark/30 shadow-[inset_0_0_15px_rgba(255,26,26,0.2)]'
                    : 'border-void-border bg-void-light/50 hover:bg-void-light hover:border-white/20'
                }`}
              >
                {isKillTarget && (
                  <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none" />
                )}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold font-mono border ${
                      isKillTarget ? 'border-blood-glow text-blood-glow bg-blood-dark' : 'border-void-border text-horror-muted bg-void'
                    }`}>
                      {room.id}
                    </span>
                    <span className={`text-[11px] font-bold tracking-wider ${isKillTarget ? 'text-white' : 'text-horror-text'}`}>
                      {room.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {freeCount > 0 && (
                      <span className="text-[10px] text-horror-muted font-mono flex items-center gap-1">
                        {freeCount}<Skull className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className={`text-[11px] font-mono ${isKillTarget ? 'text-blood-glow' : 'text-white'}`}>
                      {gamblingTotal > 0 ? `${gamblingTotal.toFixed(2)}` : '—'}
                    </span>
                    {totalPot > 0 && gamblingTotal > 0 && (
                      <span className="text-[9px] text-horror-muted font-mono w-6 text-right">{pctOfPot}%</span>
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
        <div className="px-5 py-5 border-t border-blood-dark bg-void-light relative">
          <div className="absolute inset-0 bg-blood-glow opacity-[0.02] pointer-events-none" />
          <div className="border border-void-border bg-void p-4 space-y-4 relative z-10">
            <p className="text-horror-text text-[10px] font-mono uppercase tracking-widest text-center border-b border-void-border pb-3">
              VICTIM FOUND IN: <br/><strong className="text-blood-glow text-xs mt-1 block animate-pulse">{killRoomName}</strong>
            </p>

            {/* Free bet results */}
            {roundResult.correctFreeBets.length > 0 && (
              <div className="bg-void-light border border-white/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skull className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                    {roundResult.correctFreeBets.length} SURVIVED
                  </span>
                </div>
                <p className="text-horror-muted text-[9px] font-mono lowercase">
                  {(roundResult.correctFreeBets.length * 0.01).toFixed(2)} SOL devbuy triggered
                </p>
              </div>
            )}

            {/* Gambling results */}
            {roundResult.totalPot > 0 && (
              <>
                {roundResult.winnersExist ? (
                  <div className="bg-void-light border border-white/10 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                        SPOILS OF WAR ({roundResult.payouts.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {roundResult.payouts.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono border-b border-void-border pb-1 last:border-0 last:pb-0">
                          <span className="text-horror-muted">{p.wallet.slice(0, 4)}...{p.wallet.slice(-4)}</span>
                          <span className="text-white">+{p.amount.toFixed(3)} SOL</span>
                        </div>
                      ))}
                      {roundResult.payouts.length > 5 && (
                        <p className="text-[9px] text-horror-muted font-mono pt-1">+{roundResult.payouts.length - 5} more</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blood-dark/20 border border-blood/30 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-3.5 h-3.5 text-blood-glow" />
                      <span className="text-blood-glow text-[10px] font-bold tracking-widest uppercase">NO SURVIVORS</span>
                    </div>
                    <p className="text-horror-muted text-[9px] font-mono lowercase">
                      {roundResult.totalPot.toFixed(2)} SOL to devbuy
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Total devbuy */}
            {roundResult.devBuyAmount > 0 && (
              <div className="flex items-center justify-between bg-void border border-blood-dark px-3 py-2">
                <span className="text-horror-muted text-[9px] font-mono tracking-widest uppercase">TOTAL BLOOD MONEY</span>
                <span className="text-blood-glow text-[11px] font-bold font-mono">{roundResult.devBuyAmount.toFixed(3)} SOL</span>
              </div>
            )}

            {/* Auto-restart indicator */}
            <div className="w-full py-3 border border-void-border font-bold text-[10px] tracking-[0.2em] bg-void text-horror-muted flex items-center justify-center gap-2 uppercase">
              <Play className="w-3 h-3 text-white animate-pulse" />
              NEXT NIGHTMARE
            </div>
          </div>
        </div>
      )}

      {/* ── Footer hint ── */}
      <div className="px-5 py-3 border-t border-void-border bg-void-light/30">
        <p className="text-[9px] text-horror-muted font-mono lowercase tracking-wide text-center">
          {gamePhase === 'betting' && 'Select target or wager soul'}
          {gamePhase === 'knocking' && 'Silence... he searches'}
          {gamePhase === 'killing' && 'Blood is drawn'}
          {gamePhase === 'result' && 'The cycle continues'}
        </p>
      </div>
    </div>
  )
}
