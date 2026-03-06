'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Database, Clock, Server } from 'lucide-react'

interface HowItWorksPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function HowItWorksPopup({ isOpen, onClose }: HowItWorksPopupProps) {
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
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#222] text-gray-300 p-8 shadow-2xl overflow-hidden font-mono"
          >
            {/* Tech noise overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8 border-b border-[#222] pb-4">
                <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em] font-sans flex items-center gap-3">
                  <Server className="w-6 h-6 text-red-600" />
                  System Architecture
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
                    <Database className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">1. Postgres / Supabase</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      All game state, bets, and wallet balances are stored securely in a relational PostgreSQL database via Supabase. Every interaction ensures strict data consistency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-[#222] rounded">
                    <Terminal className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">2. Realtime Multiplayer</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Supabase Realtime channels broadcast live player positions and game phases to all connected clients instantly. When the killer moves, everyone sees it at the exact same millisecond.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-[#222] rounded">
                    <Clock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm font-sans">3. Server-side Authority</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The game logic (killer movement, RNG outcomes, payout calculations) runs entirely via protected server actions and API routes. The client only displays the horror—it does not dictate it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#222] flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 hover:text-red-400 transition-all uppercase tracking-widest text-xs font-bold"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
