import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// GET — fetch recent messages (last 50)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Reverse so oldest first
    const messages = (data || []).reverse()
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — send a new message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { senderId, senderName, message } = body

    if (!senderId || !message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing senderId or message' }, { status: 400 })
    }

    const trimmed = message.trim().slice(0, 500)
    if (trimmed.length === 0) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        sender_name: senderName || 'Anon',
        message: trimmed,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
