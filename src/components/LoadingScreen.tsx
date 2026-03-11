'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('INITIALIZING PROTOCOL')

  useEffect(() => {
    // Fake progress for visual flair
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99
        // Random increment between 1 and 15
        const inc = Math.random() * 15
        return Math.min(prev + inc, 99) // Stay at 99 until session actually loads
      })
    }, 200)

    const textInterval = setInterval(() => {
      const texts = [
        'ESTABLISHING SECURE CONNECTION...',
        'BYPASSING MAINFRAME...',
        'SYNCING REALTIME DATA...',
        'LOCATING HIDING SPOTS...',
        'PREPARING THE HOUSE...'
      ]
      setLoadingText(texts[Math.floor(Math.random() * texts.length)])
    }, 1500)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8, ease: "easeInOut" } }}
      className="absolute inset-0 z-[100] bg-void flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Dynamic background effects */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-radial from-blood/5 to-transparent opacity-50" />
      
      {/* Glitching Logo */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: 'blur(20px)' }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          filter: 'blur(0px)',
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 mb-16"
      >
        <motion.div
          animate={{
            x: [0, -2, 2, -1, 0, 0, 0, 0],
            y: [0, 1, -1, 2, 0, 0, 0, 0],
            opacity: [1, 0.8, 1, 0.9, 1, 1, 1, 1],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            repeatDelay: Math.random() * 4 + 2,
          }}
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-72 md:w-[450px] object-contain drop-shadow-[0_0_30px_rgba(255,26,26,0.2)] filter contrast-125"
          />
        </motion.div>
      </motion.div>

      {/* Loading Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-8"
      >
        <div className="flex justify-between w-full mb-4 text-blood-glow font-mono text-[10px] md:text-xs tracking-widest uppercase">
          <motion.span
            key={loadingText}
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          >
            {loadingText}
          </motion.span>
          <span className="tabular-nums">{Math.floor(progress)}%</span>
        </div>

        {/* High-end Progress Bar */}
        <div className="w-full h-[1px] bg-blood-dark/30 relative">
          {/* Track blur */}
          <div className="absolute inset-0 bg-blood-dark/20 blur-sm" />
          
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blood-glow"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
          >
            {/* Glow effect at the tip of the progress bar */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-blood-glow rounded-full blur-md opacity-50" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full blur-[1px]" />
          </motion.div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="mt-12 flex gap-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-blood rounded-full"
              animate={{
                opacity: [0.1, 0.8, 0.1],
                scale: [0.8, 1.2, 0.8],
                boxShadow: [
                  "0 0 0px rgba(255,26,26,0)",
                  "0 0 10px rgba(255,26,26,0.5)",
                  "0 0 0px rgba(255,26,26,0)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
