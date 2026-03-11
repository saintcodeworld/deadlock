import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, walletAddress, roomId, betType, amount } = body

    if (!sessionId || !walletAddress || !roomId || !betType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (betType === 'free') {
      const { data: existingBet } = await supabase
        .from('bets')
        .select('id')
        .eq('session_id', sessionId)
        .eq('wallet_address', walletAddress)
        .eq('bet_type', 'free')
        .single()

      if (existingBet) {
        return NextResponse.json({ error: 'Free bet already placed this round' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('bets')
      .insert({
        session_id: sessionId,
        wallet_address: walletAddress,
        room_id: roomId,
        bet_type: betType,
        amount: amount || 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ bet: data })
  } catch (error: any) {
    console.error('Error placing bet:', error)
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

    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error

    return NextResponse.json({ bets: data })
  } catch (error: any) {
    console.error('Error fetching bets:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
