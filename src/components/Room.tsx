'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGame, Room as RoomType } from '@/context/GameContext'

interface RoomProps {
  room: RoomType
  isSelected: boolean
  onClick: () => void
}

export function Room({ room, isSelected, onClick }: RoomProps) {
  const { getTotalGamblingBetsForRoom, getFreeBetCountForRoom, killerTargetRoom, killer2TargetRoom, killerKnockingRoom, killer2KnockingRoom, isRoomKilled, survivingRoom, killSequence, killStep, gamePhase, isKilling, playerPositions } = useGame()
  const totalGambling = getTotalGamblingBetsForRoom(room.id)
  const freeCount = getFreeBetCountForRoom(room.id)
  const isKillerHere = killerTargetRoom === room.id || killer2TargetRoom === room.id
  const isBeingKnocked = killerKnockingRoom === room.id || killer2KnockingRoom === room.id
  // Currently being killed RIGHT NOW at this step
  const isActiveKill = gamePhase === 'killing' && isKilling && killStep >= 0 && killStep < killSequence.length && killSequence[killStep]?.roomId === room.id
  // Already dead from a previous step
  const isAlreadyDead = isRoomKilled(room.id) && !isActiveKill
  const isBeingKilled = isActiveKill
  // Only show surviving room after all kills complete or during result
  const allKillsDone = killStep >= killSequence.length
  const isSurviving = survivingRoom === room.id && (gamePhase === 'result' || (gamePhase === 'killing' && allKillsDone))
  const canClick = gamePhase === 'betting'
  
  const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)

  const overlayFill = isSurviving
    ? 'rgba(0, 255, 100, 0.25)'
    : isActiveKill
    ? 'rgba(255, 0, 0, 0.4)'
    : isAlreadyDead
    ? 'rgba(80, 0, 0, 0.5)'
    : isBeingKnocked
    ? 'rgba(138, 3, 3, 0.2)'
    : isKillerHere
    ? 'rgba(255, 26, 26, 0.2)'
    : isSelected
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(5, 5, 5, 0.3)'

  const hoverFill = canClick
    ? 'rgba(255, 255, 255, 0.05)'
    : overlayFill

  const borderColor = isSurviving
    ? '#00ff66'
    : isActiveKill
    ? '#ff0000'
    : isAlreadyDead
    ? '#4a0000'
    : isBeingKnocked
    ? '#8a0303'
    : isKillerHere
    ? '#ff1a1a'
    : isSelected
    ? '#ffffff'
    : 'rgba(255,255,255,0.08)'

  const labelCx = room.x + room.width / 2
  const labelCy = room.y + room.height / 2

  return (
    <motion.g
      onClick={canClick ? onClick : undefined}
      style={{ cursor: canClick ? 'pointer' : 'default' }}
    >
      {/* Invisible hitbox */}
      <rect
        x={room.x} y={room.y}
        width={room.width} height={room.height}
        fill="transparent"
      />

      {/* Interactive overlay */}
      <motion.rect
        x={room.x + 1} y={room.y + 1}
        width={room.width - 2} height={room.height - 2}
        rx={0} // Sharp corners for horror
        fill={overlayFill}
        stroke={borderColor}
        strokeWidth={isSelected || isKillerHere || isBeingKnocked || isBeingKilled ? 1.5 : 0.5}
        filter={isSelected || isBeingKilled ? 'url(#glow)' : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={canClick ? { fill: hoverFill } : undefined}
      />

      {/* Noise overlay on room when selected or targeted */}
      {(isSelected || isBeingKnocked || isBeingKilled) && (
        <rect
          x={room.x + 1} y={room.y + 1}
          width={room.width - 2} height={room.height - 2}
          fill="url(#noiseFilter)"
          opacity="0.1"
          style={{ mixBlendMode: 'overlay' }}
          pointerEvents="none"
        />
      )}

      {/* Room number badge */}
      <g>
        <rect
          x={room.x + 8} y={room.y + 8}
          width={22} height={22} rx={0}
          fill={isBeingKilled ? '#8a0303' : isBeingKnocked ? '#3e0000' : isKillerHere ? '#cc0000' : isSelected ? '#ffffff' : 'rgba(5,5,5,0.8)'}
          stroke={isBeingKilled ? '#ff1a1a' : isBeingKnocked ? '#8a0303' : isKillerHere ? '#ff1a1a' : isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)'}
          strokeWidth={1}
        />
        <text
          x={room.x + 19} y={room.y + 23}
          textAnchor="middle"
          fill={isBeingKilled ? '#ffffff' : isBeingKnocked ? '#ff1a1a' : isKillerHere ? '#ffffff' : isSelected ? '#050505' : 'rgba(255,255,255,0.7)'}
          fontSize="11" fontFamily="monospace" fontWeight="bold"
        >
          {room.id}
        </text>
      </g>

      {/* Room name label */}
      <g>
        <rect
          x={labelCx - room.name.length * 3.5 - 6} y={labelCy - 8}
          width={room.name.length * 7 + 12} height={16} rx={0}
          fill="rgba(5,5,5,0.8)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <text
          x={labelCx} y={labelCy + 4}
          textAnchor="middle"
          fill={isBeingKilled ? '#ff1a1a' : isBeingKnocked ? '#8a0303' : isKillerHere ? '#ff1a1a' : isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)'}
          fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="1"
        >
          {room.name.toUpperCase()}
        </text>
      </g>

      {/* Gambling bet pill */}
      {totalGambling > 0 && (
        <g>
          <rect
            x={room.x + room.width - 56} y={room.y + room.height - 22}
            width={50} height={16} rx={0}
            fill="rgba(5,5,5,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
          />
          <text
            x={room.x + room.width - 31} y={room.y + room.height - 11}
            textAnchor="middle" fill="#ffffff"
            fontSize="8" fontFamily="monospace" fontWeight="bold"
          >
            {totalGambling} SOL
          </text>
        </g>
      )}
      {/* Free prediction count pill */}
      {freeCount > 0 && (
        <g>
          <rect
            x={room.x + 8} y={room.y + room.height - 22}
            width={32} height={16} rx={0}
            fill="rgba(5,5,5,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
          />
          <text
            x={room.x + 24} y={room.y + room.height - 11}
            textAnchor="middle" fill="#ffffff"
            fontSize="8" fontFamily="monospace" fontWeight="bold"
          >
            {freeCount} 💀
          </text>
        </g>
      )}

      {/* Player avatars in room */}
      {playersInRoom.map((player: any, index: number) => {
        const avatarX = room.x + 15 + (index * 20)
        const avatarY = room.y + 40
        const shortAddress = player.walletAddress ? player.walletAddress.slice(0, 4) + '...' + player.walletAddress.slice(-4) : '???'
        
        return (
          <g key={player.walletAddress || index}>
            <circle
              cx={avatarX}
              cy={avatarY}
              r={7}
              fill="rgba(5,5,5,0.8)"
              stroke="#ffffff"
              strokeWidth={1}
            />
            <text
              x={avatarX}
              y={avatarY + 3}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
              👤
            </text>
            <rect
              x={avatarX - 18}
              y={avatarY + 12}
              width={36}
              height={10}
              rx={0}
              fill="rgba(5,5,5,0.9)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
            />
            <text
              x={avatarX}
              y={avatarY + 19}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="5"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              {shortAddress}
            </text>
          </g>
        )
      })}

      {/* Knocking indicator — dark blood pulse on room border */}
      {isBeingKnocked && (
        <motion.rect
          x={room.x + 2} y={room.y + 2}
          width={room.width - 4} height={room.height - 4} rx={0}
          fill="none" stroke="#8a0303" strokeWidth={2}
          animate={{ opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Kill room — bright blood pulsing overlay with glitch */}
      {isBeingKilled && (
        <>
          <motion.rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4} rx={0}
            fill="rgba(255,0,0,0.15)" stroke="#ff1a1a" strokeWidth={3}
            animate={{ opacity: [0.8, 0.3, 0.9, 0.2, 0.8], fill: ['rgba(255,0,0,0.25)', 'rgba(255,0,0,0.05)', 'rgba(255,0,0,0.3)', 'rgba(255,0,0,0.05)', 'rgba(255,0,0,0.25)'] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
          />
          {/* Screen shake effect text */}
          <motion.text
            x={labelCx} y={room.y + room.height - 30}
            textAnchor="middle" fill="#ff1a1a"
            fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="2"
            animate={{ opacity: [1, 0.5, 1], x: [labelCx - 3, labelCx + 3, labelCx - 1, labelCx + 2, labelCx] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={{ textShadow: '0 0 10px #ff1a1a' }}
          >
            FATALITY
          </motion.text>
        </>
      )}

      {/* Already dead from previous kill step — dim static overlay */}
      {isAlreadyDead && gamePhase === 'killing' && (
        <>
          <rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4} rx={0}
            fill="rgba(60,0,0,0.4)" stroke="#4a0000" strokeWidth={1.5}
            opacity={0.8}
          />
          <text
            x={labelCx} y={room.y + room.height - 30}
            textAnchor="middle" fill="#6a0000"
            fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2"
            opacity={0.7}
          >
            DEAD
          </text>
        </>
      )}

      {/* Surviving room — green glow pulse */}
      {isSurviving && (
        <>
          <motion.rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4} rx={0}
            fill="rgba(0,255,100,0.08)" stroke="#00ff66" strokeWidth={2}
            animate={{ opacity: [0.9, 0.5, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.text
            x={labelCx} y={room.y + room.height - 30}
            textAnchor="middle" fill="#00ff66"
            fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="2"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ textShadow: '0 0 10px #00ff66' }}
          >
            SURVIVED
          </motion.text>
        </>
      )}
    </motion.g>
  )
}
