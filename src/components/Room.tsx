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
  const { getTotalGamblingBetsForRoom, getFreeBetCountForRoom, killerTargetRoom, killerKnockingRoom, killerKillRoom, gamePhase, isKilling, playerPositions } = useGame()
  const totalGambling = getTotalGamblingBetsForRoom(room.id)
  const freeCount = getFreeBetCountForRoom(room.id)
  const isKillerHere = killerTargetRoom === room.id
  const isBeingKnocked = killerKnockingRoom === room.id
  const isBeingKilled = killerKillRoom === room.id && isKilling
  const canClick = gamePhase === 'betting'
  
  const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)

  const overlayFill = isBeingKilled
    ? 'rgba(255, 0, 0, 0.3)'
    : isBeingKnocked
    ? 'rgba(255, 100, 0, 0.12)'
    : isKillerHere
    ? 'rgba(255, 30, 30, 0.18)'
    : isSelected
    ? 'rgba(0, 212, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.0)'

  const hoverFill = canClick
    ? 'rgba(0, 212, 255, 0.1)'
    : overlayFill

  const borderColor = isBeingKilled
    ? '#ff0000'
    : isBeingKnocked
    ? '#ff6600'
    : isKillerHere
    ? '#ff3333'
    : isSelected
    ? '#00d4ff'
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
        rx={2}
        fill={overlayFill}
        stroke={borderColor}
        strokeWidth={isSelected || isKillerHere || isBeingKnocked || isBeingKilled ? 1.5 : 0.5}
        filter={isSelected ? 'url(#glow)' : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={canClick ? { fill: hoverFill } : undefined}
      />

      {/* Room number badge */}
      <g>
        <rect
          x={room.x + 8} y={room.y + 8}
          width={22} height={22} rx={6}
          fill={isBeingKilled ? '#880000' : isBeingKnocked ? '#884400' : isKillerHere ? '#cc0000' : isSelected ? '#006688' : 'rgba(0,0,0,0.6)'}
          stroke={isBeingKilled ? '#ff0000' : isBeingKnocked ? '#ff6600' : isKillerHere ? '#ff4444' : isSelected ? '#00d4ff' : 'rgba(255,255,255,0.2)'}
          strokeWidth={1}
        />
        <text
          x={room.x + 19} y={room.y + 23}
          textAnchor="middle"
          fill={isBeingKilled ? '#ff4444' : isBeingKnocked ? '#ffaa44' : isKillerHere ? '#ffcccc' : isSelected ? '#00ffff' : 'rgba(255,255,255,0.7)'}
          fontSize="11" fontFamily="monospace" fontWeight="bold"
        >
          {room.id}
        </text>
      </g>

      {/* Room name label */}
      <g>
        <rect
          x={labelCx - room.name.length * 3.5 - 6} y={labelCy - 8}
          width={room.name.length * 7 + 12} height={16} rx={4}
          fill="rgba(0,0,0,0.55)"
        />
        <text
          x={labelCx} y={labelCy + 4}
          textAnchor="middle"
          fill={isBeingKilled ? '#ff4444' : isBeingKnocked ? '#ffaa44' : isKillerHere ? '#ff8888' : isSelected ? '#00e5ff' : 'rgba(255,255,255,0.65)'}
          fontSize="10" fontFamily="monospace" fontWeight="600" letterSpacing="0.5"
        >
          {room.name}
        </text>
      </g>

      {/* Gambling bet pill */}
      {totalGambling > 0 && (
        <g>
          <rect
            x={room.x + room.width - 52} y={room.y + room.height - 22}
            width={46} height={18} rx={9}
            fill="#f59e0b" opacity={0.95}
          />
          <text
            x={room.x + room.width - 29} y={room.y + room.height - 10}
            textAnchor="middle" fill="#0a0a0a"
            fontSize="9" fontFamily="monospace" fontWeight="bold"
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
            width={32} height={18} rx={9}
            fill="#10b981" opacity={0.9}
          />
          <text
            x={room.x + 24} y={room.y + room.height - 10}
            textAnchor="middle" fill="#fff"
            fontSize="8" fontFamily="monospace" fontWeight="bold"
          >
            {freeCount}🎯
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
              r={8}
              fill="#00d4ff"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={avatarX}
              y={avatarY + 3}
              textAnchor="middle"
              fill="#000"
              fontSize="10"
              fontWeight="bold"
            >
              👤
            </text>
            <rect
              x={avatarX - 18}
              y={avatarY + 12}
              width={36}
              height={12}
              rx={3}
              fill="rgba(0,0,0,0.7)"
            />
            <text
              x={avatarX}
              y={avatarY + 20}
              textAnchor="middle"
              fill="#00d4ff"
              fontSize="6"
              fontFamily="monospace"
            >
              {shortAddress}
            </text>
          </g>
        )
      })}

      {/* Knocking indicator — orange pulse on room border */}
      {isBeingKnocked && (
        <motion.rect
          x={room.x + 2} y={room.y + 2}
          width={room.width - 4} height={room.height - 4} rx={2}
          fill="none" stroke="#ff6600" strokeWidth={2}
          animate={{ opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Kill room — red pulsing overlay */}
      {isBeingKilled && (
        <>
          <motion.rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4} rx={2}
            fill="rgba(255,0,0,0.15)" stroke="#ff0000" strokeWidth={3}
            animate={{ opacity: [0.8, 0.3, 0.8], fill: ['rgba(255,0,0,0.25)', 'rgba(255,0,0,0.05)', 'rgba(255,0,0,0.25)'] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Screen shake effect text */}
          <motion.text
            x={labelCx} y={room.y + room.height - 30}
            textAnchor="middle" fill="#ff0000"
            fontSize="9" fontFamily="monospace" fontWeight="bold"
            animate={{ opacity: [1, 0.5, 1], x: [labelCx - 2, labelCx + 2, labelCx] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            ☠ KILLING ☠
          </motion.text>
        </>
      )}
    </motion.g>
  )
}
