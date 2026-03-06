'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { triggerServerDevBuy } from '@/utils/devbuy'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface FreeBet {
  walletAddress: string
  roomId: number
  timestamp: number
}

export interface GamblingBet {
  walletAddress: string
  roomId: number
  amount: number
  timestamp: number
}

export interface Room {
  id: number
  name: string
  x: number
  y: number
  width: number
  height: number
  freeBets: FreeBet[]
  gamblingBets: GamblingBet[]
}

export type GamePhase = 'betting' | 'knocking' | 'killing' | 'result'

export interface DoorPosition {
  roomId: number
  x: number
  y: number
}

export interface RoundResult {
  killedRoom: number
  totalPot: number
  winnersExist: boolean
  payouts: { wallet: string; amount: number; betAmount: number }[]
  correctFreeBets: string[]
  devBuyAmount: number
}

export interface PlayerPosition {
  walletAddress: string
  roomId: number | null
  positionX: number | null
  positionY: number | null
}

interface GameState {
  rooms: Room[]
  killerPosition: { x: number; y: number }
  killerTargetRoom: number | null
  killerKnockingRoom: number | null
  killerKillRoom: number | null
  currentRound: number
  roundTimeRemaining: number
  gamePhase: GamePhase
  selectedRoom: number | null
  isKilling: boolean
  knockSequence: number[]
  knockIndex: number
  roundResult: RoundResult | null
  playerPositions: PlayerPosition[]
  sessionId: string | null
  sessionLoaded: boolean
}

interface GameContextType extends GameState {
  placeFreeBet: (roomId: number, walletAddress: string) => Promise<boolean>
  placeGamblingBet: (roomId: number, amount: number, walletAddress: string) => Promise<void>
  selectRoom: (roomId: number | null) => void
  startNewRound: () => void
  skipBettingTimer: () => void
  getTotalGamblingBetsForRoom: (roomId: number) => number
  getFreeBetCountForRoom: (roomId: number) => number
  getTotalPot: () => number
  hasPlacedFreeBet: (walletAddress: string) => boolean
  getMyGamblingBets: (walletAddress: string) => GamblingBet[]
  getRoomsWithBets: () => number[]
  updatePlayerPosition: (walletAddress: string, roomId: number | null) => Promise<void>
}

const BETTABLE_ROOMS: Room[] = [
  { id: 1, name: 'Master Bedroom', x: 40, y: 40, width: 220, height: 180, freeBets: [], gamblingBets: [] },
  { id: 2, name: 'Bedroom 2', x: 40, y: 240, width: 180, height: 160, freeBets: [], gamblingBets: [] },
  { id: 3, name: 'Bedroom 3', x: 40, y: 420, width: 180, height: 140, freeBets: [], gamblingBets: [] },
  { id: 4, name: 'Study', x: 500, y: 40, width: 180, height: 160, freeBets: [], gamblingBets: [] },
  { id: 5, name: 'Master Bath', x: 280, y: 40, width: 200, height: 130, freeBets: [], gamblingBets: [] },
  { id: 6, name: 'Bathroom 2', x: 500, y: 220, width: 180, height: 120, freeBets: [], gamblingBets: [] },
  { id: 7, name: 'Kitchen', x: 500, y: 360, width: 180, height: 200, freeBets: [], gamblingBets: [] },
]

const buildInitialRooms = (): Room[] => [
  ...BETTABLE_ROOMS.map(r => ({ ...r, freeBets: [] as FreeBet[], gamblingBets: [] as GamblingBet[] })),
]

const doorPositions: DoorPosition[] = [
  { roomId: 1, x: 268, y: 120 },
  { roomId: 2, x: 228, y: 310 },
  { roomId: 3, x: 228, y: 480 },
  { roomId: 4, x: 480, y: 120 },
  { roomId: 5, x: 360, y: 178 },
  { roomId: 6, x: 480, y: 278 },
  { roomId: 7, x: 480, y: 450 },
]

const HALLWAY_WAYPOINTS = [
  { x: 360, y: 220 },
  { x: 360, y: 375 },
  { x: 360, y: 520 },
  { x: 300, y: 375 },
  { x: 420, y: 300 },
  { x: 360, y: 220 },
]
const HALLWAY_CENTER = { x: 360, y: 375 }

const BETTING_DURATION = 60
const KNOCK_DURATION = 3000
const KILL_DURATION = 4000
const RESULT_DISPLAY_DURATION = 8000
const FREE_BET_DEVBUY = 0.01
const MASTER_HEARTBEAT_INTERVAL = 5000
const MASTER_STALE_THRESHOLD = 8000

// Generate a unique client ID per browser tab
function getClientId(): string {
  let id = sessionStorage.getItem('game_client_id')
  if (!id) {
    id = 'client_' + Math.random().toString(36).substring(2) + '_' + Date.now()
    sessionStorage.setItem('game_client_id', id)
  }
  return id
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>(buildInitialRooms())
  const [killerPosition, setKillerPosition] = useState(HALLWAY_CENTER)
  const [killerTargetRoom, setKillerTargetRoom] = useState<number | null>(null)
  const [killerKnockingRoom, setKillerKnockingRoom] = useState<number | null>(null)
  const [killerKillRoom, setKillerKillRoom] = useState<number | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(BETTING_DURATION)
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting')
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [isKilling, setIsKilling] = useState(false)
  const [knockSequence, setKnockSequence] = useState<number[]>([])
  const [knockIndex, setKnockIndex] = useState(0)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([])
  const [isGameMaster, setIsGameMaster] = useState(false)
  const [bettingEndsAt, setBettingEndsAt] = useState<number | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const knockTimerRef = useRef<NodeJS.Timeout | null>(null)
  const patrolTimerRef = useRef<NodeJS.Timeout | null>(null)
  const patrolIndexRef = useRef(0)
  const roomsSnapshotRef = useRef<Room[]>(rooms)
  const resultProcessedRef = useRef(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isGameMasterRef = useRef(false)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const clientIdRef = useRef<string>('')
  const sessionIdRef = useRef<string | null>(null)
  const currentRoundRef = useRef(1)

  // Keep refs in sync for use in intervals/timeouts
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { currentRoundRef.current = currentRound }, [currentRound])

  const getRoomCenter = useCallback((roomId: number) => {
    const room = BETTABLE_ROOMS.find(r => r.id === roomId)
    if (!room) return HALLWAY_CENTER
    return { x: room.x + room.width / 2, y: room.y + room.height / 2 }
  }, [])

  const getRoomsWithBets = useCallback(() => {
    return rooms.filter(r => r.freeBets.length > 0 || r.gamblingBets.length > 0).map(r => r.id)
  }, [rooms])

  const getTotalGamblingBetsForRoom = useCallback((roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return 0
    return room.gamblingBets.reduce((sum: number, b: GamblingBet) => sum + b.amount, 0)
  }, [rooms])

  const getFreeBetCountForRoom = useCallback((roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return 0
    return room.freeBets.length
  }, [rooms])

  const getTotalPot = useCallback(() => {
    return rooms.reduce((sum: number, r: Room) => sum + r.gamblingBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0), 0)
  }, [rooms])

  const hasPlacedFreeBet = useCallback((walletAddress: string) => {
    return rooms.some(r => r.freeBets.some(b => b.walletAddress === walletAddress))
  }, [rooms])

  const getMyGamblingBets = useCallback((walletAddress: string) => {
    const bets: GamblingBet[] = []
    rooms.forEach(r => r.gamblingBets.forEach(b => {
      if (b.walletAddress === walletAddress) bets.push(b)
    }))
    return bets
  }, [rooms])

  // ============================================================
  // SERVER-SIDE GAME MASTER ELECTION
  // ============================================================
  const updateSessionOnServer = useCallback(async (sid: string, updates: Record<string, unknown>) => {
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', sessionId: sid, updates })
      })
    } catch (err) {
      console.error('[Multiplayer] Error updating session:', err)
    }
  }, [])

  const tryClaimMaster = useCallback(async (sid: string): Promise<boolean> => {
    const clientId = clientIdRef.current
    try {
      // Try to read the session - use maybeSingle() to avoid PGRST116 crash
      const { data: session, error: readError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sid)
        .maybeSingle()

      if (readError || !session) {
        // Can't read session — just become master locally
        console.log('[Multiplayer] 👑 No session found, becoming master locally')
        isGameMasterRef.current = true
        setIsGameMaster(true)
        return true
      }

      const currentMaster = (session as Record<string, any>).game_master_id || null
      const lastSeen = (session as Record<string, any>).game_master_last_seen || null

      // Already the master
      if (currentMaster === clientId) {
        isGameMasterRef.current = true
        setIsGameMaster(true)
        return true
      }

      // Determine if we should claim: no master, or master is stale (>15s)
      let shouldClaim = !currentMaster
      if (currentMaster && lastSeen) {
        const elapsed = Date.now() - new Date(lastSeen).getTime()
        if (elapsed > MASTER_STALE_THRESHOLD) {
          shouldClaim = true
          console.log(`[Multiplayer] ⏱️ Master stale (${Math.round(elapsed / 1000)}s), claiming...`)
        }
      } else if (currentMaster && !lastSeen) {
        // Has master but no timestamp — assume stale
        shouldClaim = true
      }

      if (shouldClaim) {
        const { error: writeError } = await supabase
          .from('game_sessions')
          .update({
            game_master_id: clientId,
            game_master_last_seen: new Date().toISOString()
          })
          .eq('id', sid)

        if (!writeError) {
          isGameMasterRef.current = true
          setIsGameMaster(true)
          console.log('[Multiplayer] 👑 Claimed game master!')
          return true
        } else {
          // If update fails (e.g. columns don't exist), be master locally anyway
          // The game will still work — just won't sync master identity via DB
          console.warn('[Multiplayer] ⚠️ Could not write master to DB, becoming master locally:', writeError.message)
          isGameMasterRef.current = true
          setIsGameMaster(true)
          return true
        }
      }

      isGameMasterRef.current = false
      setIsGameMaster(false)
      console.log('[Multiplayer] 👥 Another client is game master:', currentMaster)
      return false
    } catch (err) {
      // On any error, become master locally so the game still works
      console.warn('[Multiplayer] ⚠️ Master claim error, becoming master locally:', err)
      isGameMasterRef.current = true
      setIsGameMaster(true)
      return true
    }
  }, [])

  const startHeartbeat = useCallback((sid: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)

    heartbeatRef.current = setInterval(async () => {
      if (!isGameMasterRef.current) {
        // Try to claim if master went stale
        await tryClaimMaster(sid)
        return
      }
      // Heartbeat: update last_seen
      await supabase
        .from('game_sessions')
        .update({ game_master_last_seen: new Date().toISOString() })
        .eq('id', sid)
        .eq('game_master_id', clientIdRef.current)
    }, MASTER_HEARTBEAT_INTERVAL)
  }, [tryClaimMaster])

  // ============================================================
  // APPLY SERVER STATE TO LOCAL STATE (for followers)
  // ============================================================
  const applySessionState = useCallback((session: Record<string, any>) => {
    // Only apply if we are NOT the game master (master sets state locally)
    if (isGameMasterRef.current) return

    const newPhase = session.game_phase
    setGamePhase(newPhase)
    setKillerPosition({ x: Number(session.killer_position_x), y: Number(session.killer_position_y) })
    setKillerTargetRoom(session.killer_target_room)
    setKillerKnockingRoom(session.killer_knocking_room)
    setKillerKillRoom(session.killer_kill_room)
    setKnockSequence(session.knock_sequence || [])
    setKnockIndex(session.knock_index || 0)
    setIsKilling(session.is_killing || false)
    setCurrentRound(session.round_number)

    // Sync betting_ends_at so follower timer derives from same absolute timestamp
    if (session.betting_ends_at) {
      setBettingEndsAt(new Date(session.betting_ends_at).getTime())
    }

    // For non-betting phases, keep round_time_remaining from server
    if (newPhase !== 'betting') {
      setRoundTimeRemaining(session.round_time_remaining)
    }

    // When master resets to a new betting round, followers must also reset local bets/rooms
    if (newPhase === 'betting' && session.round_time_remaining >= 55) {
      setRooms(buildInitialRooms())
      setRoundResult(null)
      setSelectedRoom(null)
      setPlayerPositions([])
    }
  }, [])

  // ============================================================
  // INIT SESSION + SUBSCRIBE TO REALTIME
  // ============================================================
  useEffect(() => {
    clientIdRef.current = getClientId()
    console.log('[Multiplayer] 🆔 Client ID:', clientIdRef.current)

    async function initSession() {
      try {
        const response = await fetch('/api/game/session')
        const data = await response.json()

        if (data.session) {
          const sid = data.session.id
          setSessionId(sid)
          setCurrentRound(data.session.round_number)
          setGamePhase(data.session.game_phase)
          setRoundTimeRemaining(data.session.round_time_remaining)
          setKillerPosition({ x: Number(data.session.killer_position_x), y: Number(data.session.killer_position_y) })
          setKillerTargetRoom(data.session.killer_target_room)
          setKillerKnockingRoom(data.session.killer_knocking_room)
          setKillerKillRoom(data.session.killer_kill_room)
          setKnockSequence(data.session.knock_sequence || [])
          setKnockIndex(data.session.knock_index || 0)
          setIsKilling(data.session.is_killing || false)

          // Set betting_ends_at for timer sync
          if (data.session.betting_ends_at) {
            setBettingEndsAt(new Date(data.session.betting_ends_at).getTime())
          }

          // Load existing bets
          try {
            const betsResponse = await fetch(`/api/game/bet?sessionId=${sid}`)
            const betsData = await betsResponse.json()
            if (betsData.bets) {
              const updatedRooms = buildInitialRooms()
              betsData.bets.forEach((bet: any) => {
                const room = updatedRooms.find((r: Room) => r.id === bet.room_id)
                if (room) {
                  if (bet.bet_type === 'free') {
                    room.freeBets.push({
                      walletAddress: bet.wallet_address,
                      roomId: bet.room_id,
                      timestamp: new Date(bet.created_at).getTime()
                    })
                  } else {
                    room.gamblingBets.push({
                      walletAddress: bet.wallet_address,
                      roomId: bet.room_id,
                      amount: bet.amount,
                      timestamp: new Date(bet.created_at).getTime()
                    })
                  }
                }
              })
              setRooms(updatedRooms)
            }
          } catch (betErr) {
            console.warn('[Multiplayer] Error loading bets:', betErr)
          }

          // Load player positions
          try {
            const posResponse = await fetch(`/api/game/position?sessionId=${sid}`)
            const posData = await posResponse.json()
            if (posData.positions) {
              setPlayerPositions(posData.positions.map((p: any) => ({
                walletAddress: p.wallet_address,
                roomId: p.room_id,
                positionX: p.position_x,
                positionY: p.position_y
              })))
            }
          } catch (posErr) {
            console.warn('[Multiplayer] Error loading positions:', posErr)
          }

          // Try to become game master — always ensure someone is master
          const isMaster = await tryClaimMaster(sid)
          if (!isMaster) {
            // If claim failed, wait a moment and try again (race condition on first load)
            setTimeout(async () => {
              await tryClaimMaster(sid)
            }, 2000)
          }
          startHeartbeat(sid)
        }
      } catch (error) {
        console.error('[Multiplayer] Error initializing session:', error)
        // Even on total failure, become master locally so the game runs
        isGameMasterRef.current = true
        setIsGameMaster(true)
        console.log('[Multiplayer] 👑 Fallback: becoming local master after init error')
      } finally {
        // Always mark session as loaded so UI can render the correct state
        setSessionLoaded(true)
      }
    }

    initSession()

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [tryClaimMaster, startHeartbeat])

  // ============================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================
  useEffect(() => {
    if (!sessionId) return

    console.log('[Multiplayer] 🔌 Setting up realtime for session:', sessionId)

    const channel = supabase
      .channel(`game:${sessionId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bets', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          console.log('[Multiplayer] 📥 Bet received:', payload.new)
          const bet = payload.new as Record<string, any>
          setRooms(prev => prev.map((room: Room) => {
            if (room.id === bet.room_id) {
              if (bet.bet_type === 'free') {
                // Avoid duplicates
                if (room.freeBets.some((b: FreeBet) => b.walletAddress === bet.wallet_address)) return room
                return {
                  ...room,
                  freeBets: [...room.freeBets, {
                    walletAddress: bet.wallet_address,
                    roomId: bet.room_id,
                    timestamp: new Date(bet.created_at).getTime()
                  }]
                }
              } else {
                return {
                  ...room,
                  gamblingBets: [...room.gamblingBets, {
                    walletAddress: bet.wallet_address,
                    roomId: bet.room_id,
                    amount: bet.amount,
                    timestamp: new Date(bet.created_at).getTime()
                  }]
                }
              }
            }
            return room
          }))
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          const session = payload.new as Record<string, any>
          console.log('[Multiplayer] 🎮 Session update received, phase:', session.game_phase, 'isMaster:', isGameMasterRef.current)
          applySessionState(session)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'player_positions', filter: `session_id=eq.${sessionId}` },
        async () => {
          try {
            const posResponse = await fetch(`/api/game/position?sessionId=${sessionId}`)
            const posData = await posResponse.json()
            if (posData.positions) {
              setPlayerPositions(posData.positions.map((p: any) => ({
                walletAddress: p.wallet_address,
                roomId: p.room_id,
                positionX: p.position_x,
                positionY: p.position_y
              })))
            }
          } catch (err) {
            console.error('[Multiplayer] Error fetching positions:', err)
          }
        }
      )
      .subscribe((status) => {
        console.log('[Multiplayer] 📡 Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('[Multiplayer] ✅ Real-time sync active!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Multiplayer] ❌ Channel error - check Supabase realtime replication')
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, applySessionState])

  // ============================================================
  // GAME MASTER LOGIC: PATROL during betting
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'betting') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    console.log('[Multiplayer] 🚶 Starting killer patrol (master)')
    patrolIndexRef.current = 0
    setKillerPosition(HALLWAY_WAYPOINTS[0])

    const patrol = () => {
      patrolIndexRef.current = (patrolIndexRef.current + 1) % HALLWAY_WAYPOINTS.length
      const newPos = HALLWAY_WAYPOINTS[patrolIndexRef.current]
      setKillerPosition(newPos)

      const sid = sessionIdRef.current
      if (sid) {
        updateSessionOnServer(sid, {
          killer_position_x: newPos.x,
          killer_position_y: newPos.y
        })
      }

      patrolTimerRef.current = setTimeout(patrol, 2500 + Math.random() * 1500)
    }
    patrolTimerRef.current = setTimeout(patrol, 2500)

    return () => { if (patrolTimerRef.current) clearTimeout(patrolTimerRef.current) }
  }, [gamePhase, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // UNIVERSAL BETTING TIMER — runs on ALL clients (master + followers)
  // All clients compute remaining time from the same absolute betting_ends_at
  // timestamp so everyone's timer is perfectly in sync.
  // Only the game master triggers the phase transition when time hits 0.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'betting') return
    if (!bettingEndsAt) return

    const calcRemaining = () => Math.max(0, Math.ceil((bettingEndsAt - Date.now()) / 1000))

    // Set immediately so there's no 500ms delay on first render
    setRoundTimeRemaining(calcRemaining())

    const tick = setInterval(() => {
      const remaining = calcRemaining()
      setRoundTimeRemaining(remaining)

      if (remaining <= 0) {
        clearInterval(tick)
        // Only the game master drives the phase transition
        if (isGameMasterRef.current) {
          console.log('[Multiplayer] ⏱️ Timer done → knocking')
          setGamePhase('knocking')
          const sid = sessionIdRef.current
          if (sid) {
            updateSessionOnServer(sid, { game_phase: 'knocking', round_time_remaining: 0 })
          }
        }
      }
    }, 500)

    return () => clearInterval(tick)
  }, [gamePhase, bettingEndsAt, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KNOCKING INIT
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'knocking') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    console.log('[Multiplayer] 🚪 Starting knocking phase (master)')

    const shuffled = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5)
    console.log('[Multiplayer] 🚪 Knock sequence:', shuffled)
    setKnockSequence(shuffled)
    setKnockIndex(0)
    setKillerKnockingRoom(null)

    updateSessionOnServer(sessionId, {
      knock_sequence: shuffled,
      knock_index: 0,
      killer_knocking_room: null
    })

    return () => { if (knockTimerRef.current) clearTimeout(knockTimerRef.current) }
  }, [gamePhase, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KNOCKING STEPS
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'knocking') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return
    if (knockSequence.length === 0) return

    console.log(`[Multiplayer] 🚪 Knock step: ${knockIndex}/${knockSequence.length}`)

    if (knockIndex >= knockSequence.length) {
      // All rooms knocked → pick a room to kill
      const targetId = BETTABLE_ROOMS[Math.floor(Math.random() * BETTABLE_ROOMS.length)].id
      const targetCenter = getRoomCenter(targetId)

      console.log(`[Multiplayer] 🔪 Killing room ${targetId}`)

      setKillerKnockingRoom(null)
      setKillerKillRoom(targetId)
      setKillerPosition(targetCenter)
      setKillerTargetRoom(targetId)
      setGamePhase('killing')

      updateSessionOnServer(sessionId, {
        game_phase: 'killing',
        killer_knocking_room: null,
        killer_kill_room: targetId,
        killer_position_x: targetCenter.x,
        killer_position_y: targetCenter.y,
        killer_target_room: targetId
      })
      return
    }

    const currentRoomId = knockSequence[knockIndex]
    const doorPos = doorPositions.find((d: DoorPosition) => d.roomId === currentRoomId)
    if (doorPos) {
      console.log(`[Multiplayer] 🚪 Knocking room ${currentRoomId}`)
      setKillerPosition({ x: doorPos.x, y: doorPos.y })
      setKillerKnockingRoom(currentRoomId)
      setKillerTargetRoom(null)

      updateSessionOnServer(sessionId, {
        killer_position_x: doorPos.x,
        killer_position_y: doorPos.y,
        killer_knocking_room: currentRoomId,
        killer_target_room: null,
        knock_index: knockIndex
      })
    }

    knockTimerRef.current = setTimeout(() => {
      setKnockIndex(prev => prev + 1)
    }, KNOCK_DURATION)

    return () => { if (knockTimerRef.current) clearTimeout(knockTimerRef.current) }
  }, [gamePhase, knockIndex, knockSequence, getRoomCenter, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KILLING
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'killing') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    console.log('[Multiplayer] 🔪 Killing phase (master), room:', killerKillRoom)
    setIsKilling(true)

    updateSessionOnServer(sessionId, { is_killing: true })

    const killTimer = setTimeout(() => {
      console.log('[Multiplayer] 🔪 Kill complete → result')
      setIsKilling(false)
      setGamePhase('result')

      const sid = sessionIdRef.current
      if (sid) {
        updateSessionOnServer(sid, {
          game_phase: 'result',
          is_killing: false
        })
      }
    }, KILL_DURATION)

    return () => clearTimeout(killTimer)
  }, [gamePhase, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // ROOMS SNAPSHOT — always keep ref in sync during betting
  // ============================================================
  useEffect(() => {
    roomsSnapshotRef.current = rooms
  }, [rooms])

  useEffect(() => {
    if (gamePhase === 'betting') {
      resultProcessedRef.current = false
    }
  }, [gamePhase])

  // ============================================================
  // RESULT PROCESSING (only game master)
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'result') return
    if (killerKillRoom === null) return
    if (resultProcessedRef.current) return
    if (!isGameMasterRef.current) return

    resultProcessedRef.current = true

    const snapshotRooms = roomsSnapshotRef.current
    const killedRoom = killerKillRoom
    const allGamblingBets: GamblingBet[] = []
    snapshotRooms.forEach((r: Room) => r.gamblingBets.forEach((b: GamblingBet) => allGamblingBets.push(b)))

    const totalPot = allGamblingBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0)
    const winningBets = allGamblingBets.filter((b: GamblingBet) => b.roomId === killedRoom)
    const winningTotal = winningBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0)

    const killedRoomData = snapshotRooms.find((r: Room) => r.id === killedRoom)
    const correctFreeBets = killedRoomData ? killedRoomData.freeBets.map((b: FreeBet) => b.walletAddress) : []

    let payouts: RoundResult['payouts'] = []
    let devBuyAmount = correctFreeBets.length * FREE_BET_DEVBUY

    if (winningTotal > 0 && totalPot > 0) {
      payouts = winningBets.map((b: GamblingBet) => ({
        wallet: b.walletAddress,
        amount: (b.amount / winningTotal) * totalPot,
        betAmount: b.amount,
      }))
    } else if (totalPot > 0) {
      devBuyAmount += totalPot
    }

    const result: RoundResult = {
      killedRoom,
      totalPot,
      winnersExist: winningTotal > 0,
      payouts,
      correctFreeBets,
      devBuyAmount,
    }
    setRoundResult(result)

    if (devBuyAmount > 0) {
      triggerServerDevBuy(devBuyAmount)
        .then(res => {
          if (res.success) {
            console.log(`[Game] ✅ Devbuy of ${devBuyAmount} SOL executed. TX: ${res.signature}`)
          } else {
            console.error(`[Game] ❌ Devbuy failed: ${res.error}`)
          }
        })
        .catch(err => {
          console.error(`[Game] ❌ Devbuy error:`, err)
        })
    }
  }, [gamePhase, killerKillRoom, isGameMaster])

  // ============================================================
  // ACTIONS
  // ============================================================
  const placeFreeBet = useCallback(async (roomId: number, walletAddress: string): Promise<boolean> => {
    if (gamePhase !== 'betting') return false
    if (!sessionId) return false

    const alreadyBet = rooms.some((r: Room) => r.freeBets.some((b: FreeBet) => b.walletAddress === walletAddress))
    if (alreadyBet) return false

    try {
      const response = await fetch('/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          betType: 'free',
          amount: 0
        })
      })

      const data = await response.json()
      return !!data.bet
    } catch (error) {
      console.error('Error placing free bet:', error)
      return false
    }
  }, [gamePhase, rooms, sessionId])

  const placeGamblingBet = useCallback(async (roomId: number, amount: number, walletAddress: string) => {
    if (gamePhase !== 'betting') return
    if (amount <= 0) return
    if (!sessionId) return

    try {
      await fetch('/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          betType: 'gambling',
          amount
        })
      })
    } catch (error) {
      console.error('Error placing gambling bet:', error)
    }
  }, [gamePhase, sessionId])

  const updatePlayerPosition = useCallback(async (walletAddress: string, roomId: number | null) => {
    if (!sessionId) return

    try {
      const room = roomId ? BETTABLE_ROOMS.find((r: Room) => r.id === roomId) : null
      const posX = room ? room.x + room.width / 2 : null
      const posY = room ? room.y + room.height / 2 : null

      await fetch('/api/game/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          positionX: posX,
          positionY: posY
        })
      })
    } catch (error) {
      console.error('Error updating position:', error)
    }
  }, [sessionId])

  const selectRoom = useCallback((roomId: number | null) => {
    if (gamePhase !== 'betting') return
    setSelectedRoom(roomId)
  }, [gamePhase])

  const skipBettingTimer = useCallback(async () => {
    if (gamePhase !== 'betting') return
    if (!sessionId) return

    // Expire betting_ends_at so universal timer fires immediately on all clients
    const expiredAt = new Date(Date.now() - 1000).toISOString()
    setBettingEndsAt(Date.now() - 1000)
    setRoundTimeRemaining(0)
    setGamePhase('knocking')

    await updateSessionOnServer(sessionId, {
      game_phase: 'knocking',
      round_time_remaining: 0,
      betting_ends_at: expiredAt
    })
  }, [gamePhase, sessionId, updateSessionOnServer])

  // Start new round: RESET the same session (don't create a new one!)
  const startNewRound = useCallback(async () => {
    if (!sessionId) return

    console.log('[Multiplayer] 🔄 Starting new round on same session')

    // Delete old bets and positions for this session
    await supabase.from('bets').delete().eq('session_id', sessionId)
    await supabase.from('player_positions').delete().eq('session_id', sessionId)

    // Compute new round number and absolute betting end time
    const nextRound = currentRoundRef.current + 1
    const newBettingEndsAt = Date.now() + BETTING_DURATION * 1000

    // Push new state to server — betting_ends_at is the authoritative timer source
    await updateSessionOnServer(sessionId, {
      round_number: nextRound,
      game_phase: 'betting' as const,
      round_time_remaining: BETTING_DURATION,
      betting_ends_at: new Date(newBettingEndsAt).toISOString(),
      killer_position_x: HALLWAY_CENTER.x,
      killer_position_y: HALLWAY_CENTER.y,
      killer_target_room: null,
      killer_knocking_room: null,
      killer_kill_room: null,
      knock_sequence: [] as number[],
      knock_index: 0,
      is_killing: false,
      game_master_id: clientIdRef.current,
      game_master_last_seen: new Date().toISOString()
    })

    // Update local state
    isGameMasterRef.current = true
    setIsGameMaster(true)
    setCurrentRound(nextRound)
    setBettingEndsAt(newBettingEndsAt)
    setRooms(buildInitialRooms())
    setRoundTimeRemaining(BETTING_DURATION)
    setGamePhase('betting')
    setKillerTargetRoom(null)
    setKillerPosition(HALLWAY_CENTER)
    setKillerKnockingRoom(null)
    setKillerKillRoom(null)
    setIsKilling(false)
    setSelectedRoom(null)
    setKnockSequence([])
    setKnockIndex(0)
    setRoundResult(null)
    setPlayerPositions([])
  }, [sessionId, updateSessionOnServer])

  // ============================================================
  // AUTO-RESTART after result (game master only)
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'result') return
    if (!roundResult) return
    if (!isGameMasterRef.current) return

    const restartTimer = setTimeout(() => {
      startNewRound()
    }, RESULT_DISPLAY_DURATION)

    return () => clearTimeout(restartTimer)
  }, [gamePhase, roundResult, isGameMaster, startNewRound])

  return (
    <GameContext.Provider value={{
      rooms,
      killerPosition,
      killerTargetRoom,
      killerKnockingRoom,
      killerKillRoom,
      currentRound,
      roundTimeRemaining,
      gamePhase,
      selectedRoom,
      isKilling,
      knockSequence,
      knockIndex,
      roundResult,
      playerPositions,
      sessionId,
      sessionLoaded,
      placeFreeBet,
      placeGamblingBet,
      selectRoom,
      startNewRound,
      skipBettingTimer,
      getTotalGamblingBetsForRoom,
      getFreeBetCountForRoom,
      getTotalPot,
      hasPlacedFreeBet,
      getMyGamblingBets,
      getRoomsWithBets,
      updatePlayerPosition,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
