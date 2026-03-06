'use client'

import { useState } from 'react'
import { HouseMap } from '@/components/HouseMap'
import { BettingSidebar } from '@/components/BettingSidebar'
import { GameHeader } from '@/components/GameHeader'
import { FreeBetPopup } from '@/components/FreeBetPopup'
import { GamblingBetPopup } from '@/components/GamblingBetPopup'
import { BetTypeChooser } from '@/components/BetTypeChooser'
import { GameProvider } from '@/context/GameContext'
import { DevTestPanel } from '@/components/DevTestPanel'
import { DevBuyToast } from '@/components/DevBuyToast'

export default function Home() {
  const [freeBetOpen, setFreeBetOpen] = useState(false)
  const [gamblingOpen, setGamblingOpen] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [clickedRoom, setClickedRoom] = useState<number | null>(null)
  const [preSelectedRoom, setPreSelectedRoom] = useState<number | null>(null)

  const handleRoomClick = (roomId: number) => {
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
    <GameProvider>
      <main className="relative h-screen w-screen overflow-hidden">
        {/* Full screen house map background */}
        <div className="absolute inset-0">
          <HouseMap onRoomClick={handleRoomClick} />
        </div>

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

        {/* Bet type chooser (shown on room click) */}
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

        {/* Dev testing panel — remove before production */}
        {/* <DevTestPanel /> */}

        {/* DevBuy notification toast */}
        <DevBuyToast />
      </main>
    </GameProvider>
  )
}
