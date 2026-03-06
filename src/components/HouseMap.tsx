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
    <div className="relative w-full h-full bg-void">
      {/* 3D Floor Plan container with isometric tilt */}
      <div
        className="floor-plan-3d w-full h-full flex items-center justify-center relative overflow-hidden"
        style={{ perspective: '1500px' }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(138,3,3,0.05)_0%,rgba(5,5,5,1)_80%)] pointer-events-none" />
        
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-1000"
          style={{
            transform: gamePhase === 'killing' ? 'rotateX(20deg) rotateZ(0deg) scale(1.05)' : 'rotateX(18deg) rotateZ(-1deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            viewBox="0 0 720 600"
            className={`w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,1)] ${gamePhase === 'killing' ? 'animate-glitch' : ''}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Dark Wood floor pattern */}
              <pattern id="woodFloor" width="40" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                <rect width="40" height="8" fill="#1c1412" />
                <rect width="40" height="1" y="7" fill="#0a0505" opacity="0.8" />
                <rect width="1" height="8" x="20" fill="#0a0505" opacity="0.6" />
              </pattern>

              {/* Bloody Tile pattern for bathrooms */}
              <pattern id="tileFloor" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#151515" />
                <rect width="15" height="15" x="0.5" y="0.5" fill="#1f1f1f" />
                <circle cx="8" cy="8" r="2" fill="#2a0000" opacity="0.4" />
              </pattern>

              {/* Dark Carpet pattern for bedrooms */}
              <pattern id="carpetFloor" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#161618" />
                <circle cx="2" cy="2" r="0.5" fill="#222228" />
              </pattern>

              {/* Hallway floor */}
              <pattern id="hallwayFloor" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill="#121212" />
                <rect width="14" height="14" x="0" y="0" fill="#1a1a1a" />
                <rect width="14" height="14" x="15" y="15" fill="#1a1a1a" />
              </pattern>

              {/* Wall shadow (3D depth) */}
              <filter id="wallShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#000000" floodOpacity="1" />
              </filter>

              {/* Glow for selected rooms */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Ground shadow under the house */}
            <rect x="30" y="30" width="660" height="540" fill="#000" filter="url(#wallShadow)" />

            {/* ========== ROOM FLOORS ========== */}

            {/* Master Bedroom floor */}
            <rect x={40} y={40} width={220} height={180} fill="url(#carpetFloor)" />

            {/* Bedroom 2 floor */}
            <rect x={40} y={240} width={180} height={160} fill="url(#carpetFloor)" />

            {/* Bedroom 3 floor */}
            <rect x={40} y={420} width={180} height={140} fill="url(#carpetFloor)" />

            {/* Study floor */}
            <rect x={500} y={40} width={180} height={160} fill="url(#woodFloor)" />

            {/* Master Bath floor */}
            <rect x={280} y={40} width={200} height={130} fill="url(#tileFloor)" />

            {/* Bathroom 2 floor */}
            <rect x={500} y={220} width={180} height={120} fill="url(#tileFloor)" />

            {/* Kitchen floor */}
            <rect x={500} y={360} width={180} height={200} fill="url(#tileFloor)" />

            {/* Hallway floor */}
            <rect x={240} y={190} width={240} height={370} fill="url(#hallwayFloor)" />

            {/* Splatters and environment details */}
            <g opacity="0.4">
              <path d="M 280 250 Q 300 240 320 260 T 350 280" fill="none" stroke="#8a0303" strokeWidth="2" strokeDasharray="5,10" />
              <path d="M 450 400 Q 470 420 440 450" fill="none" stroke="#8a0303" strokeWidth="3" strokeDasharray="2,15" />
              <circle cx="260" cy="200" r="15" fill="#8a0303" filter="blur(4px)" />
              <circle cx="480" cy="350" r="25" fill="#8a0303" filter="blur(6px)" />
            </g>

            {/* ========== WALLS (Dark, sharp) ========== */}
            <g>
              {/* Outer walls */}
              <rect x={32} y={32} width={656} height={WALL} fill="#2a2a2a" stroke="#444" strokeWidth="1" />
              <rect x={32} y={560} width={656} height={WALL} fill="#2a2a2a" stroke="#444" strokeWidth="1" />
              <rect x={32} y={32} width={WALL} height={536} fill="#2a2a2a" stroke="#444" strokeWidth="1" />
              <rect x={680} y={32} width={WALL} height={536} fill="#2a2a2a" stroke="#444" strokeWidth="1" />

              {/* Interior walls */}
              <rect x={32} y={220} width={228} height={WALL} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={32} y={400} width={208} height={WALL} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={260} y={170} width={220} height={WALL} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={480} y={200} width={208} height={WALL} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={480} y={340} width={208} height={WALL} fill="#1f1f1f" stroke="#333" strokeWidth="1" />

              <rect x={260} y={32} width={WALL} height={148} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={220} y={220} width={WALL} height={348} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={480} y={32} width={WALL} height={316} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
              <rect x={480} y={348} width={WALL} height={220} fill="#1f1f1f" stroke="#333" strokeWidth="1" />
            </g>

            {/* ========== DOOR OPENINGS ========== */}
            <g>
              <rect x={260} y={100} width={WALL} height={40} fill="url(#carpetFloor)" />
              <path d="M 268 100 A 40 40 0 0 1 268 140" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={340} y={170} width={40} height={WALL} fill="url(#tileFloor)" />
              <path d="M 340 178 A 40 40 0 0 0 380 178" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={220} y={290} width={WALL} height={40} fill="url(#carpetFloor)" />
              <path d="M 228 290 A 40 40 0 0 1 228 330" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={220} y={460} width={WALL} height={40} fill="url(#carpetFloor)" />
              <path d="M 228 460 A 40 40 0 0 1 228 500" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={480} y={100} width={WALL} height={40} fill="url(#studyFloor)" />
              <path d="M 480 100 A 40 40 0 0 0 480 140" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={480} y={260} width={WALL} height={35} fill="url(#tileFloor)" />
              <path d="M 480 260 A 35 35 0 0 0 480 295" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />

              <rect x={480} y={430} width={WALL} height={40} fill="url(#tileFloor)" />
              <path d="M 480 430 A 40 40 0 0 0 480 470" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />
            </g>

            {/* ========== HIGHLY DETAILED DARK FURNITURE ========== */}
            <g opacity="0.9">
              {/* === Master Bedroom (Room 1) === */}
              {/* King bed */}
              <rect x={70} y={70} width={90} height={110} rx={2} fill="#2a1f1f" stroke="#4a1515" strokeWidth="1.5" />
              <rect x={75} y={80} width={80} height={90} rx={1} fill="#3a2525" stroke="#5a1515" strokeWidth="0.5" />
              {/* Messy Sheets */}
              <path d="M 80 120 Q 100 110 130 140 T 150 160" fill="none" stroke="#553333" strokeWidth="2" />
              {/* Pillows */}
              <rect x={80} y={82} width={30} height={18} rx={2} fill="#4a3a3a" stroke="#664444" strokeWidth="0.5" />
              <rect x={120} y={82} width={30} height={18} rx={2} fill="#4a3a3a" stroke="#664444" strokeWidth="0.5" />
              {/* Blood splatter on bed */}
              <circle cx={130} cy={120} r={12} fill="#a30000" opacity="0.8" filter="blur(1px)" />
              <path d="M 130 120 Q 140 140 160 150" fill="none" stroke="#a30000" strokeWidth="3" opacity="0.8" />
              {/* Nightstand left */}
              <rect x={50} y={100} width={16} height={16} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Nightstand right */}
              <rect x={164} y={100} width={16} height={16} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Dresser */}
              <rect x={190} y={185} width={60} height={22} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Lamp circles on nightstands */}
              <circle cx={58} cy={108} r={4} fill="#ff3333" opacity="0.6" />
              <circle cx={172} cy={108} r={4} fill="#ff3333" opacity="0.6" />
              {/* Rug under bed */}
              <rect x={60} y={150} width={110} height={40} rx={2} fill="#1a1515" stroke="#2a1a1a" opacity="0.9" />
              {/* Bloody Drag Marks */}
              <path d="M 180 140 Q 200 150 240 130" fill="none" stroke="#8a0303" strokeWidth="5" opacity="0.7" strokeDasharray="10, 5" />

              {/* === Bedroom 2 (Room 2) === */}
              {/* Double bed */}
              <rect x={60} y={270} width={75} height={95} rx={2} fill="#222" stroke="#444" strokeWidth="1.2" />
              <rect x={64} y={278} width={67} height={78} rx={1} fill="#2a2a2a" stroke="#555" strokeWidth="0.5" />
              {/* Pillow */}
              <rect x={74} y={280} width={48} height={14} rx={2} fill="#3a3a3a" stroke="#666" strokeWidth="0.5" />
              {/* Desk */}
              <rect x={155} y={260} width={50} height={25} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Chair at desk (knocked over) */}
              <circle cx={190} cy={300} r={8} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              <line x1={185} y1={295} x2={195} y2={305} stroke="#444" strokeWidth="2" />
              {/* Overturned item / mess */}
              <rect x={130} y={320} width={20} height={12} fill="#1a1a1a" stroke="#444" transform="rotate(25 130 320)" />
              {/* Wardrobe (doors slightly open) */}
              <rect x={50} y={375} width={50} height={18} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              <line x1={75} y1={375} x2={70} y2={393} stroke="#111" strokeWidth="2" />
              {/* Bloody Handprint / Smudge */}
              <circle cx={80} cy={350} r={6} fill="#a30000" opacity="0.7" filter="blur(1px)" />

              {/* === Bedroom 3 (Room 3) === */}
              {/* Single bed */}
              <rect x={55} y={445} width={60} height={90} rx={2} fill="#222" stroke="#444" strokeWidth="1.2" />
              <rect x={59} y={452} width={52} height={74} rx={1} fill="#2a2a2a" stroke="#555" strokeWidth="0.5" />
              {/* Pillow */}
              <rect x={67} y={454} width={36} height={12} rx={2} fill="#3a3a3a" stroke="#666" strokeWidth="0.5" />
              {/* Bookshelf (books fallen) */}
              <rect x={140} y={430} width={55} height={14} rx={0.5} fill="#222" stroke="#444" strokeWidth="1" />
              <rect x={140} y={448} width={55} height={14} rx={0.5} fill="#222" stroke="#444" strokeWidth="1" />
              <line x1={150} y1={465} x2={160} y2={470} stroke="#666" strokeWidth="3" />
              <line x1={155} y1={462} x2={165} y2={468} stroke="#555" strokeWidth="3" />
              {/* Small rug */}
              <ellipse cx={100} cy={530} rx={35} ry={15} fill="#1a1a1a" stroke="#2a2a2a" opacity="0.9" />
              <path d="M 70 530 Q 100 520 120 540" fill="none" stroke="#660000" strokeWidth="4" opacity="0.7" />

              {/* === Study (Room 4) === */}
              {/* L-shaped desk */}
              <rect x={520} y={55} width={80} height={25} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              <rect x={570} y={55} width={25} height={70} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Monitor on desk (broken screen) */}
              <rect x={535} y={58} width={25} height={18} rx={1} fill="#111" stroke="#333" strokeWidth="1" />
              <path d="M 540 60 L 555 70 M 545 75 L 550 65" stroke="#aaa" strokeWidth="1" opacity="0.7" />
              <rect x={545} y={76} width={5} height={4} fill="#333" />
              {/* Office chair */}
              <circle cx={548} cy={95} r={10} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              {/* Bookcase */}
              <rect x={640} y={55} width={25} height={80} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Books on bookcase */}
              <rect x={643} y={58} width={6} height={12} fill="#600000" />
              <rect x={650} y={58} width={5} height={12} fill="#2a2a2a" />
              <rect x={656} y={58} width={6} height={12} fill="#3a3a3a" />
              {/* Filing cabinet */}
              <rect x={520} y={155} width={30} height={25} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Bloody footprint */}
              <ellipse cx={510} cy={120} rx={4} ry={8} fill="#a30000" opacity="0.8" transform="rotate(45 510 120)" />

              {/* === Master Bath (Room 5) === */}
              {/* Bathtub (Filled with blood/grime) */}
              <rect x={300} y={55} width={80} height={40} rx={8} fill="#222" stroke="#555" strokeWidth="1.5" />
              <rect x={308} y={60} width={64} height={30} rx={6} fill="#4a0000" stroke="#660000" strokeWidth="1" opacity="0.9" />
              {/* Blood trail from tub */}
              <path d="M 340 90 Q 350 110 370 115" fill="none" stroke="#a30000" strokeWidth="4" opacity="0.9" />
              {/* Toilet */}
              <ellipse cx={430} cy={80} rx={12} ry={16} fill="#222" stroke="#555" strokeWidth="1" />
              <rect x={422} y={62} width={16} height={10} rx={2} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              {/* Vanity / double sink */}
              <rect x={300} y={120} width={90} height={20} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Sinks */}
              <ellipse cx={325} cy={130} rx={10} ry={6} fill="#111" stroke="#333" strokeWidth="1" />
              <ellipse cx={365} cy={130} rx={10} ry={6} fill="#4a0000" stroke="#660000" strokeWidth="1" /> {/* Bloody sink */}
              {/* Mirror above vanity (cracked/bloody) */}
              <rect x={310} y={110} width={70} height={6} rx={1} fill="#2a2a2a" opacity="0.9" />
              <path d="M 330 110 L 335 116 M 350 110 L 345 116" fill="none" stroke="#000" strokeWidth="1" />
              <circle cx={365} cy={113} r={3} fill="#cc0000" opacity="0.8" />
              {/* Shower area indicator */}
              <rect x={420} y={110} width={45} height={45} rx={1} fill="none" stroke="#666" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x={442} y={137} textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">SHOWER</text>

              {/* === Bathroom 2 (Room 6) === */}
              {/* Toilet */}
              <ellipse cx={530} cy={260} rx={10} ry={14} fill="#222" stroke="#555" strokeWidth="1" />
              <rect x={523} y={244} width={14} height={8} rx={2} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              {/* Sink */}
              <rect x={580} y={238} width={40} height={18} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              <ellipse cx={600} cy={247} rx={10} ry={5} fill="#111" stroke="#333" strokeWidth="1" />
              {/* Shower/tub */}
              <rect x={570} y={280} width={70} height={50} rx={4} fill="#222" stroke="#555" strokeWidth="1" />
              <rect x={576} y={286} width={58} height={38} rx={3} fill="#111" stroke="#333" strokeWidth="1" />
              {/* Grime/Blood */}
              <circle cx={550} cy={310} r={8} fill="#600000" opacity="0.7" filter="blur(2px)" />

              {/* === Kitchen (Room 7) === */}
              {/* Counter / island */}
              <rect x={540} y={410} width={100} height={30} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Stovetop circles */}
              <circle cx={560} cy={425} r={6} fill="none" stroke="#777" strokeWidth="1" />
              <circle cx={580} cy={425} r={6} fill="none" stroke="#777" strokeWidth="1" />
              <circle cx={600} cy={425} r={5} fill="none" stroke="#777" strokeWidth="1" />
              <circle cx={620} cy={425} r={5} fill="none" stroke="#777" strokeWidth="1" />
              {/* Fridge (Left Open) */}
              <rect x={645} y={380} width={25} height={45} rx={1} fill="#2a2a2a" stroke="#555" strokeWidth="1" />
              <rect x={645} y={380} width={25} height={22} rx={1} fill="#3a3a3a" stroke="#666" strokeWidth="1" />
              <line x1={645} y1={380} x2={625} y2={390} stroke="#555" strokeWidth="2" /> {/* Open door */}
              <rect x={655} y={390} width={3} height={8} rx={0.5} fill="#111" />
              <rect x={655} y={410} width={3} height={8} rx={0.5} fill="#111" />
              {/* Sink */}
              <rect x={520} y={470} width={50} height={20} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              <ellipse cx={545} cy={480} rx={12} ry={6} fill="#4a0000" stroke="#660000" strokeWidth="1" />
              {/* Dining table */}
              <rect x={570} y={490} width={70} height={45} rx={2} fill="#2a2a2a" stroke="#555" strokeWidth="1" />
              {/* Bloody Table cloth / marks */}
              <path d="M 580 490 L 600 510 L 620 490" fill="none" stroke="#a30000" strokeWidth="5" opacity="0.8" />
              {/* Chairs around table */}
              <circle cx={575} cy={512} r={6} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              <circle cx={635} cy={512} r={6} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              <circle cx={605} cy={494} r={6} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              {/* Knocked over chair */}
              <circle cx={610} cy={540} r={6} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
              <line x1={605} y1={535} x2={615} y2={545} stroke="#444" strokeWidth="2" />

              {/* === Hallway (visual only, not a room) === */}
              {/* Runner rug */}
              <rect x={320} y={210} width={80} height={330} rx={2} fill="#1a1111" stroke="#2a1a1a" opacity="0.9" />
              {/* Console table */}
              <rect x={300} y={520} width={60} height={16} rx={1} fill="#222" stroke="#444" strokeWidth="1" />
              {/* Wall art (crooked) */}
              <g transform="rotate(-15 450 414)">
                <rect x={440} y={400} width={20} height={28} rx={0.5} fill="#1a1a1a" stroke="#444" strokeWidth="1" />
                <rect x={442} y={402} width={16} height={24} rx={0.5} fill="#2a2a2a" />
              </g>
              {/* Hanging light (circle) */}
              <circle cx={360} cy={375} r={12} fill="none" stroke="#555" strokeWidth="1" />
              <circle cx={360} cy={375} r={3} fill="#ff3333" opacity="0.8" /> {/* Eerie red light */}
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

            {/* ========== DIMENSION LINES (Minimal) ========== */}
            <g stroke="#333" strokeWidth="0.5" opacity="0.2">
              <line x1={40} y1={22} x2={680} y2={22} />
              <line x1={40} y1={18} x2={40} y2={26} />
              <line x1={680} y1={18} x2={680} y2={26} />
              
              <line x1={22} y1={40} x2={22} y2={560} />
              <line x1={18} y1={40} x2={26} y2={40} />
              <line x1={18} y1={560} x2={26} y2={560} />
            </g>

            {/* ========== KILLER ========== */}
            <Killer
              position={killerPosition}
              isKnocking={gamePhase === 'knocking' && killerKnockingRoom !== null}
              isKilling={gamePhase === 'killing' && isKilling}
            />

            {/* ========== HIDING PERSONS (from multiplayer positions + local bets) ========== */}
            {rooms.map(room => {
              const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)
              const betCount = room.freeBets.length + room.gamblingBets.length
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
