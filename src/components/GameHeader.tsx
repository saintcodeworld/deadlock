'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Zap } from 'lucide-react'
import Image from 'next/image'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export function GameHeader() {
  return (
    <header className="bg-blueprint-dark/90 backdrop-blur-sm border-b border-blueprint-line">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="DEADLOCK Logo" 
              width={48} 
              height={48}
              className="w-12 h-12"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono tracking-wider">
              DEADLOCK
            </h1>
            <p className="text-xs text-blueprint-accent font-mono">
              SURVIVE THE NIGHT
            </p>
          </div>
        </div>

        {/* Center - Status */}
        {/* <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-blueprint-line">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-mono">LIVE ON SOLANA</span>
          </div>
          <div className="h-4 w-px bg-blueprint-line/50" />
          <div className="text-sm font-mono text-blueprint-accent">
            pump.fun Integration
          </div>
        </div> */}

        {/* Wallet Connect */}
        <div className="flex items-center gap-4">
          <WalletMultiButton className="!bg-blueprint-accent !text-blueprint-dark hover:!bg-white !font-mono !text-sm !rounded !py-2 !px-4" />
        </div>
      </div>
    </header>
  )
}
