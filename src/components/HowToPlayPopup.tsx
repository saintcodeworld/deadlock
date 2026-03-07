'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skull, Coins, Ghost, Trophy } from 'lucide-react'

interface HowToPlayPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function HowToPlayPopup({ isOpen, onClose }: HowToPlayPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#222] text-gray-300 p-8 shadow-[0_0_50px_rgba(138,3,3,0.1)] overflow-hidden font-mono"
          >
            {/* Tech noise overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8 border-b border-[#222] pb-4">
                <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em] font-sans flex items-center gap-3">
                  <Skull className="w-6 h-6 text-red-600" />
                  How To Play
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-white transition-colors uppercase text-sm tracking-widest"
                >
                  [Close]
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-[#222] rounded">
                    <Coins className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">1. Pick The Survivor</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      There are 7 rooms and <span className="text-red-500 font-bold">two killers</span>. Your goal is to guess which <span className="text-green-500 font-bold">one room survives</span>. Place a <span className="text-white font-bold">Free Bet</span> just to play, or a <span className="text-green-500 font-bold">Gambling Bet</span> (using SOL) to win real money.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-[#222] rounded">
                    <Ghost className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">2. The Killers Strike</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Once betting closes, <span className="text-red-500 font-bold">two killers</span> roam the house knocking on doors. They never enter the same room at the same time. Together they breach <span className="text-red-500 font-bold">6 out of 7 rooms</span>, massacring everyone inside. Only <span className="text-green-500 font-bold">one room is left untouched</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-[#222] rounded">
                    <Trophy className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">3. Collect Your Reward</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      If you picked the <span className="text-green-500 font-bold">one surviving room</span>, you win! The total SOL wagered by all other players is split among the winners proportionally. <br /><br />
                      If you won using a <span className="text-white font-bold">Free Bet</span>, the Dev will trigger a buy on the project's token as a reward!
                    </p>
                  </div>
                </div>

                {/* The Two Word Conclusion */}
                <div className="mt-8 p-6 bg-red-950/20 border border-red-900/30 text-center">
                  <p className="text-xs text-red-500/80 uppercase tracking-widest mb-2 font-sans font-bold">In Conclusion:</p>
                  <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase font-sans drop-shadow-[0_0_15px_rgba(0,204,68,0.5)]">
                    SURVIVE
                  </h1>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-[#222] flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 hover:text-red-400 transition-all uppercase tracking-widest text-xs font-bold"
                >
                  I Understand
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
