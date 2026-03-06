'use client'

import React, { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { triggerServerDevBuy } from '@/utils/devbuy'

export function DevTestPanel() {
  const { gamePhase, placeFreeBet, rooms, skipBettingTimer, roundResult, killerKillRoom, roundTimeRemaining } = useGame()
  const [testAmount, setTestAmount] = useState('0.001')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const totalFreeBets = rooms.reduce((sum, r) => sum + r.freeBets.length, 0)

  // Direct devbuy API test — bypasses game logic entirely
  const handleDirectDevbuy = async () => {
    const amt = parseFloat(testAmount)
    if (isNaN(amt) || amt <= 0) {
      setStatus('Invalid amount')
      return
    }
    setLoading(true)
    setStatus(`Sending ${amt} SOL devbuy...`)
    try {
      const res = await triggerServerDevBuy(amt)
      if (res.success) {
        setStatus(`✅ Devbuy OK! TX: ${res.signature?.slice(0, 16)}...`)
      } else {
        setStatus(`❌ Failed: ${res.error}`)
      }
    } catch (e: any) {
      setStatus(`❌ Error: ${e?.message}`)
    }
    setLoading(false)
  }

  // Place a fake free bet on every room so at least one will hit
  const handleBetAllRooms = async () => {
    if (gamePhase !== 'betting') {
      setStatus('Can only bet during betting phase')
      return
    }
    const fakeWallet = 'DEVtest' + Date.now()
    let placed = 0
    for (const room of rooms) {
      const ok = await placeFreeBet(room.id, fakeWallet + '_' + room.id)
      if (ok) placed++
    }
    setStatus(`Placed free bets on ${placed}/7 rooms. One WILL hit → 0.01 SOL devbuy.`)
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-purple-600/80 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-mono backdrop-blur-sm"
      >
        DEV TEST
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 border border-purple-500/50 rounded-xl p-4 w-80 font-mono text-xs text-white backdrop-blur-sm max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-purple-400 font-bold text-sm">DEV TEST PANEL</span>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">✕</button>
      </div>

      {/* Quick test flow */}
      <div className="mb-3 p-2 bg-white/5 rounded-lg border-2 border-cyan-500/30">
        <div className="text-cyan-400 mb-1.5 font-bold">⚡ Quick Full Test</div>
        <div className="flex gap-2 mb-1.5">
          <button
            onClick={handleBetAllRooms}
            disabled={gamePhase !== 'betting'}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black font-bold px-2 py-1 rounded flex-1 text-[10px]"
          >
            1. Bet All
          </button>
          <button
            onClick={skipBettingTimer}
            disabled={gamePhase !== 'betting'}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-black font-bold px-2 py-1 rounded flex-1 text-[10px]"
          >
            2. Skip Timer
          </button>
        </div>
        <p className="text-gray-500 text-[10px] mb-2">Click "Bet All" → "Skip Timer". Watch killer knock + kill. Devbuy triggers on result.</p>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-1.5">
          <p className="text-yellow-400 text-[10px] font-bold">⚠️ OPEN BROWSER CONSOLE (F12) to see devbuy logs!</p>
          <p className="text-gray-400 text-[9px]">Look for: [Game] 🚀 Triggering devbuy...</p>
        </div>
      </div>

      {/* Direct devbuy test */}
      <div className="mb-3 p-2 bg-white/5 rounded-lg">
        <div className="text-yellow-400 mb-1.5 font-bold">Direct Devbuy API Test</div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={testAmount}
            onChange={e => setTestAmount(e.target.value)}
            className="bg-black/60 border border-white/20 rounded px-2 py-1 w-24 text-white"
          />
          <span className="text-gray-400">SOL</span>
          <button
            onClick={handleDirectDevbuy}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold px-3 py-1 rounded"
          >
            {loading ? '...' : 'BUY'}
          </button>
        </div>
        <p className="text-gray-500 mt-1">Calls /api/devbuy directly. No game logic.</p>
      </div>

      {/* Live state */}
      <div className="p-2 bg-white/5 rounded-lg mb-2">
        <div className="text-gray-400 font-bold mb-1">Live State</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
          <span className="text-gray-500">Phase:</span>
          <span className={gamePhase === 'result' ? 'text-green-400' : gamePhase === 'killing' ? 'text-red-400' : 'text-white'}>{gamePhase}</span>
          <span className="text-gray-500">Timer:</span>
          <span className="text-white">{roundTimeRemaining}s</span>
          <span className="text-gray-500">Free bets:</span>
          <span className="text-white">{totalFreeBets}</span>
          <span className="text-gray-500">Killed room:</span>
          <span className="text-red-400">{killerKillRoom ?? '-'}</span>
          {roundResult && (
            <>
              <span className="text-gray-500">DevBuy amt:</span>
              <span className="text-yellow-400">{roundResult.devBuyAmount} SOL</span>
              <span className="text-gray-500">Correct bets:</span>
              <span className="text-green-400">{roundResult.correctFreeBets.length}</span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="p-2 bg-white/5 rounded-lg text-gray-300 break-all">
          {status}
        </div>
      )}
    </div>
  )
}
