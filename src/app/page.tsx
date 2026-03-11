'use client'

import { useState } from 'react'
import { HouseMap } from '@/components/HouseMap'
import { BettingSidebar } from '@/components/BettingSidebar'
import { GameHeader } from '@/components/GameHeader'
import { FreeBetPopup } from '@/components/FreeBetPopup'
import { GamblingBetPopup } from '@/components/GamblingBetPopup'
import { BetTypeChooser } from '@/components/BetTypeChooser'
import { GameProvider, useGame } from '@/context/GameContext'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { DevBuyToast } from '@/components/DevBuyToast'
import { ChatSidebar } from '@/components/ChatSidebar'
import { LoadingScreen } from '@/components/LoadingScreen'
import { UsernamePopup } from '@/components/UsernamePopup'
import { AnimatePresence } from 'framer-motion'

function GameInner() {
  const { gamePhase, sessionLoaded } = useGame()
  const { username, setUsername, usernameLoaded } = useChat()
  const [freeBetOpen, setFreeBetOpen] = useState(false)
  const [gamblingOpen, setGamblingOpen] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [clickedRoom, setClickedRoom] = useState<number | null>(null)
  const [preSelectedRoom, setPreSelectedRoom] = useState<number | null>(null)

  const showUsernamePopup = sessionLoaded && usernameLoaded && !username

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
    <main className="relative h-screen w-screen overflow-hidden bg-void selection:bg-blood">
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] z-0 pointer-events-none mix-blend-overlay" />
      
      {/* Full screen house map background */}
      <div className="absolute inset-0 z-10">
        <HouseMap onRoomClick={handleRoomClick} />
      </div>

      {/* Loading overlay */}
      <AnimatePresence mode="wait">
        {!sessionLoaded && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col">
        {/* Header overlay */}
        <div className="pointer-events-auto">
          <GameHeader />
        </div>

        {/* Betting sidebar overlay - right side */}
        <div className="absolute top-28 right-8 bottom-8 w-80 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.9)]">
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

      {/* Chat sidebar - left side */}
      <ChatSidebar />

      {/* Username picker popup - shown after loading if no username set */}
      <UsernamePopup
        isOpen={showUsernamePopup}
        onComplete={(name) => setUsername(name)}
      />
    </main>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <ChatProvider>
        <GameInner />
      </ChatProvider>
    </GameProvider>
  )
}
