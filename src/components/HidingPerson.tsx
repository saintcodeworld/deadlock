'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface HidingPersonProps {
  roomX: number
  roomY: number
  roomWidth: number
  roomHeight: number
  personIndex: number
  isKilled: boolean
}

export function HidingPerson({ roomX, roomY, roomWidth, roomHeight, personIndex, isKilled }: HidingPersonProps) {
  // Generate a random walk path within the room bounds (with padding)
  const pad = 25
  const minX = roomX + pad
  const maxX = roomX + roomWidth - pad
  const minY = roomY + pad
  const maxY = roomY + roomHeight - pad

  const walkPath = useMemo(() => {
    const seed = personIndex * 137.5
    const points = 6
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < points; i++) {
      xs.push(minX + ((Math.sin(seed + i * 2.1) * 0.5 + 0.5) * (maxX - minX)))
      ys.push(minY + ((Math.cos(seed + i * 3.7) * 0.5 + 0.5) * (maxY - minY)))
    }
    // Close the loop
    xs.push(xs[0])
    ys.push(ys[0])
    return { xs, ys }
  }, [minX, maxX, minY, maxY, personIndex])

  // Person color based on index
  const colors = ['#5588cc', '#cc8855', '#55cc88', '#cc55aa', '#88cc55', '#aa55cc']
  const color = colors[personIndex % colors.length]

  if (isKilled) {
    // Death animation: person falls, blood splatter — use plain SVG to avoid framer-motion attribute bugs
    const bx = walkPath.xs[0]
    const by = walkPath.ys[0]
    return (
      <g>
        {/* Fallen body */}
        <g style={{ transformOrigin: `${bx}px ${by}px`, transform: 'rotate(90deg)', opacity: 0.6 }}>
          <ellipse cx={bx} cy={by} rx={6} ry={4} fill={color} opacity={0.7} />
          <circle cx={bx - 7} cy={by} r={3} fill="#ddb896" />
        </g>

        {/* Blood pool */}
        <ellipse cx={bx} cy={by + 2} rx={12} ry={8} fill="#880000" opacity={0.6} />

        {/* Blood splatter dots */}
        {[0, 1, 2, 3].map(i => (
          <circle
            key={i}
            cx={bx + Math.cos(i * 1.5) * 8}
            cy={by + Math.sin(i * 1.5) * 6}
            r={1.5}
            fill="#aa0000"
            opacity={0.7}
          />
        ))}

        {/* X eyes */}
        <g>
          <line x1={bx - 9} y1={by - 2} x2={bx - 5} y2={by + 2} stroke="#cc0000" strokeWidth="0.8" />
          <line x1={bx - 5} y1={by - 2} x2={bx - 9} y2={by + 2} stroke="#cc0000" strokeWidth="0.8" />
        </g>
      </g>
    )
  }

  // Alive: walking animation inside room using SVG transform
  const startX = walkPath.xs[0]
  const startY = walkPath.ys[0]

  return (
    <motion.g
      initial={{ translateX: startX, translateY: startY }}
      animate={{
        translateX: walkPath.xs,
        translateY: walkPath.ys,
      }}
      transition={{
        duration: 8 + personIndex * 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Shadow */}
      <ellipse
        cx={0}
        cy={5}
        rx={4}
        ry={1.5}
        fill="rgba(0,0,0,0.3)"
      />

      {/* Body */}
      <ellipse
        cx={0}
        cy={0}
        rx={4}
        ry={6}
        fill={color}
      />

      {/* Head */}
      <circle
        cx={0}
        cy={-9}
        r={3.5}
        fill="#ddb896"
        stroke="#c4a07a"
        strokeWidth={0.3}
      />

      {/* Hair */}
      <ellipse
        cx={0}
        cy={-11}
        rx={3.5}
        ry={2}
        fill={personIndex % 2 === 0 ? '#4a3020' : '#2a1a10'}
      />

      {/* Scared expression (during knocking/killing) */}
      <circle cx={-1} cy={-9} r={0.6} fill="#333" />
      <circle cx={1.5} cy={-9} r={0.6} fill="#333" />
      <ellipse cx={0} cy={-7} rx={1} ry={0.5} fill="#333" />

      {/* Walking legs */}
      <line
        x1={-1.5} y1={5}
        x2={-3} y2={10}
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
      <line
        x1={1.5} y1={5}
        x2={3} y2={10}
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
    </motion.g>
  )
}
