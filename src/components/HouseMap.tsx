'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { Room } from './Room'
import { Killer } from './Killer'
import { HidingPerson } from './HidingPerson'
import { useKnockSound } from '@/hooks/useKnockSound'
import { useKillSound } from '@/hooks/useKillSound'

interface HouseMapProps {
  onRoomClick?: (roomId: number) => void
}

export function HouseMap({ onRoomClick }: HouseMapProps) {
  const { rooms, killerPosition, selectedRoom, selectRoom, gamePhase, killerKnockingRoom, killerKillRoom, isKilling, playerPositions } = useGame()
  const { playKnock } = useKnockSound()
  const { playKill } = useKillSound()
  const prevKnockingRoomRef = useRef<number | null>(null)

  // Play knock sound each time the killer arrives at a new door
  useEffect(() => {
    if (killerKnockingRoom !== null && killerKnockingRoom !== prevKnockingRoomRef.current) {
      playKnock()
    }
    prevKnockingRoomRef.current = killerKnockingRoom
  }, [killerKnockingRoom, playKnock])

  // Play kill sound when killing phase starts
  useEffect(() => {
    if (gamePhase === 'killing' && isKilling) {
      playKill()
    }
  }, [gamePhase, isKilling, playKill])

  const WALL = 8 // wall thickness

  return (
    <div className="relative w-full h-full">
      {/* 3D Floor Plan container with isometric tilt */}
      <div
        className="floor-plan-3d bg-gray-950 w-full h-full flex items-center justify-center"
        style={{ perspective: '1500px' }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: 'rotateX(18deg) rotateZ(-1deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            viewBox="0 0 720 600"
            className="w-full h-full drop-shadow-2xl"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Wood floor pattern */}
              <pattern id="woodFloor" width="40" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                <rect width="40" height="8" fill="#3d2b1f" />
                <rect width="40" height="1" y="7" fill="#2a1d14" opacity="0.5" />
                <rect width="1" height="8" x="20" fill="#2a1d14" opacity="0.3" />
              </pattern>

              {/* Tile pattern for bathrooms */}
              <pattern id="tileFloor" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#d4cfc7" />
                <rect width="11" height="11" x="0.5" y="0.5" fill="#e8e3db" rx="0.5" />
              </pattern>

              {/* Carpet pattern for bedrooms */}
              <pattern id="carpetFloor" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#2c3a4a" />
                <circle cx="2" cy="2" r="0.5" fill="#344558" opacity="0.5" />
              </pattern>

              {/* Hallway floor */}
              <pattern id="hallwayFloor" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill="#4a3d30" />
                <rect width="14" height="14" x="0" y="0" fill="#3d3228" />
                <rect width="14" height="14" x="15" y="15" fill="#3d3228" />
              </pattern>

              {/* Study wood floor */}
              <pattern id="studyFloor" width="30" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
                <rect width="30" height="6" fill="#4a3728" />
                <rect width="30" height="1" y="5" fill="#3a2a1a" opacity="0.5" />
              </pattern>

              {/* Kitchen tile floor */}
              <pattern id="kitchenFloor" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#3a3028" />
                <rect width="15" height="15" x="0.5" y="0.5" fill="#44382e" rx="0.5" />
              </pattern>

              {/* Wall shadow (3D depth) */}
              <filter id="wallShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
              </filter>

              {/* Inner shadow for rooms (depth) */}
              <filter id="innerDepth" x="-5%" y="-5%" width="115%" height="115%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
              </filter>

              {/* Glow for selected rooms */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Red glow for killer */}
              <filter id="killerGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Ambient light gradient */}
              <radialGradient id="ambientLight" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>

            {/* Dark background */}
            <rect width="720" height="600" fill="#0a0a0a" rx="8" />

            {/* Ground shadow under the house */}
            <rect x="30" y="30" width="660" height="540" rx="4" fill="#000" opacity="0.4" filter="url(#wallShadow)" />

            {/* ========== ROOM FLOORS ========== */}

            {/* Master Bedroom floor (carpet) */}
            <rect x={40} y={40} width={220} height={180} fill="url(#carpetFloor)" />

            {/* Bedroom 2 floor (carpet) */}
            <rect x={40} y={240} width={180} height={160} fill="url(#carpetFloor)" />

            {/* Bedroom 3 floor (carpet) */}
            <rect x={40} y={420} width={180} height={140} fill="url(#carpetFloor)" />

            {/* Study floor (wood) */}
            <rect x={500} y={40} width={180} height={160} fill="url(#studyFloor)" />

            {/* Master Bath floor (tile) */}
            <rect x={280} y={40} width={200} height={130} fill="url(#tileFloor)" />

            {/* Bathroom 2 floor (tile) */}
            <rect x={500} y={220} width={180} height={120} fill="url(#tileFloor)" />

            {/* Kitchen floor (tile) */}
            <rect x={500} y={360} width={180} height={200} fill="url(#kitchenFloor)" />

            {/* Hallway floor (parquet) */}
            <rect x={240} y={190} width={240} height={370} fill="url(#hallwayFloor)" />

            {/* Ambient light overlay */}
            <rect x="30" y="30" width="660" height="540" fill="url(#ambientLight)" />

            {/* ========== WALLS (thick, 3D-style) ========== */}
            <g>
              {/* Outer walls - highly visible */}
              {/* Top wall */}
              <rect x={32} y={32} width={656} height={WALL} fill="#4a4a4a" stroke="#666" strokeWidth="2" />
              <rect x={32} y={32} width={656} height={2} fill="#5a5a5a" />
              {/* Bottom wall */}
              <rect x={32} y={560} width={656} height={WALL} fill="#4a4a4a" stroke="#666" strokeWidth="2" />
              <rect x={32} y={560} width={656} height={2} fill="#5a5a5a" />
              {/* Left wall */}
              <rect x={32} y={32} width={WALL} height={536} fill="#4a4a4a" stroke="#666" strokeWidth="2" />
              <rect x={32} y={32} width={2} height={536} fill="#5a5a5a" />
              {/* Right wall */}
              <rect x={680} y={32} width={WALL} height={536} fill="#4a4a4a" stroke="#666" strokeWidth="2" />
              <rect x={686} y={32} width={2} height={536} fill="#5a5a5a" />

              {/* Interior walls - Horizontal - highly visible */}
              {/* Wall between Master Bedroom and rooms below (y=220) */}
              <rect x={32} y={220} width={228} height={WALL} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={32} y={220} width={228} height={2} fill="#4a4a4a" />
              
              {/* Wall between Bedroom 2 and Bedroom 3 (y=400) */}
              <rect x={32} y={400} width={208} height={WALL} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={32} y={400} width={208} height={2} fill="#4a4a4a" />
              
              {/* Wall between Master Bath bottom (y=170) */}
              <rect x={260} y={170} width={220} height={WALL} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={260} y={170} width={220} height={2} fill="#4a4a4a" />
              
              {/* Wall between Study and Bathroom 2 (y=200) */}
              <rect x={480} y={200} width={208} height={WALL} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={480} y={200} width={208} height={2} fill="#4a4a4a" />
              
              {/* Wall Bathroom 2 bottom (y=340) */}
              <rect x={480} y={340} width={208} height={WALL} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={480} y={340} width={208} height={2} fill="#4a4a4a" />

              {/* Interior walls - Vertical - highly visible */}
              {/* Wall right of Master Bedroom (x=260) */}
              <rect x={260} y={32} width={WALL} height={148} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={260} y={32} width={2} height={148} fill="#4a4a4a" />
              
              {/* Wall right of Bedroom 2/3 (x=220) */}
              <rect x={220} y={220} width={WALL} height={348} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={220} y={220} width={2} height={348} fill="#4a4a4a" />
              
              {/* Wall left of Study (x=480) */}
              <rect x={480} y={32} width={WALL} height={316} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={480} y={32} width={2} height={316} fill="#4a4a4a" />
              
              {/* Wall right of hallway (x=480) goes from bathroom2 bottom to house bottom */}
              <rect x={480} y={348} width={WALL} height={220} fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
              <rect x={480} y={348} width={2} height={220} fill="#4a4a4a" />
            </g>

            {/* ========== WALL TOP EDGES (3D effect) ========== */}
            <g fill="none" stroke="#777" strokeWidth="1">
              {/* Top edge highlights on walls for 3D depth */}
              <line x1={32} y1={32} x2={688} y2={32} />
              <line x1={32} y1={560} x2={688} y2={560} />
              <line x1={32} y1={32} x2={32} y2={568} />
              <line x1={688} y1={32} x2={688} y2={568} />
            </g>

            {/* ========== DOOR OPENINGS ========== */}
            <g>
              {/* Door: Master Bedroom → Hallway (vertical wall at x=260, gap in wall) */}
              <rect x={260} y={100} width={WALL} height={40} fill="url(#carpetFloor)" />
              <rect x={260} y={100} width={WALL} height={40} fill="rgba(255,255,255,0.03)" />
              {/* Door arc */}
              <path d="M 268 100 A 40 40 0 0 1 268 140" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Master Bath → Hallway (horizontal wall at y=170, gap) */}
              <rect x={340} y={170} width={40} height={WALL} fill="url(#tileFloor)" />
              <rect x={340} y={170} width={40} height={WALL} fill="rgba(255,255,255,0.03)" />
              <path d="M 340 178 A 40 40 0 0 0 380 178" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Bedroom 2 → Hallway (vertical wall at x=220, gap) */}
              <rect x={220} y={290} width={WALL} height={40} fill="url(#carpetFloor)" />
              <rect x={220} y={290} width={WALL} height={40} fill="rgba(255,255,255,0.03)" />
              <path d="M 228 290 A 40 40 0 0 1 228 330" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Bedroom 3 → Hallway (vertical wall at x=220, gap) */}
              <rect x={220} y={460} width={WALL} height={40} fill="url(#carpetFloor)" />
              <rect x={220} y={460} width={WALL} height={40} fill="rgba(255,255,255,0.03)" />
              <path d="M 228 460 A 40 40 0 0 1 228 500" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Study → Hallway (vertical wall at x=480, gap) */}
              <rect x={480} y={100} width={WALL} height={40} fill="url(#studyFloor)" />
              <rect x={480} y={100} width={WALL} height={40} fill="rgba(255,255,255,0.03)" />
              <path d="M 480 100 A 40 40 0 0 0 480 140" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Bathroom 2 → Hallway (vertical wall at x=480, gap) */}
              <rect x={480} y={260} width={WALL} height={35} fill="url(#tileFloor)" />
              <rect x={480} y={260} width={WALL} height={35} fill="rgba(255,255,255,0.03)" />
              <path d="M 480 260 A 35 35 0 0 0 480 295" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />

              {/* Door: Kitchen → Hallway (vertical wall at x=480, gap) */}
              <rect x={480} y={430} width={WALL} height={40} fill="url(#kitchenFloor)" />
              <rect x={480} y={430} width={WALL} height={40} fill="rgba(255,255,255,0.03)" />
              <path d="M 480 430 A 40 40 0 0 0 480 470" fill="none" stroke="#666" strokeWidth="0.8" strokeDasharray="2,2" />
            </g>

            {/* ========== FURNITURE ========== */}
            <g opacity="0.7">
              {/* === Master Bedroom (Room 1) === */}
              {/* King bed */}
              <rect x={70} y={70} width={90} height={110} rx={4} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1.5" />
              <rect x={75} y={80} width={80} height={90} rx={3} fill="#4a6b8a" stroke="#5a7b9a" strokeWidth="0.5" />
              {/* Pillows */}
              <rect x={80} y={82} width={30} height={18} rx={8} fill="#c8d8e8" stroke="#a0b8cc" strokeWidth="0.5" />
              <rect x={120} y={82} width={30} height={18} rx={8} fill="#c8d8e8" stroke="#a0b8cc" strokeWidth="0.5" />
              {/* Nightstand left */}
              <rect x={50} y={100} width={16} height={16} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="0.8" />
              {/* Nightstand right */}
              <rect x={164} y={100} width={16} height={16} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="0.8" />
              {/* Dresser */}
              <rect x={190} y={185} width={60} height={22} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1" />
              {/* Lamp circles on nightstands */}
              <circle cx={58} cy={108} r={4} fill="#ffcc44" opacity="0.4" />
              <circle cx={172} cy={108} r={4} fill="#ffcc44" opacity="0.4" />
              {/* Rug under bed */}
              <rect x={60} y={150} width={110} height={40} rx={6} fill="#5a3a2a" opacity="0.35" />

              {/* === Bedroom 2 (Room 2) === */}
              {/* Double bed */}
              <rect x={60} y={270} width={75} height={95} rx={3} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1.2" />
              <rect x={64} y={278} width={67} height={78} rx={2} fill="#6a4a6a" stroke="#7a5a7a" strokeWidth="0.5" />
              {/* Pillow */}
              <rect x={74} y={280} width={48} height={14} rx={6} fill="#d8c8d8" stroke="#b8a8b8" strokeWidth="0.5" />
              {/* Desk */}
              <rect x={155} y={260} width={50} height={25} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="0.8" />
              {/* Chair at desk */}
              <circle cx={180} cy={298} r={8} fill="#444" stroke="#555" strokeWidth="0.5" />
              {/* Wardrobe */}
              <rect x={50} y={375} width={50} height={18} rx={2} fill="#2a1d14" stroke="#4a3020" strokeWidth="1" />

              {/* === Bedroom 3 (Room 3) === */}
              {/* Single bed */}
              <rect x={55} y={445} width={60} height={90} rx={3} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1.2" />
              <rect x={59} y={452} width={52} height={74} rx={2} fill="#4a8a4a" stroke="#5a9a5a" strokeWidth="0.5" />
              {/* Pillow */}
              <rect x={67} y={454} width={36} height={12} rx={6} fill="#c8e8c8" stroke="#a8c8a8" strokeWidth="0.5" />
              {/* Bookshelf */}
              <rect x={140} y={430} width={55} height={14} rx={1} fill="#2a1d14" stroke="#4a3020" strokeWidth="0.8" />
              <rect x={140} y={448} width={55} height={14} rx={1} fill="#2a1d14" stroke="#4a3020" strokeWidth="0.8" />
              {/* Small rug */}
              <ellipse cx={100} cy={530} rx={35} ry={15} fill="#6a4a3a" opacity="0.3" />

              {/* === Study (Room 4) === */}
              {/* L-shaped desk */}
              <rect x={520} y={55} width={80} height={25} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1" />
              <rect x={570} y={55} width={25} height={70} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1" />
              {/* Monitor on desk */}
              <rect x={535} y={58} width={25} height={18} rx={1} fill="#222" stroke="#444" strokeWidth="0.8" />
              <rect x={545} y={76} width={5} height={4} fill="#333" />
              {/* Office chair */}
              <circle cx={548} cy={95} r={10} fill="#333" stroke="#555" strokeWidth="0.5" />
              {/* Bookcase */}
              <rect x={640} y={55} width={25} height={80} rx={2} fill="#2a1d14" stroke="#4a3020" strokeWidth="1" />
              {/* Books on bookcase */}
              <rect x={643} y={58} width={6} height={12} fill="#8a4444" />
              <rect x={650} y={58} width={5} height={12} fill="#44648a" />
              <rect x={656} y={58} width={6} height={12} fill="#4a8a44" />
              {/* Filing cabinet */}
              <rect x={520} y={155} width={30} height={25} rx={2} fill="#555" stroke="#666" strokeWidth="0.8" />

              {/* === Master Bath (Room 5) === */}
              {/* Bathtub */}
              <rect x={300} y={55} width={80} height={40} rx={15} fill="#e0e0e0" stroke="#bbb" strokeWidth="1.5" />
              <rect x={308} y={60} width={64} height={30} rx={12} fill="#b8d8e8" stroke="#a0c0d0" strokeWidth="0.5" />
              {/* Toilet */}
              <ellipse cx={430} cy={80} rx={12} ry={16} fill="#e8e8e8" stroke="#ccc" strokeWidth="1" />
              <rect x={422} y={62} width={16} height={10} rx={3} fill="#e0e0e0" stroke="#ccc" strokeWidth="0.5" />
              {/* Vanity / double sink */}
              <rect x={300} y={120} width={90} height={20} rx={3} fill="#d4c8b8" stroke="#b8a898" strokeWidth="1" />
              {/* Sinks */}
              <ellipse cx={325} cy={130} rx={10} ry={6} fill="#ddd" stroke="#bbb" strokeWidth="0.5" />
              <ellipse cx={365} cy={130} rx={10} ry={6} fill="#ddd" stroke="#bbb" strokeWidth="0.5" />
              {/* Mirror above vanity */}
              <rect x={310} y={110} width={70} height={6} rx={2} fill="#88aacc" opacity="0.5" />
              {/* Shower area indicator */}
              <rect x={420} y={110} width={45} height={45} rx={2} fill="none" stroke="#aaa" strokeWidth="1" strokeDasharray="3,2" />
              <text x={442} y={137} textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">SHOWER</text>

              {/* === Bathroom 2 (Room 6) === */}
              {/* Toilet */}
              <ellipse cx={530} cy={260} rx={10} ry={14} fill="#e8e8e8" stroke="#ccc" strokeWidth="1" />
              <rect x={523} y={244} width={14} height={8} rx={3} fill="#e0e0e0" stroke="#ccc" strokeWidth="0.5" />
              {/* Sink */}
              <rect x={580} y={238} width={40} height={18} rx={3} fill="#d4c8b8" stroke="#b8a898" strokeWidth="0.8" />
              <ellipse cx={600} cy={247} rx={10} ry={5} fill="#ddd" stroke="#bbb" strokeWidth="0.5" />
              {/* Shower/tub */}
              <rect x={570} y={280} width={70} height={50} rx={8} fill="#e0e0e0" stroke="#bbb" strokeWidth="1" />
              <rect x={576} y={286} width={58} height={38} rx={6} fill="#b8d8e8" stroke="#a0c0d0" strokeWidth="0.5" />

              {/* === Kitchen (Room 7) === */}
              {/* Counter / island */}
              <rect x={540} y={410} width={100} height={30} rx={3} fill="#5a4a3a" stroke="#6a5a4a" strokeWidth="1" />
              {/* Stovetop circles */}
              <circle cx={560} cy={425} r={6} fill="none" stroke="#888" strokeWidth="1" />
              <circle cx={580} cy={425} r={6} fill="none" stroke="#888" strokeWidth="1" />
              <circle cx={600} cy={425} r={5} fill="none" stroke="#888" strokeWidth="0.8" />
              <circle cx={620} cy={425} r={5} fill="none" stroke="#888" strokeWidth="0.8" />
              {/* Fridge */}
              <rect x={645} y={380} width={25} height={45} rx={3} fill="#c0c0c0" stroke="#aaa" strokeWidth="1" />
              <rect x={645} y={380} width={25} height={22} rx={3} fill="#d0d0d0" stroke="#aaa" strokeWidth="0.5" />
              <rect x={655} y={390} width={3} height={8} rx={1} fill="#999" />
              <rect x={655} y={410} width={3} height={8} rx={1} fill="#999" />
              {/* Sink */}
              <rect x={520} y={470} width={50} height={20} rx={3} fill="#d4c8b8" stroke="#b8a898" strokeWidth="0.8" />
              <ellipse cx={545} cy={480} rx={12} ry={6} fill="#ddd" stroke="#bbb" strokeWidth="0.5" />
              {/* Dining table */}
              <rect x={570} y={490} width={70} height={45} rx={4} fill="#3d2b1f" stroke="#5a4030" strokeWidth="1" />
              {/* Chairs around table */}
              <circle cx={575} cy={512} r={6} fill="#444" stroke="#555" strokeWidth="0.5" />
              <circle cx={635} cy={512} r={6} fill="#444" stroke="#555" strokeWidth="0.5" />
              <circle cx={605} cy={494} r={6} fill="#444" stroke="#555" strokeWidth="0.5" />
              <circle cx={605} cy={530} r={6} fill="#444" stroke="#555" strokeWidth="0.5" />

              {/* === Hallway (visual only, not a room) === */}
              {/* Runner rug */}
              <rect x={320} y={210} width={80} height={330} rx={4} fill="#5a3a2a" opacity="0.25" />
              {/* Console table */}
              <rect x={300} y={520} width={60} height={16} rx={2} fill="#3d2b1f" stroke="#5a4030" strokeWidth="0.8" />
              {/* Wall art */}
              <rect x={440} y={400} width={20} height={28} rx={1} fill="#334" stroke="#556" strokeWidth="0.8" />
              <rect x={442} y={402} width={16} height={24} rx={0.5} fill="#667788" opacity="0.5" />
              {/* Hanging light (circle) */}
              <circle cx={360} cy={375} r={12} fill="none" stroke="#887744" strokeWidth="1" />
              <circle cx={360} cy={375} r={3} fill="#ffcc44" opacity="0.6" />
            </g>

            {/* ========== ROOM INTERACTIVE OVERLAYS ========== */}
            {rooms.map((room) => (
              <Room
                key={room.id}
                room={room}
                isSelected={selectedRoom === room.id}
                onClick={() => {
                  selectRoom(room.id)
                  if (onRoomClick && gamePhase === 'betting') {
                    onRoomClick(room.id)
                  }
                }}
              />
            ))}

            {/* ========== DIMENSION LINES ========== */}
            <g stroke="#555" strokeWidth="0.5" opacity="0.4">
              {/* Top dimension */}
              <line x1={40} y1={22} x2={680} y2={22} />
              <line x1={40} y1={18} x2={40} y2={26} />
              <line x1={680} y1={18} x2={680} y2={26} />
              <text x={360} y={18} textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">16.0m</text>

              {/* Left dimension */}
              <line x1={22} y1={40} x2={22} y2={560} />
              <line x1={18} y1={40} x2={26} y2={40} />
              <line x1={18} y1={560} x2={26} y2={560} />
              <text x={18} y={300} textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace" transform="rotate(-90, 18, 300)">13.0m</text>
            </g>

            {/* ========== KILLER ========== */}
            <Killer
              position={killerPosition}
              isKnocking={gamePhase === 'knocking' && killerKnockingRoom !== null}
              isKilling={gamePhase === 'killing' && isKilling}
            />

            {/* ========== HIDING PERSONS (from multiplayer positions + local bets) ========== */}
            {rooms.map(room => {
              // Count players from realtime multiplayer positions
              const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)
              // Count from local bets as fallback (for players whose positions haven't synced yet)
              const betCount = room.freeBets.length + room.gamblingBets.length
              // Use the greater of the two to ensure all players are shown
              const totalPersons = Math.max(playersInRoom.length, betCount)
              if (totalPersons === 0) return null
              return (
                <g key={`persons-${room.id}`}>
                  {Array.from({ length: Math.min(totalPersons, 6) }).map((_, idx) => (
                    <HidingPerson
                      key={`person-${room.id}-${idx}`}
                      roomX={room.x}
                      roomY={room.y}
                      roomWidth={room.width}
                      roomHeight={room.height}
                      personIndex={idx}
                      isKilled={killerKillRoom === room.id && isKilling}
                    />
                  ))}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
