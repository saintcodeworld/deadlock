'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Skull, Info, Gamepad2 } from 'lucide-react'
import Image from 'next/image'
import { HowItWorksPopup } from './HowItWorksPopup'
import { HowToPlayPopup } from './HowToPlayPopup'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export function GameHeader() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)

  return (
    <>
      <header className="bg-void-light/80 backdrop-blur-md border-b border-blood-dark/50 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="DEADLOCK Logo" 
                width={48} 
                height={48}
                className="w-12 h-12 filter drop-shadow-[0_0_8px_rgba(204,0,0,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(255,26,26,0.8)] transition-all duration-500"
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blood-glow rounded-full animate-pulse-slow shadow-[0_0_10px_rgba(255,26,26,0.8)]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white font-display tracking-[0.2em] uppercase group-hover:text-blood-glow transition-colors duration-300">
                DEADLOCK
              </h1>
              <div className="flex items-center gap-2">
                <Skull className="w-3 h-3 text-horror-accent" />
                <p className="text-[10px] text-horror-muted font-mono uppercase tracking-[0.3em]">
                  Survive The Night
                </p>
              </div>
            </div>
          </div>

          {/* Nav & Wallet Connect */}
          <div className="flex items-center gap-6">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden md:flex items-center gap-2 text-horror-muted hover:text-white transition-colors duration-300"
            >
              <svg className="w-4 h-4 group-hover:text-blood-glow transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase">Twitter</span>
            </a>

            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="group hidden md:flex items-center gap-2 text-horror-muted hover:text-white transition-colors duration-300"
            >
              <Gamepad2 className="w-4 h-4 group-hover:text-blood-glow transition-colors duration-300" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase">How To Play</span>
            </button>

            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="group hidden md:flex items-center gap-2 text-horror-muted hover:text-white transition-colors duration-300"
            >
              <Info className="w-4 h-4 group-hover:text-blood-glow transition-colors duration-300" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase">Project Architecture</span>
            </button>

            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-void border border-blood-dark/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-blood animate-pulse" />
              <span className="text-[11px] font-mono text-horror-muted tracking-widest uppercase">Live on Solana</span>
            </div>
            <WalletMultiButton className="!bg-blood-dark hover:!bg-blood !text-white !font-mono !text-xs !tracking-widest !rounded-none !border !border-blood/50 hover:!border-blood-glow !py-3 !px-6 !transition-all !duration-300 hover:!shadow-[0_0_20px_rgba(138,3,3,0.4)]" />
          </div>
        </div>
      </header>

      <HowItWorksPopup 
        isOpen={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />
      <HowToPlayPopup 
        isOpen={isHowToPlayOpen} 
        onClose={() => setIsHowToPlayOpen(false)} 
      />
    </>
  )
}
