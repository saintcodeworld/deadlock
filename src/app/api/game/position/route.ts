import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, walletAddress, roomId, positionX, positionY } = body

    if (!sessionId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('player_positions')
      .upsert({
        session_id: sessionId,
        wallet_address: walletAddress,
        room_id: roomId,
        position_x: positionX,
        position_y: positionY,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'session_id,wallet_address'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ position: data })
  } catch (error: any) {
    console.error('Error updating position:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('player_positions')
      .select('*')
      .eq('session_id', sessionId)
      .gte('last_active', fiveMinutesAgo)

    if (error) throw error

    return NextResponse.json({ positions: data })
  } catch (error: any) {
    console.error('Error fetching positions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
