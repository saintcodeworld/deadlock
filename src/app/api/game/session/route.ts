import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Look for ANY active session — use maybeSingle() to avoid PGRST116
    const { data: session, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    // If an active session exists, always return it (even mid-game)
    if (session) {
      return NextResponse.json({ session })
    }

    // Only create a new session if none exists at all
    const newSession = await createNewSession()
    return NextResponse.json({ session: newSession })
  } catch (error: any) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const newSession = await createNewSession()
      return NextResponse.json({ session: newSession })
    }

    if (action === 'update') {
      const { sessionId, updates } = body

      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
      }

      // Use maybeSingle() — if session was deleted/deactivated, don't crash
      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('is_active', true)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Session update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data) {
        // Session no longer exists or was deactivated — not a crash, just stale
        return NextResponse.json({ session: null, stale: true })
      }

      return NextResponse.json({ session: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in session POST:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function createNewSession() {
  const bettingEndsAt = new Date(Date.now() + 60000).toISOString()
  
  // Deactivate old sessions that have been inactive for more than 5 minutes
  // Do NOT deactivate the current active session — other players may be on it
  await supabase
    .from('game_sessions')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
  
  // Check once more if an active session appeared (race condition with another tab)
  const { data: existing } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      round_number: 1,
      game_phase: 'betting',
      round_time_remaining: 60,
      killer_position_x: 360,
      killer_position_y: 375,
      betting_ends_at: bettingEndsAt,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}
