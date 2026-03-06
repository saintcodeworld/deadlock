'use client'

import { useState } from 'react'
import { HouseMap } from '@/components/HouseMap'
import { BettingSidebar } from '@/components/BettingSidebar'
import { GameHeader } from '@/components/GameHeader'
import { FreeBetPopup } from '@/components/FreeBetPopup'
import { GamblingBetPopup } from '@/components/GamblingBetPopup'
import { BetTypeChooser } from '@/components/BetTypeChooser'
import { GameProvider, useGame } from '@/context/GameContext'
import { DevBuyToast } from '@/components/DevBuyToast'

function GameInner() {
  const { gamePhase, sessionLoaded } = useGame()
  const [freeBetOpen, setFreeBetOpen] = useState(false)
  const [gamblingOpen, setGamblingOpen] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [clickedRoom, setClickedRoom] = useState<number | null>(null)
  const [preSelectedRoom, setPreSelectedRoom] = useState<number | null>(null)

  const handleRoomClick = (roomId: number) => {
    if (gamePhase !== 'betting') return
    setClickedRoom(roomId)
    setChooserOpen(true)
  }

  const handleChooseFreeBet = (roomId: number) => {
    setPreSelectedRoom(roomId)
    setFreeBetOpen(true)
  }

  const handleChooseGambling = (roomId: number) => {
    setPreSelectedRoom(roomId)
    setGamblingOpen(true)
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Full screen house map background */}
      <div className="absolute inset-0">
        <HouseMap onRoomClick={handleRoomClick} />
      </div>

      {/* Loading overlay — shown until we know the real game state */}
      {!sessionLoaded && (
        <div className="absolute inset-0 z-50 bg-gray-950/95 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">Connecting to game...</p>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header overlay */}
        <div className="pointer-events-auto">
          <GameHeader />
        </div>

        {/* Betting sidebar overlay - right side */}
        <div className="absolute top-20 right-4 bottom-4 w-80 pointer-events-auto">
          <BettingSidebar
            onOpenFreeBet={() => { setPreSelectedRoom(null); setFreeBetOpen(true) }}
            onOpenGambling={() => { setPreSelectedRoom(null); setGamblingOpen(true) }}
          />
        </div>
      </div>

      {/* Bet type chooser (shown on room click during betting only) */}
      <BetTypeChooser
        isOpen={chooserOpen}
        roomId={clickedRoom}
        onClose={() => setChooserOpen(false)}
        onChooseFreeBet={handleChooseFreeBet}
        onChooseGambling={handleChooseGambling}
      />

      {/* Popups */}
      <FreeBetPopup isOpen={freeBetOpen} onClose={() => { setFreeBetOpen(false); setPreSelectedRoom(null) }} preSelectedRoom={preSelectedRoom} />
      <GamblingBetPopup isOpen={gamblingOpen} onClose={() => { setGamblingOpen(false); setPreSelectedRoom(null) }} preSelectedRoom={preSelectedRoom} />

      {/* DevBuy notification toast */}
      <DevBuyToast />
    </main>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  )
}
