import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Multiplayer features will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export interface GameSession {
  id: string
  round_number: number
  game_phase: 'betting' | 'knocking' | 'killing' | 'result'
  round_time_remaining: number
  killer_position_x: number
  killer_position_y: number
  killer_target_room: number | null
  killer_knocking_room: number | null
  killer_kill_room: number | null
  knock_sequence: number[]
  knock_index: number
  is_killing: boolean
  total_pot: number
  killed_room: number | null
  devbuy_amount: number
  created_at: string
  updated_at: string
  betting_ends_at: string | null
  is_active: boolean
  game_master_id: string | null
  game_master_last_seen: string | null
}

export interface Bet {
  id: string
  session_id: string
  wallet_address: string
  room_id: number
  bet_type: 'free' | 'gambling'
  amount: number
  created_at: string
}

export interface PlayerPosition {
  id: string
  session_id: string
  wallet_address: string
  room_id: number | null
  position_x: number | null
  position_y: number | null
  last_active: string
}
