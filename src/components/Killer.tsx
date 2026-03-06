'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface KillerProps {
  position: { x: number; y: number }
  isKnocking?: boolean
  isKilling?: boolean
}

export function Killer({ position, isKnocking = false, isKilling = false }: KillerProps) {
  return (
    <motion.g
      initial={{ x: position.x, y: position.y }}
      animate={{ x: position.x, y: position.y }}
      transition={{ 
        type: 'spring',
        stiffness: 40,
        damping: 12,
        duration: 2
      }}
      filter="url(#killerGlow)"
    >
      {/* Knocking ring pulse */}
      {isKnocking && (
        <>
          <motion.circle
            cx={0} cy={0} r={8}
            fill="none" stroke="#ff4444" strokeWidth={1.5}
            initial={{ r: 8, opacity: 0.8 }}
            animate={{ r: 30, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={0} cy={0} r={8}
            fill="none" stroke="#ff4444" strokeWidth={1}
            initial={{ r: 8, opacity: 0.6 }}
            animate={{ r: 25, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
          {/* KNOCK text */}
          <motion.text
            x={0} y={-30}
            textAnchor="middle"
            fill="#ff4444"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            animate={{ opacity: [1, 0.3, 1], y: [-30, -34, -30] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            KNOCK KNOCK
          </motion.text>
        </>
      )}

      {/* Kill flash effect */}
      {isKilling && (
        <>
          {/* Red flash */}
          <motion.circle
            cx={0} cy={0} r={5}
            fill="#ff0000"
            initial={{ r: 5, opacity: 0.8 }}
            animate={{ r: 50, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
          />
          {/* Slash lines */}
          {[0, 1, 2].map(i => (
            <motion.line
              key={i}
              x1={-15 + i * 8} y1={-20}
              x2={15 + i * 8} y2={20}
              stroke="#ff0000"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          {/* Blood splatters */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.circle
              key={`blood-${i}`}
              cx={Math.cos(i * 1.05) * 15}
              cy={Math.sin(i * 1.05) * 12}
              r={2}
              fill="#aa0000"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
            />
          ))}
        </>
      )}

      {/* Ghostface body - hooded cloak */}
      <motion.path
        d="M 0 -15 
           C -12 -10 -15 5 -12 20 
           L -8 25 L 8 25 L 12 20 
           C 15 5 12 -10 0 -15 Z"
        fill="#1a1a1a"
        stroke="#333333"
        strokeWidth="1"
        animate={isKilling
          ? { scale: [1, 1.15, 1.05, 1.15, 1], rotate: [0, -10, 10, -5, 0] }
          : isKnocking
          ? { scale: [1, 1.05, 1], x: [0, 3, -3, 0] }
          : { scale: [1, 1.02, 1] }
        }
        transition={{
          duration: isKilling ? 0.6 : isKnocking ? 0.4 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Ghostface mask */}
      <motion.ellipse
        cx="0"
        cy="-5"
        rx="8"
        ry="10"
        fill="#f5f5f5"
        stroke="#cccccc"
        strokeWidth="0.5"
      />
      
      {/* Left eye hole */}
      <motion.ellipse
        cx="-3"
        cy="-7"
        rx="2"
        ry="3"
        fill="#000000"
        animate={{ ry: isKilling ? [3, 4, 3] : [3, 2.5, 3] }}
        transition={{ duration: isKilling ? 0.3 : 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Right eye hole */}
      <motion.ellipse
        cx="3"
        cy="-7"
        rx="2"
        ry="3"
        fill="#000000"
        animate={{ ry: isKilling ? [3, 4, 3] : [3, 2.5, 3] }}
        transition={{ duration: isKilling ? 0.3 : 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
      
      {/* Mouth - elongated scream */}
      <motion.ellipse
        cx="0"
        cy="2"
        rx="3"
        ry="5"
        fill="#000000"
        animate={{ ry: isKilling ? [5, 7, 5] : [5, 6, 5] }}
        transition={{ duration: isKilling ? 0.4 : 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Knife */}
      <motion.g
        animate={isKilling
          ? { rotate: [-20, 60, -20, 60, -20] }
          : isKnocking
          ? { rotate: [0, -15, 0] }
          : { rotate: [-5, 5, -5] }
        }
        transition={{
          duration: isKilling ? 0.5 : isKnocking ? 0.3 : 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transformOrigin: '12px 10px' }}
      >
        {/* Knife handle */}
        <rect x="10" y="5" width="4" height="10" fill="#4a3728" rx="1" />
        {/* Knife blade */}
        <path d="M 10 5 L 12 -15 L 14 5 Z" fill="#c0c0c0" stroke="#888888" strokeWidth="0.5" />
        {/* Blade shine */}
        <line x1="12" y1="-12" x2="12" y2="2" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
      </motion.g>

      {/* Blood drip effect */}
      <motion.circle
        cx="12" cy="-10" r="1" fill="#cc0000"
        animate={{ cy: [-10, 30], opacity: [1, 0] }}
        transition={{ duration: isKilling ? 0.5 : 2, repeat: Infinity, ease: "easeIn", delay: isKilling ? 0 : 1 }}
      />

      {/* Extra blood drips when killing */}
      {isKilling && (
        <>
          <motion.circle cx="-5" cy="-5" r="1.2" fill="#cc0000"
            animate={{ cy: [-5, 35], opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeIn", delay: 0.2 }}
          />
          <motion.circle cx="5" cy="-8" r="0.8" fill="#cc0000"
            animate={{ cy: [-8, 32], opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
          />
        </>
      )}
    </motion.g>
  )
}
